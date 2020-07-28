import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, Link } from 'react-router-dom'
import { Button, Row, Col, Typography, Alert, Popover } from 'antd'
import { useQueryParam, StringParam } from 'use-query-params'

import { setAllTokens, ServerGameStatus } from 'Utilities/common'
import { getGame } from 'Utilities/services/gameService'
import { getActiveGames, getUserData, getNotifications, acceptGameRequest, rejectGameRequest, acceptFriendRequest, rejectFriendRequest, addFriend } from 'Utilities/services/userService'
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
  const [friendId, ] = useQueryParam('friendId', StringParam)
  const [friendName, ] = useQueryParam('friendId', StringParam)
  const [firstTime, ] = useQueryParam('firstTime', StringParam)
  const [popoverVisible, setPopoverVisible] = useState(true)

  if (user) setAllTokens(user.token)

  useEffect(() => {
    if (!user || ! user.user) return

    handleGetActiveGames()
    handleGetFriends()
    handleGetNotifications()
  }, [user])

  // if user was referred through a friend, automatically send a friend request
  useEffect(() => {
    if (!friendId || !user || !user.user) return

    const handleNewUser = async () => {
      await addFriend(user.user.id, friendId)
      handleSetAlert(`Friend request to ${friendName} sent`)
      handleGetUserData() // re-render page
    }

    handleNewUser()

  }, [friendId])

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
    setActiveGames(gamesFromDB)
  }

  const handleGetFriends = async () => {
    const userFromDB = await getUserData(user.user.id)
    setUserData(userFromDB)
    // console.log(userFromDB) // DEBUG
  }

  const handleGetNotifications = async () => {
    const notificationsFromDB = await getNotifications(user.user.id)

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

  // if its the users first time logging in, create a popover explaining he needs friends to play
  const findFriendsButton = () => {
    if (firstTime) {
      return (
      <Popover
        content={
          <div style={{ fontSize: '16px'}}>
            Find friends to play with. 
            When your friend request is <br />
            accepted, you can begin a game.
            <div><a onClick={() => setPopoverVisible(false)}>OK</a></div>
          </div>
        }
        defaultVisible={true}
        destroyTooltipOnHide={true}
        visible={popoverVisible}
        placement='bottomRight'
      > 
        <Button style={{ border: '1px solid limegreen'}} onClick={() => history.push('/add-friends')}>Find New Friends</Button>
      </Popover>
      )
    } 
    else return <Button style={{ border: '1px solid limegreen'}} onClick={() => history.push('/add-friends')}>Find New Friends</Button>
  }

  return (
    <div className='main-layout vertical-center-div'>
      <Alert message={alertMessage} type="success" showIcon style={displayStyle} className='skinny-alert' />
      <div className='skinny-container'>
        <Typography.Title>Welcome <Link to={`/profile/${user.user.id}`}>{user.user.username}</Link></Typography.Title>
        <Row gutter={{sm: 24, md: 32}}>
        <Col span={18}>
        <Typography.Title level={4}><b>Notifications</b></Typography.Title>
        <Row gutter={rowGutter}>{notifications && notifications.length > 0 ? 
            notifications.map(n => <NotificationCard key={n.id} notification={n} handleAcceptGame={handleAcceptGame} 
            handleRejectGame={handleRejectGame} handleAcceptFriend={handleAcceptFriend} handleRejectFriend={handleRejectFriend} 
            handleSeeProfile={handleSeeProfile}/>)
          : <p style={{ paddingLeft: '8px' }}>No new notifications</p>}</Row>
        <Typography.Title level={4}><b>My Games</b></Typography.Title>
            <Row gutter={rowGutter}>{activeGames && activeGames.length > 0 ? activeGames.sort(sortByActivePlayerThenDate)
              .map(ag => <ActiveGameCard key={ag.id} game={ag} user={user.user} getGame={getGame} />) 
            : <p style={{ paddingLeft: '8px' }}>No active games</p>}</Row>
        </Col>
        <Col span={6}>
        <Typography.Title level={4}><b>My Friends</b></Typography.Title>
          <div style={{ marginBottom: '15px' }}>
            {findFriendsButton()}
          </div>
          {userData && userData.friends.length > 0 ? userData.friends.map(friend => 
                <FriendCard friend={friend} handleNewGame={handleNewGame} handleSeeProfile={handleSeeProfile}/>)
                : <p>No friends yet</p>}
        </Col>
        </Row>
        </div>
    </div>
  )
}

export default Home
