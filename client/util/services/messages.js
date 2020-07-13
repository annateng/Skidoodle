import axios from 'axios'

const basePath = '/api/games'

export const sendDrawing = async () => {
  

export const postMessage = async (message) => {
  const response = await axios.post(basePath, { message })
  return response.data
}

export const deleteMessage = async (message) => {
  const response = await axios.delete(`${basePath}/${message.id}`)
  return response.data
}
