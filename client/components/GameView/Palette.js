import React from 'react';
import {
  Col, Row, Typography, Card,
} from 'antd';

const Palette = () => {
  const colors = ['black', 'saddlebrown', 'crimson', 'deeppink', 'pink', 'coral', 'orange', 'gold', 'limegreen', 'darkgreen',
    'lightseagreen', 'paleturquoise', 'cadetblue', 'cornflowerblue', 'mediumblue', 'mediumpurple', 'indigo', 'dimgray'];

  const sizes = [2, 4, 8, 14, 22, 30];

  return (
    <Col span={5}>
      <Typography.Text>Color</Typography.Text>
      <Row gutter={[6, 6]}>
        { colors.map((color) => (
          <Col span={6} key={color}>
            <div
              onClick={() => { localStorage.setItem('scribbleColor', color); }}
              onKeyDown={(e) => {
                if (e.keyCode === 13) localStorage.setItem('scribbleColor', color);
              }}
              role="button"
              tabIndex={0}
            >
              <Card hoverable="true" style={{ backgroundColor: color }} />
            </div>
          </Col>
        ))}
        <Col span={12} key="eraser">
          <div
            onClick={() => { localStorage.setItem('scribbleColor', 'white'); }}
            onKeyDown={(e) => {
              if (e.keyCode === 13) localStorage.setItem('scribbleColor', 'white');
            }}
            role="button"
            tabIndex={0}
          >
            <Card hoverable="true" style={{ backgroundColor: 'white', maxHeight: '50px', padding: '0px' }} bodyStyle={{ padding: '10px' }}>Eraser</Card>
          </div>
        </Col>
      </Row>
      <Typography.Text>Size</Typography.Text>
      <Row gutter={[4, 8]}>
        { sizes.map((size) => (
          <Col span={4} key={`size-${size}`}>
            <div
              style={{
                height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center',
              }}
              onClick={() => { localStorage.setItem('scribbleSize', size); }}
              onKeyDown={(e) => {
                if (e.keyCode === 13) localStorage.setItem('scribbleSize', size);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="dot" style={{ height: `${size}px`, width: `${size}px` }} />
            </div>
          </Col>
        )) }
      </Row>
    </Col>
  );
};

export default Palette;
