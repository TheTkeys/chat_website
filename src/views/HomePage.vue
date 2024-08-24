<template>
  <div class="home-page flex">
    <a-drawer
      :closable="false"
      width="auto"
      :bodyStyle="{
        padding: 0
      }"
      placement="left"
      :open="sideBarOpen"
      @close="sideBarOpen = false"
    >
      <div class="side-bar">
        <div class="side-bar-title flex">
          <img src="../assets/images/logo.png" />
          <div class="title-text">Chat Website</div>
        </div>
        <div class="side-bar-content">
          <div class="options-wrap flex">
            <div class="option" @click="toHome">
              <img src="../assets/images/new-chat.png" />
              <div class="option-bottom flex">
                新建聊天
                <PlusOutlined />
              </div>
            </div>
            <div class="option" @click="toCreateBot">
              <img src="../assets/images/new-robot.png" />
              <div class="option-bottom flex">
                创建机器人
                <PlusOutlined />
              </div>
            </div>
          </div>
          <div class="chat-wrap">
            <div
              :class="{
                'chat-item': true,
                active: selectedChatId === item.chatId
              }"
              v-for="item in chatHistoryList"
              :key="item.chatId"
              @click="toChat(item.chatId)"
            >
              <div class="top flex">
                <div>{{ item.robotName }}</div>
                <div>{{ item.createTime }}</div>
              </div>
              <div class="flex justify-between">
                {{ item.chatName }}
                <div class="delete-icon">
                  <a-popconfirm
                    title="确认删除此聊天记录吗？"
                    @click.stop
                    @confirm="deleteChat(item.chatId)"
                  >
                    <DeleteTwoTone two-tone-color="#5d5cde" />
                  </a-popconfirm>
                </div>
              </div>
              <div class="bottom" v-if="item.message.length">
                {{ item.message[item.message.length - 1].content }}
              </div>
            </div>
          </div>
        </div>
        <a-button @click="logout" class="logout" danger>退出登录</a-button>
      </div>
    </a-drawer>
    <div class="side-bar pc">
      <div class="side-bar-title flex">
        <img src="../assets/images/logo.png" />
        <div class="title-text">Chat Website</div>
      </div>
      <div class="side-bar-content">
        <div class="options-wrap flex">
          <div class="option" @click="toHome">
            <img src="../assets/images/new-chat.png" />
            <div class="option-bottom flex">
              新建聊天
              <PlusOutlined />
            </div>
          </div>
          <div class="option" @click="toCreateBot">
            <img src="../assets/images/new-robot.png" />
            <div class="option-bottom flex">
              创建机器人
              <PlusOutlined />
            </div>
          </div>
        </div>
        <div class="chat-wrap">
          <div
            :class="{
              'chat-item': true,
              active: selectedChatId === item.chatId
            }"
            v-for="item in chatHistoryList"
            :key="item.chatId"
            @click="toChat(item.chatId)"
          >
            <div class="top flex">
              <div>{{ item.robotName }}</div>
              <div>{{ item.createTime }}</div>
            </div>
            <div class="flex justify-between">
              {{ item.chatName }}
              <div class="delete-icon">
                <a-popconfirm
                  title="确认删除此聊天记录吗？"
                  @click.stop
                  @confirm="deleteChat(item.chatId)"
                >
                  <DeleteTwoTone two-tone-color="#5d5cde" />
                </a-popconfirm>
              </div>
            </div>
            <div class="bottom" v-if="item.message.length">
              {{ item.message[item.message.length - 1].content }}
            </div>
          </div>
        </div>
      </div>
      <a-button @click="logout" class="logout" danger>退出登录</a-button>
    </div>
    <RouterView />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, provide, createVNode } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, DeleteTwoTone, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { deleteToken } from '@/utils/token'
import { store } from '@/utils/store'
import { getAllChat, deleteChatById } from '@/api/chat'

