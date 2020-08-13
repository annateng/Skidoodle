/* eslint-disable no-underscore-dangle */

const common = require('@util/common');
const { ApplicationError } = require('@util/customErrors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/** login with username and password */
const login = async (req, res) => {
  const loginInfo = req.body;

  const user = await User.findOne({ username: loginInfo.username });
  if (!user) throw new ApplicationError('Invalid username.', 401);
  const passwordCorrect = await bcrypt.compare(loginInfo.password, user.passwordHash);
  if (!passwordCorrect) throw new ApplicationError('Incorrect password.', 401);

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, common.PRIVATE_KEY);

  res.status(200).json({
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      settings: user.settings,
    },
  });
};

module.exports = { login };
