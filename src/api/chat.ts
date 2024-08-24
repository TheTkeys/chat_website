import type { CreateChatFormInterface, SendMessageFormInterface } from '@/interface/types'
import request from './network'

export function getAllChat() {
  return request('/chat/all', 'GET')
}

export function getChatDetail(chatId: number) {
  return request(`/chat?chatId=${chatId}`, 'GET')
}

export function createChat(createChatForm: CreateChatFormInterface) {
  return request('/chat', 'POST', createChatForm)
}

export function deleteChatById(chatId: number) {
  return request(`/chat?chatId=${chatId}`, 'DELETE')
}

export function sendChatMessage(message: SendMessageFormInterface) {
  return fetch('http://localhost:8848/chat', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })
}
