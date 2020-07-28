import React, { useState, useEffect, useRef } from 'react'
import { Typography, Button, Row, Col } from 'antd'
import { PaperScope } from 'paper/dist/paper-core'

import { getDrawing } from 'Utilities/services/gameService'
import Palette from 'Components/GameView/Palette'

const FreeDraw = ({ wordsToDraw, roundLen, gameId, userId, setGame, setGameState }) => {
  // console.log('render') //DEBUG
  const [canvas, setCanvas] = useState()
  const [paper, setPaper] = useState(new PaperScope())
  
  useEffect(() => {
    if (canvas) {
      console.log('got here1')
      // keep fixed canvas aspect ratio 2:1 for scaling
      const canvasDiv = document.getElementById('canvas-div')
      canvasDiv.style.height = (canvasDiv.clientWidth / 2) + 'px'
      window.onresize = () => canvasDiv.style.height = (canvasDiv.clientWidth / 2) + 'px'

      handleStartRound()
      console.log('got here2')
    } else {
      const thisCanvas = document.getElementById('paper-canvas')

      setCanvas(thisCanvas)
      localStorage.setItem('scribbleColor', 'black')
      localStorage.setItem('scribbleSize', 2)
      localStorage.setItem('scribbleEraser', false)
      console.log('got here')
    }
  }, [canvas])

  const handleStartRound = async () => {
    try {
      paper.setup(canvas)
      const drawing = getDrawing(-1, paper, false)
      drawing.isActive = true
      console.log('got here4')
      
    } catch (e) {
      console.error('Error in handleStartRound', e)
    }
  }

  const clear = () => {
    paper.project.activeLayer.removeChildren()
    paper.view.draw()
  }

  return (
    <div className='vertical-center-div'>
      <Typography.Title level={2} style={{ marginTop: '20px' }}>Free Draw</Typography.Title>
      <Row gutter={26}>
        <Palette />
        <Col span={19}>
          <div id='canvas-div'>
            <canvas id="paper-canvas" resize="false"></canvas>
          </div>
          <Button style={{ marginTop: '15px' }} type='danger' onClick={clear}size='large'>Start Over</Button>
        </Col>
      </Row>
    </div>
  )
}

export default FreeDraw

