import React, { useState, useRef, useEffect } from 'react'
import { Form, Input, Button, Typography, Alert } from 'antd'
import { MailOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'

import { sendInvite } from 'Utilities/services/emailService'

const Signup = () => {
  const user = useSelector(state => state.user)
  const [alertMessage, setAlertMessage] = useState()
  const [alertType, setAlertType] = useState()
  const alertRef = useRef()

  // Clean up alert settimeouts if component unmounts
  useEffect(() => () => clearTimeout(alertRef.current), [])

  const handleSendInvite = async (values) => {
    if (!user || !user.user) {
      handleSetAlert('Log in to send e-mail invites.', 'error')
      return
    }

    try {
      await sendInvite(values.email, user.user.username)

      handleSetAlert('Invite sent', 'success')
    } catch (e) {
      console.error(e.message)
    }
  }

  const handleSetAlert = (message, type) => {
    setAlertType(type)
    setAlertMessage(message)

    if (alertRef.current) clearTimeout(alertRef.current)
    alertRef.current = setTimeout(() => setAlertMessage(null), 5000)
  }
  // Set alert invisible unless unsuccessful login
  const displayStyle = alertMessage ? null : { display: 'none' }
  // antd form layout settings
  const layout = {
    layout: 'vertical'
  }
  
  return (
    <div className='main-layout vertical-center-div'>
      <Alert message={alertMessage} type={alertType} showIcon style={displayStyle} className='skinny-skinny-alert' />
      <div className='skinny-skinny-container'>
        <Typography.Title level={3}>Invite your friends to play skidoodle</Typography.Title> 
        <Form {...layout} onFinish={handleSendInvite} onFinishFailed={() => console.error('Required form fields missing.')}>
          <Form.Item label='E-mail address' name='email'
              rules={[{ required: true, type: 'email', message: 'Please enter valid email address.' }]}>
              <Input />
          </Form.Item>
          <Form.Item>
              <Button type='primary' htmlType='submit' size='large'><MailOutlined />Send Invite</Button>
          </Form.Item>
        </Form>    
      </div>
    </div>
  )
}

export default Signup
