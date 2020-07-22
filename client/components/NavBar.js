import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Layout, Menu, Button, Dropdown } from 'antd'
import { MenuOutlined } from '@ant-design/icons';

import { images } from 'Utilities/common'
import { logout } from 'Utilities/reducers/loginReducer'

const NavBar = ({ user }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'logout': 
        dispatch(logout())
        history.push('/')
    }
  }

  const menu = (
    <Menu onClick={handleMenuClick} style={{ padding: '10px' }}>
      <span style={{ fontSize: '16px' }}>Logged in as {user && user.user && user.user.username}</span>
      <Menu.Item key="logout" style={{ fontSize: '16px' }}>Log Out</Menu.Item>
    </Menu>
  )
  
  return (
    <Layout.Header style={{ position: 'relative' }}>
      <div><img id='header-logo' src={images.logo} alt='skidoodle logo' /></div>
      { user && user.user && 
        <Dropdown overlay={menu}>
          <MenuOutlined id='header-user-info' />
        </Dropdown>
      }
    </Layout.Header>
  )
}

export default NavBar
