import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Typography, Progress, Alert, Button,
} from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Rodal from 'rodal';
import { PaperScope } from 'paper/dist/paper-core';

import { startRodal, getRound, replayRound } from 'Utilities/services/gameService';
import { ROUND_LEN } from 'Utilities/common';

// <Route path='/game/:gameId/replay/:roundNum' component={ReplayView} />
const ReplayView = () => {
  const [timeLeft, setTimeLeft] = useState();
  const [canvas, setCanvas] = useState();
  const [, setGuessInput] = useState();
  const [guess, setGuess] = useState('');
  const [label, setLabel] = useState('');
  const [rodalVisible, setRodalVisible] = useState(false);
  const [rodalHeader, setRodalHeader] = useState();
  const [doodleNum, setDoodleNum] = useState();
  const [lastResult, setLastResult] = useState();
  const [replay, setReplay] = useState();
  const [loading, setLoading] = useState(true);
  const [paper] = useState(new PaperScope());
  const [endRodalVisible, setEndRodalVisible] = useState(false);
  const intervalRef = useRef();
  const replayRef = useRef();
  const modalIntervalRef = useRef();
  const modalRef = useRef();
  const params = useParams();
  const history = useHistory();

  // Label shows number of characters
  const handleSetLabel = (labelTxt) => {
    const disp = labelTxt.replace(/[a-z]/gi, '_');

    setLabel(disp);
  };

  const handleStartRodal = async () => {
    await startRodal(setRodalVisible, setRodalHeader, modalIntervalRef, modalRef);
  };

  const handleStartRoundReplay = async () => {
    try {
      setEndRodalVisible(false);

      if (!replay) {
        const replayFromDB = await getRound(params.gameId, params.roundNum);
        // console.log(replay)
        setReplay(replayFromDB);
        setLoading(false);

        // if (!paper.project) console.log(paper)
        await replayRound(replayFromDB.doodles, replayFromDB.guesses,
          paper, replayFromDB.roundLen, setGuess, setDoodleNum, setTimeLeft,
          handleSetLabel, handleStartRodal, intervalRef, replayRef, setLastResult);
      } else {
        // if (!paper.project) console.log(paper)
        await replayRound(replay.doodles, replay.guesses, paper, replay.roundLen,
          setGuess, setDoodleNum, setTimeLeft, handleSetLabel, handleStartRodal,
          intervalRef, replayRef, setLastResult);
      }

      setEndRodalVisible(true);
      setLastResult(null);
    } catch (e) {
      console.error('Error in handleStartRoundReplay', e);
    }
  };

  useEffect(() => {
    if (canvas) {
      // keep fixed canvas aspect ratio 2:1 for scaling
      const canvasDiv = document.getElementById('canvas-div');
      canvasDiv.style.height = `${canvasDiv.clientWidth / 2}px`;
      window.onresize = () => { canvasDiv.style.height = `${canvasDiv.clientWidth / 2}px`; };

      paper.setup(canvas);
      handleStartRoundReplay();
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

  // Cap guess input len at number of characters
  const handleSetGuess = (guessVal) => {
    if (!label) setGuess(guessVal);
    else setGuess(guessVal.substring(0, label.length));
  };

  return (
    <div className="main-layout vertical-center-div">
      {loading && <Alert className="skinny-alert" message="loading..." type="warning" showIcon icon={<LoadingOutlined />} />}
      <div className="skinny-container" style={{ position: 'relative' }}>
        <div className="replay-background">REPLAY</div>
        <div className="vertical-center-div">
          <b style={{ fontSize: '20px' }}>Time Left:</b>
          <Typography.Title id="countdown-timer">{timeLeft ? `${timeLeft}s` : ''}</Typography.Title>
          <Progress className="guess-progress" percent={(timeLeft / ROUND_LEN) * 100} showInfo={false} strokeColor="dodgerblue" />
          <b>Guess:</b>
          <div id="guess-input-wrapper">
            <input
              className="borderless-input"
              id="guess-input"
              type="text"
              value={guess}
              onChange={(event) => handleSetGuess(event.target.value)}
              autoComplete="off"
              spellCheck="false"
              disabled
            />
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
              {replay && (
              <div>
                Doodle
                {doodleNum}
                {' '}
                of
                {replay.doodles.length}
              </div>
              )}
            </div>
          </Rodal>
          <Rodal
            visible={endRodalVisible}
            onClose={() => setEndRodalVisible(false)}
            width={600}
            height={250}
            closeMaskonClick={false}
            customStyles={{ borderRadius: '10px', border: '2px solid tomato' }}
          >
            <div className="rodal-body">
              <div>Replay Finished</div>
              <Button onClick={handleStartRoundReplay} style={{ marginRight: '15px' }}>Watch Again</Button>
              <Button onClick={() => {
                history.push(`/game/${params.gameId}`);
                history.go();
              }}
              >
                Back to Game
              </Button>
            </div>
          </Rodal>
        </div>
      </div>
    </div>
  );
};

export default ReplayView;
