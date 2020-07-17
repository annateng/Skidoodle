import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { getGameState, sendRound } from 'Utilities/services/gameService'
import { setActiveGame, setLastGamePlayed } from 'Utilities/reducers/gameReducer'
import { setAllTokens } from 'Utilities/common'

import DrawingView from 'Components/GameView/DrawingView'
import GuessingView from 'Components/GameView/GuessingView'

const GameView = () => {
  const [gameState, setGameState] = useState()
  const activeGame = useSelector(state => state.game.activeGame)
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    setGameState(getGameState(activeGame))
    // console.log('gameState', gameState)
  }, [])

  useEffect(() => {
    const sendRoundResults = async (activeGame) => {
        const sentRound = await sendRound(activeGame)
        console.log(sentRound)
        dispatch(setLastGamePlayed(sentRound))
        dispatch(setActiveGame({}))
    }

    console.log(getGameState(activeGame))
    if (getGameState(activeGame) === 'OVER') {
      sendRoundResults(activeGame) 
    }

  }, [activeGame])

  if (user) setAllTokens(user.token)
  // console.log('getgamestate', getGameState(activeGame))
  // console.log('gameState', gameState)

  if (!activeGame) return ( <>no active game...</> ) //TODO

  // prevent read property doodles of undefined
  const doodlesToGuess = activeGame.doodlesToGuess ? activeGame.doodlesToGuess.doodles : null

  if (gameState === 'GUESS') return ( <GuessingView doodlesToGuess={doodlesToGuess} setGameState={setGameState} /> )
  if (gameState === 'DRAW') return ( <DrawingView wordsToDraw={activeGame.nextWords} setGameState={setGameState} /> )
  if (gameState === 'OVER') return ( <div>ROUND OVER</div> ) // TODO
  if (gameState === 'INACTIVE') return ( <div>GAME IS OVER</div> ) // TODO
  
  // This shouldn't render unless gameState is an error
  return ( <div>error</div> )
}

export default GameView