import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { getGameState, sendRound } from 'Utilities/services/gameService'
import { setAllTokens } from 'Utilities/common'

import DrawingView from 'Components/GameView/DrawingView'
import GuessingView from 'Components/GameView/GuessingView'

const GameView = () => {
  const [gameState, setGameState] = useState()
  const activeGame = useSelector(state => state.game.activeGame)
  const user = useSelector(state => state.user)

  useEffect(() => {
    setGameState(getGameState(activeGame))
    console.log('gameState', gameState)
  }, [])

  useEffect(() => {
    const sendRoundResults = async (activeGame) => {
        const sendRoundSuccess = await sendRound(activeGame)
        console.log(sendRoundSuccess)
    }

    if (getGameState(activeGame) === 'OVER') {
      sendRoundResults(activeGame) 
    }

  }, [activeGame])

  if (user) setAllTokens(user.token)
  console.log('getgamestate', getGameState(activeGame))
  console.log('gameState', gameState)

  const fuckyou = async () => {
    const sendRoundSuccess = await sendRound(activeGame)
    console.log(sendRoundSuccess)
  }

  if (!activeGame) return ( <>no active game...</> ) //TODO

  // prevent read property doodles of undefined
  const doodlesToGuess = activeGame.doodlesToGuess ? activeGame.doodlesToGuess.doodles : null

  if (gameState === 'GUESS') return ( <GuessingView doodlesToGuess={doodlesToGuess} setGameState={setGameState} /> )
  if (gameState === 'DRAW') return ( <DrawingView wordsToDraw={activeGame.nextWords} setGameState={setGameState} /> )
  
  // This shouldn't render unless gameState is an error
  return (
    <button onClick={fuckyou}>FUCK YOU</button>
  )
}

export default GameView