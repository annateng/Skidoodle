import { login } from 'Utilities/services/loginService'
import { setAllTokens } from 'Utilities/common'
import { sendUpdateSettings } from 'Utilities/services/userService'

const loginReducer = (state = {}, action) => {
  switch (action.type) {
    case 'LOGIN': 
      return {
        ...action.data
      }
    case 'LOGOUT':
      return {}
    case 'UPDATE-SETTINGS':
      return {
        ...state,
        user: {
          ...state.user,
          settings: action.data
        }
      }
  }
  return state
}

export const loginUser = userData => {
  return async dispatch => {
    try {
      const loggedInUser = await login(userData)
      setAllTokens(loggedInUser.token)
      dispatch({
        type: 'LOGIN',
        data: {
          ...loggedInUser
        }
      })
    } catch (e) {
      throw new Error(e.message)
    }
  } 
}

export const logout = () => {
  return {
    type: 'LOGOUT'
  }
}

export const updateSettings = (settings, userId) => {
  return async dispatch => {
    try {
      const updatedSettings = await sendUpdateSettings(settings, userId)
      dispatch({
        type: 'UPDATE-SETTINGS',
        data: {
          ...updatedSettings
        }
      })
    } catch (e) {
      throw new Error(e.message)
    }
  }
}

export default loginReducer 