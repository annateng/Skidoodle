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

export const getNotifications = async userId => {
  const config = { 
    headers: { Authorization: token },
  }

  const res = await axios.get(`${basePath}/${userId}/notifications`, config)
  return res.data
}

export const acceptGameRequest = async (userId, gameRequestId) => {
  const config = { 
    headers: { Authorization: token },
    params: { action: 'accept' }
  }

  const res = await axios.post(`${basePath}/${userId}/game-requests/${gameRequestId}`, null, config)
  return res.data
}

export const rejectGameRequest = async (userId, gameRequestId) => {
  const config = { 
    headers: { Authorization: token },
    params: { action: 'reject' }
  }

  const res = await axios.post(`${basePath}/${userId}/game-requests/${gameRequestId}`, null, config)
  return res.data
}

export const signUpUser = async userData => {
  try {
    const res = await axios.post(`${basePath}`, userData)
    return res.data
  } catch (e) {
    throw new Error(`status ${e.response.status}: ${e.response.data.error}`)
  }
}

export const searchForUsers = async (userId, queryString) => {
  const config = {
    params: { search: queryString, requesterId: userId }
  }

  const res = await axios.get(`${basePath}/search`, config)
  return res.data
}

export const addFriend = async (requesterId, receiverId) => {
  const config = {
    headers: { Authorization: token },
    params: { requesterId }
  }

  const res = await axios.post(`${basePath}/${receiverId}/friend-requests`, null, config)
  return res.data
}

export const acceptFriendRequest = async (userId, frId) => {
  const config = {
    headers: { Authorization: token },
    params: { action: 'accept' }
  }

  const res = await axios.post(`${basePath}/${userId}/friend-requests/${frId}`, null, config)
  return res.data
}

export const rejectFriendRequest = async (userId, frId) => {
  const config = {
    headers: { Authorization: token },
    params: { action: 'reject' }
  }

  const res = await axios.post(`${basePath}/${userId}/friend-requests/${frId}`, null, config)
  return res.data
}
