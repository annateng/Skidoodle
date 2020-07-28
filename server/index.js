const express = require('express')
const mongoose = require('mongoose')
require('express-async-errors')

const errorMiddleware = require('@middleware/errorMiddleware')
const common = require('@util/common')
const routes = require('@util/routes')

const mongoUrl = common.MONGODB_URI

console.log('connecting to...', mongoUrl)
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    // .then(res => { console.log('connected to DB')} )
    .catch(err => { console.error('error connecting to DB', err.message)})

const app = express()

app.use(express.json({limit: '50mb'}))
app.use(routes)
app.use(errorMiddleware)

module.exports = app
