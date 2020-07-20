import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { startGuessingRound, sendGuesses } from 'Utilities/services/gameService'
import { ROUND_LEN } from 'Utilities/common'

const GuessingView = ({ doodlesToGuess, roundLen, gameId, userId, setGame, setGameState }) => {
  const [timeLeft, setTimeLeft] = useState(ROUND_LEN)
  const [canvas, setCanvas] = useState()
  const [guessInput, setGuessInput] = useState()
  const [guess, setGuess] = useState('')
  
  useEffect(() => {
    const thisCanvas = document.getElementById('paper-canvas')
    setCanvas(thisCanvas)
    setGuessInput(document.getElementById('guess-input'))
  }, [])

  const handleStartGuessing = async () => {
    const guesses = await startGuessingRound(canvas, guessInput, doodlesToGuess, roundLen, setTimeLeft, setGuess)
    const newGame = await sendGuesses(guesses, userId, gameId)
    console.log(newGame) // DEBUG
    setGame(newGame)
    setGameState('SHOW-THIS-RESULT')
  }

  return (
    <div>
      <input id='guess-input' type='text' value={guess} onChange={event => setGuess(event.target.value)}></input>
      <div id="canvas-div">
        <canvas id="paper-canvas" resize="true"></canvas>
      </div>
      <button onClick={handleStartGuessing}>Start Round</button>
      <div>{timeLeft}</div>
    </div>
  )
}

export default GuessingView
