import React, { useState, useEffect, useRef } from 'react';
import {
  Typography, Progress, Row, Col,
} from 'antd';
import Rodal from 'rodal';

import { startRound, sendDoodles, startRodal } from 'Utilities/services/gameService';
import { GameState, ServerGameStatus, STROKE_WIDTH } from 'Utilities/common';
import Palette from 'Components/GameView/Palette';

const DrawingView = ({
  wordsToDraw, roundLen, gameId, userId, setGame, setGameState, setLoading,
}) => {
  // console.log('render') //DEBUG
  const [timeLeft, setTimeLeft] = useState(roundLen);
  const [canvas, setCanvas] = useState();
  const [word, setWord] = useState();
  const [rodalVisible, setRodalVisible] = useState(false);
  const [rodalHeader, setRodalHeader] = useState();
  const intervalRef = useRef();
  const roundRef = useRef();
  const modalIntervalRef = useRef();
  const modalRef = useRef();

  useEffect(() => {
    if (canvas) {
      // keep fixed canvas aspect ratio 2:1 for scaling
      const canvasDiv = document.getElementById('canvas-div');
      canvasDiv.style.height = `${canvasDiv.clientWidth / 2}px`;
      window.onresize = () => canvasDiv.style.height = `${canvasDiv.clientWidth / 2}px`;

      handleStartRound();
    } else {
      const thisCanvas = document.getElementById('paper-canvas');

      setCanvas(thisCanvas);
      localStorage.setItem('scribbleColor', 'black');
      localStorage.setItem('scribbleSize', STROKE_WIDTH);
    }

    // clean up intervals and unresolved promises
    return () => {
      clearInterval(intervalRef.current);
      if (roundRef.current) roundRef.current();
      clearInterval(modalIntervalRef.current);
      if (modalRef.current) modalRef.current();
    };
  }, [canvas]);

  const handleStartRodal = async () => {
    await startRodal(setRodalVisible, setRodalHeader, modalIntervalRef, modalRef);
  };

  const handleStartRound = async () => {
    try {
      const doodles = await startRound(canvas, setTimeLeft, wordsToDraw, roundLen, setWord, intervalRef,
        roundRef, handleStartRodal);
      setLoading(true);
      const newGame = await sendDoodles(doodles, userId, gameId);
      setLoading(false);

      if (newGame.status === ServerGameStatus.pending) {
        setGameState(GameState.pending);
      } else {
        setGameState(GameState.over);
      }

      setGame(newGame);
    } catch (e) {
      console.error('Error in handleStartRound', e);
    }
  };

  return (
    <div className="vertical-center-div">
      <b style={{ fontSize: '20px' }}>Time Left:</b>
      <Typography.Title id="countdown-timer">
        {timeLeft}
        s
      </Typography.Title>
      <Progress className="draw-progress" percent={timeLeft / roundLen * 100} showInfo={false} strokeColor="dodgerblue" />
      <Typography.Title id="word-to-draw">{word || ' '}</Typography.Title>

      <Row gutter={26}>
        <Palette />
        <Col span={19}>
          <div id="canvas-div">
            <canvas id="paper-canvas" resize="false" />
          </div>
        </Col>
      </Row>
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
        <div className="rodal-body" style={{ fontSize: '26px' }}>
          Draw:
          {word}
        </div>
      </Rodal>
    </div>
  );
};

export default DrawingView;
