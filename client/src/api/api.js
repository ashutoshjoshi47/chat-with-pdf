import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

export async function uploadPdfAndAsk(file, question) {
  const formData = new FormData()
  formData.append('pdf', file)
  formData.append('question', question)

  const res = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}

export default api
