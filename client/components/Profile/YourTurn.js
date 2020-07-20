import React from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'


const YourTurn = ({ game, user }) => {
  const history = useHistory()

  const opponent = game.player1.id === user.id ? game.player2 : game.player1

  const handleChooseGame = async () => {
    history.push(`/game/${game.id}`)
  }

  return (
    <div onClick={handleChooseGame}>
        Opponent: {opponent.username}<br />
        Current Round: {game.currentRoundNum}<br />
    </div>
  )

}

export default YourTurn