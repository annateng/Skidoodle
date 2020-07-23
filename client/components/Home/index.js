import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Button, Row, Divider, Typography } from 'antd';

import { setAllTokens, ServerGameStatus } from 'Utilities/common'
import { getGame } from 'Utilities/services/gameService'
import { getActiveGames, getUserData, getNotifications, acceptGameRequest, rejectGameRequest } from 'Utilities/services/userService'
import { getNewGame } from 'Utilities/services/gameService'

import ActiveGameCard from 'Components/Home/ActiveGameCard'
import Friend from 'Components/Home/Friend'
import NotificationCard from 'Components/Home/NotificationCard'

const Home = () => {
  const user = useSelector(state => state.user)
  const [activeGames, setActiveGames] = useState()
  const [userData, setUserData] = useState()
  const [notifications, setNotifications] = useState()
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
      <div>
        <Typography.Title level={4}>Log in to see your profile</Typography.Title>
        <Button type='primary' size='large' onClick={() => history.push('/login')}>Log In</Button>
      </div>
    )
  }

  const handleGetActiveGames = async () => {
    const gamesFromDB = await getActiveGames(user.user.id)
    console.log(gamesFromDB)
    setActiveGames(gamesFromDB)
  }

  const handleGetFriends = async () => {
    const userFromDB = await getUserData(user.user.id)
    setUserData(userFromDB)
    // console.log(userFromDB)
  }

  const handleGetNotifications = async () => {
    const notificationsFromDB = await getNotifications(user.user.id)
    console.log(notificationsFromDB)

    const formattedNotifications = notificationsFromDB.friendRequests.map(fr => ({
      id: fr.id,
      type: 'friendRequest',
      requester: fr.requester.username,
      dateRequested: fr.dateRequested
    })).concat(notificationsFromDB.gameRequests.map(gr => ({
      id: gr.id,
      type: 'gameRequest',
      requester: gr.requester.username,
      dateRequested: gr.dateRequested
    })))

    setNotifications(formattedNotifications)
  }

  // create new game, navigate to game play page. game request to partner is generated
  // after first round is sent automatically on the backend
  const handleNewGame = async (receiverId) => {
    const newGame = await getNewGame(user.user.id, receiverId)
    history.push(`/game/${newGame.id}`)
  }

  // accept game request, and navigate to begin playing game
  const handleAcceptGame = async gameRequestId => {
    const acceptedGame = await acceptGameRequest(user.user.id, gameRequestId)
    history.push(`/game/${acceptedGame.id}`)
  }

  const handleRejectGame = async gameRequestId => {

  }

  const handleAcceptFriend = async friendRequestId => {

  }

  const handleRejectFriend = async friendRequestId => {

  }

  // sorting callback - sort by status first (players turn > others turn > pending), then sort games within each category by date
  const sortByActivePlayerThenDate = (a, b) => {
    const isPendingA = a.status === ServerGameStatus.pending
    const isPendingB = b.status === ServerGameStatus.pending
    if (isPendingA && !isPendingB) return 1
    if (!isPendingA && isPendingB) return -1

    const isActiveA = user.user.id === a.activePlayer.id
    const isActiveB = user.user.id === b.activePlayer.id
    if (isActiveA && !isActiveB) return -1
    if (!isActiveA && isActiveB) return 1

    return a.timeOfLastMove - b.timeOfLastMove
  }

  // antd row gutter settings
  const rowGutter = [{ xs: 8, sm: 8, md: 16 },{ xs: 8, sm: 8, md: 16 }]

  return (
    <div className="main-layout" >
      <Typography.Title level={2} style={{ marginBottom: '0' }}>Welcome {user.user.username} </Typography.Title>
      {notifications && notifications.length > 0 && <Divider orientation='left'><b style={{ color: 'dodgerblue' }}>Notifications</b></Divider>}
      {notifications && notifications.map(n => <NotificationCard key={n.id} notification={n} handleAcceptGame={handleAcceptGame} 
        handleRejectGame={handleRejectGame} handleAcceptFriend={handleAcceptFriend} handleRejectFriend={handleRejectFriend}/>)}
      <Divider orientation='left'>Active Games</Divider>
        <Row gutter={rowGutter}>
          {activeGames && activeGames.sort(sortByActivePlayerThenDate)
            .map(ag => <ActiveGameCard key={ag.id} game={ag} user={user.user} getGame={getGame} />)}
          </Row>
      <Divider orientation='left'>Friends</Divider>
        <Row gutter={rowGutter}>
        {userData && userData.friends.map(friend => 
            <Friend key={friend.id} friend={friend} handleNewGame={handleNewGame} />)}
        </Row>
      <Divider orientation='left'>Inactive Games</Divider>
    </div>
  )
}

export default Home
