import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, Redirect, useHistory } from 'react-router-dom'
import { Layout, Divider, Typography, Button, Space } from 'antd'

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

  if (!user) return ( <Redirect to="/login " /> )

  const beginRoundButton = buttonText => (
    <Button type='primary' onClick={handleBeginRound} id='begin-round-button'>{buttonText}</Button>
  )
  
  const getGameBody = () => {
    if (!game || !gameState) return ( <div>loading...</div> )

    switch (gameState) {
      case 'INACTIVE': 
        return ( <div>GAME IS OVER</div> ) // TODO
      case 'SHOW-LAST-RESULT':
        const lastRoundNum = game.currentRoundNum - 1
        if (!game.result || !game.result.roundScores || game.result.roundScores.length < lastRoundNum - 1) {
          console.error('previous round results not available')
          return (<div>previous round results not available</div>)
        }

        // During first round: no scores to show
        if (game.result.roundScores.length === 0 && game.currentRoundNum === 1) {
          return (
            <Space direction='vertical' align='center'>
              <Typography.Title level={2}>Guessing Round</Typography.Title>
              <Typography.Paragraph>
                <ul>
                  <li>
                    You will have {game.roundLen} seconds to guess what your partner has drawn
                  </li>
                  <li>
                    There are {game.currentRound.doodles.length} words to guess
                  </li>
                  <li>
                    Try to guess as many as you can, as fast as possible for a better score!
                  </li>
                </ul>
              </Typography.Paragraph>
              {beginRoundButton('Start Guessing')}
            </Space>
          )
        }

        return ( 
          <Space direction='vertical' align='center'>
            <Divider orientation='left'>Round {lastRoundNum} Results</Divider>
            <RoundResults roundResults={game.result.roundScores[lastRoundNum - 1]} gameResults={game.result.gameTotals} />
            <Typography.Title level={2}>Ready for round {game.currentRoundNum}?</Typography.Title>
            {beginRoundButton('Start Guessing')}
          </Space>
        )
      case 'SHOW-THIS-RESULT':
        if (!game.result || !game.result.roundScores || game.result.roundScores.length < Math.max(game.currentRoundNum - 1, 0)) {
          console.error('this round results not available')
          return (<div>this round results not available</div>)
        }

        // Before the first round: no scores to show
        if (game.result.roundScores.length === 0 && game.currentRoundNum === 1) {
          return (
            <Space direction='vertical' align='center'>
              <Typography.Title level={2}>New Game</Typography.Title>
              <Typography.Paragraph>
                <ul>
                  <li>
                    You will have {game.roundLen} seconds to draw each word
                  </li>
                  <li>
                    There are {game.nextWords.length} words per round
                  </li>
                </ul>
              </Typography.Paragraph>
              <Typography.Title level={2}>Ready?</Typography.Title>
              {beginRoundButton('Let\'s Doodle')}
            </Space>
          )
        }

        return ( 
          <Space direction='vertical' align='center'>
            <Divider orientation='left'>Round {game.currentRoundNum - 1} Results</Divider>
            <RoundResults roundResults={game.result.roundScores[game.currentRoundNum - 1]} gameResults={game.result.gameTotals} />
            <Typography.Title level={2}>Ready for round {game.currentRoundNum}?</Typography.Title>
            {beginRoundButton('Let\'s Doodle')}
          </Space>
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

  return (
    <Layout id="game-layout" style={{ padding: '24px 0' }}>
      {getGameBody()}
    </Layout>
  )
}

export default GameView