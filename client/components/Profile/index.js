import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams, Link } from 'react-router-dom'
import { Button, Typography, Alert, Row, Col, Table } from 'antd';

import { setAllTokens, monthNames } from 'Utilities/common'
import { getUserData } from 'Utilities/services/userService'
import { getNewGame } from 'Utilities/services/gameService'
import FriendCard from 'Components/Home/FriendCard'


const Profile = () => {
  const userId = useParams().userId
  const user = useSelector(state => state.user)
  const [alertMessage, setAlertMessage] = useState()
  const [userData, setUserData] = useState()
  const alertRef = useRef()
  const history = useHistory()

  if (user) setAllTokens(user.token)

  useEffect(() => {
    if (!user) return

    handleGetUserData()

  }, [])

  const handleGetUserData = async () => {
    const userFromDB = await getUserData(userId)
    setUserData(userFromDB)
    console.log(userFromDB)
  }

  if (!userData) {
    return (
      <div className='main-layout' >
        <div className='vertical-center-div'>
        <Typography.Title level={4}>Log in to see your profile</Typography.Title>
        <Button type='primary' size='large' onClick={() => history.push('/login')}>Log In</Button>
        </div>
      </div>
    )
  }

  // create new game, navigate to game play page. game request to partner is generated
  // after first round is sent automatically on the backend
  const handleNewGame = async (receiverId) => {
    const newGame = await getNewGame(user.user.id, receiverId)
    history.push(`/game/${newGame.id}`)
  }

  // handlers for alert message, 5sec - successfully request friend, accept friend request, reject request
  const handleSetAlert = alertMessage => {
    setAlertMessage(alertMessage)
    if (alertRef.current) clearTimeout(alertRef.current)
    alertRef.current = setTimeout(() => setAlertMessage(null), 5000)
  }
  const displayStyle = alertMessage ? null : { display: 'none' }

  // function for getting MMM DD, YYYY date format
  const getFormattedDate = dateStr => {
    const date = new Date(dateStr)
    return `${monthNames[date.getMonth()].substring(0,3)} ${date.getDate()}, ${date.getFullYear()}`
  }

  // high score table data
  const highScoreData = userData.highScores.map((hs, index) => 
    ({ 
      key: index+1, 
      partner: hs.partnerUsername,
      date: hs.timeStamp,
      numCorrect: hs.score.numCorrect,
      tts: hs.score.totalTimeSpent
    })
  )
  const highScoreColumns = 
  [
    { title: '#', dataIndex: 'key', key: 'key' },
    { title: 'Partner', dataIndex: 'partner', key: 'partner'},
    { title: 'Date', dataIndex: 'date', key: 'date', render: ts => getFormattedDate(ts) },
    { title: 'Total Correct', dataIndex: 'numCorrect', key: 'numCorrect' },
    { title: 'Total Time Spent', dataIndex: 'tts', key: 'tts', render: tts => (tts / 1000).toFixed(2) + 's' }
  ]

  return (
    <div className='main-layout' >
      <div>
        <Alert message={alertMessage} type="success" showIcon style={displayStyle} />
        <Typography.Title >{userData.username}</Typography.Title>
        <div><b>Date joined: {getFormattedDate(userData.dateJoined)}</b></div>
        <b><Link to={`/home`}>Go to my games</Link></b>
        
        <Row gutter={26}>
          <Col span={18}>
            <Typography.Title level={4} style={{ marginTop: '15px' }}>High scores</Typography.Title>
            {userData.highScores.length > 0 && <Table dataSource={highScoreData} columns={highScoreColumns} tableLayout='fixed' pagination={false} />}
          </Col>
          <Col span={6}>
            <Typography.Title level={4} style={{ marginTop: '15px' }}>Friends</Typography.Title>
            <div style={{ marginBottom: '15px' }}>
              <Button style={{ border: '1px solid limegreen'}} onClick={() => history.push('/add-friends')}>Find New Friends</Button>
            </div>
            {userData && userData.friends.map(friend => 
              <FriendCard key={friend.id} friend={friend} handleNewGame={handleNewGame} />)}
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Profile
