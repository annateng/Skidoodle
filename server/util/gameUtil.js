/* eslint-disable no-underscore-dangle */

const dictionary = require('@resources/dictionary.json');
const { WORDS_PER_ROUND } = require('@util/common');
const { ApplicationError } = require('@util/customErrors');
const GameRequest = require('@models/game-request');

const dictLen = dictionary.words.length;

const generateWords = (wordsSoFar) => {
  if (!wordsSoFar) wordsSoFar = [];

  const wordsToReturn = [];

  while (wordsToReturn.length < WORDS_PER_ROUND) {
    const randomWordIndex = Math.floor(Math.random() * dictLen);
    const randomWord = dictionary.words[randomWordIndex];
    if (!wordsSoFar.includes(randomWord) && !wordsToReturn.includes(randomWord)) {
      wordsToReturn.push(randomWord);
    }
  }

  return wordsToReturn;
};

/** send new game request */
const createGameRequest = async (req, requesterId, receiverId, gameId) => {
  const checkExisting = await GameRequest.findOne({
    game: gameId,
    isActive: true,
  });

  if (checkExisting) throw new ApplicationError('Game request already pending.', 400);

  // const isFriends = await isFriendsWith(receiverId, requesterId)
  // if (!isFriends) throw new ApplicationError('Unauthorized request, users are not friends.', 400)

  const newGameRequest = new GameRequest({
    requester: requesterId,
    receiver: receiverId,
    isActive: true,
    game: gameId,
  });

  await newGameRequest.save();

  return newGameRequest._id;
};

module.exports = { generateWords, createGameRequest };
