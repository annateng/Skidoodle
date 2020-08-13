import React from 'react';
import { useHistory } from 'react-router-dom';
import { Col, Card } from 'antd';

import { ServerGameStatus, monthNames } from 'Utilities/common';

const ActiveGameCard = ({ game, user }) => {
  const history = useHistory();

  const handleChooseGame = async () => {
    history.push(`/game/${game.id}`);
  };

  let cardType;
  if (user.id === game.activePlayer.id) cardType = 'usersTurn';
  else if (game.status === ServerGameStatus.pending) cardType = 'pending';
  else cardType = 'othersTurn';

  const partner = cardType === 'usersTurn' ? game.inactivePlayer.username : game.activePlayer.username;
  const date = game.timeOfLastMove ? new Date(game.timeOfLastMove) : null;
  const state = cardType === 'usersTurn' ? game.currentRound.state.toLowerCase() : null;

  const cardStyle = {
    border: cardType === 'usersTurn' ? '2px solid limegreen' : null,
    backgroundColor: cardType === 'pending' ? '#ffe8e8' : cardType === 'usersTurn' ? null : null,
    height: '100%',
  };

  const textStyle = {
    color: state && state === 'guess' ? 'tomato' : 'dodgerblue',
  };

  let cardHeader;
  if (cardType === 'pending') {
    cardHeader = <b>Game request pending</b>;
  } else if (cardType === 'usersTurn') {
    cardHeader = (
      <b>
        Your turn to
        <b style={textStyle}>{game.currentRound.state.toLowerCase()}</b>
      </b>
    );
  } else {
    cardHeader = (
      <b>
        It's
        {partner}
        's turn
      </b>
    );
  }

  let cardBody;
  if (cardType === 'pending') {
    cardBody = (
      <div>
        Waiting for
        <b>{partner}</b>
        {' '}
        to accept
      </div>
    );
  } else {
    cardBody = (
      <div>
        Game with
        <b>{partner}</b>
      </div>
    );
  }

  return (
    <Col xs={12} sm={12} lg={8}>
      <Card className="home-card" bordered="true" hoverable="true" bodyStyle={{ padding: '10px' }} style={cardStyle}>
        <div onClick={handleChooseGame}>
          <div style={{ fontSize: '1.1em' }}>{cardHeader}</div>
          <div>{cardBody}</div>
          <div>
            Round
            {game.currentRoundNum}
          </div>
          {date && (
          <div>
            Last move on
            {monthNames[date.getMonth()].substring(0, 3)}
            {' '}
            {date.getDate()}
            {' '}
          </div>
          )}
          {!date && <div>&nbsp;</div>}
        </div>
      </Card>
    </Col>

  );
};

export default ActiveGameCard;
