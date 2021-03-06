/* eslint-disable no-underscore-dangle */

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: String,
  displayName: String,
  dateJoined: {
    type: Date,
    default: Date.now,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  highScores: [{
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    partnerUsername: String,
    timeStamp: Date,
    score: {
      numCorrect: Number,
      totalTimeSpent: Number,
    },
  }],
  settings: {
    alertFrequency: {
      type: String,
      default: 'ALL',
    },
  },
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.passwordHash;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
