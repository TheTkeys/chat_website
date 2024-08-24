<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#5d5cde'
      }
    }"
  >
    <RouterView />
  </a-config-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { getUserInfo } from './api/user'
import { getAllRobots } from './api/robot'
import { store } from './utils/store'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    // getAllRobots()
    const route = useRoute()
    const router = useRouter()
    async function login() {
      const res = await getUserInfo()
      if (res.success && res.data) {
        store.userLogin(res.data)
        router.push('/')
      } else {
        store.userLogout()
      }
    }

    login()
    return {}
  }
})
</script>

<style scoped></style>
