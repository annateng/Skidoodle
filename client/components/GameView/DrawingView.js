import React, { useState, useEffect, useRef } from 'react'
import { Typography, Progress, Row, Col, Card } from 'antd'
import Rodal from 'rodal'

import { startRound, sendDoodles, startRodal } from 'Utilities/services/gameService'
import { GameState, ServerGameStatus } from 'Utilities/common'

const colors = ['black', 'darkred', 'crimson', 'deeppink', 'pink', 'coral', 'orange', 'gold', 'limegreen', 'darkgreen', 
  'lightseagreen', 'paleturquoise', 'cadetblue', 'cornflowerblue', 'mediumblue', 'mediumpurple', 'indigo', 'dimgray']

const sizes = [2, 4, 8, 14, 22, 30]

const DrawingView = ({ wordsToDraw, roundLen, gameId, userId, setGame, setGameState }) => {
  // console.log('render') //DEBUG
  const [timeLeft, setTimeLeft] = useState(roundLen)
  const [canvas, setCanvas] = useState()
  const [word, setWord] = useState()
  const [rodalVisible, setRodalVisible] = useState(false)
  const [rodalHeader, setRodalHeader] = useState()
  const intervalRef = useRef()
  const roundRef = useRef()
  const modalIntervalRef = useRef()
  const modalRef = useRef()
  
  useEffect(() => {
    if (canvas) {
      handleStartRound()
    } else {
      const thisCanvas = document.getElementById('paper-canvas')
      setCanvas(thisCanvas)
      localStorage.setItem('scribbleColor', 'black')
      localStorage.setItem('scribbleSize', 2)
      localStorage.setItem('scribbleEraser', false)
    }

    // clean up intervals and unresolved promises
    return () => {
      clearInterval(intervalRef.current)
      if (roundRef.current) roundRef.current()
      clearInterval(modalIntervalRef.current)
      if (modalRef.current) modalRef.current()
    }
  
  }, [canvas])

  const handleStartRodal = async () => {
    await startRodal(setRodalVisible, setRodalHeader, modalIntervalRef, modalRef)
  }

  const handleStartRound = async () => {
    try {
      const doodles = await startRound(canvas, setTimeLeft, wordsToDraw, roundLen, setWord, intervalRef, 
        roundRef, handleStartRodal)
      const newGame = await sendDoodles(doodles, userId, gameId)
      console.log(newGame) // DEBUG

      if (newGame.status === ServerGameStatus.pending) {
        setGameState(GameState.pending)
      } else {
        setGameState(GameState.over)
      }

      setGame(newGame)
      
    } catch (e) {
      console.error('Error in handleStartRound', e)
    }
  }

  const handleSetColor = color => {
    console.log('got here', color)
    localStorage.setItem('scribbleColor', color)
  }

  const handleSetSize = size => {
    localStorage.setItem('scribbleSize', size)
  }

  return (
    <div className='vertical-center-div'>
      <Typography.Title id='countdown-timer'>Time Left: {timeLeft}s</Typography.Title>
      <Progress className='game-progress' percent={timeLeft/roundLen*100} showInfo={false} />
      <Typography.Title id='word-to-draw'>{word || " "}</Typography.Title>
      
      <Row gutter={26}>
        <Col span={5}>
          <Typography.Text>Color</Typography.Text>
          <Row gutter={[6, 6]}>
            { colors.map(color => 
              <Col span={6} key={color}>
                <div onClick={() => handleSetColor(color)}>
                  <Card hoverable='true' style={{ backgroundColor: color }} ></Card>
                </div>
              </Col>) 
            }
            <Col span={12} key={'eraser'}>
              <div id='ubitch' onClick={() => handleSetColor('whitesmoke')}>
                <Card hoverable='true' style={{ backgroundColor: 'whitesmoke', maxHeight: '50px', padding: '0px' }} bodyStyle={{ padding: '10px' }}>Eraser</Card>
              </div>
            </Col>
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
        <Col span={19} style={{ display: 'flex', alignContent: 'center'}}>
          <canvas id="paper-canvas" resize="true"></canvas>
        </Col>
      </Row>
      <Rodal visible={rodalVisible} onClose={() => setRodalVisible(false)} showCloseButton={false}
        width={600} height={400} enterAnimation='zoom' closeMaskOnClick={false}>
        <div className='rodal-header'>{rodalHeader}</div>
        <div className='rodal-body'>Draw: {word}</div>
      </Rodal>
    </div>
  )
}

export default DrawingView

