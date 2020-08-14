import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Typography, Progress } from 'antd';
import Rodal from 'rodal';

import { startGuessingRound, sendGuesses, startRodal } from 'Utilities/services/gameService';
import { GameState, ServerGameStatus } from 'Utilities/common';

const GuessingView = ({
  doodlesToGuess, roundLen, gameId, userId, setGame, setGameState, setLoading,
}) => {
  // console.log(doodlesToGuess) // DEBUG
  const [timeLeft, setTimeLeft] = useState(roundLen);
  const [canvas, setCanvas] = useState();
  const [guessInput, setGuessInput] = useState();
  const [guess, setGuess] = useState('');
  const [label, setLabel] = useState('');
  const [rodalVisible, setRodalVisible] = useState(false);
  const [rodalHeader, setRodalHeader] = useState();
  const [doodleNum, setDoodleNum] = useState();
  const [lastResult, setLastResult] = useState();
  const intervalRef = useRef();
  const replayRef = useRef();
  const modalIntervalRef = useRef();
  const modalRef = useRef();

  // Label shows number of characters
  const handleSetLabel = (labelText) => {
    const disp = labelText.replace(/[a-z]/gi, '_');

    setLabel(disp);
  };

  const handleStartRodal = async () => {
    await startRodal(setRodalVisible, setRodalHeader, modalIntervalRef, modalRef);
  };

  // Cap guess input len at number of characters
  const handleSetGuess = (guessVal) => {
    if (!label) setGuess(guessVal);
    else setGuess(guessVal.substring(0, label.length));
  };

  const handleStartGuessing = async () => {
    try {
      const guesses = await startGuessingRound(canvas, guessInput, doodlesToGuess, roundLen,
        setTimeLeft, handleSetGuess, handleSetLabel, intervalRef, replayRef, setDoodleNum,
        handleStartRodal, setLastResult);
      setLoading(true);
      const newGame = await sendGuesses(guesses, userId, gameId);
      setLoading(false);
      setGame(newGame);

      if (newGame.status === ServerGameStatus.active) setGameState(GameState.showThisResult);
      else setGameState(GameState.inactiveGame);
    } catch (e) {
      console.error('Error in handleStartGuessing', e);
    }
  };

  useEffect(() => {
    if (canvas) {
      // keep fixed canvas aspect ratio 2:1 for scaling
      const canvasDiv = document.getElementById('canvas-div');
      canvasDiv.style.height = `${canvasDiv.clientWidth / 2}px`;
      window.onresize = () => { canvasDiv.style.height = `${canvasDiv.clientWidth / 2}px`; };

      handleStartGuessing();
    } else {
      const thisCanvas = document.getElementById('paper-canvas');
      setCanvas(thisCanvas);
      setGuessInput(document.getElementById('guess-input'));
    }

    /* eslint-disable react-hooks/exhaustive-deps */
    // clean up intervals and unresolved promises
    return () => {
      clearInterval(intervalRef.current);
      if (replayRef.current) replayRef.current();
      clearInterval(modalIntervalRef.current);
      if (modalRef.current) modalRef.current();
    };
    /* eslint-enable react-hooks/exhaustive-deps */
  }, [canvas]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="vertical-center-div">
      <b style={{ fontSize: '20px' }}>Time Left:</b>
      <Typography.Title id="countdown-timer">
        {timeLeft}
        s
      </Typography.Title>
      <Progress className="guess-progress" percent={(timeLeft / roundLen) * 100} showInfo={false} strokeColor="dodgerblue" />
      <b>Guess:</b>
      <div id="guess-input-wrapper">
        <input className="borderless-input" id="guess-input" type="text" value={guess} onChange={(event) => handleSetGuess(event.target.value)} autoComplete="off" spellCheck="false" />
        <div id="underline-div">{label}</div>
      </div>
      <div id="canvas-div" className="centered-div">
        <canvas id="paper-canvas" resize="false" />
      </div>
      <Rodal
        visible={rodalVisible}
        onClose={() => setRodalVisible(false)}
        showCloseButton={false}
        width={600}
        height={450}
        animation="rotate"
        closeMaskOnClick={false}
        customStyles={{ borderRadius: '10px', border: '2px solid tomato' }}
      >
        <div className="rodal-header">{rodalHeader}</div>
        <div className="rodal-body">
          {lastResult && <div style={{ fontSize: '1.5em', color: 'gold' }}>{lastResult}</div>}
          <div>
            Doodle
            {' '}
            {doodleNum}
            {' '}
            of
            {' '}
            {doodlesToGuess.length}
          </div>
        </div>
      </Rodal>
    </div>
  );
};

// // const GuessingView = ({
//   doodlesToGuess, roundLen, gameId, userId, setGame, setGameState, setLoading,
GuessingView.propTypes = {
  doodlesToGuess: PropTypes.arrayOf(PropTypes.shape({
    artist: PropTypes.string.isRequired,
    drawing: PropTypes.shape({
      timeElapsed: PropTypes.arrayOf(PropTypes.number).isRequired,
      x: PropTypes.arrayOf(PropTypes.number).isRequired,
      y: PropTypes.arrayOf(PropTypes.number).isRequired,
      r: PropTypes.arrayOf(PropTypes.number).isRequired,
      g: PropTypes.arrayOf(PropTypes.number).isRequired,
      b: PropTypes.arrayOf(PropTypes.number).isRequired,
      isDrawing: PropTypes.arrayOf(PropTypes.bool).isRequired,
      width: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    recipient: PropTypes.string.isRequired,
    timeStamp: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
  })).isRequired,
  roundLen: PropTypes.number.isRequired,
  gameId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  setGame: PropTypes.func.isRequired,
  setGameState: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
};

export default GuessingView;
