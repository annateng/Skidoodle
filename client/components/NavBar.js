import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Layout, Menu, Dropdown } from 'antd'
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
        break
      case 'profile':
        history.push('/profile')
        break
    }
  }

  const menu = (
    <Menu onClick={handleMenuClick} style={{ padding: '10px', fontSize: '16px' }}>
      <b>Logged in as {user && user.user && user.user.username}</b>
      <Menu.Item key="profile" style={{ fontSize: '16px' }}>Profile</Menu.Item>
      <Menu.Item key="logout" style={{ fontSize: '16px' }}>Log Out</Menu.Item>
    </Menu>
  )
  
  // TODO: update home link
  return (
    <Layout.Header id='navbar'>
      <div onClick={() => history.push('/login')}><img id='header-logo' src={images.logo} alt='skidoodle logo' /></div> 
      { user && user.user && 
        <Dropdown overlay={menu}>
          <MenuOutlined id='header-user-info' />
        </Dropdown>
      }
    </Layout.Header>
  )
}

export default NavBar
