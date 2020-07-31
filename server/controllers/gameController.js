const common = require('@util/common')
const { ApplicationError } = require('@util/customErrors')
const { checkAuthorization } = require('@util/authUtil')
const { generateWords } = require('@util/gameUtil')
const Doodle = require('@models/doodle')
const Game = require('@models/game')
const GameRequest = require('@models/game-request')
const User = require('@models/user')
const GameOverNote = require('@models/game-over-note')
const { sendUpdate } = require('@util/emailUtil')

const { NUM_ROUNDS, ROUND_LEN, NUM_HIGH_SCORES, ServerGameStatus, ServerRoundState } = common

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

  // // User can start a game with anyone - doesn't have to be friends 
  // const isFriends = await isFriendsWith(gameData.requesterId, gameData.receiverId) 
  // if (!isFriends) throw new ApplicationError('Requester is not friends with this user.', 401)

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
    },
    isHighScore: {
      p1: false,
      p2: false
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

  // const isFriends = await isFriendsWith(receiverId, requesterId)
  // if (!isFriends) throw new ApplicationError('Unauthorized request, users are not friends.', 400)

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

  // client will either send guesses or doodles
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
        artist: gameData.requesterId,
        recipient: game.player1.toString() === gameData.requesterId ? game.player2 : game.player1,
        drawing: doodle.drawing,
        label: doodle.label,
        width: doodle.width
      })

      const savedDoodle = await newDoodle.save()
      currentRound.doodles.push(savedDoodle)
    }

    // active player switches after draw
    game.activePlayer = game.activePlayer.toString() === game.player1.toString() ? game.player2 : game.player1

    // send email update to new active player
    const inactive = game.activePlayer.toString() === game.player1.toString() ? await User.findById(game.player2) : await User.findById(game.player1)
    const active = await User.findById(game.activePlayer)
    if (active.settings.alertFrequency === 'ALL') sendUpdate(active.email, `It's your turn against <b style="color:tomato;">${inactive.username}</b>`, 
      inactive.username, 'Let\'s play', `/game/${game._id.toString()}`)

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

      game.allWords = [...game.allWords, ...game.nextWords]
      game.nextWords = generateWords(game.allWords)
      game.currentRound = game.rounds[game.currentRoundNum++]
    } else {
      // send game over note to the inactive player
      const gon = new GameOverNote({
        game: game,
        sender: game.activePlayer,
        receiver: game.player1.toString() === game.activePlayer.toString() ? game.player2 : game.player1,
        isActive: true
      })
      await gon.save()

      const p1 = await User.findById(game.player1)
      const p2 = await User.findById(game.player2)

      // send e-mail alert to inactive player
      const inactive = p1._id.toString() === game.activePlayer.toString() ? p2 : p1
      const active = p1._id.toString() === game.activePlayer.toString() ? p1 : p2
      if (inactive.settings.alertFrequency === 'ALL') sendUpdate(inactive.email, `Game with <b style="color:tomato;">${active.username}</b> 
        has ended.`, active.username, 'See results', `/home`)
      
      // Game over
      game.status = ServerGameStatus.inactive
      game.activePlayer = null
      game.nextWords = null
      game.currentRoundNum = null

      // calculate whether game qualifies as a high score
      if (p1.highScores.length > NUM_HIGH_SCORES || p2.highScores.length > NUM_HIGH_SCORES) throw new ApplicationError('Player has too many high scores.', 500)

      // if player has less than NUM_HIGH_SCORES total scores, just add this game to the high score list
      if (p1.highScores.length < NUM_HIGH_SCORES) {
        p1.highScores.push({
          game: game._id,
          partner: p2._id,
          partnerUsername: p2.username,
          timeStamp: game.timeOfLastMove,
          score: {
            ...game.result.gameTotals
          }
        })

        game.isHighScore.p1 = true
        
      } else if (p1.highScores.sort((a,b) => a.score.totalTimeSpent - b.score.totalTimeSpent)[NUM_HIGH_SCORES - 1] > game.result.gameTotals.totalTimeSpent) {
        p1.highScores.pop() // remove slowest game
        p1.highScores.push({
          game: game._id,
          partner: p2._id,
          partnerUsername: p2.username,
          timeStamp: game.timeOfLastMove,
          score: {
            ...game.result.gameTotals
          }
        })
        p1.highScores.sort((a,b) => a.score.totalTimeSpent - b.score.totalTimeSpent) // sort ascending in time
        game.isHighScore.p1 = true
      }

      // if player has less than NUM_HIGH_SCORES total scores, just add this game to the high score list
      if (p2.highScores.length < NUM_HIGH_SCORES) {
        p2.highScores.push({
          game: game._id,
          partner: p1._id,
          partnerUsername: p1.username,
          timeStamp: game.timeOfLastMove,
          score: {
            ...game.result.gameTotals
          }
        })
        game.isHighScore.p2 = true

      } else if (p2.highScores.sort((a,b) => a.score.totalTimeSpent - b.score.totalTimeSpent)[NUM_HIGH_SCORES - 1] > game.result.gameTotals.totalTimeSpent) {
        p2.highScores.pop() // remove slowest game
        p2.highScores.push({
          game: game._id,
          partner: p1._id,
          partnerUsername: p1.username,
          timeStamp: game.timeOfLastMove,
          score: {
            ...game.result.gameTotals
          }
        })
        p2.highScores.sort((a,b) => a.score.totalTimeSpent - b.score.totalTimeSpent) // sort ascending in time
        game.isHighScore.p2 = true
      }
      
      await p1.save()
      await p2.save()
    }
  } else {
    game.currentRound = currentRound
  }

  const savedGame = await game.save()
  await savedGame
    .populate({ path: 'player1', select: 'username'})
    .populate({ path: 'player2', select: 'username settings email'})
    .populate({ path: 'activePlayer', select: 'username'})
    .execPopulate()

  // if it's the first round, create a game request for this game
  if (savedGame.status === ServerGameStatus.pending) {
    const gameRequestId = await createGameRequest(req, savedGame.player1._id, savedGame.player2._id, savedGame._id)
    // if player2 has email notifications on, send email
    if (savedGame.player2.settings.alertFrequency === 'ALL') sendUpdate(savedGame.player2.email, `You have a new game request from 
      <b style="color:tomato;">${savedGame.player1.username}</b>.`, savedGame.player1.username, 'Let\'s play', `/home`)
    delete savedGame.player2.settings
    delete savedGame.player2.email
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

  if (!game) throw new ApplicationError('Game not found.', 404)

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

const getRandomDoodle = async (req,res) => {
  const numDoodles = await Doodle.count()
  const randomIndex = Math.floor(Math.random() * numDoodles)
  const doodle = await Doodle.findOne().skip(randomIndex)

  res.json(doodle.toJSON())
}

const deleteNote = async (req, res) => {
  const note = await GameOverNote.findById(req.params.noteId)
  if (!note) res.status(410).send()

  checkAuthorization(req, note.receiver)
  
  note.isActive = false
  await note.save()

  res.status(204).send()
}

// router.get('/games/:gameId/get-replay/:roundNum', games.getRoundReplay)
const getRoundReplay = async (req, res) => {

  const gameId = req.params.gameId
  const roundNum = req.params.roundNum

  const game = await Game.findById(gameId).populate(`rounds.${roundNum-1}.doodles`).lean()

  if (game.rounds.length < roundNum) throw new ApplicationError(`Game only has ${game.rounds.length} rounds of data. You requested round ${roundNum}`, 400)

  const round = game.rounds[roundNum - 1]
  if (round.state !== ServerRoundState.over) throw new ApplicationError(`Round is not over. State is ${round.state}`, 400)

  round.roundLen = game.roundLen

  res.send(JSON.stringify(round))

}

module.exports = { getActive, sendRound, getNewGame, getGame, getRandomDoodle, deleteNote, getRoundReplay }