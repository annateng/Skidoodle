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

module.exports = {
  inProduction, ServerGameStatus, ServerRoundState
}
