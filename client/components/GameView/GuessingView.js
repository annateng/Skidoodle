import React, { useState, useEffect, useRef } from 'react'
import { startGuessingRound, sendGuesses } from 'Utilities/services/gameService'
import { Typography, Progress, Space } from 'antd'

const GuessingView = ({ doodlesToGuess, roundLen, gameId, userId, setGame, setGameState }) => {
  const [timeLeft, setTimeLeft] = useState(roundLen)
  const [canvas, setCanvas] = useState()
  const [guessInput, setGuessInput] = useState()
  const [guess, setGuess] = useState('')
  const [label, setLabel] = useState('')
  const intervalRef = useRef()
  const replayRef = useRef()
  
  useEffect(() => {
    const thisCanvas = document.getElementById('paper-canvas')
    setCanvas(thisCanvas)
    setGuessInput(document.getElementById('guess-input'))

    return () => {
      clearInterval(intervalRef.current)
      if (replayRef.current) replayRef.current()
    }
  }, [])

  const handleSetLabel = label => {
    const disp = label.replace(/[a-z]/gi, '_')
    console.log(disp) // DEBUG

    setLabel(disp)
  }

  const handleStartGuessing = async () => {
    try {
      const guesses = await startGuessingRound(canvas, guessInput, doodlesToGuess, roundLen, setTimeLeft, handleSetGuess, handleSetLabel, intervalRef, replayRef)
      const newGame = await sendGuesses(guesses, userId, gameId)
      console.log(newGame) // DEBUG
      setGame(newGame)
      setGameState('SHOW-THIS-RESULT')
    } catch (e) {
      console.error('Error in handleStartGuessing', e)
    }
  }

  const handleSetGuess = guessVal => {
    if (!label) setGuess(guessVal)
    else setGuess(guessVal.substring(0, label.length))
  }

  return (
    <Space direction='vertical'>
      <Typography.Title id='countdown-timer'>Time Left: {timeLeft}s</Typography.Title>
      <Progress percent={timeLeft/roundLen*100} showInfo={false} />
      <div>
        <Typography.Text>Guess</Typography.Text>
        <div id='guess-input-wrapper'>
          <input className='borderless-input' id='guess-input' type='text' value={guess} onChange={event => handleSetGuess(event.target.value)} autoComplete='off' spellCheck='false' />
          <div id='underline-div'>{label}</div>
        </div>
      </div>
      <div id="canvas-div">
        <canvas id="paper-canvas" resize="true"></canvas>
      </div>
      <button onClick={handleStartGuessing}>Start Round</button>
      <div>{timeLeft}</div>
    </Space>
  )
}

export default GuessingView
