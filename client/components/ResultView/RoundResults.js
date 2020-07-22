import React from 'react'
import { Table } from 'antd'

const RoundResults = ({ roundResults }) => {
  
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
          <span style={{ color: 'limegreen' }}>Correct</span>
          : <span style={{ color: 'crimson' }}>Timed Out</span> },
    { title: 'Time', dataIndex: 'timeSpent', key: 'timeSpent' }
  ]

  const footer = () => (
    <div>
      <b>Total correct: </b> <span style={{ color: 'limegreen' }} >{roundResults.roundTotals.numCorrect}&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <b>Total guess time: </b> <span style={{ color: 'limegreen' }}> {(roundResults.roundTotals.totalTimeSpent / 1000).toFixed(2) +'s'}</span>
    </div>
  )

  return (
    <Table dataSource={datasource} columns={columns} tableLayout='fixed' 
      pagination={false} footer={footer} style={{ marginBottom: '15px' }} />
  )
}

export default RoundResults