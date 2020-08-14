import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Input, Row, Col,
} from 'antd';

import { searchForUsers } from 'Utilities/services/userService';

const NewGameModal = ({
  visible, setVisible, handleNewGame, userId,
}) => {
  const [filteredUsers, setFilteredUsers] = useState();

  // onSearch callback
  const handleSearch = async (value) => {
    const usersFromDb = await searchForUsers(userId, value);
    // map data from DB into formatting information for the list items
    setFilteredUsers(usersFromDb.map((u) => ({ username: u.username, id: u.id })));
  };

  // antd row gutter settings
  const rowGutter = [8, 8];

  return (
    <Modal
      title="New Game"
      visible={visible}
      footer={null}
      onCancel={() => setVisible(false)}
    >
      <div>Who would you like to play with?</div>
      <Input.Search placeholder="username" onSearch={(val) => handleSearch(val)} />
      {filteredUsers
        && (
        <Row gutter={rowGutter} style={{ marginTop: '5px' }}>
          {filteredUsers.map((u) => (
            <Col key={u.id} span={8}>
              <div style={{ borderRadius: '3px', border: '1px solid pink', backgroundColor: 'whitesmoke' }} className="centered-div">
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                  onClick={() => handleNewGame(u.id)}
                  onKeyDown={(e) => {
                    if (e.keyCode === 13) handleNewGame(u.id);
                  }}
                  role="link"
                  tabIndex={0}
                >
                  {u.username}
                </a>
              </div>
            </Col>
          ))}
        </Row>
        )}
    </Modal>
  );
};

NewGameModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired,
  handleNewGame: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default NewGameModal;
