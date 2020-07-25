import React from 'react'
import { Button, Card } from 'antd'

const FriendCard = ({ friend, handleNewGame, handleSeeProfile }) => {

  // TODO: handleSeeProfile
  return (
    <div>
      <Card className='home-card' bordered='true' bodyStyle={{ padding: '10px' }}>
        <p><b>{friend.username}</b></p>
        <div><Button size='small' onClick={() => handleNewGame(friend.id)}>Start a New Game</Button></div>
        <div><Button size='small' onClick={() => handleSeeProfile(friend.id)}>View Profile</Button></div>
      </Card>
    </div>
  )

}

export default FriendCard