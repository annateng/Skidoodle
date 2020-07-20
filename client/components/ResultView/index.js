import React from 'react'
import { useSelector } from 'react-redux'

import GameResults from 'Components/ResultView/GameResults'
import RoundResults from 'Components/ResultView/RoundResults'

const ResultView = ({ gameId }) => {
  const activeGame = useSelector(state => state.game.activeGame)

  if (!activeGame) 

  return (
    <div>
      {activeGame && activeGame.lastRoundResults && <RoundResults roundResults={activeGame.lastRoundResults} />}
      {activeGame && activeGame.lastRoundResults && <RoundResults roundResults={activeGame.lastRoundResults} />}
    </div>
  )
}

export default ResultView