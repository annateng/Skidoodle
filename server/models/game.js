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
      // returnedObject.currentRound = returnedObject.isActive ? returnedObject.rounds[returnedObject.rounds.length - 1] : null
      delete returnedObject.rounds
      delete returnedObject.allWords
      delete returnedObject._id
      delete returnedObject.__v
      if (!returnedObject.currentRound || returnedObject.currentRound.state != 'DOODLE') delete returnedObject.nextWords
  }
})

module.exports = mongoose.model('Game', gameSchema)