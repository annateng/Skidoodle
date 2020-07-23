import React from 'react'
import { Table, Typography } from 'antd'

const RoundResults = ({ roundResults, roundNum, artist, guesser }) => {

  const datasource = roundResults.doodles.map((doodle, index) => ({
    key: index,
    label: doodle.label,
    isCorrect: doodle.isCorrect,
    timeSpent: (doodle.timeSpent / 1000).toFixed(2) + 's'
  }))

  const columns =
  [
    { title: 'Doodle #', dataIndex: 'key', key: 'key' },
    { title: 'Word', dataIndex: 'label', key: 'label'},
    { title: 'Guess', dataIndex: 'isCorrect', key: 'isCorrect',
        render: guess => guess ? 
          <span style={{ color: 'darkgreen' }}>Correct</span>
          : <span style={{ color: 'tomato' }}>Timed Out</span> },
    { title: 'Time', dataIndex: 'timeSpent', key: 'timeSpent' }
  ]

  const footer = () => (
    <div>
      <b>Total correct: </b> <span style={{ color: 'darkgreen' }} >{roundResults.roundTotals.numCorrect}&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <b>Total guess time: </b> <span style={{ color: 'darkgreen' }}> {(roundResults.roundTotals.totalTimeSpent / 1000).toFixed(2) +'s'}</span>
    </div>
  )

  return (
    <div>
      <Typography.Title level={3}>Round {roundNum} Results</Typography.Title>
        <div style={{ width: '100%' }}>
          <Typography.Text style={{ align: 'left' }}><b>artist:</b> {artist}&nbsp;&nbsp;&nbsp;&nbsp;
            <b>guesser:</b> {guesser}</Typography.Text><br />
        </div>
      <Table dataSource={datasource} columns={columns} tableLayout='fixed' 
      pagination={false} footer={footer} style={{ marginBottom: '15px' }} />
    </div>
  )
}

export default RoundResults