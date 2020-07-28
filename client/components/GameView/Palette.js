import React from 'react'
import {Col, Row, Typography, Card } from 'antd'

const Palette = () => {

  const handleSetColor = color => {
    localStorage.setItem('scribbleColor', color)
  }

  const handleSetSize = size => {
    localStorage.setItem('scribbleSize', size)
  }

  const colors = ['black', 'chocolate', 'crimson', 'deeppink', 'pink', 'coral', 'orange', 'gold', 'limegreen', 'darkgreen', 
  'lightseagreen', 'paleturquoise', 'cadetblue', 'cornflowerblue', 'mediumblue', 'mediumpurple', 'indigo', 'dimgray']

  const sizes = [2, 4, 8, 14, 22, 30]
  
  return (
    <Col span={5}>
      <Typography.Text>Color</Typography.Text>
      <Row gutter={[6, 6]}>
        { colors.map(color => 
          <Col span={6} key={color}>
            <div onClick={() => handleSetColor(color)}>
              <Card hoverable='true' style={{ backgroundColor: color }} ></Card>
            </div>
          </Col>) 
        }
        <Col span={12} key={'eraser'}>
          <div id='ubitch' onClick={() => handleSetColor('white')}>
            <Card hoverable='true' style={{ backgroundColor: 'white', maxHeight: '50px', padding: '0px' }} bodyStyle={{ padding: '10px' }}>Eraser</Card>
          </div>
        </Col>
      </Row>
      <Typography.Text>Size</Typography.Text>
      <Row gutter={[4, 8]}>
        { sizes.map(size => 
          <Col span={4} key={'size-' + size}>
            <div style={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => handleSetSize(size)}>
              <div className='dot' style={{ height: size+'px', width: size+'px' }} ></div>
            </div>
          </Col>) }
      </Row>
    </Col>
  )
}

export default Palette