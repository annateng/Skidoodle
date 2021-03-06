import React, { useState, useRef, useEffect } from 'react';
import { loginUser, logout } from 'Utilities/reducers/loginReducer';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Form, Input, Button, Typography, Alert,
} from 'antd';
import { useQueryParam, StringParam } from 'use-query-params';

const Login = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const history = useHistory();
  const [alertMessage, setAlertMessage] = useState();
  const alertRef = useRef();
  const [redirect] = useQueryParam('redirect', StringParam);

  // Clean up alert settimeouts if component unmounts
  useEffect(() => () => clearTimeout(alertRef.current), []);

  // If a user is already logged in, don't display login form
  if (user && user.user) {
    return (
      <div className="main-layout vertical-center-div">
        <div className="skinny-skinny-container">
          <Typography.Title level={2}>
            You are already logged in as
            {' '}
            {user.user.username}
          </Typography.Title>
          <div style={{ marginBottom: '15px' }}><Button type="danger" size="large" onClick={() => dispatch(logout())}>Log Out</Button></div>
          <div><Button type="primary" size="large" onClick={() => history.push(`/profile/${user.user.id}`)}>Go To My Profile</Button></div>
        </div>
      </div>
    );
  }

  const handleSetAlert = (errorMessage) => {
    if (!errorMessage) setAlertMessage('Error while logging in.');
    else if (errorMessage.includes('Invalid username.')) setAlertMessage('Username not found.');
    else if (errorMessage.includes('Incorrect password.')) setAlertMessage('Invalid password.');
    else setAlertMessage(errorMessage);

    if (alertRef.current) clearTimeout(alertRef.current);
    alertRef.current = setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleLogin = async (values) => {
    try {
      await dispatch(loginUser({
        username: values.username,
        password: values.password,
      }));

      if (!redirect) history.push('/home');
      else history.push(`${decodeURIComponent(redirect)}`);
    } catch (e) {
      console.warn(e.message);
      handleSetAlert(e.message);
    }
  };

  // Set alert invisible unless unsuccessful login
  const displayStyle = alertMessage ? null : { display: 'none' };

  return (
    <div className="main-layout vertical-center-div">
      <Alert message={alertMessage} type="error" showIcon style={displayStyle} className="skinny-skinny-alert" />
      <div className="skinny-skinny-container">
        <Typography.Title>Log In</Typography.Title>
        <Form onFinish={handleLogin} onFinishFailed={() => console.error('Required form fields missing.')}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Username required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password required' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" size="large" style={{ marginRight: '20px' }}>Log In</Button>
            <Button size="large" onClick={() => history.push('/signup')}>Sign Up</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
