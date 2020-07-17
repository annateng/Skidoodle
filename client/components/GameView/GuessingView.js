import React, { useState, useEffect } from 'react'
import paper from 'paper'
import { useSelector, useDispatch } from 'react-redux'
import { getGame, startGuessingRound } from 'Utilities/services/gameService'
import { setActiveGame } from 'Utilities/reducers/gameReducer'
import { setAllTokens } from 'Utilities/common'

//TODO: figure out sizing
const GuessingView = () => {
  const [timeLeft, setTimeLeft] = useState(10)
  const [canvas, setCanvas] = useState()
  const [guessInput, setGuessInput] = useState()
  const [guess, setGuess] = useState('')
  const user = useSelector(state => state.user)
  
  useEffect(() => {
    const thisCanvas = document.getElementById('paper-canvas')
    setCanvas(thisCanvas)
    paper.setup(thisCanvas)

    setGuessInput(document.getElementById('guess-input'))
  }, [])

  if (user) setAllTokens(user.token)

  const handleStartGuessing = async () => {
    const game = await getGame('5f11034019f50c232eba943b', user.id)
    // console.log(game)
    startGuessingRound(canvas, guessInput, game, setTimeLeft, setGuess)
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
