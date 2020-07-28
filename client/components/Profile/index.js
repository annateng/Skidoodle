import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams, Link } from 'react-router-dom'
import { Button, Typography, Alert, Row, Col, Table } from 'antd'
import { UserOutlined } from '@ant-design/icons'

import { setAllTokens, monthNames } from 'Utilities/common'
import { getUserData, acceptFriendRequest, rejectFriendRequest, addFriend } from 'Utilities/services/userService'
import { getNewGame } from 'Utilities/services/gameService'
import FriendSidebar from 'Components/Home/FriendSidebar'


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
        <Typography.Title level={4}>loading...</Typography.Title>
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

  // accept friend request handler
  const handleAcceptRequest = async friendRequestId => {
    await acceptFriendRequest(user.user.id, friendRequestId)
    console.log(friendRequestId)
    handleSetAlert('Friend request accepted')
    handleGetUserData() // re-render page
  }

  // reject friend request handler
  const handleRejectRequest = async friendRequestId => {
    await rejectFriendRequest(user.user.id, friendRequestId)
    handleSetAlert('Friend request rejected')
    handleGetUserData() // re-render page
  }

  // send friend request handler
  const handleAddFriend = async userId => {
    await addFriend(user.user.id, userId)
    handleSetAlert('Friend request sent')
    handleGetUserData() // re-render page
  }

  // redirect to user profile
  const handleSeeProfile = async userId => {
    history.push(`/profile/${userId}`)
    history.go()
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
  const highScoreData = userData.highScores && 
  userData.highScores.map((hs, index) => 
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

  // what to display under username. depends on whether users are friends, pending friends, not friends, or self
  const friendDisplay = userData.friends ? <b><Link to={`/home`}>Go to my games</Link></b> : // if userData.friends, user is the requesting user
  userData.isFriends ? (
    <div>
      <div>Friends</div>
      <Button onClick={() => handleNewGame(userData.id)}>Start new game</Button>
    </div>) :
  userData.frStatus === 'outgoing' ? <div>friend request pending</div> :
  userData.frStatus === 'incoming' ? 
    (<div>
      Friend request pending
      <div style={{ float: 'right'}}>
        <Button style={{ marginRight: '15px' }} onClick={() => handleAcceptRequest(userData.frId)}>Accept</Button>
        <Button onClick={() => handleRejectRequest(userData.frId)}>Reject</Button>
      </div>
    </div>) : 
  <Button onClick={() => handleAddFriend(userData.id)}>Add Friend</Button>

  return (
    <div className='main-layout vertical-center-div' >
      <Alert message={alertMessage} type="success" showIcon style={displayStyle} className='skinny-alert' />
      <div className='skinny-container'>
        <Typography.Title ><UserOutlined style={{ color: 'dodgerblue' }}/>&nbsp;&nbsp;{userData.username}</Typography.Title>
        {userData.dateJoined && <div><b>Date joined: {getFormattedDate(userData.dateJoined)}</b></div>}
        <div>{friendDisplay}</div>
        <Row gutter={26}>
          <Col span={18}>
            <Typography.Title level={4} style={{ marginTop: '15px' }}>High scores</Typography.Title>
            {userData.highScores && userData.highScores.length > 0  ? 
              <Table dataSource={highScoreData} columns={highScoreColumns} tableLayout='fixed' pagination={false} />
              : <div>No high scores yet</div>}
          </Col>
          {userData && userData.friends && <FriendSidebar userData={userData} handleNewGame={handleNewGame} handleSeeProfile={handleSeeProfile} />}
        </Row>
      </div>
    </div>
  )
}

export default Profile
