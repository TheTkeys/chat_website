<template>
  <div class="login-page flex">
    <div class="background">
      <div></div>
    </div>
    <div class="login-window">
      <div class="login-top">
        <div class="text-content flex">
          <div class="h1">Welcome</div>
          <div class="text">Chat Website</div>
        </div>
      </div>
      <div class="login-content">
        <img src="../assets/images/logo.png" />
        <a-form v-if="loginMode" :model="loginForm" style="height: 100%" @finish="onLogin">
          <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" />
          <div style="height: calc(100% - 46px)" class="flex justify-between align-center">
            <div class="left flex">
              <a-form-item name="email" :rules="[{ required: true, message: '请输入邮箱!' }]">
                <a-input v-model:value="loginForm.email" placeholder="邮箱" />
              </a-form-item>
              <a-form-item
                v-if="current[0] === 'password'"
                name="password"
                :rules="[{ required: true, message: '请输入密码!' }]"
              >
                <a-input v-model:value="loginForm.password" placeholder="密码" type="password" />
              </a-form-item>
              <a-form-item
                v-else
                name="code"
                :rules="[{ required: true, message: '请输入验证码!' }]"
              >
                <a-input-group compact>
                  <a-input
                    v-model:value="loginForm.code"
                    placeholder="验证码"
                    style="width: calc(100% - 120px)"
                  />
                  <a-button
                    @click="onSendLoginCode"
                    :loading="loginCodeLoading"
                    :disabled="loginCodeButton !== '发送验证码'"
                    >{{ loginCodeButton }}</a-button
                  >
                </a-input-group>
              </a-form-item>
            </div>
            <div class="right flex">
              <a-button class="login-button" type="primary" html-type="submit">Log in</a-button>
              <a-button @click="loginMode = false" class="link" type="link"
                >还没有账号？去注册</a-button
              >
            </div>
          </div>
        </a-form>
        <a-form v-else :model="registerForm" style="height: 100%" @finish="onRegister">
          <div style="height: 100%" class="flex justify-between align-center">
            <div class="left flex">
              <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名!' }]">
                <a-input v-model:value="registerForm.username" placeholder="用户名" />
              </a-form-item>
              <a-form-item name="email" :rules="[{ required: true, message: '请输入邮箱!' }]">
                <a-input v-model:value="registerForm.email" placeholder="邮箱" />
              </a-form-item>
              <a-form-item name="password" :rules="[{ required: true, message: '请输入密码!' }]">
                <a-input v-model:value="registerForm.password" placeholder="密码" type="password" />
              </a-form-item>
              <a-form-item name="code" :rules="[{ required: true, message: '请输入验证码!' }]">
                <a-input-group compact>
                  <a-input
                    v-model:value="registerForm.code"
                    placeholder="验证码"
                    style="width: calc(100% - 120px)"
                  />
                  <a-button
                    @click="onSendRegisterCode"
                    :loading="registerCodeLoading"
                    :disabled="registerCodeButton !== '发送验证码'"
                    >{{ registerCodeButton }}</a-button
                  >
                </a-input-group>
              </a-form-item>
            </div>
            <div class="right flex">
              <a-button class="login-button" type="primary" html-type="submit">Register</a-button>
              <a-button @click="loginMode = true" class="link" type="link"
                >已有账号？去登录</a-button
              >
            </div>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, type MenuProps } from 'ant-design-vue'
import type { RegisterFormInterface } from '../interface/types'

import { sendRegisterCode, sendLoginCode, register, login, getUserInfo } from '../api/user'

import { store } from '@/utils/store'
import { setToken } from '@/utils/token'

