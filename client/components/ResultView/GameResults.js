import React from 'react'
import { Table } from 'antd'

const GameResults = ({ result }) => {
  // if there's no results to display, return nothing
  if (!result || result.roundScores.length < 1) return null
  
  const datasource = result.roundScores.map((roundScore, index) => ({
    key: index,
    numCorrect: roundScore.roundTotals.numCorrect,
    totalTimeSpent: roundScore.roundTotals.totalTimeSpent
  }))

  const columns = [
    { title: 'Round #', dataIndex: 'key', key: 'key', render: i => i + 1 },
    { title: 'Words Guessed Correctly', dataIndex: 'numCorrect', key: 'numCorrect' },
    { title: 'Total Time', dataIndex: 'totalTimeSpent', key: 'totalTimeSpent', 
        render: time => (time/1000).toFixed(2)+'s' }
  ]

  const footer = () => (
    <div>
      <b style={{ color: 'dodgerblue' }}>Total correct: </b> <span style={{ color: 'limegreen' }} >{ result.gameTotals.numCorrect }&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <b style={{ color: 'dodgerblue' }}>Total guess time: </b> <span style={{ color: 'limegreen' }}> { (result.gameTotals.totalTimeSpent / 1000).toFixed(2) +'s' }</span>
    </div>
  )

  const expandedRowRender = round => {
    const roundNum = round.key

    const roundDatasource = result.roundScores[roundNum].doodles.map((doodle, index) => ({
      key: index,
      label: doodle.label,
      isCorrect: doodle.isCorrect,
      timeSpent: (doodle.timeSpent / 1000).toFixed(2) + 's'
    }))

    const roundColumns =   
    [
      { title: 'Doodle #', dataIndex: 'key', key: 'key', render: i => i + 1 },
      { title: 'Word', dataIndex: 'label', key: 'label'},
      { title: 'Guess', dataIndex: 'isCorrect', key: 'isCorrect',
          render: guess => guess ? 
            <span style={{ color: 'limegreen' }}>Correct</span>
            : <span style={{ color: 'crimson' }}>Timed Out</span> },
      { title: 'Time', dataIndex: 'timeSpent', key: 'timeSpent' }
    ]
  
    return <Table columns={roundColumns} dataSource={roundDatasource} pagination={false} />;
  }

  const expandable = { expandedRowRender }

  return (
    <Table dataSource={datasource} columns={columns} tableLayout='fixed' 
      pagination={false} footer={footer} expandable={expandable} style={{ marginBottom: '15px' }} />
  )
}

export default GameResults