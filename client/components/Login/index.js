import React, { useState } from 'react'
import { loginUser, logout } from 'Utilities/reducers/loginReducer'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Form, Input, Button, Typography, Space } from 'antd'

// TODO: handle bad login
const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const history = useHistory()

  const handleLogin = async (values) => {
    dispatch(loginUser({
      username: values.username, 
      password: values.password 
    }))
    history.push('/profile')
  }

  if (user && user.user) {
    return (
      <div id='login-form-div'>
        <Typography.Title level={2}>You are already logged in as {user.user.username} </Typography.Title>
        <Space>
          <Button type='primary' size='large' onClick={() => dispatch(logout())}>Log Out</Button>
          <Button type='primary' size='large' onClick={() => history.push('/profile')}>Go To My Profile</Button>
        </Space>
      </div>
    )
  }

  return (
    <div id='login-form-div'>
      <Typography.Title>Log In</Typography.Title> 
      <Form layout='vertical' onFinish={handleLogin} onFinishFailed={() => console.error('Required form fields missing.')}>
        <Form.Item label='Username' name='username'
          rules={[{ required: true, message: 'Username required' }]}>
          <Input />
        </Form.Item>
        <Form.Item label='Password' name='password'
          rules={[{ required: true, message: 'Password required' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit' size='large'>Log In</Button>
        </Form.Item>
      </Form>    
    </div>
  )
}

export default LoginPage
