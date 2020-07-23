const common = require('@util/common')
const { ApplicationError } = require('@util/customErrors')
const { checkAuthorization, isFriendsWith } = require('@util/authUtil')
const { generateWords } = require('@util/gameUtil')
const Doodle = require('@models/doodle')
const Game = require('@models/game')
const GameRequest = require('@models/game-request')

const { NUM_ROUNDS, ROUND_LEN, ServerGameStatus, ServerRoundState } = common

/** send userId in params */
const getActive = async (req, res) => {
  const userId = req.params.id
  checkAuthorization(req, userId)

  const activeGames = await Game.find(
      { status: {$in: [ServerGameStatus.active, ServerGameStatus.pending]} }, 
      'player1 player2 activePlayer timeOfLastMove currentRoundNum currentRound.state status')
    .or([
      { player1: userId },
      { player2: userId }
    ])
    .populate({ path: 'player1', select: 'username'})
    .populate({ path: 'player2', select: 'username'})
    .populate({ path: 'activePlayer', select: 'username'})

  // if a game is pending and awaiting the requester's acceptance, it is NOT considered an active game
  const filteredAg = activeGames.filter(ag => !(ag.status === ServerGameStatus.pending && ag.player2._id.toString() === userId.toString()))
  
  res.json(filteredAg.map(ag => ag.toJSON()))
}

/* in req.body, send { receiverId, requesterId } */
const getNewGame = async (req, res) => {
  const gameData = req.query
  checkAuthorization(req, gameData.requesterId)

  const isFriends = await isFriendsWith(gameData.requesterId, gameData.receiverId) 
  if (!isFriends) throw new ApplicationError('Requester is not friends with this user.', 401)

  const newRound = {
    state: ServerRoundState.doodle,
    doodles: [],
    guesses: []
  }

  const game = new Game({
    player1: gameData.requesterId,
    player2: gameData.receiverId,
    dateStarted: Date.now(),
    numRounds: NUM_ROUNDS,
    roundLen: ROUND_LEN,
    status: ServerGameStatus.pending,
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

/** send new game request */
const createGameRequest = async (req, requesterId, receiverId, gameId) => {
  const checkExisting = await GameRequest.findOne({ 
    game: gameId,
    isActive: true
  })

  if (checkExisting) throw new ApplicationError('Game request already pending.', 400)

  const isFriends = await isFriendsWith(receiverId, requesterId)
  if (!isFriends) throw new ApplicationError('Unauthorized request, users are not friends.', 400)

  const newGameRequest = new GameRequest({
    requester: requesterId,
    receiver: receiverId,
    isActive: true,
    game: gameId
  })

  await newGameRequest.save()

  return newGameRequest._id
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
  if (game.status === ServerGameStatus.inactive) throw new ApplicationError('Game inactive.', 400)
  if (game.activePlayer.toString() !== gameData.requesterId) throw new ApplicationError('User is not the active player.', 400)

  // most recent round
  const currentRound = game.rounds.length > 0 ? game.rounds[game.rounds.length - 1] : null
  // if the last round is complete, throw error
  if (!currentRound) throw new ApplicationError('Game data error. No current round.', 500)
  if (currentRound.state === ServerRoundState.over && game.rounds.length === game.numRounds) {
    game.status = ServerGameStatus.inactive
    game.save()
    throw new ApplicationError('Game is already over.', 400)
  }

  const type = req.query.type
  if (!(type === 'guess' || type === 'doodle')) throw new ApplicationError('Valid type is needed as query parameter: \'guess\' or \'doodle\'', 400)

  if (type === 'doodle') {
    if (!gameData.doodles) throw new ApplicationError('Send doodles in request body.', 400)
    // the round state should be DOODLE
    if (currentRound.state != ServerRoundState.doodle) throw new ApplicationError(`Game is not awaiting doodles. Current round state is ${currentRound.state}`, 400)
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
    currentRound.state = ServerRoundState.guess
  } 
  
  else if (type === 'guess') {
    // game state should be GUESS
    if (!gameData.guesses) throw new ApplicationError('Send guesses in request body.', 400)
    if (currentRound.state != ServerRoundState.guess) throw new ApplicationError(`Game is not awaiting doodles. Current round state is ${currentRound.state}`, 400)
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
    currentRound.state = ServerRoundState.over
  }

  // Update game
  game.timeOfLastMove = Date.now()

  if (currentRound.state === ServerRoundState.over) {
    if (game.rounds.length < game.numRounds) {
      // create next round
      game.rounds.push({
        state: ServerRoundState.doodle,
        doodles: [],
        guesses: []
      })

      game.nextWords = generateWords(game.allWords)
      game.allWords = [...game.allWords, ...game.nextWords]
      game.currentRound = game.rounds[game.currentRoundNum++]
    } else {
      // Game over
      game.status = ServerGameStatus.inactive
      game.activePlayer = null
      game.nextWords = null
      game.currentRoundNum = null
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

  // if it's the first round, create a game request for this game
  if (savedGame.status === ServerGameStatus.pending) {
    const gameRequestId = await createGameRequest(req, savedGame.player1._id, savedGame.player2._id, savedGame._id)
    return res.status(201).json({ ...savedGame.toJSON(), gameRequestId })
  }
  
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
  
  const gameJson = game.toJSON()

  // don't send round gameplay data if the player is inactive. only results are needed.
  if (game.activePlayer && userId !== game.activePlayer._id.toString()) {
    delete gameJson.currentRound
  }
  
  res.json(gameJson)
}

module.exports = { getActive, sendRound, getNewGame, getGame }