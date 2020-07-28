const dictionary = require('@resources/dictionary.json')
const { WORDS_PER_ROUND } = require('@util/common')
const dictLen = dictionary.words.length


const generateWords = wordsSoFar => {
  if (!wordsSoFar) wordsSoFar = []

  const wordsToReturn = []

  console.log(dictLen) // DEBUG

  while (wordsToReturn.length < WORDS_PER_ROUND) {
    const randomWordIndex = Math.floor(Math.random() * dictLen)
    console.log(randomWordIndex) // DEBUG
    const randomWord = dictionary.words[randomWordIndex]
    if (!wordsSoFar.includes(randomWord) && !wordsToReturn.includes(randomWord)) wordsToReturn.push(randomWord)
  }

  return wordsToReturn
}

/** send new game request */
const createGameRequest = async (req, requesterId, receiverId, gameId) => {
  const checkExisting = await GameRequest.findOne({ 
    game: gameId,
    isActive: true
  })

  if (checkExisting) throw new ApplicationError('Game request already pending.', 400)

  const isFriends = await isFriendsWith(req.params.id, req.body.requesterId)
  if (!isFriends) throw new ApplicationError('Unauthorized request, users are not friends.', 400)

  const newGameRequest = new GameRequest({
    requester: req.body.requesterId,
    receiver: req.params.id,
    isActive: true,
    game: req.body.gameId
  })

  await newGameRequest.save()

  res.status(201).send()
}

module.exports = { generateWords, createGameRequest }