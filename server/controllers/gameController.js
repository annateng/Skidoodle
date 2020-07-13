const common = require('@util/common')
const { ApplicationError } = require('@util/customErrors')
const Drawing = require('../models/drawing')

// TODO: PLACEHOLDER
const postDrawing = async (req, res) => {
 const drawing = new Drawing({
   drawing: req.body.drawing
 })

 const savedDrawing = await drawing.save()

 res.json(savedDrawing.toJSON())
  
}

// TODO: PLACEHOLDER
const getDrawing = async (req, res) => {
  const drawing = await Drawing.findById(req.params.drawingID)

  res.json(drawing.toJSON())
}

module.exports = { postDrawing, getDrawing }