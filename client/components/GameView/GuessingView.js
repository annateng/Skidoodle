import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { startGuessingRound, sendGuesses } from 'Utilities/services/gameService'
import { ROUND_LEN } from 'Utilities/common'

const GuessingView = ({ doodlesToGuess, roundLen, gameId, userId, setGame, setGameState }) => {
  const [timeLeft, setTimeLeft] = useState(ROUND_LEN)
  const [canvas, setCanvas] = useState()
  const [guessInput, setGuessInput] = useState()
  const [guess, setGuess] = useState('')
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

  const handleStartGuessing = async () => {
    try {
      const guesses = await startGuessingRound(canvas, guessInput, doodlesToGuess, roundLen, setTimeLeft, handleSetGuess, intervalRef, replayRef)
      const newGame = await sendGuesses(guesses, userId, gameId)
      console.log(newGame) // DEBUG
      setGame(newGame)
      setGameState('SHOW-THIS-RESULT')
    } catch (e) {
      console.error('Error in handleStartGuessing', e)
    }
  }

  const handleSetGuess = (guessVal) => {
    setGuess(guessVal)
  }

  return (
    <div>
      <input id='guess-input' type='text' value={guess} onChange={event => handleSetGuess(event.target.value)} autoComplete='off' />
      <div id="canvas-div">
        <canvas id="paper-canvas" resize="true"></canvas>
      </div>
      <button onClick={handleStartGuessing}>Start Round</button>
      <div>{timeLeft}</div>
    </div>
  )
}

export default GuessingView
