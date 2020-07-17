const common = require('@util/common')
const { ApplicationError } = require('@util/customErrors')
const { checkAuthorization, isFriendsWith } = require('@util/authUtil')
const { generateWords } = require('@util/gameUtil')
const Doodle = require('@models/doodle')
const Game = require('@models/game')

const sizeof = require('object-sizeof') // TEST

/** send userId in params */
const getActive = async (req, res) => {
  checkAuthorization(req, req.params.id)

  const userID = req.params.id

  const activeGames = await Game.find(
      { isActive: true }, 
      'player1 player2 activePlayer timeOfLastMove currentRound')
    .or([
      { player1: userID },
      { player2: userID }
    ])
    .populate({ path: 'player1', select: 'username'})
    .populate({ path: 'player2', select: 'username'})
  
  res.json(activeGames.map(ag => ag.toJSON()))
}

/** in req.body, send { receiverId, requesterId }*/
const getNewGame = async (req, res) => {
  const gameData = req.query
  checkAuthorization(req, gameData.requesterId)

  const isFriends = await isFriendsWith(gameData.requesterId, gameData.receiverId) 
  if (!isFriends) throw new ApplicationError('Requester is not friends with this user.', 401)

  const game = new Game({
    player1: gameData.requesterId,
    player2: gameData.receiverId,
    rounds: [],
    scores: [],
    isActive: true,
    activePlayer: gameData.requesterId,
    currentRound: 0,
    nextWords: await generateWords()
  })

  const savedGame = await game.save()

  res.json(savedGame.toJSON())
}

/** in req.body, send { receiverId, requesterId, doodles, guessResults { doodleId, guesses, isCorrect, timeSpent } }
 * if its the last round, there will be no doodles, only guessResults
 * in req.params send gameId
 */
const sendRound = async (req, res) => {
  const gameData = req.body 
  checkAuthorization(req, gameData.requesterId)

  const gameId = req.params.gameId
  const game = await Game.findById(gameId)
  if (!game.isActive) throw new ApplicationError('Game is already over.', 400)
  if (game.activePlayer.toString() !== gameData.requesterId) throw new ApplicationError('User is not the active player.', 400)

  let thisRound
  const allWords = [...game.allWords]
  if (gameData.doodles) {
    thisRound = { doodles: [] }
    for (const doodle of gameData.doodles) {

      const newDoodle = new Doodle({
        game: gameId,
        artist: gameData.requesterId,
        recipient: gameData.receiverId,
        drawing: doodle.drawing,
        label: doodle.label,
      })

      // console.log(newDoodle)

      const savedDoodle = await newDoodle.save()

      thisRound.doodles.push(savedDoodle)
      allWords.push(doodle.label)
    }
  }

  const newResult = {...game.result}
  for (const guessResult of gameData.guessResults) {
    // console.log(guessResult)

    const doodle = await Doodle.findById(guessResult.doodleId)
    doodle.guesses = guessResult.guesses
    doodle.isCorrect = guessResult.isCorrect
    doodle.timeSpent = guessResult.timeSpent

    newResult.scores.push({
      isCorrect: guessResult.isCorrect,
      timeSpent: guessResult.timeSpent
    })
    if (guessResult.isCorrect) newResult.totalScore.numCorrect++
    newResult.totalScore.totalTimeSpent += guessResult.timeSpent 
    await doodle.save()
  }

  game.timeOfLastMove = Date.now()
  game.rounds = [...game.rounds, thisRound]
  game.allWords = allWords
  game.currentRound = game.rounds.length
  game.nextWords = game.currentRound < game.numRounds ? await generateWords(allWords) : []
  game.result = newResult

  if (game.currentRound === game.numRounds && !gameData.doodles) game.isActive = false
  game.activePlayer = game.isActive ? gameData.receiverId : null

  const savedGame = await game.save()

  res.status(201).json({
    gameId: savedGame._id.toString(),
    isActive: savedGame.isActive,
    currentRound: savedGame.currentRound,
    activePlayer: savedGame.activePlayer,
    result: savedGame.result
  })
}

/** send gameId in params
 * send userId in query params
 */
const getGame = async (req, res) => {
  const userId = req.query.userId
  if (!userId) throw new ApplicationError('Not authorized. Include userId as query param.', 401)
  
  const game = await Game.findById(req.params.gameId).populate('rounds.doodles')

  if (userId === game.player1.toString()) checkAuthorization(req, game.player1)
  else if (userId === game.player2.toString()) checkAuthorization(req, game.player2)
  else throw new ApplicationError('Not authorized.', 401)

  const gameToSend = game.toJSON()

  if (userId !== game.activePlayer.toString()) delete gameToSend.nextWords
  delete gameToSend.rounds
  if (game.isActive && game.rounds.length > 0) {
    if (!game.rounds[game.rounds.length - 1].completed) {
      gameToSend.doodlesToGuess = game.rounds[game.rounds.length - 1]
    }
  }
  
  res.json(gameToSend)
}

module.exports = { getActive, sendRound, getNewGame, getGame }