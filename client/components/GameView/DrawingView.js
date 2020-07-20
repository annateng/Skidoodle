import React, { useState, useEffect, useRef } from 'react'

import { startRound, sendDoodles } from 'Utilities/services/gameService'
import { ROUND_LEN } from 'Utilities/common'

const DrawingView = ({ wordsToDraw, roundLen, gameId, userId, setGame, setGameState }) => {
  const [timeLeft, setTimeLeft] = useState(ROUND_LEN)
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
      <div>{word}</div>
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

export default DrawingView
