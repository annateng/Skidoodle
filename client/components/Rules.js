import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Typography } from 'antd';

import { NUM_ROUNDS, ROUND_LEN, WORDS_PER_ROUND } from 'Utilities/common';

const Rules = () => {
  const user = useSelector((state) => state.user);

  const profileLink = user && user.user && user.user.id ? `/profile/${user.user.id}` : '/login';
  return (
    <div className="main-layout vertical-center-div">
      <div className="skinny-skinny-container">
        <Typography.Title level={3}>About</Typography.Title>
        <Typography.Title level={4}>What is Skidoodle?</Typography.Title>
        <Typography.Text>
          Skidoodle is a multi-player doodling game similar to pictionary.
          Players take turns sketching words, then trying to guess each word
          that their partner has sketched. The goal is to complete each round
          as quickly as possible to get on the high score board.
        </Typography.Text>
        <Typography.Title level={4}>Rules</Typography.Title>
        <Typography.Paragraph>
          <ul>
            <b>Gameplay</b>
            <li>
              Each game consists of
              {' '}
              <b>{NUM_ROUNDS}</b>
              {' '}
              rounds
            </li>
            <li>
              During each round, one player will have
              {' '}
              <b>
                {ROUND_LEN}
                {' '}
                seconds
              </b>
              {' '}
              to doodle each of
              {' '}
              <b>{WORDS_PER_ROUND}</b>
              {' '}
              words
            </li>
            <li>
              The doodles will then be sent to his partner, who will have a chance to
              guess what each doodle is
            </li>
            <b>Scoring</b>
            <li>Total score is computed as the sum of the time taken to guess each word</li>
            <li>Players should aim for the lowest score possible</li>
            <li>
              If a player fails to guess a word, a full
              {' '}
              {ROUND_LEN}
              {' '}
              seconds will be added to the score for that word.
            </li>
            <li>
              View your high scores on your
              {' '}
              <Link to={profileLink}>profile</Link>
            </li>
          </ul>
        </Typography.Paragraph>
        <Typography.Title level={4}>Code</Typography.Title>
        <Typography.Text>Github Repo: </Typography.Text>
        <a href="https://github.com/annateng/Skidoodle">https://github.com/annateng/skidoodle</a>
      </div>
    </div>
  );
};

export default Rules;
