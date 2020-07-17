import paper from 'paper'
import axios from 'axios'
const basePath = '/api/games'

let token
// let paperScope

export const setToken = authToken => {
  token = `bearer ${authToken}`
}

export const setupPaper = canvas => {
  paper.setup(canvas)
}

export const sendRound = async gameData => {
  const config = { 
    headers: { Authorization: token },
  }

  const requesterId = gameData.activePlayer
  const receiverId = gameData.player1 === requesterId ? gameData.player2 : gameData.player1
  const doodles = gameData.doodlesToSend
  const guessResults = gameData.guesses
  const gameId = gameData.id

  const body = {
    requesterId, receiverId, doodles, guessResults
  }

  const res = await axios.post(`${basePath}/${gameId}`, body, config)
  return res.data
}

export const getNewGame = async (requesterId, receiverId) => {
  const config = { 
    headers: { Authorization: token },
    params: {
      requesterId, receiverId
    }
  }
  // console.log(config)
  const res = await axios.get(`${basePath}/new-game`, config)
  return res.data
}

// TODO: figure out sizing
export const getDrawing = () => {

  const drawing = {
    duration: 10,
    isActive: false,
    isDrawing: false,
    paths: [],
    curPath: null,
    curPoint: null,
    // paper: new paper.Project(canvas)
  }

  paper.view.onMouseDown = event => {
    if (!drawing.isActive) return

    if (drawing.curPath) drawing.curPath.selected = false
    
    // console.log(drawing)
    drawing.curPath = new paper.Path({
      segments: [event.point],
      strokeColor: localStorage.getItem('scribbleColor') || 'black',
      strokeWidth: localStorage.getItem('scribbleSize') || 2
    })

    drawing.isDrawing = true
  }

  paper.view.onMouseUp = event => {
    if (!drawing.isActive) return
    drawing.isDrawing = false
  }

  paper.view.onMouseDrag = event => {
    if (!drawing.isActive || !drawing.isDrawing) return
    drawing.curPoint = event.point
    drawing.curPath.add(drawing.curPoint)
  }

  paper.view.onMouseMove = event => {
    if (!drawing.isActive) return
    drawing.curPoint = event.point
  }

  paper.view.onFrame = event => {
    if (!drawing.isActive) return
    
    drawing.paths.push({
      x: drawing.curPoint ? drawing.curPoint.x : null,
      y: drawing.curPoint ? drawing.curPoint.y : null,
      r: drawing.curPath ? drawing.curPath.strokeColor.red : null,
      g: drawing.curPath ? drawing.curPath.strokeColor.green : null,
      b: drawing.curPath ? drawing.curPath.strokeColor.blue : null,
      width: drawing.curPath ? drawing.curPath.strokeWidth : null,
      isDrawing: drawing.isDrawing
    })
  }
  
  return drawing
}

export const startRound = async (canvas, setTimeLeft, wordsToDraw, setWord) => {
  
  setupPaper(canvas)
  const doodles = []

  // console.log('wordsToDraw', wordsToDraw)
  for (const word of wordsToDraw) {
    const drawing = getDrawing()
    setWord(word)
    const completedDrawing = await startDrawing(drawing, setTimeLeft)
    doodles.push({
      label: word,
      drawing: completedDrawing.paths
    })
  }

  return doodles
}

const startDrawing = (drawing, setTimeLeft) => {
  return new Promise((resolve, reject) => {
    paper.project.activeLayer.removeChildren()
    paper.view.draw()
    drawing.isActive = true
  
    const start = Date.now()
  
    const tick = setInterval(async () => {
      const timeLeft = drawing.duration - ((Date.now() - start) / 1000) | 0
      setTimeLeft(timeLeft < 0 ? 0 : timeLeft)
      if (timeLeft <= 0) {
        clearInterval(tick)
        drawing.isActive = false
        resolve(drawing)
        // const game = await sendDrawingToDB(drawing)
     }
    }, 100)
  })
}

export const getGame = async (gameId, userId) => {
  const config = { 
    headers: { Authorization: token },
    params: {
      userId
    }
  }

  // console.log(config)
  
  const res = await axios.get(`${basePath}/${gameId}`, config)
  return res.data
}

