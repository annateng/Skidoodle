import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { Col, Card } from 'antd';

import { ServerGameStatus, monthNames } from 'Utilities/common';

const ActiveGameCard = ({ game, user }) => {
  const history = useHistory();

  const handleChooseGame = async () => {
    history.push(`/game/${game.id}`);
  };

  let cardType;
  let backgroundColor;
  if (user.id === game.activePlayer.id) {
    cardType = 'usersTurn';
    backgroundColor = null;
  } else if (game.status === ServerGameStatus.pending) {
    cardType = 'pending';
    backgroundColor = '#ffe8e8';
  } else {
    cardType = 'othersTurn';
    backgroundColor = null;
  }

  const partner = cardType === 'usersTurn' ? game.inactivePlayer.username : game.activePlayer.username;
  const date = game.timeOfLastMove ? new Date(game.timeOfLastMove) : null;
  const state = cardType === 'usersTurn' ? game.currentRound.state.toLowerCase() : null;

  const cardStyle = {
    border: cardType === 'usersTurn' ? '2px solid limegreen' : null,
    backgroundColor,
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
        {' '}
        <b style={textStyle}>{game.currentRound.state.toLowerCase()}</b>
      </b>
    );
  } else {
    cardHeader = (
      <b>
        It&#39;s
        {' '}
        {partner}
        &#39;s turn
      </b>
    );
  }

  let cardBody;
  if (cardType === 'pending') {
    cardBody = (
      <div>
        Waiting for
        {' '}
        <b>{partner}</b>
        {' '}
        to accept
      </div>
    );
  } else {
    cardBody = (
      <div>
        Game with
        {' '}
        <b>{partner}</b>
      </div>
    );
  }

  return (
    <Col xs={12} sm={12} lg={8}>
      <Card className="home-card" bordered="true" hoverable="true" bodyStyle={{ padding: '10px' }} style={cardStyle}>
        <div
          onClick={handleChooseGame}
          onKeyDown={(e) => {
            if (e.keyCode === 13) handleChooseGame();
          }}
          role="button"
          tabIndex={0}
        >
          <div style={{ fontSize: '1.1em' }}>{cardHeader}</div>
          <div>{cardBody}</div>
          <div>
            Round
            {' '}
            {game.currentRoundNum}
          </div>
          {date && (
          <div>
            Last move on
            {' '}
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

ActiveGameCard.propTypes = {
  game: PropTypes.shape({
    activePlayer: PropTypes.shape({
      username: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
    }).isRequired,
    inactivePlayer: PropTypes.shape({
      username: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
    }).isRequired,
    player1: PropTypes.shape({
      username: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
    }).isRequired,
    currentRound: PropTypes.shape({
      state: PropTypes.string.isRequired,
    }),
    currentRoundNum: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    timeOfLastMove: PropTypes.string,
  }).isRequired,
  user: PropTypes.shape({
    displayName: PropTypes.string,
    id: PropTypes.string.isRequired,
    settings: PropTypes.shape({
      alertFrequency: PropTypes.string,
    }),
    username: PropTypes.string.isRequired,
  }).isRequired,
};

export default ActiveGameCard;
