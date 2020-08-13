import React from 'react';
import { Typography } from 'antd';
import { Link, useHistory } from 'react-router-dom';

const NoMatch = () => {
  const history = useHistory();

  return (
    <div className="main-layout">
      <Typography.Title level={4}>oops, page not found</Typography.Title>
      <b><Link to="/" onClick={() => history.goBack()}>Go back</Link></b>
      <br />
      <b><Link to="/login">Go to log in</Link></b>
      <br />
      <b><Link to="/home">Go home</Link></b>
      <br />
    </div>
  );
};

export default NoMatch;
