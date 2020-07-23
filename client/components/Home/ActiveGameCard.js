import React from 'react'
import { useHistory } from 'react-router-dom'
import { Col, Card } from 'antd'


const ActiveGameCard = ({ game, user }) => {
  const history = useHistory()

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleChooseGame = async () => {
    history.push(`/game/${game.id}`)
  }

  const isUsersTurn = user.id === game.activePlayer.id
  const partner = isUsersTurn ? game.inactivePlayer.username : game.activePlayer.username
  const date = game.timeOfLastMove ? new Date(game.timeOfLastMove) : null
  const state = isUsersTurn ? game.currentRound.state.toLowerCase() : null

  const cardStyle = {
    border: isUsersTurn ? '2px solid limegreen' : null,
    backgroundColor: isUsersTurn ? 'palegoldenrod' : 'whitesmoke'
  }

  const textStyle = {
    color: state && state === 'guess' ? 'tomato' : 'dodgerblue'
  }

  return (
    <Col xs={12} sm={8} lg={6}>
      <Card className='active-game-card' bordered='true' hoverable='true' bodyStyle={{ padding: '10px' }} style={cardStyle}>
        <div onClick={handleChooseGame}>
            {isUsersTurn && <div style={{ fontSize: '1.1em' }}><b>Your turn to <b style={textStyle}>{game.currentRound.state.toLowerCase()}</b></b></div>}
            {!isUsersTurn && <div style={{ fontSize: '1.1em' }}><b>It's {partner}'s turn</b></div>}
            <div>Game with {partner}</div>
            <div>Round {game.currentRoundNum}</div>
            {date && <div>Last move on {monthNames[date.getMonth()].substring(0,3)} {date.getDate()}  </div>}
            {!date && <div>&nbsp;</div>}
        </div>
      </Card>
    </Col>
    
  )
}

export default ActiveGameCard