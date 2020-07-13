import React, { useState, useEffect } from 'react'
import paper from 'paper'
import { getDrawing, startRound } from 'Utilities/services/gameService'

//TODO: figure out sizing
const Drawing = () => {
  const [timeLeft, setTimeLeft] = useState(10)
  const [canvas, setCanvas] = useState()
  
  useEffect(() => {
    const thisCanvas = document.getElementById('paper-canvas')
    setCanvas(thisCanvas)
    paper.setup(thisCanvas)
    localStorage.setItem('scribbleColor', 'black')
  }, [])

  const handleStartRound = () => {
    const drawing = getDrawing(canvas)
    startRound(drawing, setTimeLeft)
  }

  const handleSetColor = color => {
    localStorage.setItem('scribbleColor', color)
  }

  const handleSetSize = size => {
    localStorage.setItem('scribbleSize', size)
  }

  return (
    <div>
      <div id="canvas-div">
        <button onClick={() => handleSetColor('black')}>black</button>
        <button onClick={() => handleSetColor('yellow')}>yellow</button>
        <button onClick={() => handleSetColor('red')}>red</button>
        <button onClick={() => handleSetSize(2)}>small</button>
        <button onClick={() => handleSetSize(4)}>medium</button>
        <button onClick={() => handleSetSize(8)}>large</button>
        <canvas id="paper-canvas" resize="true"></canvas>
      </div>
      <button onClick={handleStartRound}>Start Round</button>
      <div>{timeLeft}</div>
    </div>
  )
}

export default Drawing
