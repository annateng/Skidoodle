import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Typography, Input, List, Button, Alert,
} from 'antd';
import { UserOutlined, CheckOutlined, ExclamationOutlined } from '@ant-design/icons';

import {
  searchForUsers, addFriend, acceptFriendRequest, rejectFriendRequest,
} from 'Utilities/services/userService';
import { setAllTokens } from 'Utilities/common';

const AddFriends = () => {
  const user = useSelector((state) => state.user);
  const [filteredUsers, setFilteredUsers] = useState();
  const [alertMessage, setAlertMessage] = useState();
  const [query, setQuery] = useState();
  const alertRef = useRef();
  const history = useHistory();

  // Clean up alert settimeouts if component unmounts
  useEffect(() => () => clearTimeout(alertRef.current), []);

  if (user) setAllTokens(user.token);

  /* handlers for alert message, 5sec - successfully request friend,
  accept friend request, reject request */
  const handleSetAlert = (alertText) => {
    setAlertMessage(alertText);
    if (alertRef.current) clearTimeout(alertRef.current);
    alertRef.current = setTimeout(() => setAlertMessage(null), 5000);
  };
  const displayStyle = alertMessage ? null : { display: 'none' };

  // handler for query input onchange
  const handleSetQuery = (event) => {
    setQuery(event.target.value);
  };

  // handler for "see profile" button
  const handleSeeProfile = (userId) => {
    history.push(`/profile/${userId}`);
  };

  // accept friend request handler
  const handleAcceptRequest = async (friendRequestId) => {
    await acceptFriendRequest(user.user.id, friendRequestId);
    handleSetAlert('Friend request accepted');
    // eslint-disable-next-line no-use-before-define
    handleSearch(query); // re-render page
  };

  // reject friend request handler
  const handleRejectRequest = async (friendRequestId) => {
    await rejectFriendRequest(user.user.id, friendRequestId);
    handleSetAlert('Friend request rejected');
    // eslint-disable-next-line no-use-before-define
    handleSearch(query); // re-render page
  };

  // send friend request handler
  const handleAddFriend = async (userId) => {
    await addFriend(user.user.id, userId);
    handleSetAlert('Friend request sent');
    // eslint-disable-next-line no-use-before-define
    handleSearch(query); // re-render page
  };

  // buttons for result cards
  const seeProfileButton = (userId) => (
    <Button onClick={() => handleSeeProfile(userId)}>See Profile</Button>);
  const addFriendButton = (userId) => <Button style={{ marginRight: '15px' }} onClick={() => handleAddFriend(userId)}>Add Friend</Button>;
  // Buttons for list item corresponding to an incoming friend request
  const incomingButtons = (friendRequestId, userId) => (
    <div style={{ float: 'right' }}>
      <Button style={{ marginRight: '15px' }} onClick={() => handleAcceptRequest(friendRequestId)}>Accept</Button>
      <Button onClick={() => handleRejectRequest(friendRequestId)}>Reject</Button>
      {seeProfileButton(userId)}
    </div>
  );
  // Buttons for outgoing friend request
  const outgoingButtons = (userId) => (
    <div style={{ float: 'right' }}>
      <span style={{ marginRight: '15px' }}>Friend request sent</span>
      {seeProfileButton(userId)}
    </div>
  );
  // Buttons for list item corresponding to a stranger
  const strangerButtons = (userId) => (
    <div style={{ float: 'right' }}>
      {addFriendButton(userId)}
      {seeProfileButton(userId)}
    </div>
  );

  // onSearch callback
  const handleSearch = async (value) => {
    if (!user.user) {
      console.error('no logged in user data. may need to re-login.');
      return;
    }

    const usersFromDb = await searchForUsers(user.user.id, value);

    // map data from DB into formatting information for the list items
    setFilteredUsers(usersFromDb.map((u) => {
      let button;
      let backgroundColor;
      let title;
      if (u.isFriends) {
        button = <div style={{ float: 'right' }}>{seeProfileButton(u.id)}</div>;
        backgroundColor = '#f0ffe6';
      } else if (u.frStatus === 'incoming') {
        button = incomingButtons(u.frId, u.id);
        backgroundColor = '#f1ebff';
      } else if (u.frStatus === 'outgoing') {
        button = outgoingButtons(u.id);
        backgroundColor = '#e8e8e8';
      } else {
        button = strangerButtons(u.id);
        backgroundColor = '#fffeeb';
      }

      if (u.isFriends) {
        title = (
          <div>
            <CheckOutlined />
            Friends
          </div>
        );
      } else if (u.frStatus) {
        title = (
          <div>
            <ExclamationOutlined />
            Pending Friend Request
          </div>
        );
      } else title = null;

      return {
        username: u.username,
        isFriends: u.isFriends,
        button,
        additionalStyles: {
          backgroundColor,
        },
        title,
      };
    }));
  };

  return (
    <div className="main-layout vertical-center-div">
      <Alert message={alertMessage} type="success" showIcon style={displayStyle} className="skinny-alert" />
      <div className="skinny-container">
        <Typography.Title level={2} style={{ marginBottom: '0' }}>Find new friends </Typography.Title>

        <Input.Search
          size="large"
          placeholder="search username"
          prefix={<UserOutlined />}
          style={{ marginTop: '20px' }}
          enterButton="search"
          onSearch={handleSearch}
          onChange={handleSetQuery}
        />

        <div>
          { filteredUsers && filteredUsers.length > 0

            && (
            <List
              className="search-list"
              itemLayout="horizontal"
              dataSource={filteredUsers}
              renderItem={(item) => (
                <List.Item className="search-list-item" style={{ border: '1px solid #d1d1d1', ...item.additionalStyles }}>
                  <List.Item.Meta
                    description={(
                      <div>
                        <b style={{ color: 'black' }}>{item.username}</b>
                        {item.button}
                      </div>
                    )}
                    title={item.title}
                  />
                </List.Item>
              )}
            />
            )}
        </div>
      </div>
    </div>
  );
};

export default AddFriends;
