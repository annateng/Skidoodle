import React, { useState } from 'react'
import { loginUser } from 'Utilities/reducers/loginReducer'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

// TODO: handle bad login
const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()
  // const user = useSelector(state => state.user)
  const history = useHistory()

  const handleLogin = async event => {
    event.preventDefault()
    dispatch(loginUser({
      username, 
      password 
    }))
    history.push('/draw')
  }

  return (
    <div> 
      <form onSubmit={handleLogin}>
        <div>
          username <input type='text' value={username} onChange={event => setUsername(event.target.value)}></input>
        </div>
        <div>
          password <input type='text' value={password} onChange={event => setPassword(event.target.value)}></input>
        </div>
        <button type='submit'>Log In</button>
      </form>    
    </div>
  )
}

export default LoginPage
