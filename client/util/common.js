import logo from 'Assets/logo.png'
import logo_pic_only from 'Assets/logo_pic_only.png'
import { setToken as setGameToken } from 'Utilities/services/gameService'
import { setToken as setUserToken } from 'Utilities/services/userService'

export const images = {
  logo, logo_pic_only
}

export const setAllTokens = authToken => {
  setGameToken(authToken)
  setUserToken(authToken)
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

// Everything from application wide common items is available through here
export * from '@root/config/common'
