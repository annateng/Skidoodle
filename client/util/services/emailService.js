import axios from 'axios'

const basePath = '/api/send-email'
let token

export const setToken = authToken => {
  token = `bearer ${authToken}`
}

export const sendInvite = async (emailAddr, name) => {
  const config = { 
    headers: { Authorization: token },
  }

  const res = await axios.post(`${basePath}/invite`, { emailAddr, name }, config)
  return res.data
}