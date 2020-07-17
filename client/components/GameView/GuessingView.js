import React, { useState, useEffect } from 'react'
import paper from 'paper'
import { useDispatch } from 'react-redux'
import { startGuessingRound } from 'Utilities/services/gameService'
import { saveGuesses } from 'Utilities/reducers/gameReducer'
import { ROUND_LEN } from 'Utilities/common'

//TODO: figure out sizing
const GuessingView = ({ doodlesToGuess, setGameState }) => {
  const [timeLeft, setTimeLeft] = useState(ROUND_LEN)
  const [canvas, setCanvas] = useState()
  const [guessInput, setGuessInput] = useState()
  const [guess, setGuess] = useState('')
  
  const dispatch = useDispatch()
  
  useEffect(() => {
    const thisCanvas = document.getElementById('paper-canvas')
    setCanvas(thisCanvas)
    paper.setup(thisCanvas)

    setGuessInput(document.getElementById('guess-input'))
  }, [])

  const handleStartGuessing = async () => {
    const guesses = await startGuessingRound(canvas, guessInput, doodlesToGuess, setTimeLeft, setGuess)
    dispatch(saveGuesses(guesses))
    setGameState('DRAW')
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
