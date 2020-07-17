import logo from 'Assets/logo.png'
import { setToken as setGameToken } from 'Utilities/services/gameService'
import { setToken as setUserToken } from 'Utilities/services/userService'

export const images = {
  logo,
}

export const setAllTokens = authToken => {
  setGameToken(authToken)
  setUserToken(authToken)
}

export const ROUND_LEN = 10

// Everything from application wide common items is available through here
export * from '@root/config/common'
