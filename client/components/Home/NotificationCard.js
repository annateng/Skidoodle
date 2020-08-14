import React from 'react';
import PropTypes from 'prop-types';
import { Col, Button, Card } from 'antd';

import { monthNames } from 'Utilities/common';

const NotificationCard = ({
  notification, handleAcceptGame, handleAcceptFriend, handleRejectGame,
  handleRejectFriend, handleSeeProfile, handleSeeGame,
}) => {
  const notificationBody = () => {
    // console.log(notification)
    if (!notification) return null;

    const date = new Date(notification.dateRequested);

    switch (notification.type) {
      case 'friendRequest':
        return (
          <div>
            <div style={{ fontSize: '1.1em' }}>
              New friend request from
              <br />
              <b>
                {notification.requester}
                !
              </b>
            </div>
            <div>
              Sent on
              {' '}
              {monthNames[date.getMonth()].substring(0, 3)}
              {' '}
              {date.getDate()}
            </div>
            <div>
              <Button size="small" style={{ marginRight: '10px' }} type="primary" onClick={() => handleAcceptFriend(notification.id)}>Accept</Button>
              <Button size="small" onClick={() => handleRejectFriend(notification.id)}>Reject</Button>
            </div>
            <div><Button size="small" onClick={() => handleSeeProfile(notification.requesterId)}>View Profile</Button></div>
          </div>
        );
      case 'gameRequest':
        return (
          <div>
            <div style={{ fontSize: '1.1em' }}>
              New game request from
              <br />
              <b>
                {notification.requester}
                !
              </b>
            </div>
            <div>
              Sent on
              {' '}
              {monthNames[date.getMonth()].substring(0, 3)}
              {' '}
              {date.getDate()}
            </div>
            <div>
              <Button size="small" style={{ marginRight: '10px' }} type="primary" onClick={() => handleAcceptGame(notification.id)}>Accept</Button>
              <Button size="small" onClick={() => handleRejectGame(notification.id)}>Reject</Button>
            </div>
          </div>
        );
      case 'gameOver':
        return (
          <div>
            <div style={{ fontSize: '1.1em' }}>
              Game with
              <br />
              <b>
                {notification.requester}
                !
              </b>
              {' '}
              finished
            </div>
            <Button size="small" onClick={() => handleSeeGame(notification.gameId, notification.id)}>See Results</Button>
          </div>
        );
      default:
        return null;
    }
  };

  let borderStyle;
  if (notification.type === 'friendRequest') borderStyle = '2px solid #f59ab1';
  else if (notification.type === 'gameRequest') borderStyle = '2px solid #c2b2d6';
  else borderStyle = '2px solid goldenrod';
  const cardStyle = {
    border: borderStyle,
    backgroundColor: notification.type === 'friendRequest' ? null : null,
    height: '100%',
  };

  return (
    <Col xs={12} sm={12} lg={8}>
      <Card className="home-card" bordered="true" bodyStyle={{ padding: '10px' }} style={cardStyle}>
        {notificationBody()}
      </Card>
    </Col>
  );
};

NotificationCard.propTypes = {
  notification: PropTypes.shape({
    dateRequested: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    requester: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    requesterId: PropTypes.string,
    gameId: PropTypes.string,
  }).isRequired,
  handleAcceptGame: PropTypes.func.isRequired,
  handleAcceptFriend: PropTypes.func.isRequired,
  handleRejectGame: PropTypes.func.isRequired,
  handleRejectFriend: PropTypes.func.isRequired,
  handleSeeProfile: PropTypes.func.isRequired,
  handleSeeGame: PropTypes.func.isRequired,
};

export default NotificationCard;
