import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Typography, Progress, Button, Card,
} from 'antd';
import Rodal from 'rodal';
import { PaperScope } from 'paper/dist/paper-core';

import { startGuessingRound, getRandomDoodle, startRodal } from 'Utilities/services/gameService';
import { ROUND_LEN } from 'Utilities/common';

const PracticeMode = () => {
  const [timeLeft, setTimeLeft] = useState(ROUND_LEN);
  const [canvas, setCanvas] = useState();
  const [guessInput, setGuessInput] = useState();
  const [guess, setGuess] = useState('');
  const [label, setLabel] = useState('');
  const [lastWord, setLastWord] = useState();
  const [lastResult, setLastResult] = useState();
  const [rodalVisible, setRodalVisible] = useState(false);
  const [rodalHeader, setRodalHeader] = useState();
  const [running, setRunning] = useState(false);
  const [paper] = useState(new PaperScope());
  const intervalRef = useRef();
  const replayRef = useRef();
  const modalIntervalRef = useRef();
  const modalRef = useRef();
  const history = useHistory();

  useEffect(() => {
    if (canvas) {
      // keep fixed canvas aspect ratio 2:1 for scaling
      const canvasDiv = document.getElementById('canvas-div');
      canvasDiv.style.height = `${canvasDiv.clientWidth / 2}px`;
      window.onresize = () => canvasDiv.style.height = `${canvasDiv.clientWidth / 2}px`;

      paper.setup(canvas);
    } else {
      const thisCanvas = document.getElementById('paper-canvas');
      setCanvas(thisCanvas);
      setGuessInput(document.getElementById('guess-input'));
    }

    // clean up intervals and unresolved promises
    return () => {
      clearInterval(intervalRef.current);
      if (replayRef.current) replayRef.current();
      clearInterval(modalIntervalRef.current);
      if (modalRef.current) modalRef.current();
    };
  }, [canvas]);

  // Label shows number of characters
  const handleSetLabel = (label) => {
    const disp = label.replace(/[a-z]/gi, '_');

    setLabel(disp);
  };

  const handleStartRodal = async () => {
    await startRodal(setRodalVisible, setRodalHeader, modalIntervalRef, modalRef);
  };

  const handleStartPractice = async () => {
    try {
      if (running) return;
      setLastResult(null);
      setLastWord(null);
      setRunning(true);

      const doodle = await getRandomDoodle();
      setLastWord(doodle.label);
      await startGuessingRound(canvas, guessInput, [doodle], ROUND_LEN, setTimeLeft, handleSetGuess,
        handleSetLabel, intervalRef, replayRef, null, handleStartRodal, setLastResult, true, paper);
      setRodalVisible(true);
      setRodalHeader(null);
      setRunning(false);
    } catch (e) {
      console.error('Error in handleStartPractice', e);
    }
  };

  // Cap guess input len at number of characters
  const handleSetGuess = (guessVal) => {
    if (!label) setGuess(guessVal);
    else setGuess(guessVal.substring(0, label.length));
  };

  return (
    <div className="main-layout vertical-center-div">
      <div className="skinny-container">
        <div className="vertical-center-div">
          <Card style={{ margin: '10px' }}>
            <Typography.Title level={4}>Practice Mode</Typography.Title>
            <Typography.Text>Practice guessing with random doodles made by our users</Typography.Text>
          </Card>
          <div style={{ display: 'flex', flexDirection: 'vertical' }}>
            <div className="centered-div" style={{ marginRight: '20px' }}>
              <b style={{ fontSize: '20px' }}>Time Left:</b>
              <Typography.Title id="countdown-timer">
                {timeLeft}
                s
              </Typography.Title>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button style={{ height: '80px' }} size="large" type="primary" onClick={handleStartPractice} size="large">Start</Button>
            </div>
          </div>
          <Progress className="guess-progress" percent={timeLeft / ROUND_LEN * 100} showInfo={false} strokeColor="dodgerblue" />
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
            height={300}
            animation="rotate"
            closeMaskOnClick={false}
            customStyles={{ borderRadius: '10px', border: '2px solid tomato' }}
          >
            <div className="rodal-header">{rodalHeader}</div>
            <div className="rodal-body">
              {lastResult
            && (
            <div>
              <div style={{ fontSize: '1.5em', color: 'gold' }}>{lastResult}</div>
              <div style={{ fontSize: '22px' }}>
                The word was:
                {lastWord}
              </div>
              <Button size="large" onClick={handleStartPractice} style={{ marginRight: '15px' }}>Play Again</Button>
              <Button size="large" onClick={() => history.push('/home')}>Go Home</Button>
            </div>
            )}
              {!lastResult && <div>Practice mode</div>}
            </div>
          </Rodal>
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;
