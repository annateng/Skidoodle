import axios from 'axios'
const basePath = '/api/login'

export const login = async loginInfo => {
  const res = await axios.post(basePath, loginInfo)
  return res.data
}