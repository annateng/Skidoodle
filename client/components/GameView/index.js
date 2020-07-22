import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, Redirect, useHistory } from 'react-router-dom'
import { Layout, Typography, Button } from 'antd'

import { getGame, getGameState } from 'Utilities/services/gameService'
import { setActiveGame, setLastGamePlayed } from 'Utilities/reducers/gameReducer'
import { setAllTokens } from 'Utilities/common'

import DrawingView from 'Components/GameView/DrawingView'
import GuessingView from 'Components/GameView/GuessingView'
import GameResults from 'Components/ResultView/GameResults'
import RoundResults from 'Components/ResultView/RoundResults'

// FRONTEND GAME STATES: SHOW-LAST-RESULT -> GUESS -> SHOW-THIS-RESULT -> DOODLE -> OVER ... INACTIVE, LOADING
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
        return ( 
          <div className='vertical-center-div'>
            <Typography.Title>Game finished!</Typography.Title>
            <GameResults result={game.result} />
            <Button type='primary' onClick={() => history.push('/profile')}>Back to My Games</Button>
          </div> 
        )

      case 'SHOW-LAST-RESULT':
        const lastRoundNum = game.currentRoundNum - 1
        if (!game.result || !game.result.roundScores || game.result.roundScores.length < lastRoundNum - 1) {
          console.error('previous round results not available')
          return (<div>previous round results not available</div>)
        }

        // During first round: no scores to show
        if (game.result.roundScores.length === 0 && game.currentRoundNum === 1) {
          return (
            <div className='vertical-center-div'>
              <Typography.Title level={2}>Guessing Round</Typography.Title>
              <Typography.Paragraph>
                <ul>
                  <li>
                    You will have {game.roundLen} seconds to guess each word that your partner has drawn
                  </li>
                  <li>
                    There are {game.currentRound.doodles.length} words to guess
                  </li>
                  <li>
                    Try to guess as many as you can, as fast as possible for a better score
                  </li>
                </ul>
              </Typography.Paragraph>
              {beginRoundButton('Start Guessing')}
            </div>
          )
        }

        // Regular round results
        return ( 
          <div className='vertical-center-div'>
            <Typography.Title level={3}>Round {lastRoundNum} Results</Typography.Title>
             <div style={{ width: '100%' }}>
              <Typography.Text style={{ align: 'left' }}><b>artist:</b> {game.activePlayer.username}&nbsp;&nbsp;&nbsp;&nbsp;
                <b>guesser:</b> {game.inactivePlayer.username}</Typography.Text><br />
            </div>
            <RoundResults roundResults={game.result.roundScores[lastRoundNum - 1]} gameResults={game.result.gameTotals} />
            <Typography.Title level={3}>Ready for round {game.currentRoundNum}?</Typography.Title>
            {beginRoundButton('Start Guessing')}
          </div>
        )

      case 'SHOW-THIS-RESULT':
        if (!game.result || !game.result.roundScores || game.result.roundScores.length < Math.max(game.currentRoundNum - 1, 0)) {
          console.error('this round results not available')
          return (<div>this round results not available</div>)
        }

        // Before the first round: no scores to show
        if (game.result.roundScores.length === 0 && game.currentRoundNum === 1) {
          return (
            <div className='vertical-center-div'>
              <Typography.Title level={2}>New Game</Typography.Title>
              <Typography.Paragraph>
                <ul>
                  <li>
                    You will have {game.roundLen} seconds to draw each word
                  </li>
                  <li>
                    There are {game.nextWords.length} words per round
                  </li>
                  <li>
                    Don't spell out the word, it's against the rules!
                  </li>
                </ul>
              </Typography.Paragraph>
              <Typography.Title level={3}>Ready?</Typography.Title>
              {beginRoundButton('Let\'s Doodle')}
            </div>
          )
        }

        // Regular round results
        console.log('game', game)
        console.log('game.inactivePlayer.username', game.inactivePlayer.username)
        console.log('game.activePlayer.username', game.activePlayer.username)
        return (
          <div className='vertical-center-div'>
            <Typography.Title level={3}>Round {game.currentRoundNum - 1} Results</Typography.Title>
            <div style={{ width: '100%' }}>
            <Typography.Text style={{ align: 'left' }}><b>artist:</b> {game.inactivePlayer.username}&nbsp;&nbsp;&nbsp;&nbsp;
                <b>guesser:</b> {game.activePlayer.username}</Typography.Text><br />
            </div>
            <RoundResults roundResults={game.result.roundScores[game.currentRoundNum - 2]} gameResults={game.result.gameTotals} />
            <Typography.Title level={3}>Ready for round {game.currentRoundNum}?</Typography.Title>
            {beginRoundButton('Let\'s Doodle')}
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
          <div className='vertical-center-div'>
            <Typography.Title level={3}>Finished!</Typography.Title>
            <Button type='primary' onClick={() => history.push('/profile')}>Back to My Games</Button>
          </div> 
        )
      // This shouldn't render unless gameState is an error
      default:
        return ( <div>error</div> )
    }
  }

  return (
    <Layout id="game-layout">
      {getGameBody()}
    </Layout>
  )
}

export default GameView