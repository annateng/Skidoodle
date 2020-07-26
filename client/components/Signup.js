import React, { useState, useRef, useEffect } from 'react'
import { Form, Input, Button, Typography, Alert } from 'antd'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { signUpUser } from 'Utilities/services/userService'
import { loginUser } from 'Utilities/reducers/loginReducer'

const Signup = () => {
  const [alertMessage, setAlertMessage] = useState()
  const [alertType, setAlertType] = useState('error')
  const alertRef = useRef()
  const history = useHistory()
  const dispatch = useDispatch()

  // Clean up alert settimeouts if component unmounts
  useEffect(() => () => clearTimeout(alertRef.current), [])

  const handleSignUp = async (values) => {
    try {
      const newUser = await signUpUser({
        ...values
      })

      // automatically log in after sign up
      await dispatch(loginUser({
        username: newUser.username, 
        password: values.password 
      }))

      setAlertMessage('Success!')
      setAlertType('success')

      if (alertRef.current) clearTimeout(alertRef.current)
      alertRef.current = setTimeout(() => {
        history.push('/home')
      }, 1000)
    } catch (e) {
      console.error(e.message)
      handleSetError(e.message)
    }
  }

  const handleSetError = errorMessage => {
    if (!errorMessage) setAlertMessage('Error while logging in.')
    else if (errorMessage.toLowerCase().includes('username')) setAlertMessage('Username taken.')
    else if (errorMessage.toLowerCase().includes('email')) setAlertMessage('User already exists for this email address.')
    else setAlertMessage(errorMessage)

    if (alertRef.current) clearTimeout(alertRef.current)
    alertRef.current = setTimeout(() => setAlertMessage(null), 5000)
  }

  const validateMessages = {
    required: '${label} required!',
    types: {
      email: 'Please enter valid email address.',
    },
  }

  // Alert message settings
  const displayStyle = alertMessage ? { width: '100%', marginBottom: '10px' } : { display: 'none' }

  // antd form layout settings
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  }

  return (
    <div className='main-layout vertical-center-div'>
      <Alert message={alertMessage} type={alertType} showIcon style={displayStyle} className='skinny-skinny-alert' />
      <div className='skinny-skinny-container'>
        <Typography.Title>Sign Up</Typography.Title> 
        <Form {...layout} onFinish={handleSignUp} validateMessages={validateMessages}
          onFinishFailed={() => console.error('Required form fields missing.')}>
          <Form.Item label='Name' name='displayName'
              rules={[{ required: true }]}>
              <Input />
          </Form.Item>
          <Form.Item label='E-mail address' name='email'
              rules={[{ required: true, type: 'email' }]}>
              <Input />
          </Form.Item>
          <Form.Item label='Username' name='username'
            rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label='Password' name='password'
            rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type='primary' htmlType='submit' size='large' style={{ marginRight: '20px'}}>Sign Up</Button>
              <Button htmlType='submit' size='large' style={{ fontSize: '16px' }} onClick={() => history.push('/login')}>I already have an account</Button>
          </Form.Item>
        </Form>    
      </div>
    </div>
  )
}

export default Signup
