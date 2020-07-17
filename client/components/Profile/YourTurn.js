import React from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { setActiveGame } from 'Utilities/reducers/gameReducer'


const YourTurn = ({ game, user, getGame }) => {
  const history = useHistory()
  const dispatch = useDispatch()

  const opponent = game.player1.id === user.id ? game.player2 : game.player1

  const handleChooseGame = async () => {
    const gameData = await getGame(game.id, user.id)
    dispatch(setActiveGame(gameData))
    history.push('/game')
  }

  return (
    <div onClick={handleChooseGame}>
        Opponent: {opponent.username}<br />
        Current Round: {game.currentRound}<br />
    </div>
  )

}

export default YourTurn