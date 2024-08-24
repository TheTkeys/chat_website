import { reactive } from 'vue'
import type { UserInterface } from '../interface/types'

export const store = reactive({
  auth: {
    userInfo: {} as UserInterface,
    isLogin: false
  },
  userLogin(userInfo: UserInterface) {
    this.auth.userInfo = { ...userInfo }
    this.auth.isLogin = true
  },
  userLogout() {
    this.auth.isLogin = false
  }
})
