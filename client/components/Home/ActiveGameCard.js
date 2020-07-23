import React from 'react'
import { useHistory } from 'react-router-dom'
import { Col, Card } from 'antd'

import { ServerGameStatus, monthNames } from 'Utilities/common'


const ActiveGameCard = ({ game, user }) => {
  const history = useHistory()



  const handleChooseGame = async () => {
    history.push(`/game/${game.id}`)
  }

  const isPending = game.status === ServerGameStatus.pending

  const isUsersTurn = user.id === game.activePlayer.id
  const partner = isUsersTurn ? game.inactivePlayer.username : game.activePlayer.username
  const date = game.timeOfLastMove ? new Date(game.timeOfLastMove) : null
  const state = isUsersTurn ? game.currentRound.state.toLowerCase() : null

  const cardStyle = {
    border: isUsersTurn ? '2px solid limegreen' : null,
    backgroundColor: isPending ? '#ffe8e8' : isUsersTurn ? 'palegoldenrod' : 'whitesmoke'
  }

  const textStyle = {
    color: state && state === 'guess' ? 'tomato' : 'dodgerblue'
  }

  let cardHeader
  if (isPending) {
    cardHeader = <b>Game request pending</b>
  } else if (isUsersTurn) {
    cardHeader = <b>Your turn to <b style={textStyle}>{game.currentRound.state.toLowerCase()}</b></b>
  } else {
    cardHeader = <b>It's {partner}'s turn</b>
  }

  let cardBody
  if (isPending) cardBody = <div>Waiting for <b>{partner}</b> to accept</div>
  else cardBody = <div>Game with <b>{partner}</b></div>

  return (
    <Col xs={12} sm={8} lg={6}>
      <Card className='home-card' bordered='true' hoverable='true' bodyStyle={{ padding: '10px' }} style={cardStyle}>
        <div onClick={handleChooseGame}>
            <div style={{ fontSize: '1.1em' }}>{cardHeader}</div>
            <div>{cardBody}</div>
            <div>Round {game.currentRoundNum}</div>
            {date && <div>Last move on {monthNames[date.getMonth()].substring(0,3)} {date.getDate()}  </div>}
            {!date && <div>&nbsp;</div>}
        </div>
      </Card>
    </Col>
    
  )
}

export default ActiveGameCard