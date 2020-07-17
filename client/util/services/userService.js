import axios from 'axios'
const basePath = '/api/users'

let token

export const setToken = authToken => {
  token = `bearer ${authToken}`
}

export const getActiveGames = async userId => {
  const config = { 
    headers: { Authorization: token },
  }
  
  const res = await axios.get(`${basePath}/${userId}/active-games`, config)
  return res.data
}

export const getUserData = async userId => {
  const config = { 
    headers: { Authorization: token },
  }

  const res = await axios.get(`${basePath}/${userId}`, config)
  return res.data
}