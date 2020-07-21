import React from 'react'
import { Col, Button, Card } from 'antd'

const Friend = ({ friend, handleNewGame }) => {

  return (
    <Col span={{ xs: 12, sm: 8, md: 6, lg: 4 }} >
      <Card bordered='true'>
        <p>{friend.username}</p>
        <Button size='small' onClick={() => handleNewGame(friend.id)}>Start New Game</Button>
      </Card>
    </Col>
  )

}

export default Friend