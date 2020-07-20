import React from 'react'

const OpponentsTurn = ({ game, user }) => {

  const opponent = game.player1.id === user.id ? game.player2 : game.player1

  return (
    <div>
      Opponent: {opponent.username}<br />
      Current Round: {game.currentRoundNum}<br />
    </div>
  )

}

export default OpponentsTurn