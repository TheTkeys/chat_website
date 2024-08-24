/**
 * 存储的用户信息
 */
export interface UserInterface {
  userId: number
  username: string
  email: string
}

/**
 * 注册时提交的表单类型
 */
export interface RegisterFormInterface {
  username: string
  email: string
  password: string
  code: string
}

/**
 * 注册时提交的表单类型
 */
export interface LoginFormInterface {
  email: string
  password?: string
  code?: string
}

/**
 * 机器人
 */
export interface RobotInterface {
  robotId: number
  robotName: string
  model: string
  customPrompt: string
}

/**
 * 创建机器人时提交的表单类型
 */
export interface RobotFormInterface {
  robotName: string
  model: string
  customPrompt: string
}

/**
 * 创建聊天时提交的表单类型
 */
export interface CreateChatFormInterface {
  robotId: number
  chatName: string
  customPrompt: string
}

/**
 * 聊天数据类型
 */
export interface ChatHistory {
  chatId: number
  chatName: string
  chatHistory?: string
  message: MessageInterface[]
  robotId?: number
  robotName: string
  model?: string
  customPrompt?: string
  createTime?: string
}

export interface MessageInterface {
  role: string
  content: string
}

export interface SendMessageFormInterface {
  chatId: number
  chatHistory: MessageInterface
}
