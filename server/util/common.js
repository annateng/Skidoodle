const common = require('@root/config/common')
require('dotenv').config()

const PORT = process.env.PORT || 8000
const MONGODB_URI = process.env.MONGODB_URI
const PRIVATE_KEY = process.env.PRIVATE_KEY

module.exports = {
  ...common,
  PORT, MONGODB_URI, PRIVATE_KEY
}
