<template>
  <div class="create-chat-page">
    <div class="content-box">
      <BarsOutlined class="open-bar" @click="openSideBar()" />
      <div class="content">
        <div class="top flex">
          <img src="../assets/images/logo.png" />
          <h1 class="title">Chat Website</h1>
          <a-input-group compact>
            <a-textarea
              v-model:value="inputMessage"
              @pressEnter="sendMessage"
              :autoSize="{ minRows: 1, maxRows: 6 }"
              size="large"
              placeholder="开始新的聊天，设置一个合适的聊天名称"
            >
            </a-textarea>
            <a-button :disabled="!inputMessage.trim()" @click="sendMessage" type="primary">
              <template #icon><SendOutlined /></template>
            </a-button>
          </a-input-group>
        </div>

        <div class="robots">
          <div class="title">公共机器人</div>
          <div class="robot-list-wrap flex">
            <div
              :class="'robot-item' + (item.robotId === selectedRobotId ? ' active' : '')"
              v-for="item in publicRobots"
              :key="item.robotId"
              @click="selectedRobotId = item.robotId"
            >
              <div class="name">{{ item.robotName }}</div>
              <div class="desc">模型：{{ item.model }}</div>
              <div class="desc">{{ item.customPrompt }}</div>
            </div>
          </div>

          <div class="title">我的机器人</div>
          <div class="robot-list-wrap flex">
            <div
              :class="'robot-item' + (item.robotId === selectedRobotId ? ' active' : '')"
              v-for="item in robots"
              :key="item.robotId"
              @click="selectedRobotId = item.robotId"
            >
              <div class="name">{{ item.robotName }}</div>
              <div class="desc">模型：{{ item.model }}</div>
              <div class="desc">{{ item.customPrompt }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue'
import { SendOutlined, BarsOutlined } from '@ant-design/icons-vue'
import { getPublicRobots, getRobots } from '../api/robot'
import { message } from 'ant-design-vue'

import type { RobotInterface } from '../interface/types'
import { createChat } from '@/api/chat'

export default defineComponent({
  components: {
    SendOutlined,
    BarsOutlined
  },
  setup() {
    const openSideBar = inject('openSideBar', () => {})
    const inputMessage = ref('')

    const selectedRobotId = ref(-1)

    const publicRobots = ref<RobotInterface[]>([])
    const robots = ref<RobotInterface[]>([])

    const getRob = async () => {
      const res = await getRobots()
      const res2 = await getPublicRobots()

      if (res.success && res2.success) {
        robots.value = res.data
        publicRobots.value = res2.data
        selectedRobotId.value = publicRobots.value[0].robotId ?? robots.value[0].robotId ?? -1
      } else {
        message.error(res.message)
      }
    }

    getRob()

    const sendMessage = async (e: { shiftKey: any; preventDefault: () => void }) => {
      if (!e.shiftKey) {
        e.preventDefault()
        if (inputMessage.value.trim()) {
          if (selectedRobotId.value < 0) {
            message.warning('未选机器人')
          } else {
            let customPrompt = ''
            robots.value.forEach((item) => {
              if (item.robotId === selectedRobotId.value) {
                customPrompt = item.customPrompt
              }
            })
            const res = await createChat({
              robotId: selectedRobotId.value,
              chatName: inputMessage.value,
              customPrompt
            })

            if (res.success) {
              console.log(res)
            } else {
              message.error(res.message)
            }
          }
        }
      }
    }
    return {
      openSideBar,
      inputMessage,
      robots,
      publicRobots,
      selectedRobotId,
      sendMessage
    }
  }
})
</script>

<style lang="scss">
.create-chat-page {
  flex: 1;

  .content-box {
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    scrollbar-width: thin;

    .open-bar {
      padding-top: 12px;
      padding-left: 10px;
      display: none;
    }

    @media screen and (max-width: 768px) {
      .open-bar {
        display: inline-block;
      }
    }
  }

  .content {
    position: relative;
    max-width: 800px;
    padding: 10px;
    margin: auto;

    .top {
      max-width: 680px;
      margin: 100px auto 0;
      flex-direction: column;
      align-items: center;

      > img {
        width: 140px;
      }

      .title {
        font-weight: 700;
        margin-bottom: 40px;
        text-align: center;
      }

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

    .robots {
      margin-top: 60px;

      .title {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .robot-list-wrap {
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 16px;

        .active {
          background-color: #5d5cde !important;
          color: white;
        }

        .robot-item {
          width: 186px;
          flex-grow: 1;
          border: 1px solid #e4e7e7;
          border-radius: 6px;
          padding: 8px;
          cursor: pointer;

          &:hover {
            background-color: #f7f7f7;
          }

          .name {
            font-weight: 600;
          }

          .desc {
            font-size: 12px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
            overflow-wrap: break-word;
          }
        }
      }
    }
  }
}
</style>
