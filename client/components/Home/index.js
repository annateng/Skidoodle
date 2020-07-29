import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, Link } from 'react-router-dom'
import { Button, Row, Col, Typography, Alert } from 'antd'
import { HomeTwoTone, QuestionOutlined } from '@ant-design/icons'
import { useQueryParam, StringParam } from 'use-query-params'

import { setAllTokens, ServerGameStatus } from 'Utilities/common'
import { getGame } from 'Utilities/services/gameService'
import { getActiveGames, getUserData, getNotifications, acceptGameRequest, rejectGameRequest, 
  acceptFriendRequest, rejectFriendRequest, addFriend } from 'Utilities/services/userService'
import { getNewGame, deleteGameOverNote } from 'Utilities/services/gameService'

import ActiveGameCard from 'Components/Home/ActiveGameCard'
import FriendSidebar from 'Components/Home/FriendSidebar'
import NotificationCard from 'Components/Home/NotificationCard'
import NewGameModal from 'Components/Home/NewGameModal'
import { images } from 'Utilities/common'

const Home = () => {
  const user = useSelector(state => state.user)
  const [activeGames, setActiveGames] = useState()
  const [userData, setUserData] = useState()
  const [notifications, setNotifications] = useState()
  const [alertMessage, setAlertMessage] = useState()
  const [visible, setVisible] = useState(false) // Modal
  const alertRef = useRef()
  const history = useHistory()
  const [friendId, ] = useQueryParam('friendId', StringParam)
  const [friendName, ] = useQueryParam('friendName', StringParam)

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
    }))).concat(
      notificationsFromDB.gameOverNotes
      .map(gon => ({
        id: gon.id,
        gameId: gon.game,
        type: 'gameOver',
        requester: gon.sender.username,
        dateRequested: gon.dateRequested
      }))
    )
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
    history.go()
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

  // see results of completed game
  const handleSeeGame = (gameId, noteId) => {
    deleteGameOverNote(noteId)
    history.push(`/game/${gameId}`)
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
      <Alert message={alertMessage} type="success" showIcon style={displayStyle} className='skinny-alert' />
      <NewGameModal visible={visible} setVisible={setVisible} handleNewGame={handleNewGame} userId={user.user.id}/>
      <div className='skinny-container'>
        <Typography.Title><HomeTwoTone />&nbsp;&nbsp;Welcome <Link to={`/profile/${user.user.id}`}>{user.user.username}</Link></Typography.Title>
        <Row gutter={{sm: 24, md: 32}}>
        <Col span={18}>
        <Row gutter={rowGutter}>
          <Col span={8}>
            <Button type='danger' className='home-button' size='large' onClick={() => setVisible(true)}>New Game</Button>
          </Col>
          <Col span={8}>
            <Button type='danger' className='home-button' size='large' icon={<img style={{marginRight: '5px'}} 
                src={images.GuessIcon}/>} onClick={() => history.push('/practice-mode')}>Practice</Button>
          </Col>
          <Col span={8}>
            <Button type='danger' className='home-button' size='large' icon={<img style={{marginRight: '5px'}} 
                src={images.PenIcon}/>} onClick={() => history.push('/free-doodle')}>Free Draw</Button>
          </Col>
        </Row>
        <Typography.Title level={4}><b>Notifications</b></Typography.Title>
        <Row gutter={rowGutter}>{notifications && notifications.length > 0 ? 
            notifications.map(n => <NotificationCard key={n.id} notification={n} handleAcceptGame={handleAcceptGame} 
            handleRejectGame={handleRejectGame} handleAcceptFriend={handleAcceptFriend} handleRejectFriend={handleRejectFriend} 
            handleSeeProfile={handleSeeProfile} handleSeeGame={handleSeeGame}/>)
          : <p style={{ paddingLeft: '8px' }}>No new notifications</p>}</Row>
        <Typography.Title level={4}><b>My Games</b></Typography.Title>
            <Row gutter={rowGutter}>{activeGames && activeGames.length > 0 ? activeGames.sort(sortByActivePlayerThenDate)
              .map(ag => <ActiveGameCard key={ag.id} game={ag} user={user.user} getGame={getGame} />) 
            : <p style={{ paddingLeft: '8px' }}>No active games</p>}</Row>
        </Col>
        {userData && userData.friends && <FriendSidebar userData={userData} handleNewGame={handleNewGame} handleSeeProfile={handleSeeProfile} />}
        </Row>
        </div>
    </div>
  )
}

export default Home
