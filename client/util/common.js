import logo_gif from 'Assets/logo-gif.gif'
import PenIcon from 'Assets/pen.png'
import GuessIcon from 'Assets/guess.png'
import { setToken as setGameToken } from 'Utilities/services/gameService'
import { setToken as setUserToken } from 'Utilities/services/userService'
import { setToken as setEmailToken } from 'Utilities/services/emailService'

export const images = {
  logo_gif, PenIcon, GuessIcon
}

export const setAllTokens = authToken => {
  setGameToken(authToken)
  setUserToken(authToken)
  setEmailToken(authToken)
}

// Frontend game states enum
export const GameState = Object.freeze({
  showLastResult: 'SHOW-LAST-RESULT',
  guess: 'GUESS',
  showThisResult: 'SHOW-THIS-RESULT',
  doodle: 'DOODLE',
  over: 'OVER',
  inactiveGame: 'INACTIVE-GAME',
  inactivePlayer: 'INACTIVE-PLAYER',
  pending: 'PENDING'
})

export const monthNames = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
]

export const STROKE_WIDTH = 3

// Everything from application wide common items is available through here
export * from '@root/config/common'
