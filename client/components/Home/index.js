import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, Link } from 'react-router-dom'
import { Button, Row, Col, Divider, Typography, Alert } from 'antd';

import { setAllTokens, ServerGameStatus } from 'Utilities/common'
import { getGame } from 'Utilities/services/gameService'
import { getActiveGames, getUserData, getNotifications, acceptGameRequest, rejectGameRequest, acceptFriendRequest, rejectFriendRequest } from 'Utilities/services/userService'
import { getNewGame } from 'Utilities/services/gameService'

import ActiveGameCard from 'Components/Home/ActiveGameCard'
import FriendCard from 'Components/Home/FriendCard'
import NotificationCard from 'Components/Home/NotificationCard'

const Home = () => {
  const user = useSelector(state => state.user)
  const [activeGames, setActiveGames] = useState()
  const [userData, setUserData] = useState()
  const [notifications, setNotifications] = useState()
  const [alertMessage, setAlertMessage] = useState()
  const alertRef = useRef()
  const history = useHistory()

  if (user) setAllTokens(user.token)

  useEffect(() => {
    if (!user || ! user.user) return

    handleGetActiveGames()
    handleGetFriends()
    handleGetNotifications()
  }, [user])

  if (!user || !user.user) {
    return (
      <div className='main-layout' >
        <div className='vertical-center-div'>
        <Typography.Title level={4}>Log in to see your home page</Typography.Title>
        <Button type='primary' size='large' onClick={() => history.push('/login')}>Log In</Button>
        </div>
      </div>
    )
  }

  const handleGetActiveGames = async () => {
    const gamesFromDB = await getActiveGames(user.user.id)
    console.log(gamesFromDB) // DEBUG
    setActiveGames(gamesFromDB)
  }

  const handleGetFriends = async () => {
    const userFromDB = await getUserData(user.user.id)
    setUserData(userFromDB)
    // console.log(userFromDB) // DEBUG
  }

  const handleGetNotifications = async () => {
    const notificationsFromDB = await getNotifications(user.user.id)
    console.log(notificationsFromDB)

    const formattedNotifications = notificationsFromDB.friendRequests
    .map(fr => ({
      id: fr.id,
      type: 'friendRequest',
      requester: fr.requester.username,
      requesterId: fr.requester.id,
      dateRequested: fr.dateRequested
    })).concat(
      notificationsFromDB.gameRequests
      .map(gr => ({
      id: gr.id,
      type: 'gameRequest',
      requester: gr.requester.username,
      dateRequested: gr.dateRequested
    })))
    .sort((a,b) => a.dateRequested - b.dateRequested)

    setNotifications(formattedNotifications)
  }

  // create new game, navigate to game play page. game request to partner is generated
  // after first round is sent automatically on the backend
  const handleNewGame = async receiverId => {
    const newGame = await getNewGame(user.user.id, receiverId)
    history.push(`/game/${newGame.id}`)
  }

  const handleSeeProfile = async userId => {
    history.push(`/profile/${userId}`)
  }

  // accept game request, and navigate to begin playing game
  const handleAcceptGame = async gameRequestId => {
    const acceptedGame = await acceptGameRequest(user.user.id, gameRequestId)
    history.push(`/game/${acceptedGame.id}`)
  }

  // reject game request, set alert, re-render
  const handleRejectGame = async gameRequestId => {
    await rejectGameRequest(user.user.id, gameRequestId)
    handleGetActiveGames()
    handleGetNotifications()
    handleSetAlert('Game request rejected')
  }

  // accept friend request, set alert, re-render
  const handleAcceptFriend = async friendRequestId => {
    await acceptFriendRequest(user.user.id, friendRequestId)
    handleSetAlert('Friend request accepted')
    handleGetFriends()
    handleGetNotifications()
  }

  // reject friend request, set alert, re-render
  const handleRejectFriend = async friendRequestId => {
    await rejectFriendRequest(user.user.id, friendRequestId)
    handleSetAlert('Friend request rejected')
    // re-render
    handleGetFriends()
    handleGetNotifications()
  }

  // sorting function for active games sort by status first (players turn > others turn > pending), then sort games within each category by date
  const sortByActivePlayerThenDate = (a, b) => {
    const isActiveA = user.user.id === a.activePlayer.id
    const isActiveB = user.user.id === b.activePlayer.id
    if (isActiveA && !isActiveB) return -1
    if (!isActiveA && isActiveB) return 1
    
    const isPendingA = a.status === ServerGameStatus.pending
    const isPendingB = b.status === ServerGameStatus.pending
    if (isPendingA && !isPendingB) return 1
    if (!isPendingA && isPendingB) return -1

    return a.timeOfLastMove - b.timeOfLastMove
  }

  // handlers for alert message, 5sec
  const handleSetAlert = alertMessage => {
    setAlertMessage(alertMessage)
    if (alertRef.current) clearTimeout(alertRef.current)
    alertRef.current = setTimeout(() => setAlertMessage(null), 5000)
  }
  const displayStyle = alertMessage ? null : { display: 'none' }
  

  // antd row gutter settings
  const rowGutter = [{ xs: 8, sm: 8, md: 16 },{ xs: 8, sm: 8, md: 16 }]

  return (
    <div className='main-layout vertical-center-div'>
      <Alert message={alertMessage} type="success" showIcon style={displayStyle} />
      <div className='skinny-container'>
        <Typography.Title>Welcome <Link to={`/profile/${user.user.id}`}>{user.user.username}</Link></Typography.Title>
        <Typography.Title level={4}><div><b>Notifications</b></div></Typography.Title>
        {notifications && notifications.length > 0 ? 
          <Row gutter={rowGutter}>
            {notifications.map(n => <NotificationCard key={n.id} notification={n} handleAcceptGame={handleAcceptGame} 
            handleRejectGame={handleRejectGame} handleAcceptFriend={handleAcceptFriend} handleRejectFriend={handleRejectFriend} 
            handleSeeProfile={handleSeeProfile}/>)}
          </Row>
          : <p style={{ paddingLeft: '8px' }}>No new notifications</p>}
        <Typography.Title level={4}><div><b>My Games</b></div></Typography.Title>
          <Row gutter={rowGutter}>
            {activeGames && activeGames.length > 0 ? activeGames.sort(sortByActivePlayerThenDate)
              .map(ag => <ActiveGameCard key={ag.id} game={ag} user={user.user} getGame={getGame} />) 
            : <p style={{ paddingLeft: '8px' }}>No active games</p>}
            </Row>
        <Typography.Title level={4}><div><b>My Friends</b></div></Typography.Title>
          <div style={{ marginBottom: '15px' }}>
            <Button style={{ border: '1px solid limegreen'}} onClick={() => history.push('/add-friends')}>Find New Friends</Button>
          </div>
          <Row gutter={rowGutter}>
          {userData && userData.friends.map(friend => 
              <Col key={friend.id} xs={12} sm={8} lg={6} >
                <FriendCard friend={friend} handleNewGame={handleNewGame} handleSeeProfile={handleSeeProfile}/>
              </Col>)}
          </Row>
        </div>
    </div>
  )
}

export default Home
