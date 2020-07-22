const common = require('@root/config/common')
require('dotenv').config()

const PORT = process.env.PORT || 8000
const MONGODB_URI = process.env.MONGODB_URI
const PRIVATE_KEY = process.env.PRIVATE_KEY

// game variables
const NUM_ROUNDS = common.inProduction ? 10 : 2
const ROUND_LEN = common.inProduction ? 20 : 2
const WORDS_PER_ROUND = common.inProduction ? 3 : 3

module.exports = {
  ...common,
  PORT, MONGODB_URI, PRIVATE_KEY, NUM_ROUNDS, ROUND_LEN, WORDS_PER_ROUND
}
