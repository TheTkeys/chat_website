<template>
  <div class="chat-detail-page">
    <a-spin :spinning="pageLoading">
      <div class="top-bar flex">
        <BarsOutlined class="open-bar" @click="openSideBar()" />
        <div class="top-bar-info flex">
          <div class="chat-name">{{ chatDetailArr[currentIndex]?.chatDetail.chatName }}</div>
          <div class="bot-name">{{ chatDetailArr[currentIndex]?.chatDetail.robotName }}</div>
        </div>
      </div>
      <div class="content-box" ref="scrollableDiv">
        <div v-if="chatDetailArr[currentIndex]" class="content">
          <div v-for="(item, index) in chatDetailArr[currentIndex].chatDetail.message" :key="index">
            <div v-if="item.role === 'assistant'" class="bot">
              {{ chatDetailArr[currentIndex].chatDetail.robotName }}
            </div>
            <v-md-preview v-if="item.role === 'assistant'" :text="item.content"></v-md-preview>
            <div v-if="item.role === 'user'" class="user-message">
              <div>
                {{ item.content }}
              </div>
            </div>
          </div>
          <div v-if="!chatDetailArr[currentIndex].canSend" class="user-message">
            <div>
              {{ chatDetailArr[currentIndex].tempMessage.userContent }}
            </div>
          </div>
          <div v-if="!chatDetailArr[currentIndex].canSend" class="bot">
            {{ chatDetailArr[currentIndex].chatDetail.robotName }}
          </div>
          <v-md-preview
            v-if="!chatDetailArr[currentIndex].canSend"
            :text="chatDetailArr[currentIndex].tempMessage.assistantContent"
          ></v-md-preview>
        </div>
      </div>

      <div class="send">
        <a-input-group compact>
          <a-textarea
            v-model:value="inputMessage"
            @pressEnter="sendMessage"
            :autoSize="{ minRows: 1, maxRows: 1 }"
            size="large"
            placeholder="发送聊天信息"
          >
          </a-textarea>
          <a-button
            :disabled="!inputMessage.trim() || !chatDetailArr[currentIndex].canSend"
            @click="sendMessage"
            type="primary"
          >
            <template #icon><SendOutlined /></template>
          </a-button>
        </a-input-group>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, nextTick } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { BarsOutlined, SendOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { getChatDetail, sendChatMessage } from '../api/chat'
import type { ChatHistory } from '@/interface/types'

export default defineComponent({
  components: {
    BarsOutlined,
    SendOutlined
  },
  setup() {
    const route = useRoute()
    const scrollableDiv = ref<HTMLDivElement | null>(null)
    const chatId = ref(Number(route.params.id))
    const openSideBar = inject<Function>('openSideBar', () => {})
    const pageLoading = ref(true)
    const inputMessage = ref('')
    const chatDetailArr = ref(
      [] as {
        canSend: boolean
        tempContent: string
        chatDetail: ChatHistory
        tempMessage: {
          userContent: string
          assistantContent: string
        }
        isMessageEnd: boolean
      }[]
    )
    const currentIndex = ref(-1)

    onBeforeRouteUpdate(async (to, from) => {
      if (to.params.id !== from.params.id) {
        chatId.value = Number(to.params.id)
        getChat()
      }
    })

    let re = 0
    const getChat = async () => {
      pageLoading.value = true
      re++
      const res = await getChatDetail(chatId.value)
      if (res.success) {
        if (
          !chatDetailArr.value.some((item, index) => {
            if (item.chatDetail.chatId === chatId.value) {
              currentIndex.value = index
              chatDetailArr.value[index].chatDetail = res.data
              return true
            }
          })
        ) {
          currentIndex.value = chatDetailArr.value.length
          chatDetailArr.value.push({
            canSend: true,
            tempContent: '',
            chatDetail: res.data,
            tempMessage: {
              userContent: '',
              assistantContent: ''
            },
            isMessageEnd: true
          })
        }
        nextTick(() => {
          scrollToBottom()
        })
      } else {
        message.error(res.message)
      }
      re--
      if (re === 0) {
        pageLoading.value = false
      }
    }

    getChat()

    const sendMessage = async (e: { shiftKey: any; preventDefault: () => void }) => {
      if (!e.shiftKey) {
        e.preventDefault()

        const _inputMessage = inputMessage.value
        inputMessage.value = ''

        const index = currentIndex.value
        const chatDetailInfo = chatDetailArr.value[index]

        if (_inputMessage.trim() && chatDetailInfo.canSend) {
          chatDetailInfo.isMessageEnd = false
          chatDetailInfo.canSend = false
          chatDetailInfo.tempMessage.userContent = _inputMessage

          nextTick(() => scrollToBottom())

          const res = await sendChatMessage({
            chatId: chatId.value,
            chatHistory: {
              role: 'user',
              content: _inputMessage
            }
          })

          const timer = setInterval(() => {
            const length = chatDetailInfo.tempMessage.assistantContent.length
            if (chatDetailInfo.isMessageEnd && chatDetailInfo.tempContent.length === length) {
              chatDetailInfo.tempContent = ''
              chatDetailInfo.canSend = true
              chatDetailInfo.chatDetail.message.push({
                role: 'user',
                content: chatDetailInfo.tempMessage.userContent
              })
              if (chatDetailInfo.tempMessage.assistantContent) {
                chatDetailInfo.chatDetail.message.push({
                  role: 'assistant',
                  content: chatDetailInfo.tempMessage.assistantContent
                })
              }
              chatDetailInfo.tempMessage = {
                userContent: '',
                assistantContent: ''
              }
              scrollToBottom(false)
              clearInterval(timer)
            }
            if (chatDetailInfo.tempContent.length > length) {
              chatDetailInfo.tempMessage.assistantContent += chatDetailInfo.tempContent[length]
            }
          }, 20)

          const reader = res.body?.getReader?.()

          try {
            if (reader) {
              // eslint-disable-next-line no-constant-condition
              while (true) {
                const { done, value } = await reader.read()

                const decoder = new TextDecoder('utf-8')
                if (done) {
                  break
                }

                const decodedString = decoder.decode(value).replace(/data:/g, '')
                decodedString.split('\n').forEach((item) => {
                  if (item) {
                    chatDetailInfo.tempContent += JSON.parse(item).choices[0].delta.content
                    scrollToBottom(false)
                  }
                })
              }
            }
          } catch (e) {
            message.error('服务器错误，请稍后再试')
          }
          chatDetailInfo.isMessageEnd = true
        }
      }
    }

    const scrollToBottom = (isAlways = true) => {
      if (scrollableDiv.value) {
        if (isAlways || scrollableDiv.value.scrollTop + 1000 >= scrollableDiv.value.scrollHeight) {
          scrollableDiv.value.scrollTop = scrollableDiv.value.scrollHeight
        }
      }
    }

    return {
      openSideBar,
      scrollableDiv,
      chatId,
      pageLoading,
      inputMessage,
      sendMessage,
      chatDetailArr,
      currentIndex
    }
  }
})
</script>

<style lang="scss">
.chat-detail-page {
  flex: 1;

  .top-bar {
    height: 50px;
    background-color: #f1f2f2;
    border-bottom: 1px solid #e4e7e7;
    align-items: center;

    .open-bar {
      padding-left: 10px;
      display: none;
    }

    @media screen and (max-width: 768px) {
      .open-bar {
        display: block;
      }
    }

    .top-bar-info {
      padding: 0 20px;
      flex-direction: column;
      justify-content: center;
    }

    .chat-name {
      font-weight: 800;
    }

    .bot-name {
      font-size: 12px;
      color: #5d6565;
    }
  }

  .content-box {
    width: 100%;
    height: calc(100vh - 50px - 71px);
    overflow-y: auto;
    scrollbar-width: thin;
  }

  .content {
    position: relative;
    max-width: 800px;
    padding: 10px;
    margin: auto;

    .bot {
      margin-bottom: 4px;
    }

    .user-message {
      display: flex;
      justify-content: end;

      div {
        padding: 8px 16px;
        background-color: #5d5cde;
        border-radius: 8px;
        margin-bottom: 12px;
        color: white;
        font-size: 16px;
      }
    }

    .v-md-editor-preview {
      display: flex;
    }

    .vuepress-markdown-body {
      flex: 1;
      padding: 8px 16px;
      background-color: #f7f7f7;
      border-radius: 8px;
      margin-bottom: 12px;
      max-width: 100%;
      position: relative;

      .v-md-pre-wrapper {
        width: 100%;
        margin: 0;
      }

      p {
        word-wrap: break-word;
      }

      code {
        white-space: pre-wrap !important;
        word-break: break-word !important;
      }
    }
  }

  .send {
    width: 100%;
    max-width: 800px;
    margin: auto;
    padding: 10px 10px 20px;
    box-sizing: border-box;

    .ant-input {
      padding-left: 14px;
      width: calc(100% - 50px);
      border-start-start-radius: 20px;
      border-end-start-radius: 20px;
    }

    .ant-btn {
      height: 40px;
      width: 50px;
      border-start-end-radius: 20px;
      border-end-end-radius: 20px;

      &:disabled {
        color: white;
        border-color: #acaceb;
        background-color: #acaceb;
      }
    }
  }
}
</style>
