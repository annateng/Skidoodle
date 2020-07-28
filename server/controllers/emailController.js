const { sendInvite } = require('@util/emailUtil')

/** in req.body, send name and destination emailAddr */
const invite = async (req, res) => {

  const emailRes = await sendInvite(req.body.emailAddr, req.body.name, req.body.friendId)
  res.send(emailRes)
}

module.exports = { invite }