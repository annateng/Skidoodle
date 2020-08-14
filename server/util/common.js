const common = require('@root/config/common');
require('dotenv').config();

const { MONGODB_URI } = process.env;
const { PRIVATE_KEY } = process.env;
const { EMAIL_PWORD } = process.env;

// the number of high scores to track per player
const NUM_HIGH_SCORES = 10;

// URL
const BASE_URL = common.inProduction ? 'https://skidoodle.herokuapp.com' : 'http://localhost:8000';

module.exports = {
  ...common,
  MONGODB_URI,
  PRIVATE_KEY,
  NUM_HIGH_SCORES,
  EMAIL_PWORD,
  BASE_URL,
};
