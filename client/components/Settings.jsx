import React, { useState, useRef, useEffect } from 'react';
import {
  Form, Radio, Alert, Typography, Button,
} from 'antd';
import { SettingTwoTone } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { setAllTokens } from 'Utilities/common';
import { updateSettings } from 'Utilities/reducers/loginReducer';

const Settings = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [alertMessage, setAlertMessage] = useState();
  const [alertType, setAlertType] = useState();
  const [loading, setLoading] = useState(false);
  const alertRef = useRef();
  const history = useHistory();

  // Clean up alert settimeouts if component unmounts
  useEffect(() => () => clearTimeout(alertRef.current), []);

  if (user && user.user) setAllTokens(user.token);

  if (!user || !user.user || !user.user.settings) {
    return (
      <div className="main-layout">
        <div className="vertical-center-div">
          <Typography.Title level={4}>Log in to see your settings</Typography.Title>
          <Button type="primary" size="large" onClick={() => history.push('/login?redirect=settings')}>Log In</Button>
        </div>
      </div>
    );
  }

  const handleUpdateSettings = async (values) => {
    try {
      setLoading(true);
      await dispatch(updateSettings({ alertFrequency: values.alertFreq }, user.user.id));

      handleSetAlert('Settings saved.', 'success');
      setLoading(false);
    } catch (e) {
      console.error(e.message);
    }
  };

  const handleSetAlert = (message, type) => {
    setAlertType(type);
    setAlertMessage(message);

    if (alertRef.current) clearTimeout(alertRef.current);
    alertRef.current = setTimeout(() => setAlertMessage(null), 5000);
  };
  // Set alert invisible unless unsuccessful login
  const displayStyle = alertMessage ? null : { display: 'none' };

  return (
    <div className="main-layout vertical-center-div">
      <Alert message={alertMessage} type={alertType} showIcon style={displayStyle} className="skinny-skinny-alert" />
      <div className="skinny-skinny-container">
        <Typography.Title>
          <SettingTwoTone />
&nbsp;&nbsp;Settings for
          {' '}
          <Link to={`/profile/${user.user.id}`}>{user.user.username}</Link>
        </Typography.Title>
        <Form
          onFinish={handleUpdateSettings}
          onFinishFailed={() => console.error('Required form fields missing.')}
          initialValues={{ alertFreq: user.user.settings.alertFrequency }}
        >
          <Form.Item label="How frequently would you like to receive e-mail game alerts?" name="alertFreq">
            <Radio.Group>
              <Radio value="ALL">As they come</Radio>
              <br />
              {/* <Radio value='DAILY'>Daily</Radio> */}
              <Radio value="NEVER">Never</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" loading={loading}>Save changes</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Settings;
