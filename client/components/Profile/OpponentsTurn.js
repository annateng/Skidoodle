import React from 'react'
import { Col, Card } from 'antd'

const OpponentsTurn = ({ game, user }) => {

  const opponent = game.player1.id === user.id ? game.player2 : game.player1

  return (
    <Col span={{ xs: 12, sm: 8, md: 6, lg: 4 }} >
      <Card bordered='true'>
        <div>
          Opponent: {opponent.username}<br />
          Current Round: {game.currentRoundNum}<br />
        </div>
      </Card>
    </Col>
  )
}

export default OpponentsTurn