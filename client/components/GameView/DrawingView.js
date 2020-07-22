import React, { useState, useEffect, useRef } from 'react'
import { Typography, Progress, Row, Col, Button, Card } from 'antd'

import { startRound, sendDoodles } from 'Utilities/services/gameService'

const colors = ['black', 'darkred', 'crimson', 'deeppink', 'pink', 'coral', 'orange', 'gold', 'limegreen', 'darkgreen', 
  'lightseagreen', 'paleturquoise', 'cadetblue', 'cornflowerblue', 'mediumblue', 'mediumpurple', 'indigo', 'dimgray']

const sizes = [2, 4, 8, 14, 22, 30]

const DrawingView = ({ wordsToDraw, roundLen, gameId, userId, setGame, setGameState }) => {
  const [timeLeft, setTimeLeft] = useState(roundLen)
  const [canvas, setCanvas] = useState()
  const [word, setWord] = useState('')
  const intervalRef = useRef()
  const roundRef = useRef()
  
  useEffect(() => {
    const thisCanvas = document.getElementById('paper-canvas')
    setCanvas(thisCanvas)
    localStorage.setItem('scribbleColor', 'black')
    localStorage.setItem('scribbleSize', 2)

    return () => {
      clearInterval(intervalRef.current)
      if (roundRef.current) roundRef.current()
    }
  }, [])

  const handleStartRound = async () => {
    try {
      const doodles = await startRound(canvas, setTimeLeft, wordsToDraw, roundLen, setWord, intervalRef, roundRef)
      const newGame = await sendDoodles(doodles, userId, gameId)
      console.log(newGame) // DEBUG
      setGame(newGame)
      setGameState('OVER')
    } catch (e) {
      console.error('Error in handleStartRound', e)
    }
  }

  const handleSetColor = color => {
    localStorage.setItem('scribbleColor', color)
  }

  const handleSetSize = size => {
    localStorage.setItem('scribbleSize', size)
  }

  return (
    <div>
      <Typography.Title id='countdown-timer'>Time Left: {timeLeft}s</Typography.Title>
      <Progress percent={timeLeft/roundLen*100} showInfo={false} />
      <Typography.Title id='word-to-draw'>{word || " "}</Typography.Title>
      
      <Row gutter={26}>
        <Col span={5}>
          <Typography.Text>Color</Typography.Text>
          <Row gutter={[6, 6]}>
            { colors.map(color => 
              <Col span={6} key={color}>
                <div onClick={() => handleSetColor(color)}>
                  <Card hoverable='true' style={{ backgroundColor: color }} >
                  </Card>
                </div>
              </Col>) }
          </Row>
          <Typography.Text>Size</Typography.Text>
          <Row gutter={[4, 8]}>
            { sizes.map(size => 
              <Col span={4} key={'size-' + size}>
                <div style={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => handleSetSize(size)}>
                  <div className='dot' style={{ height: size+'px', width: size+'px' }} ></div>
                </div>
              </Col>) }
          </Row>
        </Col>
        <Col span={19}>
          <canvas id="paper-canvas" resize="true"></canvas>
        </Col>
      <button onClick={handleStartRound}>Start Round</button>
      </Row>
    </div>
  )
}

export default DrawingView