const startReplay = (replayDrawing, setTimeLeft) => {
  return new Promise((resolve, reject) => {
    paper.project.activeLayer.removeChildren()
    paper.view.draw()
    
    replayDrawing.curStartTime = Date.now()
  
    const tick = setInterval(async () => {
      const timeLeft = replayDrawing.duration - ((Date.now() - replayDrawing.curStartTime) / 1000) | 0
      setTimeLeft(timeLeft < 0 ? 0 : timeLeft)
      if (replayDrawing.guessedCorrectly || replayDrawing.i >= replayDrawing.curDrawing.length-1) {
        clearInterval(tick)
        resolve(replayDrawing)
     }
    }, 100)
  })
}

const getReplay = (guessInput) => {
  const replayDrawing = {
    i: 0,
    curDrawing: null,
    lastIsDrawing: false,
    curPath: null,
    curGuess: [],
    duration: 10, // TODO
    curLabel: null,
    curStartTime: null,
    correctGuessTime: null,
    guessedCorrectly: false
  }

  paper.view.onFrame = event => {

    // console.log(replayDrawing.i)
    if (!replayDrawing.curDrawing) return
    if (replayDrawing.i < 0 || replayDrawing.i >= replayDrawing.curDrawing.length - 1) return

    // console.log(replayDrawing.curDrawing[replayDrawing.i])
    if (replayDrawing.curDrawing[replayDrawing.i].isDrawing && !replayDrawing.lastIsDrawing) {
      if (replayDrawing.curPath) replayDrawing.curPath.selected = false
      replayDrawing.curPath = new paper.Path({ 
        segments: [new paper.Point(replayDrawing.curDrawing[replayDrawing.i].x, replayDrawing.curDrawing[replayDrawing.i].y)],
        strokeColor: new paper.Color(replayDrawing.curDrawing[replayDrawing.i].r, replayDrawing.curDrawing[replayDrawing.i].g, replayDrawing.curDrawing[replayDrawing.i].b),
        strokeWidth: replayDrawing.curDrawing[replayDrawing.i].width
      })
    } else if (replayDrawing.curDrawing[replayDrawing.i].isDrawing) {
      const point = new paper.Point(replayDrawing.curDrawing[replayDrawing.i].x, replayDrawing.curDrawing[replayDrawing.i].y)
      replayDrawing.curPath.lineTo(point)
      replayDrawing.curPath.moveTo(point)
    }

    replayDrawing.lastIsDrawing = replayDrawing.curDrawing[replayDrawing.i].isDrawing

    const guessInputVal = guessInput.value
    replayDrawing.curGuess.push(guessInputVal)
    if (guessInputVal === replayDrawing.curLabel) {
      replayDrawing.guessedCorrectly = true
      replayDrawing.correctGuessTime = Date.now()
    }
    replayDrawing.i++
  }

  return replayDrawing
}

export const startGuessingRound = async (canvas, guessInput, doodlesToGuess, setTimeLeft, setGuess) => {

  setupPaper(canvas)
  const guesses = []

  for (const doodle of doodlesToGuess) {
    setGuess('')
    const replayDrawing = getReplay(guessInput)
    replayDrawing.curDrawing = doodle.drawing
    replayDrawing.curLabel = doodle.label
    const completedReplay = await startReplay(replayDrawing, setTimeLeft)

    const guessToPush = {
      doodleId: doodle.id,
      guesses: replayDrawing.curGuess,
      isCorrect: replayDrawing.guessedCorrectly,
      timeSpent: replayDrawing.correctGuessTime ? replayDrawing.correctGuessTime - replayDrawing.curStartTime : 10
    }

    guesses.push(guessToPush)
  }

  return guesses
}

/**
 * States:
 * 'INACTIVE' : The game is over.
 * 'GUESS' : It's the player's turn to guess.
 * 'DRAW' : It's the player's turn to draw.
 * 'OVER' : The round is over. Data should be sent to server.
 * 'ERROR' : This should not occur.
 * @param {*} gameData 
 */
export const getGameState = gameData => {
  //console.log(gameData)

  if (!gameData) return null
  if (!gameData.isActive) return 'INACTIVE'
  if (gameData.doodlesToGuess && gameData.doodlesToGuess.doodles && gameData.doodlesToGuess.doodles.length > 0) return 'GUESS'
  if (gameData.nextWords && gameData.nextWords.length > 0) return 'DRAW'
  if (gameData.guesses || gameData.doodlesToSend) return 'OVER'

  return 'ERROR'
}