import type { ChatHistory } from '../interface/types'

export default defineComponent({
  components: {
    RouterView,
    PlusOutlined,
    DeleteTwoTone
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const sideBarOpen = ref(false)

    const selectedChatId = ref<number>(Number(route.params.id) ?? -1)

    const chatHistoryList = ref<ChatHistory[]>([])

    const getAllChats = async () => {
      const res = await getAllChat()

      if (res.success) {
        console.log(res)
        chatHistoryList.value = res.data
      } else {
        message.error(res.message)
      }
    }

    getAllChats()

    const openSideBar = () => {
      sideBarOpen.value = true
    }

    provide('openSideBar', openSideBar)

    const deleteChat = async (chatId: number) => {
      const res = await deleteChatById(chatId)

      if (res.success) {
        message.success('删除成功')
        chatHistoryList.value = chatHistoryList.value.filter((item) => item.chatId !== chatId)
        router.push('/')
      } else {
        message.error(res.message)
      }
    }

    const toHome = () => {
      sideBarOpen.value = false
      selectedChatId.value = -1
      router.push('/')
    }

    const toCreateBot = () => {
      sideBarOpen.value = false
      selectedChatId.value = -1
      router.push('/create_bot')
    }

    const toChat = (id: number) => {
      sideBarOpen.value = false
      selectedChatId.value = id

      router.push({
        name: 'Chat',
        params: {
          id
        }
      })
    }

    const logout = () => {
      Modal.confirm({
        title: '您确定要退出登录吗？',
        icon: createVNode(ExclamationCircleOutlined),
        okText: '确定',
        cancelText: '取消',
        onOk() {
          deleteToken()
          store.userLogout()
          router.push({
            name: 'Login'
          })
        }
      })
    }

    return {
      sideBarOpen,
      selectedChatId,
      chatHistoryList,
      openSideBar,
      deleteChat,
      toHome,
      toCreateBot,
      toChat,
      logout
    }
  }
})
</script>

<style scoped lang="scss">
.home-page {
  width: 100%;
}
@media screen and (max-width: 768px) {
  .pc {
    display: none;
  }
}

.side-bar {
  max-width: 280px;
  height: 100vh;
  border-right: 1px solid #e4e7e7;

  .active {
    background-color: #ebecff !important;

    .delete-icon {
      display: block !important;
    }
  }

  .side-bar-title {
    height: 50px;
    align-items: center;
    padding: 0 16px;
    background-color: #f1f2f2;
    border-bottom: 1px solid #e4e7e7;

    img {
      height: 40px;
    }

    .title-text {
      font-size: 18px;
      font-weight: 700;
      margin-left: 10px;
    }
  }

  .side-bar-content {
    height: calc(100% - 102px);
    overflow-y: auto;
    scrollbar-width: thin;

    .options-wrap {
      padding: 10px;
      border-bottom: 1px solid #e4e7e7;
      justify-content: space-between;

      .option {
        background-color: #f1f2f2;
        border-radius: 8px;
        padding: 8px;
        width: 124px;
        cursor: pointer;

        &:hover {
          background-color: #ebebeb;
        }

        img {
          width: 32px;
        }

        .option-bottom {
          justify-content: space-between;
          align-items: center;
        }
      }
    }

    .chat-wrap {
      .chat-item {
        padding: 6px 10px;
        border-bottom: 1px solid #e4e7e7;
        cursor: pointer;

        .delete-icon {
          display: none;
        }

        @media screen and (max-width: 768px) {
          .delete-icon {
            display: block;
          }
        }

        &:hover {
          background-color: #f1f2f2;

          .delete-icon {
            display: block;
          }
        }

        .top {
          font-size: 12px;
          color: #5d6565;
          justify-content: space-between;
        }

        .bottom {
          font-size: 12px;
          color: #5d6565;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .logout {
    margin: 10px;
    width: 259px;
    padding: 0;
  }
}
</style>
