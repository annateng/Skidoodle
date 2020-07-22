import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Button, Row, Col, Divider, Layout, Typography } from 'antd';

import { setAllTokens } from 'Utilities/common'
import { getGame } from 'Utilities/services/gameService'
import { getActiveGames, getUserData } from 'Utilities/services/userService'
import { getNewGame } from 'Utilities/services/gameService'

import YourTurn from 'Components/Profile/YourTurn'
import OpponentsTurn from 'Components/Profile/OpponentsTurn'
import Friend from 'Components/Profile/Friend'

const Profile = () => {
  const user = useSelector(state => state.user)
  const [activeGames, setActiveGames] = useState()
  const [userData, setUserData] = useState()
  const history = useHistory()

  if (user) setAllTokens(user.token)

  useEffect(() => {
    if (!user || ! user.user) return

    handleGetActiveGames()
    handleGetFriends()
  }, [user])

  const handleGetActiveGames = async () => {
    const gamesFromDB = await getActiveGames(user.user.id)
    // console.log(thisActiveGames)
    setActiveGames(gamesFromDB)
  }

  const handleGetFriends = async () => {
    const userFromDB = await getUserData(user.user.id)
    setUserData(userFromDB)
    console.log(userFromDB)
  }

  const handleNewGame = async (opponentId) => {
    const newGame = await getNewGame(user.user.id, opponentId)
    // console.log(newGame)
    history.push(`/game/${newGame.id}`)
  }

  if (!user || !user.user) {
    return (
      <Button type='primary' size='large' onClick={() => history.push('/profile')}>Log In</Button>
    )
  }

  return (
    <Layout id="profile-layout" style={{ padding: '24px 0' }}>
      <Divider orientation='left'>Friends</Divider>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        {userData && userData.friends.map(friend => 
              <Friend className="friend-icon" key={friend.id} friend={friend} handleNewGame={handleNewGame} />)}
        </Row>
      <Divider orientation='left'>Active Games</Divider>
      <p style={{ fontWeight: 'bold' }}>Your Turn</p>
        <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 32]}>
          {activeGames && activeGames.filter(ag => ag.activePlayer === user.user.id).sort((a,b) => a.timeOfLastMove - b.timeOfLastMove).map(ag => 
            <YourTurn key={ag.id} game={ag} user={user.user} getGame={getGame} />)}
          </Row>
      <p style={{ fontWeight: 'bold' }}>Waiting On Opponent</p>
        <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 32]}>
          {activeGames && activeGames.filter(ag => ag.activePlayer !== user.user.id).sort((a,b) => a.timeOfLastMove - b.timeOfLastMove).map(ag => 
            <OpponentsTurn key={ag.id} game={ag} user={user.user} />)}
        </Row>
    </Layout>
  )
}

export default Profile
