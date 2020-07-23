import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Layout, Space } from 'antd'

import { images } from 'Utilities/common'

const FrontPage = () => {
  const history = useHistory()

  return (
    <Layout id="homepage-div" style={{ padding: '0 24px 24px' }}>
        <img src={images.logo} id="homepage-logo" />
        <Space direction='vertical' align='center' >
          <Button type='primary' size='large' style={{ width: 400 }} block onClick={() => { history.push('/login') }}>Log In</Button>
          <Button type='primary' size='large' style={{ width: 400 }} block onClick={() => { history.push('/signup') }}>Sign Up</Button>
        </Space>
    </Layout>
  )
}

export default FrontPage
