import React from 'react'
import { Col, Button, Card } from 'antd'

import { monthNames } from 'Utilities/common'

const NotificationCard = ({ notification, handleAcceptGame, handleAcceptFriend, handleRejectGame, handleRejectFriend, handleSeeProfile }) => {

  const notificationBody = (notification) => {
    // console.log(notification)
    if (!notification) return null

    const date = new Date(notification.dateRequested)

    switch (notification.type) {
      case 'friendRequest':
        return (
          <div>
            <div style={{ fontSize: '1.1em' }}>New friend request from <br/><b>{notification.requester}!</b></div>
            <div>Sent on {monthNames[date.getMonth()].substring(0,3)} {date.getDate()}</div>
            <div>
              <Button type='primary' size='small' style={{ marginRight: '10px' }} onClick={() => handleAcceptFriend(notification.id)}>Accept</Button>
              <Button type='danger' size='small' onClick={() => handleRejectFriend(notification.id)}>Reject</Button>
            </div>
            <div><Button size='small' onClick={() => handleSeeProfile(notification.requesterId)}>View Profile</Button></div>
          </div>
        )
      case 'gameRequest':
        return (
          <div>
            <div style={{ fontSize: '1.1em' }}>New game request from <br/><b>{notification.requester}!</b></div>
            <div>Sent on {monthNames[date.getMonth()].substring(0,3)} {date.getDate()}</div>
            <div>
              <Button type='primary' size='small' style={{ marginRight: '10px' }} onClick={() => handleAcceptGame(notification.id)}>Accept</Button>
              <Button type='danger' size='small' onClick={() => handleRejectGame(notification.id)}>Reject</Button>
            </div>
          </div>
        )
    }
  }

  const cardStyle = {
    border: notification.type === 'friendRequest' ? '2px solid mediumaquamarine' : '2px solid #c2b2d6',
    backgroundColor: notification.type === 'friendRequest' ? '#cfffef' : '#f1e6ff'
  }

  return (
    <Col xs={12} sm={8} lg={6} >
      <Card className='home-card' bordered='true' bodyStyle={{ padding: '10px' }} style={cardStyle}>
        {notificationBody(notification)}
      </Card>
    </Col>
  )

}

export default NotificationCard