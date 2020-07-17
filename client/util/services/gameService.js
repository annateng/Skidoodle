import paper from 'paper'
import axios from 'axios'
const basePath = '/api/games'

let token

export const setToken = authToken => {
  token = `bearer ${authToken}`
}

export const sendRound = async (requesterId, receiverId, doodles, gameId, guessResults) => {
  const config = { 
    headers: { Authorization: token },
  }
  
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
export const getDrawing = canvas => {

  const drawing = {
    duration: 10,
    isActive: false,
    isDrawing: false,
    paths: [],
    curPath: null,
    curPoint: null,
    paper: new paper.Project(canvas)
  }

  drawing.paper.view.onMouseDown = event => {
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

  drawing.paper.view.onMouseUp = event => {
    if (!drawing.isActive) return
    drawing.isDrawing = false
  }

  drawing.paper.view.onMouseDrag = event => {
    if (!drawing.isActive) return
    drawing.curPoint = event.point
    drawing.curPath.add(drawing.curPoint)
  }

  drawing.paper.view.onMouseMove = event => {
    if (!drawing.isActive) return
    drawing.curPoint = event.point
  }

  drawing.paper.view.onFrame = event => {
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

export const startRound = async (drawing, setTimeLeft, activeGame, setWord, doodles) => {
  //console.log(drawing)

  for (const word of activeGame.nextWords) {
    drawing.paths = []
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
    drawing.paper.view.draw()
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
    replayDrawing.paper.view.draw()
    
    const start = Date.now()
  
    const tick = setInterval(async () => {
      const timeLeft = replayDrawing.duration - ((Date.now() - start) / 1000) | 0
      setTimeLeft(timeLeft < 0 ? 0 : timeLeft)
      if (replayDrawing.i >= replayDrawing.curDrawing.length-1) {
        clearInterval(tick)
        resolve(replayDrawing)
     }
    }, 100)
  })
}

const getReplay = (game, canvas, guessInput) => {
  const replayDrawing = {
    i: 0,
    drawings: game.rounds[game.rounds.length - 1],
    curDrawing: null,
    paper: new paper.Project(canvas),
    lastIsDrawing: false,
    curPath: null,
    curGuess: null,
    duration: 10 // TODO
  }

  replayDrawing.paper.view.onFrame = event => {

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
    replayDrawing.curGuess.push(guessInput.value) // TODO
    replayDrawing.i++
  }

  replayDrawing.paper.view.onResize = event => {
    console.log(replayDrawing.paper.view)
  }

  return replayDrawing
}

export const startGuessingRound = async (canvas, guessInput, game, setTimeLeft, setGuess) => {

  const replayDrawing = getReplay(game, canvas, guessInput)
  console.log(replayDrawing.paper.view)
  const guesses = []

  for (const doodle of replayDrawing.drawings.doodles) {
    setGuess('')
    replayDrawing.curDrawing = doodle.drawing
    replayDrawing.i = 0
    replayDrawing.curGuess = []
    const completedReplay = await startReplay(replayDrawing, setTimeLeft)
    guesses.push(completedReplay.curGuess)
  }


}
