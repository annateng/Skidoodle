import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Button, Layout, Space } from 'antd';

import { images } from 'Utilities/common';

const FrontPage = () => {
  const history = useHistory();

  return (
    <Layout id="homepage-div" style={{ padding: '0 24px 24px' }}>
      <img src={images.logoGif} id="homepage-logo" alt="skidoodle logo gif" />
      <Space direction="vertical" align="center">
        <Button type="primary" size="large" style={{ width: 400 }} block onClick={() => { history.push('/login'); }}>Log In</Button>
        <Button type="primary" size="large" style={{ width: 400 }} block onClick={() => { history.push('/signup'); }}>Sign Up</Button>
        <Link to="/about">About</Link>
      </Space>
    </Layout>
  );
};

export default FrontPage;
