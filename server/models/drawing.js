const mongoose = require('mongoose')

// TODO: figure out what a drawing object is
const drawingSchema = new mongoose.Schema({
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    },
    dateStarted: {
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
    drawing: Object,
    label: String
})

drawingSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Drawing', drawingSchema)