export default defineComponent({
  setup() {
    const router = useRouter()
    const loginForm = reactive({
      email: '',
      code: '',
      password: ''
    })
    const registerForm = reactive<RegisterFormInterface>({
      username: '',
      email: '',
      code: '',
      password: ''
    })
    const loginMode = ref(true)
    const current = ref<string[]>(['code'])
    const items = ref<MenuProps['items']>([
      {
        key: 'code',
        title: '验证码登录',
        label: '验证码登录'
      },
      {
        key: 'password',
        title: '密码登录',
        label: '密码登录'
      }
    ])
    const loginCodeButton = ref('发送验证码')
    const loginCodeLoading = ref(false)

    const registerCodeButton = ref('发送验证码')
    const registerCodeLoading = ref(false)

    // 发送登录验证码
    const onSendLoginCode = async () => {
      loginCodeLoading.value = true
      const res = await sendLoginCode(loginForm.email)
      loginCodeLoading.value = false
      if (res?.success) {
        message.success('验证码发送成功')

        let countDown = 60
        loginCodeButton.value = '60s后再发'
        const timer = setInterval(() => {
          loginCodeButton.value = --countDown + 's后再发'
          if (countDown === 0) {
            loginCodeButton.value = '发送验证码'
            clearInterval(timer)
          }
        }, 1000)
      } else {
        message.error(res.message)
      }
    }

    // 发送注册验证码
    const onSendRegisterCode = async () => {
      registerCodeLoading.value = true
      const res = await sendRegisterCode(registerForm.email)
      registerCodeLoading.value = false
      if (res.success) {
        message.success('验证码发送成功')

        let countDown = 60
        registerCodeButton.value = '60s后再发'
        const timer = setInterval(() => {
          registerCodeButton.value = --countDown + 's后再发'
          if (countDown === 0) {
            registerCodeButton.value = '发送验证码'
            clearInterval(timer)
          }
        }, 1000)
      } else {
        message.error(res.message)
      }
    }

    // 用户登录
    const onLogin = async () => {
      const res = await login(
        current.value[0] === 'code'
          ? {
              email: loginForm.email,
              code: loginForm.code
            }
          : {
              email: loginForm.email,
              password: loginForm.password
            }
      )

      if (res.success) {
        console.log(res)
        setToken(res.data)
        const resInfo = await getUserInfo()
        if (resInfo.success) {
          store.userLogin(resInfo.data)
          router.push('/')
        } else {
          message.error(resInfo.message)
        }
      } else {
        message.error(res.message)
      }
    }

    // 用户注册
    const onRegister = async () => {
      const res = await register(registerForm)

      if (res.success) {
        message.success('注册成功！')

        // 将数据填入到登录表单，方便用户登录
        loginForm.email = registerForm.email
        loginForm.password = registerForm.password
        current.value[0] = 'password'

        setTimeout(() => (loginMode.value = true), 1000)
      } else {
        message.error(res.message)
      }
    }
    return {
      loginForm,
      registerForm,
      loginMode,
      current,
      items,
      loginCodeButton,
      loginCodeLoading,
      registerCodeButton,
      registerCodeLoading,
      onSendLoginCode,
      onSendRegisterCode,
      onLogin,
      onRegister
    }
  }
})
</script>

<style lang="scss">
.login-page {
  height: 100vh;
  justify-content: center;
  align-items: center;
  margin: 0 20px;

  .background {
    background-image: url('../assets/images/login-background.jpg');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    background-attachment: fixed;
    background-origin: border-box;
    background-clip: border-box;
    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;

    div {
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        hsla(0, 0%, 100%, 0.5) 60%,
        #fff 90%,
        #fff 100%
      );
    }
  }

  .login-window {
    position: relative;
    width: 100%;
    max-width: 500px;
    height: 500px;
    background-color: white;
    z-index: 1;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);

    &:hover {
      box-shadow: 0px 12px 32px 0px rgba(0, 0, 0, 0.3);
    }

    .login-top {
      background-image: url('../assets/images/login.jpg');
      background-repeat: no-repeat;
      background-size: cover;
      width: 100%;
      height: 60%;
      color: white;

      .text-content {
        height: 100%;
        padding-top: 50px;
        align-items: center;
        flex-direction: column;

        .h1 {
          font-size: 60px;
          font-weight: 600;
        }

        .text {
          font-size: 28px;
        }
      }
    }

    .login-content {
      position: absolute;
      bottom: 0;
      min-height: 200px;
      width: 100%;
      background-color: white;
      border-radius: 12px;
      overflow: hidden;

      img {
        height: 32px;
        margin: 8px;
        position: absolute;
        right: 0;
      }

      .left {
        width: 50%;
        margin-left: 20px;
        padding-top: 20px;
        flex-direction: column;
        justify-content: center;

        .ant-btn {
          padding: 0;
          width: 120px;
        }
      }

      .right {
        width: 40%;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        gap: 10px;

        .login-button {
          width: 80%;
          height: 40px;
          border-radius: 4px;
          padding: 0;
        }

        .link {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
