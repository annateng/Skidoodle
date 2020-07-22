import React from 'react'
import { Col, Card } from 'antd'

const OthersTurn = ({ game, user }) => {

  return (
    <Col span={{ xs: 12, sm: 8, md: 6, lg: 4 }} >
      <Card bordered='true'>
        <div>
          Opponent: {game.activePlayer.username}<br />
          Current Round: {game.currentRoundNum}<br />
        </div>
      </Card>
    </Col>
  )
}

export default OthersTurn