import React, { useState } from 'react'
import { Col, Typography, Button, Input } from 'antd'
import { useHistory } from 'react-router-dom'

import FriendCard from 'Components/Home/FriendCard'

const FriendSidebar = ({ userData, handleNewGame, handleSeeProfile }) => {
  const [filter, setFilter] = useState()
  const history = useHistory()

  return (
    <Col span={6}>
      <Typography.Title level={4}><b>My Friends</b></Typography.Title>
      <div style={{ marginBottom: '15px' }}>
        <Button style={{ border: '1px solid limegreen', marginBottom: '8px' }} onClick={() => history.push('/add-friends')}>Find New Friends</Button>
        <Input placeholder='filter' onChange={event => setFilter(event.target.value)}></Input>
      </div>
      {userData && userData.friends.length > 0 ? userData.friends
        .filter(friend => filter ? friend.username.toLowerCase().includes(filter) : true)
        .map(friend => 
            <FriendCard key={friend.id} friend={friend} handleNewGame={handleNewGame} handleSeeProfile={handleSeeProfile}/>)
            : <p>No friends yet</p>}
    </Col>
  )
}

export default FriendSidebar