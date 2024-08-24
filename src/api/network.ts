import { getToken } from '@/utils/token'
import axios from 'axios'

export interface Response<T = any> {
  code?: string
  data: T
  message?: string
  errorMsg?: string
  success: boolean
}

const instance = axios.create({
  baseURL: 'http://localhost:8848',
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json'
  }
})

instance.interceptors.request.use((config) => {
  return config
})

instance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return error
  }
)

function request(url: string, method: string, data = {}, headers = {}): Promise<Response> {
  const token = getToken()
  return instance.request({
    url,
    method,
    data,
    headers: { Authorization: token, ...headers }
  })
}

export default request
