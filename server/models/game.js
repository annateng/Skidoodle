const mongoose = require('mongoose')

const roundSchema = new mongoose.Schema({
  state: String, // GUESS, DOODLE, OVER
  doodles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doodle'
  }],
  guesses: [{
    guesses: [String],
    isCorrect: Boolean,
    timeSpent: Number,
  }]
}, { _id: false })

const gameSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dateStarted: {
    type: Date,
    default: Date.now
  },
  numRounds: Number,
  roundLen: Number,
  timeOfLastMove: Date,
  isActive: Boolean,
  currentRound: roundSchema,
  rounds: [roundSchema],
  currentRoundNum: Number,
  allWords: [String],
  activePlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },
  nextWords: [String],
  result: {
    roundScores: [{
      doodles: [{
        isCorrect: Boolean,
        timeSpent: Number,
        label: String
      }],
      roundTotals: {
        numCorrect: Number,
        totalTimeSpent: Number
      }
    }],
    gameTotals: {
      numCorrect: Number,
      totalTimeSpent: Number
    }
  }
})

gameSchema.set('toJSON', {
  transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject.rounds
      delete returnedObject.allWords
      delete returnedObject._id
      delete returnedObject.__v
      if (!returnedObject.currentRound || returnedObject.currentRound.state != 'DOODLE') delete returnedObject.nextWords
      
      // return active/inactive players instead of player1/player2
      if (returnedObject.activePlayer) {
        const activePlayerIdStr = returnedObject.activePlayer.id ? returnedObject.activePlayer.id.toString() : returnedObject.activePlayer.toString()
        const p1IdStr = returnedObject.player1.id ? returnedObject.player1.id.toString() : returnedObject.player1.toString()
        returnedObject.inactivePlayer = activePlayerIdStr === p1IdStr ? returnedObject.player2 : returnedObject.player1
        delete returnedObject.player1
        delete returnedObject.player2
      }
  }
})

module.exports = mongoose.model('Game', gameSchema)