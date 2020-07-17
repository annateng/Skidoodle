const mongoose = require('mongoose')

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
  numRounds: {
    type: Number,
    default: 2 // TODO: move to common
  },
  timeOfLastMove: Date,
  rounds: [{ 
    doodles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doodle'
    }]
  }],
  allWords: [String],
  isActive: Boolean,
  activePlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },
  nextWords: [String],
  currentRound: Number,
  result: {
    scores: [{
      isCorrect: Boolean,
      timeSpent: Number
    }],
    totalScore: {
      numCorrect: Number,
      totalTimeSpent: Number
    }
  }
})

gameSchema.set('toJSON', {
  transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject.allWords
      delete returnedObject._id
      delete returnedObject.__v
  }
})

module.exports = mongoose.model('Game', gameSchema)