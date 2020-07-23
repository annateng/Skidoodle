const jwt = require('jsonwebtoken')

const User = require('@models/user')
const { ApplicationError } = require('@util/customErrors')
const common = require('@util/common')

const getDecodedToken = req => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return jwt.decode(authorization.substring(7), common.PRIVATE_KEY)
  }
  return null
}

const checkAuthorization = (req, userID) => {
  const decodedToken = getDecodedToken(req)
  if (!userID || !decodedToken || !decodedToken.id || decodedToken.id.toString() !== userID.toString()) throw new ApplicationError('Not authorized.', 401)
}

const isFriendsWith = async (userAID, userBID) => {
  const userA = await User.findById(userAID)
  return userA.friends.map(id => id.toString()).includes(userBID)
}

module.exports = { getDecodedToken, checkAuthorization, isFriendsWith }