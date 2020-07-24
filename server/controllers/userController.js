const bcrypt = require('bcrypt')

const { ApplicationError } = require('@util/customErrors')
const User = require('@models/user')
const FriendRequest = require('@models/friend-request')
const GameRequest = require('@models/game-request')
const Game = require('@models/game')
const { getDecodedToken, checkAuthorization, isFriendsWith } = require('@util/authUtil')

/** send search string, requesterId in query params */
const findUsers = async (req, res) => {
  const str = req.query.search
  if (!str || str.length < 1) return res.json([])

  const requesterId = req.query.requesterId
  const requestingUser = await User.findById(requesterId)

  const regex = new RegExp(`.*${str}.*`, 'i')
  const users = await User.find({ username: regex }, 'username')
  const filteredUsers = users.filter(u => u._id.toString() !== requesterId) // exclude self

  // incomingFrStr: string ids of users who have requested USER as a friend, pending
  const incomingFr = await FriendRequest.find({ receiver: requesterId, isActive: true })
  const incomingFrStr = incomingFr.map(fr => fr.requester.toString())
  // outgoingFrStr: string ids of users who USER has requested as a friend, pending
  const outgoingFr = await FriendRequest.find({ requester: requesterId, isActive: true })
  const outgoingFrStr = outgoingFr.map(fr => fr.receiver.toString())
  
  res.json(
    filteredUsers.map(fu => { 
      const fuIdStr = fu._id.toString()

      const frStatus = incomingFrStr.includes(fuIdStr) ? 'incoming' : outgoingFrStr.includes(fuIdStr) ? 'outgoing' : null
      console.log(frStatus)
      console.log(outgoingFr.map(fr => fr._id.toString()))
      const frId = frStatus === 'incoming' ? incomingFr.find(fr => fr.requester.toString() === fuIdStr)._id.toString() :
                    frStatus === 'outgoing' ? outgoingFr.find(fr => fr.receiver.toString() === fuIdStr)._id.toString() :
                    null

      return {
        username: fu.username,
        id: fuIdStr,
        isFriends: requestingUser && requestingUser.friends ? requestingUser.friends.map(f => f.toString()).includes(fuIdStr) : false,
        frStatus,
        frId
      }
    })
  )
}

const deleteUser = async (req, res) => {
  checkAuthorization(req, req.params.id)

  await User.findByIdAndDelete(req.params.id)
  res.status(204).end()
}

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

/* Get friend requests and game requests */
const getNotifications = async (req, res) => {
  checkAuthorization(req, req.params.id)

  const friendRequests = await FriendRequest
    .find({ receiver: req.params.id, isActive: true })
    .populate({ path: 'requester', select: 'username' })
  const gameRequests = await GameRequest
    .find({ receiver: req.params.id, isActive: true })
    .populate({ path: 'requester', select: 'username' })

  res.json({
    friendRequests: friendRequests.map(fr => fr.toJSON()),
    gameRequests: gameRequests.map(gr => gr.toJSON())
  })
}

/** send userId, gameRequestId in url params 
 * send action = 'accept' or 'reject' in query params 
*/
const respondToGameRequest = async (req, res) => {
  checkAuthorization(req, req.params.id)
  
  const gr = await GameRequest.findById(req.params.grId)
  const game = await Game.findById(gr.game)

  if (req.query.action === 'accept') {
    game.status = 'ACTIVE'
    gr.isActive = false
    
    const savedGame = await game.save()
    await gr.save()

    return res.json(savedGame.toJSON())

  } else if (req.query.action === 'reject') {
    gr.isActive = false
    await gr.save()
    game.status = 'INACTIVE'
    await game.save()

    return res.status(204).send()
  }

  throw new ApplicationError('Send query param action = \'accept\' or \'reject\'', 400)
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

  try {
    const savedUser = await user.save()
    res.json(savedUser.toJSON())
  } catch (e) {
    if (e.name === 'ValidationError') {
      if (e.errors.email) throw new ApplicationError('Email already exists.', 400) 
      if (e.errors.username) throw new ApplicationError('Username already exists.', 400) 
    }
  }
}

/** Send in requesterID in query parays*/
const addFriend = async (req, res) => {
  checkAuthorization(req, req.query.requesterId)

  const checkExisting = await FriendRequest.findOne({
    $or: [
      { requester: req.query.requesterId, receiver: req.params.id },
      { receiver: req.query.requesterId, requester: req.params.id }
    ],
    isActive: true
  })

  if (checkExisting) throw new ApplicationError('Friend request already pending.', 400)

  const isFriends = await isFriendsWith(req.params.id, req.query.requesterId)
  if (isFriends) throw new ApplicationError('These users are already friends.', 400)
  if (req.query.requesterId === req.params.id) throw new ApplicationError('Can\'t be friends with yourself.', 400)

  const newFriendRequest = new FriendRequest({
    requester: req.query.requesterId,
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

/** send userId, friendRequestId in url params 
 * send action = 'reject' or 'accept' in query params
*/
const respondToFriendRequest = async (req, res) => {
  checkAuthorization(req, req.params.id)
  
  const friendRequest = await FriendRequest.findById(req.params.frId)
  if (!friendRequest) throw new ApplicationError('Friend request not found.', 400)
  if (friendRequest.receiver.toString() !== req.params.id) throw new ApplicationError('User is not friend request reeiver.', 400)
  
  if (req.query.action === 'accept') {
    const receiver = await User.findById(req.params.id)
    const requester = await User.findById(friendRequest.requester)

    if (receiver.friends.map(id => id.toString()).includes(requester.id.toString())) throw new ApplicationError('Already Friends.', 400)
    if (receiver.friends.map(id => id.toString()).includes(requester.id.toString())) throw new ApplicationError('Already Friends.', 400)

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

    return res.json(confirmRes)

  } else if (req.query.action === 'reject') {
    friendRequest.isActive = false
    await friendRequest.save()
  
    return res.status(204).send()
  }

  throw new ApplicationError('Send query param action = \'accept\' or \'reject\'', 400)
}

module.exports = {
  deleteUser, getUser, addFriend, updateUser, createUser, addFriend, 
  getFriendRequests, deleteFriendRequest, respondToFriendRequest,
  getNotifications, respondToGameRequest, findUsers
}
