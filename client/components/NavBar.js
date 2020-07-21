import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Layout, Menu, Button, Dropdown } from 'antd'
import { DownOutlined } from '@ant-design/icons';

import { images } from 'Utilities/common'
import { logout } from 'Utilities/reducers/loginReducer'

const NavBar = ({ user }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'logout': 
        dispatch(logout())
        history.push('/login')
    }
  }

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="logout" style={{ fontSize: 16+'px' }}>Log Out</Menu.Item>
    </Menu>
  )
  
  return (
    <Layout.Header>
      <div id='header-logo'>
        <img src={images.logo} alt='skidoodle logo' />
      </div>
      { user && user.user && 
        <div id='header-user-info'>
          <Dropdown overlay={menu}>
            <Button size='small' style={{ fontSize: 16+'px' }}>{user.user.username} is logged in<DownOutlined /></Button>
          </Dropdown>
        </div>
      }
    </Layout.Header>
  )
}

export default NavBar
