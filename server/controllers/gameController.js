const common = require('@util/common')
const { ApplicationError } = require('@util/customErrors')
const { checkAuthorization, isFriendsWith } = require('@util/authUtil')
const { generateWords } = require('@util/gameUtil')
const Doodle = require('@models/doodle')
const Game = require('@models/game')

/** send userId in params */
const getActive = async (req, res) => {
  checkAuthorization(req, req.params.id)

  const userID = req.params.id

  const activeGames = await Game.find(
      { isActive: true }, 
      'player1 player2 activePlayer timeOfLastMove currentRoundNum')
    .or([
      { player1: userID },
      { player2: userID }
    ])
    .populate({ path: 'player1', select: 'username'})
    .populate({ path: 'player2', select: 'username'})
  
  res.json(activeGames.map(ag => ag.toJSON()))
}

/* in req.body, send { receiverId, requesterId } */
const getNewGame = async (req, res) => {
  const gameData = req.query
  checkAuthorization(req, gameData.requesterId)

  const isFriends = await isFriendsWith(gameData.requesterId, gameData.receiverId) 
  if (!isFriends) throw new ApplicationError('Requester is not friends with this user.', 401)

  const newRound = {
    state: 'DOODLE',
    doodles: [],
    guesses: []
  }

  const game = new Game({
    player1: gameData.requesterId,
    player2: gameData.receiverId,
    dateStarted: Date.now(),
    numRounds: common.NUM_ROUNDS,
    roundLen: common.ROUND_LEN,
    isActive: true,
    rounds: [newRound],
    currentRound: newRound,
    currentRoundNum: 1,
    allWords: [],
    activePlayer: gameData.requesterId,
    nextWords: generateWords(),
    result: {
      roundScores: [],
      gameTotals: {
        numCorrect: 0,
        totalTimeSpent: 0
      } 
    }
  })

  const savedGame = await game.save()

  res.json(savedGame.toJSON())
}

/* in req.body, send { requesterId, doodles OR guesses }
 * in query params send { type: 'guess' or 'doodle' } 
 * in URL params send gameId
 */
const sendRound = async (req, res) => {
  const gameData = req.body 
  checkAuthorization(req, gameData.requesterId)

  const gameId = req.params.gameId
  const game = await Game.findById(gameId)
  if (!game) throw new ApplicationError('Game not found.', 404)
  if (!game.isActive) throw new ApplicationError('Game is already over.', 400)
  if (game.activePlayer.toString() !== gameData.requesterId) throw new ApplicationError('User is not the active player.', 400)

  // most recent round
  const currentRound = game.rounds.length > 0 ? game.rounds[game.rounds.length - 1] : null
  // if the last round is complete, throw error
  if (!currentRound) throw new ApplicationError('Game data error. No current round.', 500)
  if (currentRound.state != 'GUESS' && currentRound.state != 'DOODLE' && game.rounds.length === game.numRounds) {
    game.isActive = false
    game.save()
    throw new ApplicationError('Game is already over.', 400)
  }

  const type = req.query.type
  if (!(type === 'guess' || type === 'doodle')) throw new ApplicationError('Valid type is needed as query parameter: \'guess\' or \'doodle\'', 400)

  if (type === 'doodle') {
    if (!gameData.doodles) throw new ApplicationError('Send doodles in request body.', 400)
    // the round state should be DOODLE
    if (currentRound.state != 'DOODLE') throw new ApplicationError(`Game is not awaiting doodles. Current round state is ${currentRound.state}`, 400)
    if (currentRound.doodles.length > 0) throw new ApplicationError('Already have doodles for this round.', 500)
    
    // save doodles to round
    for (const doodle of gameData.doodles) {
      const newDoodle = new Doodle({
        game: gameId,
        artist: gameData.requesterId,
        drawing: doodle.drawing,
        label: doodle.label
      })

      const savedDoodle = await newDoodle.save()
      currentRound.doodles.push(savedDoodle)
    }

    // active player switches after draw
    game.activePlayer = game.activePlayer.toString() === game.player1.toString() ? game.player2 : game.player1

    // update game state
    currentRound.state = 'GUESS'
  } 
  
  else if (type === 'guess') {
    // game state should be GUESS
    if (!gameData.guesses) throw new ApplicationError('Send guesses in request body.', 400)
    if (currentRound.state != 'GUESS') throw new ApplicationError(`Game is not awaiting doodles. Current round state is ${currentRound.state}`, 400)
    if (currentRound.guesses.length > 0) throw new ApplicationError('Already have guesses for this round.', 500)

    const roundScore = {
      doodles: [],
      roundTotals: {
        totalTimeSpent: 0,
        numCorrect: 0 
      }
    }

    // save guesses to round
    for (const guess of gameData.guesses) {
      
      currentRound.guesses.push({
        ...guess
      })

      // calculate round result
      if (guess.isCorrect) {
        roundScore.roundTotals.numCorrect++
        game.result.gameTotals.numCorrect++
      } 

      roundScore.roundTotals.totalTimeSpent += guess.timeSpent
      game.result.gameTotals.totalTimeSpent += guess.timeSpent

      roundScore.doodles.push({
        isCorrect: guess.isCorrect,
        timeSpent: guess.timeSpent,
        label: guess.label
      })
    }

    // save result to game
    game.result.roundScores.push(roundScore)

    // update game state
    currentRound.state = 'OVER'
  }

  // Update game
  game.timeOfLastMove = Date.now()

  if (currentRound.state === 'OVER') {
    console.log('got at least here', game.rounds.length, game.numRounds)
    if (game.rounds.length < game.numRounds) {
      // create next round
      game.rounds.push({
        state: 'DOODLE',
        doodles: [],
        guesses: []
      })

      game.nextWords = generateWords(game.allWords)
      game.allWords = [...game.allWords, ...game.nextWords]
      game.currentRound = game.rounds[game.currentRoundNum++]
    } else {
      // Game over
      game.isActive = false
      game.activePlayer = null
      game.nextWords = null
      game.currentRoundNum = null
      console.log('got here', game)
    }
  } else {
    game.currentRound = currentRound
  }

  const savedGame = await game.save()
  await savedGame
    .populate({ path: 'player1', select: 'username'})
    .populate({ path: 'player2', select: 'username'})
    .populate({ path: 'activePlayer', select: 'username'})
    .execPopulate()

  res.status(201).json(savedGame.toJSON())
}

/* send gameId in URL params
 * send userId in query params
 */
const getGame = async (req, res) => {
  const userId = req.query.userId
  if (!userId) throw new ApplicationError('Not authorized. Include userId as query param.', 401)
  
  const game = await Game.findById(req.params.gameId)
    .populate('currentRound.doodles')
    .populate({ path: 'player1', select: 'username'})
    .populate({ path: 'player2', select: 'username'})
    .populate({ path: 'activePlayer', select: 'username'})

  if (userId === game.player1._id.toString()) checkAuthorization(req, game.player1._id)
  else if (userId === game.player2._id.toString()) checkAuthorization(req, game.player2._id)
  else throw new ApplicationError('Not authorized.', 401)
  
  res.json(game.toJSON())
}

module.exports = { getActive, sendRound, getNewGame, getGame }