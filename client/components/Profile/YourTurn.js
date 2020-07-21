import React from 'react'
import { useHistory } from 'react-router-dom'
import { Col, Card } from 'antd'


const YourTurn = ({ game, user }) => {
  const history = useHistory()

  const opponent = game.player1.id === user.id ? game.player2 : game.player1

  const handleChooseGame = async () => {
    history.push(`/game/${game.id}`)
  }

  return (
    <Col span={{ xs: 12, sm: 8, md: 6, lg: 4 }} >
    <Card bordered='true' hoverable='true'>
      <div onClick={handleChooseGame}>
          Opponent: {opponent.username}<br />
          Current Round: {game.currentRoundNum}<br />
      </div>
    </Card>
  </Col>
    
  )
}

export default YourTurn