import { login } from 'Utilities/services/loginService'
import { setAllTokens } from 'Utilities/common'

const loginReducer = (state = {}, action) => {
  switch (action.type) {
    case 'LOGIN': 
      return {
        ...action.data
      }
    case 'LOGOUT':
      return {}
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

export default loginReducer 