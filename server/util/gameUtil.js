const dictionary = require('@util/dictionary.json')
const { WORDS_PER_ROUND } = require('@util/common')
const dictLen = dictionary.words.length


const generateWords = wordsSoFar => {
  if (!wordsSoFar) wordsSoFar = []

  const wordsToReturn = []

  while (wordsToReturn.length < WORDS_PER_ROUND) {
    const randomWordIndex = Math.floor(Math.random() * dictLen)
    const randomWord = dictionary.words[randomWordIndex]
    if (!wordsSoFar.includes(randomWord) && !wordsToReturn.includes(randomWord)) wordsToReturn.push(randomWord)
  }

  return wordsToReturn
}

module.exports = { generateWords, calculateResult }