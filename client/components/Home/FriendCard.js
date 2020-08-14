import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card } from 'antd';

const FriendCard = ({ friend, handleNewGame, handleSeeProfile }) => (
  <div>
    <Card className="home-card" bordered="true" bodyStyle={{ padding: '10px' }} style={{ height: '100%', marginBottom: '8px' }}>
      <p><b>{friend.username}</b></p>
      <div><Button size="small" style={{ border: '1px solid tomato' }} onClick={() => handleNewGame(friend.id)}>Start a New Game</Button></div>
      <div><Button size="small" onClick={() => handleSeeProfile(friend.id)}>View Profile</Button></div>
    </Card>
  </div>
);

FriendCard.propTypes = {
  friend: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }).isRequired,
  handleNewGame: PropTypes.func.isRequired,
  handleSeeProfile: PropTypes.func.isRequired,
};

export default FriendCard;
