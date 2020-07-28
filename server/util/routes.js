const Router = require('express')
const users = require('@controllers/userController')
const login = require('@controllers/loginController')
const games = require('@controllers/gameController')
const email = require('@controllers/emailController')

const router = Router()

router.get('/users/search', users.findUsers)
router.post('/users/:id/friend-requests/:frId', users.respondToFriendRequest)
router.get('/users/:id/friend-requests', users.getFriendRequests)
router.post('/users/:id/friend-requests', users.addFriend)
router.delete('/users/:id/friend-requests', users.deleteFriendRequest)
router.post('/users/:id/game-requests/:grId', users.respondToGameRequest)
router.get('/users/:id/notifications', users.getNotifications)
router.get('/users/:id/active-games', games.getActive)
router.get('/users/:id', users.getUser)
router.put('/users/:id', users.updateUser)
router.delete('/users/:id', users.deleteUser)
router.post('/users', users.createUser)

router.post('/login', login.login)

router.post('/send-email/invite', email.invite)

router.get('/games/new-game', games.getNewGame)
router.get('/games/random-doodle', games.getRandomDoodle)
router.get('/games/:gameId', games.getGame)
router.post('/games/:gameId', games.sendRound)

module.exports = router
