import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, Redirect, useHistory } from 'react-router-dom'

import { getGame, getGameState } from 'Utilities/services/gameService'
import { setActiveGame, setLastGamePlayed } from 'Utilities/reducers/gameReducer'
import { setAllTokens } from 'Utilities/common'

import DrawingView from 'Components/GameView/DrawingView'
import GuessingView from 'Components/GameView/GuessingView'
import RoundResults from 'Components/ResultView/RoundResults'

// FRONTEND GAME STATES: SHOW-LAST-RESULT -> GUESS -> SHOW-THIS-RESULT -> DOODLE -> OVER ... INACTIVE
const GameView = () => {
  const gameId = useParams().gameId
  const user = useSelector(state => state.user)
  const history = useHistory()
  const [game, setGame] = useState()
  const [gameState, setGameState] = useState()

  useEffect(() => {
    if (!user) return

    const getGameFromDB = async () => {
      const gameData = await getGame(gameId, user.user.id)
      console.log(gameData)
      setGame(gameData)

      if (!gameData.isActive) setGameState('INACTIVE')
      else if (gameData.currentRound.state === 'GUESS') setGameState('SHOW-LAST-RESULT')
      else if (gameData.currentRound.state === 'DOODLE') setGameState('SHOW-THIS-RESULT')
      else if (gameData.currentRound.state === 'OVER') setGameState('OVER')
      else console.error('Error with game state obtained with gameService.getGame', gameData.currentRound.state)
    }

    getGameFromDB()

  }, [])

  const handleBeginRound = () => {
    setGameState(game.currentRound.state)
  }

  if (user) setAllTokens(user.token)

  if (!user) return ( <Redirect to="/login " /> ) // TODO: show a page saying you're not logged in
  if (!game || !gameState) return ( <div>loading...</div> )
  
  switch (gameState) {
    case 'INACTIVE': 
      return ( <div>GAME IS OVER</div> ) // TODO
    case 'SHOW-LAST-RESULT': 
      return ( 
        <div>
          <RoundResults roundResults={game.lastRoundResults} />
          <button onClick={handleBeginRound}>Begin Round</button>
        </div>
      )
    case 'SHOW-THIS-RESULT': 
      return ( 
        <div>
          <RoundResults roundResults={game.lastRoundResults} />
          <button onClick={handleBeginRound}>Begin Round</button>
        </div>
      )
    case 'GUESS': 
      return ( <GuessingView doodlesToGuess={game.currentRound.doodles} roundLen={game.roundLen} gameId={game.id} 
        userId={user.user.id} setGame={setGame} setGameState={setGameState} /> )
    case 'DOODLE':
      return ( <DrawingView wordsToDraw={game.nextWords} roundLen={game.roundLen} gameId={game.id} userId={user.user.id} 
        setGame={setGame} setGameState={setGameState} /> )
    case 'OVER':
      return ( 
        <div>
          ROUND OVER
          <button onClick={() => history.push('/profile')}>Back to My Games</button>
        </div> 
      ) // TODO
    // This shouldn't render unless gameState is an error
    default:
      return ( <div>error</div> )
  }
}

export default GameView