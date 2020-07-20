const { ApplicationError } = require('@util/customErrors')
const common = require('@util/common')
const User = require('@models/user')
const FriendRequest = require('@models/friend-request')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getDecodedToken, checkAuthorization, isFriendsWith } = require('@util/authUtil')

const deleteUser = async (req, res) => {
  checkAuthorization(req, req.params.id)

  await User.findByIdAndDelete(req.params.id)
  res.status(204).end()
}

// TODO: update for games/stats
const getUser = async (req, res) => {
  let requestingUser

  const decodedToken = getDecodedToken(req)

  if (decodedToken && decodedToken.id) requestingUser = await User.findById(decodedToken.id).populate({ path: 'friends', select: 'username'})
  if (requestingUser && requestingUser._id.toString() === req.params.id) return res.json(requestingUser.toJSON())

  const user = await User.findById(req.params.id)

  // not friends: return partial data
  if (!requestingUser || !user.friends.includes(requestingUser._id)) return res.json({ username: user.username })

  // friends: return a little more data
  res.json({ username: user.username, displayName: user.displayName })
}

/**
 * Send in request body any of these: username, password, displayName, email
 */
const updateUser = async (req, res) => {
  checkAuthorization(req, req.params.id)

  const userData = req.body

  if (userData.password) {
    const saltRounds = 10
    userData.passwordHash = await bcrypt.hash(userData.password, saltRounds)
    delete userData.password
  }

  const savedUser = await User.findByIdAndUpdate(req.params.id, userData, { new: true})
  
  res.json(savedUser.toJSON())
}

/** Send in request body: username, password, displayName, email */
const createUser = async (req, res) => {
  const userData = req.body
  // console.log(userData)

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(userData.password, saltRounds)

  const user = new User({
    username: userData.username,
    passwordHash: passwordHash, 
    displayName: userData.displayName,
    email: userData.email,
    dateJoined: userData.date
  })

  const savedUser = await user.save()

  res.json(savedUser.toJSON())
}

/** Send in request body requesterID */
const addFriend = async (req, res) => {
  checkAuthorization(req, req.body.requesterId)

  const checkExisting = await FriendRequest.findOne({
    $or: [
      { requester: req.body.requesterId, receiver: req.params.id },
      { receiver: req.body.requesterId, requester: req.params.id }
    ],
    isActive: true
  })

  if (checkExisting) throw new ApplicationError('Friend request already pending.', 400)

  const isFriends = await isFriendsWith(req.params.id, req.body.requesterId)
  if (isFriends) throw new ApplicationError('These users are already friends.', 400)
  if (req.body.requesterId === req.params.id) throw new ApplicationError('Can\'t be friends with yourself.', 400)

  const newFriendRequest = new FriendRequest({
    requester: req.body.requesterId,
    receiver: req.params.id,
    isActive: true
  })

  const savedRequest = await newFriendRequest.save()

  res.json(savedRequest.toJSON())
}

/** Send in request body requesterID */
const deleteFriendRequest = async (req, res) => {
  checkAuthorization(req, req.body.requesterId)

  const friendRequest = await FriendRequest.findOne({
    receiver: req.params.id,
    requester: req.body.requesterId,
    isActive: true
  })

  if (!friendRequest) throw new ApplicationError('Friend request not found.', 400)

  friendRequest.isActive = false
  
  await friendRequest.save()

  res.status(204).end()
}

/** get all incoming friend requests for user idenfied by req.params.id */
const getFriendRequests = async (req, res) => {
  checkAuthorization(req, req.params.id)

  const friendRequests = await FriendRequest.find({ receiver: req.params.id, isActive: true })
  res.json(friendRequests.map(fr => fr.toJSON()))
}

/** send requesterId in body */
const acceptFriendRequest = async (req, res) => {
  checkAuthorization(req, req.params.id)
  
  const friendRequest = await FriendRequest.findOne({
    receiver: req.params.id,
    requester: req.body.requesterId,
    isActive: true
  })

  if (!friendRequest) throw new ApplicationError('Friend request not found.', 400)
  
  const receiver = await User.findById(req.params.id)
  const requester = await User.findById(req.body.requesterId)

  receiver.friends = [...receiver.friends, requester._id]
  requester.friends = [...requester.friends, receiver._id]

  updatedReceiver = await receiver.save()
  updatedRequester = await requester.save()

  friendRequest.isActive = false
  await friendRequest.save()

  const confirmRes = {
    receiverIsFriendsWithRequester: updatedReceiver.friends.includes(requester._id),
    requesterIsFriendsWithReceiver: updatedRequester.friends.includes(receiver._id)
  }

  res.json(confirmRes)
}

/** send requesterId in body */
const rejectFriendRequest = async (req, res) => {
  checkAuthorization(req, req.params.id)
  
  const friendRequest = await FriendRequest.findOne({
    receiver: req.params.id,
    requester: req.body.requesterId,
    isActive: true
  })

  if (!friendRequest) throw new ApplicationError('Friend request not found.', 400)

  friendRequest.isActive = false
  await friendRequest.save()

  res.status(204).send()
}


module.exports = {
  deleteUser, getUser, addFriend, updateUser, createUser, addFriend, 
  getFriendRequests, deleteFriendRequest, acceptFriendRequest, rejectFriendRequest
}
