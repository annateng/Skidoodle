import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setAllTokens } from 'Utilities/common'
import { getGame } from 'Utilities/services/gameService'
import { getActiveGames } from 'Utilities/services/userService'

import YourTurn from 'Components/Profile/YourTurn'

const Profile = () => {
  const activeGame = useSelector(state => state.game ? state.game.activeGame : null)
  const user = useSelector(state => state.user)
  const [activeGames, setActiveGames] = useState()

  if (user) setAllTokens(user.token)

  useEffect(() => {
    handleGetActiveGames()
  }, [])

  const handleGetActiveGames = async () => {
    const thisActiveGames = await getActiveGames(user.id)
    console.log(thisActiveGames)
    setActiveGames(thisActiveGames)
  }

  const handleGetGame = async () => {
    const game = await getGame(activeGame.id, user.id)
    console.log(game)
  }

  return (
    <div>
      <div>
        <div>Your Turn</div>
        {activeGames && activeGames.filter(ag => ag.activePlayer === user.id).map(ag => <YourTurn key={ag.id} game={ag} user={user}/>)}
      </div>
      <div>
        <div>Waiting on Opponent</div>
        {activeGames && activeGames.filter(ag => ag.activePlayer !== user.id).map(ag => <li key={ag.id}>{ag.id}</li>)}
      </div>
    </div>
  )
}

export default Profile
