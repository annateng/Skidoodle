import { login } from 'Utilities/services/loginService'
import { setAllTokens } from 'Utilities/common'

const loginReducer = (state = {}, action) => {
  switch (action.type) {
    case 'LOGIN': 
      return {
        username: action.data.user.username,
        displayName: action.data.user.displayName,
        id: action.data.user.id,
        token: action.data.token
      }
    case 'LOGOUT':
      return {}
  }
  return state
}

export const loginUser = userData => {
  return async dispatch => {
    const loggedInUser = await login(userData)
    setAllTokens(loggedInUser.token)
    dispatch({
      type: 'LOGIN',
      data: {
        ...loggedInUser
      }
    })
  } 
}

export default loginReducer 