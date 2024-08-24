import { createRouter, createWebHistory } from 'vue-router'
import { store } from '../utils/store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomePage.vue'),
      children: [
        {
          path: 'chat/:id',
          name: 'Chat',
          component: () => import('../components/ChatDetail.vue')
        },
        {
          path: 'create_bot',
          name: 'CreateBot',
          component: () => import('../components/CreateBot.vue')
        },
        {
          path: 'create_chat',
          name: 'CreateChat',
          alias: '/',
          component: () => import('../components/CreateChat.vue')
        }
      ],
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginPage.vue')
    }
  ]
})

router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !store.auth.isLogin) {
    return {
      path: '/login'
    }
  }

  console.log(to.path, from.path, store.auth.isLogin)
  if (to.name === 'Login' && store.auth.isLogin) {
    return from
  }
})

export default router
