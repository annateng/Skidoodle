const mongoose = require('mongoose')

const drawingSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  r: Number,
  g: Number,
  b: Number,
  width: String,
  isDrawing: Boolean
}, { _id: false })

const doodleSchema = new mongoose.Schema({
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    },
    timeStamp: {
        type: Date,
        default: Date.now
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    drawing: [drawingSchema],
    guesses: Object, // TODO
    label: String,
    result: {
      isCorrect: Boolean,
      timeSpent: Number
    }
})

doodleSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Doodle', doodleSchema)