import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, Link } from 'react-router-dom';
import { Layout, Menu, Dropdown } from 'antd';
import {
  MenuOutlined, HomeOutlined, SearchOutlined, UserOutlined, MailOutlined, SettingOutlined,
} from '@ant-design/icons';

import { images } from 'Utilities/common';
import { logout } from 'Utilities/reducers/loginReducer';

const NavBar = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector((state) => state.user);
  const location = useLocation();

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'logout':
        dispatch(logout());
        history.push('/');
        break;
      case 'home':
        history.push('/home');
        break;
      case 'search':
        history.push('/add-friends');
        break;
      case 'profile':
        if (user && user.user) {
          history.push(`/profile/${user.user.id}`);
          history.go();
        } else history.push('/login');
        break;
      case 'invite':
        history.push('/send-invite');
        break;
      case 'about':
        history.push('/about');
        break;
      case 'settings':
        history.push('/settings');
        break;
      default:
        // do nothing
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick} style={{ padding: '10px' }}>
      <b>
        Logged in as
        {user && user.user && user.user.username}
      </b>
      <Menu.Item className="navbar-hamburger-item" key="about">About Skidoodle</Menu.Item>
      <Menu.Item className="navbar-hamburger-item" key="settings" icon={<SettingOutlined />}>Settings</Menu.Item>
      <Menu.Item className="navbar-hamburger-item" key="logout">Log Out</Menu.Item>
    </Menu>
  );

  return (
    <Layout.Header id="navbar">
      <div
        onClick={() => history.push('/')}
        onKeyDown={(e) => { if (e.keyCode === 13) history.push('/'); }}
        role="link"
        tabIndex={0}
      >
        <img id="header-logo" src={images.logoGif} alt="skidoodle logo gif" />
      </div>
      <Menu mode="horizontal" style={{ background: 'transparent', display: 'inline-block' }} onClick={handleMenuClick}>
        <Menu.Item title="Home" className="navbar-icon" key="home"><HomeOutlined /></Menu.Item>
        <Menu.Item title="My Profile" className="navbar-icon" key="profile"><UserOutlined /></Menu.Item>
        <Menu.Item title="Find New Friends" className="navbar-icon" key="search"><SearchOutlined /></Menu.Item>
        <Menu.Item title="Invite Friends" className="navbar-icon" key="invite"><MailOutlined /></Menu.Item>
      </Menu>
      { user && user.user
        && (
        <Dropdown overlay={menu} style={{ display: 'block' }}>
          <MenuOutlined id="header-user-info" />
        </Dropdown>
        )}
      { (!user || !user.user) && (
      <div style={{ position: 'absolute', top: '0', right: '50px' }}>
        You are not logged in
        {' '}
        <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`}>Log In</Link>
      </div>
      )}
    </Layout.Header>
  );
};

export default NavBar;
