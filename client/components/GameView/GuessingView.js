import React, { useState, useEffect, useRef } from 'react'
import { Typography, Progress, Row } from 'antd'
import Rodal from 'rodal'

import { startGuessingRound, sendGuesses, startRodal } from 'Utilities/services/gameService'
import { GameState, ServerGameStatus } from 'Utilities/common'

const GuessingView = ({ doodlesToGuess, roundLen, gameId, userId, setGame, setGameState }) => {
  const [timeLeft, setTimeLeft] = useState(roundLen)
  const [canvas, setCanvas] = useState()
  const [guessInput, setGuessInput] = useState()
  const [guess, setGuess] = useState('')
  const [label, setLabel] = useState('')
  const [rodalVisible, setRodalVisible] = useState(false)
  const [rodalHeader, setRodalHeader] = useState()
  const [doodleNum, setDoodleNum] = useState()
  const [lastResult, setLastResult] = useState()
  const intervalRef = useRef()
  const replayRef = useRef()
  const modalIntervalRef = useRef()
  const modalRef = useRef()
  
  useEffect(() => {
    if (canvas) {
      handleStartGuessing()
    } else {
      const thisCanvas = document.getElementById('paper-canvas')
      setCanvas(thisCanvas)
      setGuessInput(document.getElementById('guess-input'))
    }

    // clean up intervals and unresolved promises
    return () => {
      clearInterval(intervalRef.current)
      if (replayRef.current) replayRef.current()
      clearInterval(modalIntervalRef.current)
      if (modalRef.current) modalRef.current()
    }
  }, [canvas])

  const handleSetLabel = label => {
    const disp = label.replace(/[a-z]/gi, '_')

    setLabel(disp)
  }

  const handleStartRodal = async () => {
    await startRodal(setRodalVisible, setRodalHeader, modalIntervalRef, modalRef)
  }

  const handleStartGuessing = async () => {
    try {
      const guesses = await startGuessingRound(canvas, guessInput, doodlesToGuess, roundLen, setTimeLeft, handleSetGuess, 
        handleSetLabel, intervalRef, replayRef, setDoodleNum, handleStartRodal, setLastResult)
      const newGame = await sendGuesses(guesses, userId, gameId)
      setGame(newGame)

      if (newGame.status === ServerGameStatus.active) setGameState(GameState.showThisResult)
      else setGameState(GameState.inactiveGame)
      
    } catch (e) {
      console.error('Error in handleStartGuessing', e)
    }
  }

  const handleSetGuess = guessVal => {
    if (!label) setGuess(guessVal)
    else setGuess(guessVal.substring(0, label.length))
  }

  return (
    <div className='vertical-center-div' style={{ width: '1960px' }}>
      <b style={{ fontSize: '20px' }}>Time Left:</b>
      <Typography.Title id='countdown-timer'>{timeLeft}s</Typography.Title>
      <Progress className='guess-progress' percent={timeLeft/roundLen*100} showInfo={false} strokeColor='dodgerblue'/>
      <b>Guess:</b>
      <div id='guess-input-wrapper'>
        <input className='borderless-input' id='guess-input' type='text' value={guess} onChange={event => handleSetGuess(event.target.value)} autoComplete='off' spellCheck='false' />
        <div id='underline-div'>{label}</div>
      </div>
      <canvas id="paper-canvas" resize="true"></canvas>
      <Rodal visible={rodalVisible} onClose={() => setRodalVisible(false)} showCloseButton={false}
        width={600} height={400} enterAnimation='zoom' closeMaskOnClick={false}>
        <div className='rodal-header'>{rodalHeader}</div>
        <div className='rodal-body'>
          {lastResult && <div style={{ fontSize: '1.5em', color: 'gold' }}>{lastResult}</div>}
          <div>Doodle {doodleNum} of {doodlesToGuess.length}</div>
        </div>
      </Rodal>
    </div>
  )
}

export default GuessingView
