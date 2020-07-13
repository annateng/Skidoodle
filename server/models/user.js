const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    passwordHash: String,
    displayName: String,
    dateJoined: {
        type: Date,
        default: Date.now
    },
    email: String,
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject.passwordHash
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('User', userSchema)