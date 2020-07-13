import paper from 'paper'
import axios from 'axios'
const basePath = '/api/games'

const sendDrawingToDB = async drawing => {
  const res = await axios.post(basePath, { drawing: drawing.paths })
  return res.data
}

const getDrawingFromDB = async drawingId => {
  const res = await axios.get(`${basePath}/${drawingId}`)
  return res.data
}

//TODO: figure out sizing, send to database, add colors
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
    
    console.log(drawing)
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
      color: drawing.curPath ? drawing.curPath.strokeColor : null,
      width: drawing.curPath ? drawing.curPath.strokeWidth : null,
      isDrawing: drawing.isDrawing
    })
  }
  
  return drawing
}

export const startRound = (drawing, setTimeLeft) => {
  //console.log(drawing)

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
      const game = await sendDrawingToDB(drawing)
   }
  }, 100)
}

export const replayGame = async () => {
  const drawing = await getDrawingFromDB(lastGameId)
  console.log(drawing)

  paper.project.activeLayer.removeChildren()
  paper.view.draw()

  const canvas = document.getElementById('paper-canvas')

  const replayDrawing = {
    i: 0,
    paths: drawing.drawing,
    paper: new paper.Project(canvas),
    lastIsDrawing: false,
    curPath: null
  }

  replayDrawing.paper.view.onFrame = event => {
    if (replayDrawing.i < 0 || replayDrawing.i >= replayDrawing.paths.length - 1) return

    //console.log(game.drawing[i].isDrawing, game.drawing[i-1] ? game.drawing[i-1].point : null)
    if (replayDrawing.paths[replayDrawing.i].isDrawing && !replayDrawing.lastIsDrawing) {
      if (replayDrawing.curPath) replayDrawing.curPath.selected = false
      replayDrawing.curPath = new paper.Path({ 
        segments: [new paper.Point(replayDrawing.paths[replayDrawing.i].x, replayDrawing.paths[replayDrawing.i].y)],
        strokeColor: 'red'
      })
    } else if (replayDrawing.paths[replayDrawing.i].isDrawing) {
      const point = new paper.Point(replayDrawing.paths[replayDrawing.i].x, replayDrawing.paths[replayDrawing.i].y)
      replayDrawing.curPath.lineTo(point)
      replayDrawing.curPath.moveTo(point)
    }

    replayDrawing.lastIsDrawing = replayDrawing.paths[replayDrawing.i].isDrawing
    replayDrawing.i++
  }
}
