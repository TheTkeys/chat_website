import request from './network'
import type { LoginFormInterface, RegisterFormInterface } from '../interface/types'

/**
 * 发送注册验证码
 * @param email 邮箱
 */
export function sendRegisterCode(email: string) {
  return request('/user/code?email=' + email, 'POST')
}

/**
 * 发送登录验证码
 * @param email 邮箱
 */
export function sendLoginCode(email: string) {
  return request('/user/passwordCode?email=' + email, 'POST')
}

/**
 * 用户注册
 * @param registerForm 注册信息：用户名，邮箱，密码，验证码
 */
export function register(registerForm: RegisterFormInterface) {
  return request('/user/register', 'POST', registerForm)
}

/**
 * 用户登陆
 * @param loginForm 登陆信息：用户名，邮箱或验证码
 */
export function login(loginForm: LoginFormInterface) {
  return request('/user/login', 'POST', loginForm)
}

export function getUserInfo() {
  return request('/user', 'GET')
}
