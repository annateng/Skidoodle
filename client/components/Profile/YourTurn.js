import React from 'react'

const YourTurn = ({ game, user }) => {

  const opponent = game.player1.id === user.id ? game.player2 : game.player1

  return (
    <div>
      Opponent: {opponent.username}
    </div>
  )

}

export default YourTurn