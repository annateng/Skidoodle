import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Row, Col,
} from 'antd';
import { PaperScope } from 'paper/dist/paper-core';

import { getDrawing } from 'Utilities/services/gameService';
import Palette from 'Components/GameView/Palette';
import { STROKE_WIDTH } from 'Utilities/common';

const FreeDraw = () => {
  // console.log('render') //DEBUG
  const [canvas, setCanvas] = useState();
  const [paper] = useState(new PaperScope());

  useEffect(() => {
    const handleStartRound = async () => {
      try {
        paper.setup(canvas);
        const drawing = getDrawing(-1, paper, false);
        drawing.isActive = true;
      } catch (e) {
        console.error('Error in handleStartRound', e);
      }
    };

    if (canvas) {
      // keep fixed canvas aspect ratio 2:1 for scaling
      const canvasDiv = document.getElementById('canvas-div');
      canvasDiv.style.height = `${canvasDiv.clientWidth / 2}px`;
      window.onresize = () => {
        canvasDiv.style.height = `${canvasDiv.clientWidth / 2}px`;
      };

      handleStartRound();
    } else {
      const thisCanvas = document.getElementById('paper-canvas');

      setCanvas(thisCanvas);
      localStorage.setItem('scribbleColor', 'black');
      localStorage.setItem('scribbleSize', STROKE_WIDTH);
    }
  }, [canvas, paper]);

  const clear = () => {
    paper.project.activeLayer.removeChildren();
    paper.view.draw();
  };

  return (
    <div className="main-layout vertical-center-div">
      <div className="skinny-container">
        <div className="vertical-center-div">
          <Typography.Title level={2}>Free Draw Mode</Typography.Title>
          <Row gutter={26}>
            <Palette />
            <Col span={19}>
              <div id="canvas-div">
                <canvas id="paper-canvas" resize="false" />
              </div>
              <Button style={{ marginTop: '15px' }} type="danger" onClick={clear} size="large">Start Over</Button>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default FreeDraw;
