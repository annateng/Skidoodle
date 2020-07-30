/**
 * Application wide common items here, they're all exported by frontend and backend common.js respectively
 */

const inProduction = process.env.NODE_ENV === 'production'

// server game states enum. used by frontend logic too.
const ServerGameStatus = Object.freeze({
  pending: 'PENDING',
  active: 'ACTIVE',
  inactive: 'INACTIVE'
})

// server round states enum. used by frontend logic too.
const ServerRoundState = Object.freeze({
  guess: 'GUESS',
  doodle: 'DOODLE',
  over: 'OVER'
})

// game variables
const NUM_ROUNDS = inProduction ? 6 : 3
const ROUND_LEN = inProduction ? 30 : 30
const WORDS_PER_ROUND = inProduction ? 3 : 5

module.exports = {
  inProduction, ServerGameStatus, ServerRoundState,
  NUM_ROUNDS, ROUND_LEN, WORDS_PER_ROUND
}
