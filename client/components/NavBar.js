import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Layout, Menu, Dropdown } from 'antd'
import { MenuOutlined, HomeOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';

import { images } from 'Utilities/common'
import { logout } from 'Utilities/reducers/loginReducer'

const NavBar = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const user = useSelector(state => state.user)

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'logout': 
        dispatch(logout())
        history.push('/')
        break
      case 'home':
        history.push('/home')
        break
      case 'search':
        history.push('/add-friends')
        break
      case 'profile':
        if (user && user.user) history.push(`/profile/${user.user.id}`)
        break
    }
  }

  const menu = (
    <Menu onClick={handleMenuClick} style={{ padding: '10px'}}>
      <b>Logged in as {user && user.user && user.user.username}</b>
      <Menu.Item className='navbar-hamburger-item' key='home'>Home</Menu.Item>
      <Menu.Item className='navbar-hamburger-item' key='profile'>Profile</Menu.Item>  
      <Menu.Item className='navbar-hamburger-item' key='logout'>Log Out</Menu.Item>
    </Menu>
  )
  
  return (
    <Layout.Header id='navbar'>
      <div onClick={() => history.push('/home')}><img id='header-logo' src={images.logo} alt='skidoodle logo' /></div> 
      <Menu mode="horizontal" style={{ background: 'transparent', display: 'inline-block' }} onClick={handleMenuClick}>
        <Menu.Item className='navbar-icon' key="home"><HomeOutlined /></Menu.Item>
        <Menu.Item className='navbar-icon' key="search"><SearchOutlined /></Menu.Item>
        <Menu.Item className='navbar-icon'key="profile"><UserOutlined /></Menu.Item>        
      </Menu>
      { user && user.user && 
        <Dropdown overlay={menu} style={{ display: 'block' }}>
          <MenuOutlined id='header-user-info' />
        </Dropdown>
      }
    </Layout.Header>
  )
}

export default NavBar
