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

// Everything from application wide common items is available through here
export * from '@root/config/common'
