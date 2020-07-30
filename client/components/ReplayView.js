import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Typography, Progress, Row } from 'antd'
import Rodal from 'rodal'

import { startRodal, getRoundReplay } from 'Utilities/services/gameService'
import { ROUND_LEN } from 'Utilities/common'

// <Route path='/game/:gameId/replay/:roundNum' component={ReplayView} />
const ReplayView = () => {
  const [timeLeft, setTimeLeft] = useState(ROUND_LEN)
  const [canvas, setCanvas] = useState()
  const [guessInput, setGuessInput] = useState()
  const [guess, setGuess] = useState('')
  const [label, setLabel] = useState('')
  const [rodalVisible, setRodalVisible] = useState(false)
  const [rodalHeader, setRodalHeader] = useState()
  const [doodleNum, setDoodleNum] = useState()
  const [lastResult, setLastResult] = useState()
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef()
  const replayRef = useRef()
  const modalIntervalRef = useRef()
  const modalRef = useRef()
  const params = useParams()
  
  useEffect(() => {
    if (canvas) {

      // keep fixed canvas aspect ratio 2:1 for scaling
      const canvasDiv = document.getElementById('canvas-div')
      canvasDiv.style.height = (canvasDiv.clientWidth / 2) + 'px'
      window.onresize = () => canvasDiv.style.height = (canvasDiv.clientWidth / 2) + 'px'

      handleStartRoundReplay()
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

  // Label shows number of characters
  const handleSetLabel = label => {
    const disp = label.replace(/[a-z]/gi, '_')

    setLabel(disp)
  }

  const handleStartRodal = async () => {
    await startRodal(setRodalVisible, setRodalHeader, modalIntervalRef, modalRef)
  }

  const handleStartRoundReplay = async () => {
    try {
      const replay = await getRoundReplay(params.gameId, params.roundNum)
      console.log(replay)
      // const guesses = await startGuessingRound(canvas, guessInput, doodlesToGuess, ROUND_LEN, setTimeLeft, handleSetGuess, 
      //   handleSetLabel, intervalRef, replayRef, setDoodleNum, handleStartRodal, setLastResult)
      // setLoading(true)
      // const newGame = await sendGuesses(guesses, userId, gameId)
      // setLoading(false)
      // setGame(newGame)

      // if (newGame.status === ServerGameStatus.active) setGameState(GameState.showThisResult)
      // else setGameState(GameState.inactiveGame)
      
    } catch (e) {
      console.error('Error in handleStartGuessing', e)
    }
  }

  // Cap guess input len at number of characters
  const handleSetGuess = guessVal => {
    if (!label) setGuess(guessVal)
    else setGuess(guessVal.substring(0, label.length))
  }

  return (
    <div className='main-layout vertical-center-div'>
      <div className='skinny-container'>
        {loading && <Alert message='sending...' type='info' showIcon icon={<LoadingOutlined />}/>}
        <div className='vertical-center-div'>
          <b style={{ fontSize: '20px' }}>Time Left:</b>
          <Typography.Title id='countdown-timer'>{timeLeft}s</Typography.Title>
          <Progress className='guess-progress' percent={timeLeft/ROUND_LEN*100} showInfo={false} strokeColor='dodgerblue'/>
          <b>Guess:</b>
          <div id='guess-input-wrapper'>
            <input className='borderless-input' id='guess-input' type='text' value={guess} onChange={event => handleSetGuess(event.target.value)} autoComplete='off' spellCheck='false' />
            <div id='underline-div'>{label}</div>
          </div>
          <div id='canvas-div' className='centered-div'>
            <canvas id="paper-canvas" resize="false"></canvas>
          </div>
          {/* <Rodal visible={rodalVisible} onClose={() => setRodalVisible(false)} showCloseButton={false}
            width={600} height={450} animation='rotate' closeMaskOnClick={false} 
            customStyles={{ borderRadius: '10px', border: '2px solid tomato'}}>
            <div className='rodal-header'>{rodalHeader}</div>
            <div className='rodal-body'>
              {lastResult && <div style={{ fontSize: '1.5em', color: 'gold' }}>{lastResult}</div>}
              <div>Doodle {doodleNum} of {doodlesToGuess.length}</div>
            </div>
          </Rodal> */}
        </div>
      </div>
    </div>
  )
}

export default ReplayView
