import React from 'react';
import { Table, Typography, Button } from 'antd';
import { PlaySquareFilled } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

const RoundResults = ({
  roundResults, roundNum, artist, guesser, gameId,
}) => {
  const history = useHistory();

  const datasource = roundResults.doodles.map((doodle, index) => ({
    key: index,
    label: doodle.label,
    isCorrect: doodle.isCorrect,
    timeSpent: `${(doodle.timeSpent / 1000).toFixed(2)}s`,
  }));

  const columns = [
    {
      title: 'Doodle #', dataIndex: 'key', key: 'key', render: (i) => i + 1,
    },
    { title: 'Word', dataIndex: 'label', key: 'label' },
    {
      title: 'Guess',
      dataIndex: 'isCorrect',
      key: 'isCorrect',
      render: (guess) => (guess
        ? <span style={{ color: 'darkgreen' }}>Correct</span>
        : <span style={{ color: 'tomato' }}>Timed Out</span>),
    },
    { title: 'Time', dataIndex: 'timeSpent', key: 'timeSpent' },
  ];

  const footer = () => (
    <div>
      <b>Total correct: </b>
      {' '}
      <span style={{ color: 'darkgreen' }}>
        {roundResults.roundTotals.numCorrect}
&nbsp;&nbsp;&nbsp;&nbsp;
      </span>
      <b>Total guess time: </b>
      {' '}
      <span style={{ color: 'darkgreen' }}>
        {' '}
        {`${(roundResults.roundTotals.totalTimeSpent / 1000).toFixed(2)}s`}
      </span>
    </div>
  );

  return (
    <div>
      <Typography.Title level={3}>
        Round
        {' '}
        {roundNum}
        {' '}
        Results
        <Button type="danger" style={{ marginLeft: '15px' }} icon={<PlaySquareFilled />} onClick={() => history.push(`/game/${gameId}/replay/${roundNum}`)}>Watch Replay</Button>
      </Typography.Title>
      <div style={{ width: '100%' }}>
        <Typography.Text style={{ align: 'left' }}>
          <b>artist:</b>
          {' '}
          {artist}
&nbsp;&nbsp;&nbsp;&nbsp;
          <b>guesser:</b>
          {' '}
          {guesser}
        </Typography.Text>
        <br />
      </div>
      <Table
        dataSource={datasource}
        columns={columns}
        tableLayout="fixed"
        pagination={false}
        footer={footer}
        style={{ marginBottom: '15px' }}
      />
    </div>
  );
};

export default RoundResults;
