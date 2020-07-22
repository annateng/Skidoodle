import React from 'react'
import { Table } from 'antd'

const RoundResults = ({roundResults, gameTotals}) => {
  
  console.log(roundResults) // DEBUG

  const datasource = roundResults.doodles.map((doodle, index) => ({
    key: index,
    label: doodle.label,
    isCorrect: doodle.isCorrect,
    timeSpent: (doodle.timeSpent / 1000).toFixed(2) + 's'
  }))

  console.log(datasource)

  const columns=
  [
    { title: 'Doodle #', dataIndex: 'key', key: 'key' },
    { title: 'Word', dataIndex: 'label', key: 'label'},
    { title: 'Guess', dataIndex: 'isCorrect', key: 'isCorrect',
        render: guess => guess ? 
          <span style={{ color: 'limegreen' }}>Correct</span>
          : <span style={{ color: 'crimson' }}>Timed Out</span> },
    { title: 'Time', dataIndex: 'timeSpent', key: 'timeSpent' }
  ]

  return (
    <Table dataSource={datasource} columns={columns} tableLayout='fixed' pagination={false} />
  )
}

export default RoundResults