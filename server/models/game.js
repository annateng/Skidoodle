const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
    // TODO: specify exactly 2 players
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dateStarted: {
        type: Date,
        default: Date.now
    },
    drawings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drawing'
    }],
    scoreBoard: [{
        correct: Boolean,
        time: Number
    }],
    numRounds: {
        type: Number,
        default: 10
    },
})

gameSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Game', gameSchema)