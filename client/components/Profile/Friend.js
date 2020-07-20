import React from 'react'

const Friend = ({ friend, handleNewGame }) => {

  return (
    <div>
      {friend.username}
      <button onClick={() => handleNewGame(friend.id)}>Start Game with {friend.username}</button>
    </div>
  )

}

export default Friend