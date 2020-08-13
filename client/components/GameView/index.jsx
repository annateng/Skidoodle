import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Redirect, useHistory } from 'react-router-dom';
import { Typography, Button, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { getGame } from 'Utilities/services/gameService';
import { acceptGameRequest, rejectGameRequest } from 'Utilities/services/userService';
import {
  setAllTokens, GameState, ServerGameStatus, ServerRoundState,
} from 'Utilities/common';

import DrawingView from 'Components/GameView/DrawingView';
import GuessingView from 'Components/GameView/GuessingView';
import GameResults from 'Components/ResultView/GameResults';
import RoundResults from 'Components/ResultView/RoundResults';

// FRONTEND GAME STATES: SHOW-LAST-RESULT -> GUESS -> SHOW-THIS-RESULT -> DOODLE -> OVER ... INACTIVE-GAME, INACTIVE-PLAYER, PENDING
const GameView = () => {
  const { gameId } = useParams();
  const user = useSelector((state) => state.user);
  const history = useHistory();
  const [game, setGame] = useState();
  const [gameState, setGameState] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    getGameFromDB();
  }, []);

  const getGameFromDB = async () => {
    try {
      const gameData = await getGame(gameId, user.user.id);
      setGame(gameData);

      if (gameData.status === ServerGameStatus.inactive) setGameState(GameState.inactiveGame);
      // if game status is PENDING and you are NOT the requester, set state pending
      else if (gameData.status === ServerGameStatus.pending) {
        if (user.user.id !== gameData.player1.id) setGameState(GameState.pending);
        else {
          // if its before the first turn (sending the game request), set state to pre-doodle
          if (gameData.currentRound && gameData.currentRound.state === ServerRoundState.doodle && gameData.currentRoundNum === 1) setGameState(GameState.showThisResult);
          else setGameState(GameState.pending);
        }
      }
      // if it's not your turn, just display results
      else if (gameData.activePlayer.id !== user.user.id) setGameState(GameState.inactivePlayer);
      else if (gameData.currentRound.state === ServerRoundState.guess) setGameState(GameState.showLastResult);
      else if (gameData.currentRound.state === ServerRoundState.doodle) setGameState(GameState.showThisResult);
      else if (gameData.currentRound.state === ServerRoundState.over) setGameState(GameState.over);
      else {
        console.error('Error with game state obtained with gameService.getGame', gameData.currentRound.state);
        setError('');
      }
    } catch (e) {
      console.warn(e);
      setError(e.status);
    }
  };

  // set auth tokens for Services
  if (user) setAllTokens(user.token);
  else return (<Redirect to="/login " />);

  // Button to begin round
  const beginRoundButton = (buttonText) => (
    <Button type="primary" onClick={() => setGameState(game.currentRound.state)} id="begin-round-button">{buttonText}</Button>
  );

  // Button to return home if game/round is inactive
  const backHomeButton = <Button onClick={() => history.push('/home')}>Back to My Games</Button>;

  const handleAcceptRequest = async (gameRequestId) => {
    const acceptedGame = await acceptGameRequest(user.user.id, gameRequestId);
    setGame(acceptedGame);
    setGameState(GameState.guess);
  };

  const handleRejectRequest = async (gameRequestId) => {
    await rejectGameRequest(user.user.id, gameRequestId);
    history.push('/home');
  };

  const getGameBody = () => {
    if (error) {
      return (
        <div className="centered-div">
          <Typography.Title level={4}>{error === 404 ? 'Game not found' : 'Something went wrong'}</Typography.Title>
          <Button type="primary" size="large" onClick={() => history.goBack()}>Go back</Button>
        </div>
      );
    }
    if (!game || !gameState) return (<div>loading...</div>);

    switch (gameState) {
      case GameState.inactiveGame:
        const isHighScore = game.player1.id === user.user.id ? game.isHighScore.p1 : game.isHighScore.p2;
        return (
          <div className="centered-div">
            {isHighScore && <Alert message="New High Score!" type="success" showIcon className="skinny-alert" />}
            <Typography.Title>Game finished!</Typography.Title>
            <GameResults result={game.result} gameId={game.id} />
            {backHomeButton}
          </div>
        );

      case GameState.inactivePlayer:
        return (
          <div className="centered-div">
            <Typography.Title level={2}>
              It's
              {game.activePlayer.username}
              's turn
            </Typography.Title>
            {game.currentRoundNum > 1 && (
            <Typography.Title level={4}>
              Game results so far: Round
              {game.currentRoundNum - 1}
              {' '}
              of
              {game.numRounds}
            </Typography.Title>
            )}
            <GameResults result={game.result} gameId={game.id} />
            {backHomeButton}
          </div>
        );

      case GameState.pending:

        if (game.player1.id === user.user.id) {
          return (
            <div className="centered-div">
              <Typography.Title level={4}>
                Game request to
                {game.activePlayer.username}
                {' '}
                sent
              </Typography.Title>
              {backHomeButton}
            </div>
          );
        }
        return (
          <div className="centered-div">
            <Typography.Title level={4}>
              Accept game request from
              {game.player1.username}
              ?
            </Typography.Title>
            <div>
              <Button type="primary" style={{ marginBottom: '20px', marginRight: '20px' }} onClick={() => handleAcceptRequest(game.gameRequestId)}>Accept request</Button>
              <Button type="danger" style={{ marginBottom: '20px' }} onClick={() => handleRejectRequest(game.gameRequestId)}>Reject request</Button>
            </div>
            {backHomeButton}
          </div>
        );

      case GameState.showLastResult:
        if (!game.result || !game.result.roundScores || game.result.roundScores.length < game.currentRoundNum - 2) {
          console.error('previous round results not available');
          return (<div>previous round results not available</div>);
        }

        // During first round: no scores to show
        if (game.result.roundScores.length === 0 && game.currentRoundNum === 1) {
          return (
            <div className="centered-div">
              <Typography.Title level={2}>
                New Game with
                {game.inactivePlayer.username}
              </Typography.Title>
              <Typography.Title level={3}>Guessing Round</Typography.Title>
              <Typography.Paragraph>
                <ul>
                  <li>
                    You will have
                    {' '}
                    {game.roundLen}
                    {' '}
                    seconds to guess each word that your partner has drawn
                  </li>
                  <li>
                    There are
                    {' '}
                    {game.currentRound.doodles.length}
                    {' '}
                    words to guess
                  </li>
                  <li>
                    Try to guess as many as you can, as fast as possible for a better score
                  </li>
                </ul>
              </Typography.Paragraph>
              {beginRoundButton('Start Guessing')}
            </div>
          );
        }

        // Regular round results
        return (
          <div className="centered-div">
            <RoundResults
              roundResults={game.result.roundScores[game.currentRoundNum - 2]}
              roundNum={game.currentRoundNum - 1}
              artist={game.activePlayer.username}
              guesser={game.inactivePlayer.username}
              gameId={game.id}
            />
            <Typography.Title level={3}>
              Ready for round
              {game.currentRoundNum}
              ?
            </Typography.Title>
            {beginRoundButton('Start Guessing')}
          </div>
        );

      case GameState.showThisResult:
        if (!game.result || !game.result.roundScores || game.result.roundScores.length < Math.max(game.currentRoundNum - 1, 0)) {
          console.error('this round results not available');
          return (<div>this round results not available</div>);
        }

        // Before the first round: no scores to show
        if (game.result.roundScores.length === 0 && game.currentRoundNum === 1) {
          return (
            <div className="centered-div">
              <Typography.Title level={2}>
                New Game with
                {game.inactivePlayer.username}
              </Typography.Title>
              <Typography.Paragraph>
                <ul>
                  <li>
                    You will have
                    {' '}
                    {game.roundLen}
                    {' '}
                    seconds to draw each word
                  </li>
                  <li>
                    There are
                    {' '}
                    {game.nextWords.length}
                    {' '}
                    words per round
                  </li>
                  <li>
                    Don't spell out the word, it's against the rules!
                  </li>
                </ul>
              </Typography.Paragraph>
              <Typography.Title level={3}>Ready?</Typography.Title>
              {beginRoundButton('Let\'s Doodle')}
            </div>
          );
        }

        // Regular round results
        return (
          <div className="centered-div">
            <RoundResults
              roundResults={game.result.roundScores[game.currentRoundNum - 2]}
              roundNum={game.currentRoundNum - 1}
              guesser={game.activePlayer.username}
              artist={game.inactivePlayer.username}
              gameId={game.id}
            />
            <Typography.Title level={3}>
              Ready for round
              {game.currentRoundNum}
              ?
            </Typography.Title>
            {beginRoundButton('Let\'s Doodle')}
          </div>
        );

      case GameState.guess:
        return (
          <GuessingView
            doodlesToGuess={game.currentRound.doodles}
            roundLen={game.roundLen}
            gameId={game.id}
            userId={user.user.id}
            setGame={setGame}
            setGameState={setGameState}
            setLoading={setLoading}
          />
        );

      case GameState.doodle:
        return (
          <DrawingView
            wordsToDraw={game.nextWords}
            roundLen={game.roundLen}
            gameId={game.id}
            userId={user.user.id}
            setGame={setGame}
            setGameState={setGameState}
            setLoading={setLoading}
          />
        );

      case GameState.over:
        return (
          <div className="centered-div">
            <Typography.Title level={3}>Round finished</Typography.Title>
            {backHomeButton}
          </div>
        );
      // This shouldn't render unless gameState is an error
      default:
        return (<div>error</div>);
    }
  };

  return (
    <div className="main-layout vertical-center-div">
      {loading && <Alert className="skinny-alert" message="sending..." type="warning" showIcon icon={<LoadingOutlined />} />}
      <div className="skinny-container">
        {getGameBody()}
      </div>
    </div>
  );
};

export default GameView;
