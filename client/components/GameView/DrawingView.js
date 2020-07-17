import React, { useState, useEffect } from 'react'
import paper from 'paper'
import { useSelector, useDispatch } from 'react-redux'
import { getDrawing, startRound, getNewGame, sendRound } from 'Utilities/services/gameService'
import { setActiveGame } from 'Utilities/reducers/gameReducer'
import { setAllTokens } from 'Utilities/common'

//TODO: figure out sizing
const DrawingView = () => {
  const [timeLeft, setTimeLeft] = useState(10)
  const [canvas, setCanvas] = useState()
  const [word, setWord] = useState('')
  const user = useSelector(state => state.user)
  const activeGame = useSelector(state => state.game ? state.game.activeGame : null)
  const dispatch = useDispatch()
  
  useEffect(() => {
    const thisCanvas = document.getElementById('paper-canvas')
    setCanvas(thisCanvas)
    paper.setup(thisCanvas)
    localStorage.setItem('scribbleColor', 'black')
  }, [])

  if (user) setAllTokens(user.token)

  const handleStartRound = async () => {
    const drawing = getDrawing(canvas)
    const doodles = []
    await startRound(drawing, setTimeLeft, activeGame, setWord, doodles)
    // console.log(doodles)
    const guesses = [] // TODO

    const sentGame = await sendRound(user.id, '5f08911a80a1cab3ba66cbb5', doodles, activeGame.id, guesses)
    // console.log(sentGame)
  }

  const handleSetColor = color => {
    localStorage.setItem('scribbleColor', color)
  }

  const handleSetSize = size => {
    localStorage.setItem('scribbleSize', size)
  }

  const handleNewGame = async () => {
    const newGame = await getNewGame(user.id, '5f08911a80a1cab3ba66cbb5')
    dispatch(setActiveGame(newGame))
  }

  return (
    <div>
      <button onClick={handleNewGame}>New Game</button>
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
