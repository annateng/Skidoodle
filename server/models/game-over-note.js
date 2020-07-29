const mongoose = require('mongoose')

const gameOverNoteSchema = new mongoose.Schema({
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dateRequested: {
      type: Date,
      default: Date.now
    },
    isActive: Boolean
})

gameOverNoteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('GameOverNote', gameOverNoteSchema)