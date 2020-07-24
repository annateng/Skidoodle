import React from 'react'
import { Col, Button, Card } from 'antd'

const Friend = ({ friend, handleNewGame, handleSeeProfile }) => {

  // TODO: handleSeeProfile
  return (
    <Col xs={12} sm={8} lg={6} >
      <Card className='home-card' bordered='true' bodyStyle={{ padding: '10px' }}>
        <p><b>{friend.username}</b></p>
        <div><Button type='primary' size='small' onClick={() => handleNewGame(friend.id)}>Start a New Game</Button></div>
        <div><Button size='small' onClick={() => handleSeeProfile(friend.id)}>View Profile</Button></div>
      </Card>
    </Col>
  )

}

export default Friend