import React, { useState, useRef, useEffect } from 'react'
import { loginUser, logout } from 'Utilities/reducers/loginReducer'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Form, Input, Button, Typography, Space, Alert } from 'antd'

const Login = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const history = useHistory()
  const [alertMessage, setAlertMessage] = useState()
  const alertRef = useRef()

  // Clean up alert settimeouts if component unmounts
  useEffect(() => () => clearTimeout(alertRef.current), [])

  // If a user is already logged in, don't display login form
  if (user && user.user) {
    return (
      <div className='main-layout' id='login-form-div'>
        <Typography.Title level={2}>You are already logged in as {user.user.username} </Typography.Title>
        <Space direction='vertical'>
          <Button type='danger' size='large' onClick={() => dispatch(logout())}>Log Out</Button>
          <Button type='primary' size='large' onClick={() => history.push(`/profile/${user.user.id}`)}>Go To My Profile</Button>
        </Space>
      </div>
    )
  }

  const handleLogin = async (values) => {
    try {
      await dispatch(loginUser({
        username: values.username, 
        password: values.password 
      }))
      history.push('/home')
    } catch (e) {
      console.warn(e.message)
      handleSetAlert(e.message)
    }
  }

  const handleSetAlert = errorMessage => {
    if (!errorMessage) setAlertMessage('Error while logging in.')
    else if (errorMessage.includes('Invalid username.')) setAlertMessage('Username not found.')
    else if (errorMessage.includes('Incorrect password.')) setAlertMessage('Invalid password.')
    else setAlertMessage(errorMessage)

    if (alertRef.current) clearTimeout(alertRef.current)
    alertRef.current = setTimeout(() => setAlertMessage(null), 5000)
  }

  // Set alert invisible unless unsuccessful login
  const displayStyle = alertMessage ? null : { display: 'none' }

  return (
    <div className='main-layout' id='login-form-div'>
      <Alert message={alertMessage} type="error" showIcon style={displayStyle} />
      <Typography.Title>Log In</Typography.Title> 
      <Form onFinish={handleLogin} onFinishFailed={() => console.error('Required form fields missing.')}>
        <Form.Item label='Username' name='username'
          rules={[{ required: true, message: 'Username required' }]}>
          <Input />
        </Form.Item>
        <Form.Item label='Password' name='password'
          rules={[{ required: true, message: 'Password required' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type='primary' htmlType='submit' size='large' style={{ marginRight: '20px' }}>Log In</Button>
          <Button size='large' onClick={() => history.push('/signup')}>Sign Up</Button>
        </Form.Item>
      </Form>    
    </div>
  )
}

export default Login
