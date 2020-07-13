const Router = require('express')
const users = require('@controllers/userController')
const login = require('@controllers/loginController')
const games = require('@controllers/gameController')

const router = Router()

router.post('/users/:id/friend-requests/reject', users.rejectFriendRequest)
router.post('/users/:id/friend-requests/accept', users.acceptFriendRequest)
router.get('/users/:id/friend-requests', users.getFriendRequests)
router.post('/users/:id/friend-requests', users.addFriend)
router.delete('/users/:id/friend-requests', users.deleteFriendRequest)
router.get('/users/:id', users.getUser)
router.put('/users/:id', users.updateUser)
router.delete('/users/:id', users.deleteUser)
router.post('/users', users.createUser)

router.post('/login', login.login)

router.post('/games', games.postDrawing)
router.get('/games/:drawingID', games.getDrawing) // TODO: change to index by game

module.exports = router
