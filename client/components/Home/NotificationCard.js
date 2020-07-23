import React from 'react'
import { Col, Button, Card } from 'antd'

const NotificationCard = ({ notification, handleAcceptGame, handleAcceptFriend, handleRejectGame, handleRejectFriend }) => {

  const notificationBody = (notification) => {
    if (!notification) return null

    switch (notification.type) {
      case 'friendRequest':
        return (
          <div>
            <div>New friend request from {notification.requester}!</div>
            <div>
              <Button type='primary' size='small' style={{ marginRight: '10px' }} onClick={() => null}>Accept</Button>
              <Button type='danger' size='small' onClick={() => null}>Reject</Button>
            </div>
            <div><Button size='small' onClick={() => null}>View Profile</Button></div>
          </div>
        )
      case 'gameRequest':
        return (
          <div>
            <div>New game request from {notification.requester}!</div>
            <div>
              <Button type='primary' size='small' style={{ marginRight: '10px' }} onClick={() => handleAcceptGame(notification.id)}>Accept</Button>
              <Button type='danger' size='small' onClick={() => handleRejectGame(notification.id)}>Reject</Button>
            </div>
          </div>
        )
    }
  }

  // TODO: handleSeeProfile
  return (
    <Col xs={12} sm={8} lg={6} >
      <Card className='notification-card' bordered='true' bodyStyle={{ padding: '10px' }}>
        {notificationBody(notification)}
      </Card>
    </Col>
  )

}

export default NotificationCard