import React from 'react'
import { Button, Card } from 'antd'

const FriendCard = ({ friend, handleNewGame, handleSeeProfile }) => {

  return (
    <div>
      <Card className='home-card' bordered='true' bodyStyle={{ padding: '10px' }} style={{ height: '100%', marginBottom: '8px' }}>
        <p><b>{friend.username}</b></p>
        <div><Button size='small' style={{ border: '1px solid tomato' }} onClick={() => handleNewGame(friend.id)}>Start a New Game</Button></div>
        <div><Button size='small' onClick={() => handleSeeProfile(friend.id)}>View Profile</Button></div>
      </Card>
    </div>
  )

}

export default FriendCard