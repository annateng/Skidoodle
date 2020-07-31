import { PaperScope, Path, Point, Color } from 'paper/dist/paper-core'
import axios from 'axios'

const basePath = '/api/games'
let token

export const setToken = authToken => {
  token = `bearer ${authToken}`
}

export const sendDoodles = async (doodles, userId, gameId) => {
  const config = { 
    headers: { Authorization: token },
    params: { type: 'doodle' }
  }

  const body = {
    requesterId: userId,
    doodles
  }

  const res = await axios.post(`${basePath}/${gameId}`, body, config)
  return res.data
}

export const sendGuesses = async (guesses, userId, gameId) => {
  const config = { 
    headers: { Authorization: token },
    params: { type: 'guess' }
  }

  const body = {
    requesterId: userId,
    guesses
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
  const res = await axios.get(`${basePath}/new-game`, config)
  return res.data
}

export const getDrawing = (roundLen, paper, isSaved) => {

  const drawing = {
    duration: roundLen,
    isActive: false,
    isDrawing: false,
    paths: {
      timeElapsed: [],
      x: [],
      y: [],
      r: [],
      g: [],
      b: [],
      width: [],
      isDrawing: []
    },
    curPath: null,
    curPoint: null,
    startTime: null,
    isSaved,
  }

  paper.view.onMouseDown = event => {
    if (!drawing.isActive) return

    if (drawing.curPath) drawing.curPath.selected = false
    
    drawing.curPath = new Path({
      segments: [event.point],
      strokeColor: localStorage.getItem('scribbleColor'),
      strokeWidth: localStorage.getItem('scribbleSize'),
      strokeCap: 'round',
    })

    drawing.isDrawing = true
  }

  paper.view.onMouseUp = event => {
    if (!drawing.isActive) return
    drawing.isDrawing = false
  }

  // paper.view.onMouseDrag = event => {
  //   if (!drawing.isActive || !drawing.isDrawing) return
  //   drawing.curPoint = event.point
  //   drawing.curPath.add(drawing.curPoint)
  // }

  paper.view.onMouseMove = event => {
    if (!drawing.isActive) return
    drawing.curPoint = event.point
  }

  paper.view.onFrame = event => {
    if (!drawing.isActive) return

    if (drawing.isDrawing) {
      drawing.curPath.lineTo(drawing.curPoint)
      drawing.curPath.moveTo(drawing.curPoint)
      drawing.curPath.smooth()
    }

    if (!drawing.isSaved) return
    
    drawing.paths.timeElapsed.push(Date.now() - drawing.startTime)
    drawing.paths.x.push(drawing.curPoint ? drawing.curPoint.x : null)
    drawing.paths.y.push(drawing.curPoint ? drawing.curPoint.y : null)
    drawing.paths.r.push(drawing.curPath ? drawing.curPath.strokeColor.red : null)
    drawing.paths.g.push(drawing.curPath ? drawing.curPath.strokeColor.green : null)
    drawing.paths.b.push(drawing.curPath ? drawing.curPath.strokeColor.blue : null)
    drawing.paths.width.push(drawing.curPath ? drawing.curPath.strokeWidth : null)
    drawing.paths.isDrawing.push(drawing.curPoint ? drawing.isDrawing : false)
  }
  
  return drawing
}

export const startRound = async (canvas, setTimeLeft, wordsToDraw, roundLen, setWord, intervalRef, roundRef, startRodal) => {
    
  const paper = new PaperScope()
  paper.setup(canvas)
  
  const doodles = []

  for (const word of wordsToDraw) {
    const drawing = getDrawing(roundLen, paper, true)
    setWord(word)
    setTimeLeft(roundLen)
    await startRodal()
    const completedDrawing = await startDrawing(drawing, setTimeLeft, intervalRef, roundRef, paper)

    doodles.push({
      label: word,
      drawing: completedDrawing.paths,
      width: paper.view.viewSize.width
    })
  }

  return doodles
}

const startDrawing = (drawing, setTimeLeft, intervalRef, roundRef, paper) => {
  return new Promise((resolve, reject) => {
    paper.project.activeLayer.removeChildren()
    paper.view.draw()
    drawing.isActive = true
  
    drawing.startTime = Date.now()
  
    const tick = setInterval(async () => {
      const timeLeft = drawing.duration - ((Date.now() - drawing.startTime) / 1000)
      const displayTimeLeft = Math.ceil(timeLeft)
      setTimeLeft(displayTimeLeft < 0 ? 0 : displayTimeLeft)
      if (timeLeft <= 0) {
        clearInterval(tick)
        drawing.isActive = false
        resolve(drawing)
     }
    }, 10)

    intervalRef.current = tick
    roundRef.current = () => { reject('Component Unmounted') }
  }).catch(e => { console.error(e) })
}

export const getGame = async (gameId, userId) => {
  const config = { 
    headers: { Authorization: token },
    params: {
      userId
    }
  }
  
  const res = await axios.get(`${basePath}/${gameId}`, config)
  return res.data
}

const startReplay = (replayDrawing, setTimeLeft, intervalRef, replayRef, paper) => {
  return new Promise((resolve, reject) => {
    paper.project.activeLayer.removeChildren()
    paper.view.draw()
    replayDrawing.isActive = true
    replayDrawing.startTime = Date.now()
  
    const tick = setInterval(async () => {
      const timeLeft = replayDrawing.duration - ((Date.now() - replayDrawing.startTime) / 1000)
      const displayTimeLeft = Math.ceil(timeLeft)
      setTimeLeft(displayTimeLeft < 0 ? 0 : displayTimeLeft)
      if (!replayDrawing.isActive) {
        clearInterval(tick)
        resolve(replayDrawing)
     }
    }, 10)

    intervalRef.current = tick
    replayRef.current = () => { reject('Component Unmounted') }
  }).catch(e => { console.error(e) })
}

const getReplay = (guessInput, roundLen, drawing, label, scale, paper) => {
  
  const replayDrawing = {
    drawing,
    lastIsDrawing: false,
    path: null,
    guess: [],
    timeElapsed: [],
    duration: roundLen,
    label,
    startTime: null,
    correctGuessTime: null,
    guessedCorrectly: false,
    isActive: false,
    scale,
    lastI: 0
  }

  paper.view.onFrame = event => {
    if (!replayDrawing.isActive || !replayDrawing.drawing) return

    const timeElapsed = Date.now() - replayDrawing.startTime
    const i = replayDrawing.drawing.timeElapsed.findIndexFrom(p => p >= timeElapsed, null, replayDrawing.lastI)
    if (i == -1) {
      replayDrawing.isActive = false
      return
    }

    const isDrawing = replayDrawing.drawing.isDrawing[i]
    const point = new Point(replayDrawing.drawing.x[i], replayDrawing.drawing.y[i]).multiply(replayDrawing.scale)

    if (isDrawing && !replayDrawing.lastIsDrawing) {
      if (replayDrawing.path) replayDrawing.path.selected = false
      replayDrawing.path = new Path({ 
        segments: [point],
        strokeColor: new Color(replayDrawing.drawing.r[i], replayDrawing.drawing.g[i], replayDrawing.drawing.b[i]),
        strokeWidth: replayDrawing.scale * replayDrawing.drawing.width[i],
        strokeCap: 'round',
        project: paper.project // sometimes Path will pick up the wrong 'paper' object on init unless this is included. im not sure why. maybe has to do with import method / global scope
      })
    } else if (isDrawing) {
      replayDrawing.path.lineTo(point)
      replayDrawing.path.moveTo(point)
      replayDrawing.path.smooth()
    }

    replayDrawing.lastIsDrawing = isDrawing

    const guessInputVal = guessInput.value
    replayDrawing.guess.push(guessInputVal)
    replayDrawing.timeElapsed.push(timeElapsed)
    if (guessInputVal.toLowerCase() === replayDrawing.label.toLowerCase()) {
      replayDrawing.guessedCorrectly = true
      replayDrawing.correctGuessTime = Date.now()
      replayDrawing.isActive = false
    }

    replayDrawing.lastI = i
  }

  return replayDrawing
}

export const startGuessingRound = async (canvas, guessInput, doodlesToGuess, roundLen, setTimeLeft, setGuess, 
  setLabel, intervalRef, replayRef, setDoodleNum, startRodal, setLastResult, isPractice, inputPaper) => {
  
  let paper
  if (!isPractice) { // In practice mode, can't call paper.setup multiple times, so don't run this line
    paper = new PaperScope()
    paper.setup(canvas)
  } else paper = inputPaper
  
  const guesses = []

  let doodleNum = 1
  for (const doodle of doodlesToGuess) {
    setGuess('')
    setLabel(doodle.label)
    if (setDoodleNum) setDoodleNum(doodleNum++) // in practice mode, this function is undefined
    setTimeLeft(roundLen)

    const scale = paper.view.viewSize.width / doodle.width
    const replayDrawing = getReplay(guessInput, roundLen, doodle.drawing, doodle.label, scale, paper)

    await startRodal()
    guessInput.focus()
    const completedReplay = await startReplay(replayDrawing, setTimeLeft, intervalRef, replayRef, paper)

    const guessToPush = {
      doodleId: doodle.id,
      guesses: completedReplay.guess,
      timeElapsed: completedReplay.timeElapsed,
      isCorrect: completedReplay.guessedCorrectly,
      // max time spent is the round length. time is represented in milliseconds.
      timeSpent: completedReplay.correctGuessTime ? Math.min(completedReplay.correctGuessTime - completedReplay.startTime, roundLen * 1000) : roundLen * 1000,
      label: completedReplay.label
    }

    guesses.push(guessToPush)

    setLastResult(completedReplay.guessedCorrectly ? 'Correct!' : 'Out of Time')
  }

  return guesses
}

export const startRodal = (setRodalVisible, setRodalHeader, modalIntervalRef, modalRef) => {
  return new Promise((resolve, reject) => {
    let countDown = 3
    setRodalVisible(true)
    setRodalHeader(countDown)

    const rodalTick = setInterval(() => {
      countDown--
      if (countDown > 0) setRodalHeader(countDown)
      else {
        setRodalHeader('GO!')
        clearInterval(rodalTick)
        setTimeout(() => {
          setRodalVisible(false)
          resolve()
        }, 200)
      }
    }, 1000)

    modalIntervalRef.current = rodalTick
    modalRef.current = () => reject('Modal: Component Unmounted')
  })
}

export const getRandomDoodle = async () => {
  const res = await axios.get(`${basePath}/random-doodle`)
  return res.data
}


export const deleteGameOverNote = async noteId => {
  const config = {
    headers: { Authorization: token }
  }

  const res = await axios.put(`${basePath}/delete-gameover-note/${noteId}`, null, config)
  return res.data
}

export const getRound = async (gameId, roundNum) => {
  const res = await axios.get(`${basePath}/${gameId}/get-replay/${roundNum}`)
  return res.data
}

export const replayRound = async (doodles, guesses, inputPaper, roundLen, setGuess, setDoodleNum, setTimeLeft,
  setLabel, startRodal, intervalRef, replayRef, setLastResult) => {
    
  const paper = inputPaper
  for (let i = 0; i < doodles.length; i++) {
    const doodle = doodles[i]
    const guess = guesses[i]

    setGuess('')
    setLabel(doodle.label)
    setDoodleNum(i+1)
    setTimeLeft(roundLen)

    const scale = paper.view.viewSize.width / doodle.width
    const roundReplay = getRoundReplay(roundLen, doodle, guess, scale, paper, setGuess)

    await startRodal()
    const completedReplay = await startRoundReplay(roundReplay, setTimeLeft, intervalRef, replayRef, paper)

    setLastResult(completedReplay.guessedCorrectly ? 'Correct!' : 'Out of Time')
  }

}

const getRoundReplay = (roundLen, doodle, guess, scale, paper, setGuess) => {
  
  const replayDrawing = {
    drawing: doodle.drawing,
    lastIsDrawing: false,
    path: null,
    guess: guess,
    duration: roundLen,
    label: doodle.label,
    startTime: null,
    guessedCorrectly: false,
    isActive: false,
    scale,
    lastI: 0,
    lastJ: 0
  }

  paper.view.onFrame = () => {
    if (!replayDrawing.isActive || !replayDrawing.drawing) return
    
    const timeElapsed = Date.now() - replayDrawing.startTime
    let i = replayDrawing.drawing.timeElapsed.findIndexFrom(p => p >= timeElapsed, null, replayDrawing.lastI)
    if (i == -1) {
      replayDrawing.isActive = false
      return
    }

    // find the corresponding guess at the time of the frame
    let j = replayDrawing.guess.timeElapsed.findIndexFrom(p => p >= timeElapsed, null, replayDrawing.lastJ)
    if (j == -1) {
      j = guess.timeElapsed.length - 1
    }
    setGuess(replayDrawing.guess.guesses[j])

    const isDrawing = replayDrawing.drawing.isDrawing[i]
    const point = new Point(replayDrawing.drawing.x[i], replayDrawing.drawing.y[i]).multiply(replayDrawing.scale)

    if (isDrawing && !replayDrawing.lastIsDrawing) {
      if (replayDrawing.path) replayDrawing.path.selected = false
      // if (!paper.project) console.log(paper)
      replayDrawing.path = new Path({ 
        segments: [point],
        strokeColor: new Color(replayDrawing.drawing.r[i], replayDrawing.drawing.g[i], replayDrawing.drawing.b[i]),
        strokeWidth: replayDrawing.scale * replayDrawing.drawing.width[i],
        strokeCap: 'round',
        project: paper.project // sometimes Path will pick up the wrong 'paper' object on init unless this is included. im not sure why. maybe has to do with import method / global scope
      })
    } else if (isDrawing) {
      replayDrawing.path.lineTo(point)
      replayDrawing.path.moveTo(point)
      replayDrawing.path.smooth()
    }

    replayDrawing.lastIsDrawing = isDrawing

    // const guessInputVal = guessInput.value
    if (replayDrawing.guess.guesses[j] === replayDrawing.label.toLowerCase()) {
      replayDrawing.guessedCorrectly = true
      replayDrawing.isActive = false
    }

    replayDrawing.lastI = i
    replayDrawing.lastJ = j
  }

  return replayDrawing
}

const startRoundReplay = (replayDrawing, setTimeLeft, intervalRef, replayRef, paper) => {
  return new Promise((resolve, reject) => {
    paper.project.activeLayer.removeChildren()
    paper.view.draw()
    replayDrawing.isActive = true
    replayDrawing.startTime = Date.now()
  
    const tick = setInterval(async () => {
      const timeLeft = replayDrawing.duration - ((Date.now() - replayDrawing.startTime) / 1000)
      const displayTimeLeft = Math.ceil(timeLeft)
      setTimeLeft(displayTimeLeft < 0 ? 0 : displayTimeLeft)
      if (!replayDrawing.isActive) {
        clearInterval(tick)
        resolve(replayDrawing)
     }
    }, 10)

    intervalRef.current = tick
    replayRef.current = () => { reject('Component Unmounted') }
  }).catch(e => { console.error(e) })
}