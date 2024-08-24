<template>
  <div class="create-bot-page">
    <div class="top-bar flex">
      <BarsOutlined class="open-bar" @click="openSideBar()" />
      <div class="bar-title">创建机器人</div>
    </div>
    <div class="content-box">
      <div class="content">
        <a-form :model="robotForm" layout="vertical" @finish="createBot">
          <div class="title">基础</div>
          <a-form-item
            label="名称"
            name="robotName"
            :rules="[{ required: true, message: '请输入机器人名称' }]"
          >
            <a-input v-model:value="robotForm.robotName" />
          </a-form-item>
          <a-divider />
          <div class="title">高级</div>
          <a-form-item label="模型" name="model">
            <div class="tip">为你的机器人选择一个模型</div>
            <a-select v-model:value="robotForm.model" :options="modelOptions"> </a-select>
          </a-form-item>
          <a-form-item label="提示词" name="customPrompt">
            <div class="tip">
              设定您的机器人的行为并告知它们如何回应用户信息。请尽可能具体说明。
            </div>
            <a-textarea
              placeholder="例如：“你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。Moonshot AI 为专有名词，不可翻译成其他语言。”"
              :autoSize="{ minRows: 3, maxRows: 8 }"
              v-model:value="robotForm.customPrompt"
            />
          </a-form-item>
          <a-button class="create-button" :loading="createLoading" type="primary" html-type="submit"
            >创建机器人</a-button
          >
        </a-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { message, type SelectProps } from 'ant-design-vue'
import { BarsOutlined } from '@ant-design/icons-vue'
import { createRobot } from '../api/robot'
import type { RobotFormInterface } from '@/interface/types'

export default defineComponent({
  components: {
    BarsOutlined
  },
  setup() {
    const router = useRouter()
    const openSideBar = inject<Function>('openSideBar', () => {})
    const createLoading = ref(false)
    const robotForm = reactive<RobotFormInterface>({
      robotName: '',
      model: 'moonshot-v1-8k',
      customPrompt: ''
    })

    const modelOptions = ref<SelectProps['options']>([
      {
        value: 'moonshot-v1-8k',
        label: 'moonshot-v1-8k'
      },
      {
        value: 'moonshot-v1-32k',
        label: 'moonshot-v1-32k'
      },
      {
        value: 'moonshot-v1-128k',
        label: 'moonshot-v1-128k'
      }
    ])

    const createBot = async () => {
      createLoading.value = true
      const res = await createRobot(robotForm)
      createLoading.value = false
      console.log(123)
      if (res.success) {
        console.log(res)
        message.success('创建成功')
        // setTimeout(() => {
        //   router.push({
        //     path: '/',
        //     query: {
        //       robotId:
        //     }
        //   })
        // }, 2000)
      } else {
        message.error(res.message)
      }
    }

    return {
      openSideBar,
      createLoading,
      robotForm,
      modelOptions,
      createBot
    }
  }
})
</script>

<style scoped lang="scss">
.create-bot-page {
  flex: 1;

  .top-bar {
    height: 50px;
    background-color: #f1f2f2;
    border-bottom: 1px solid #e4e7e7;
    align-items: center;
    justify-content: space-between;

    .bar-title {
      font-weight: 900;
      font-size: 18px;
      flex: 1;
      text-align: center;
      margin-right: 25px;
    }

    .open-bar {
      padding-left: 10px;
      display: none;
    }

    @media screen and (max-width: 768px) {
      .open-bar {
        display: block;
      }
    }
  }

  .content-box {
    width: 100%;
    height: calc(100vh - 50px);
    overflow-y: auto;
    scrollbar-width: thin;
  }

  .content {
    position: relative;
    max-width: 800px;
    padding: 10px;
    margin: auto;

    .title {
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 12px;
    }

    .tip {
      color: #707070;
      font-size: 12px;
      margin-bottom: 4px;
    }

    .create-button {
      width: 100%;
      position: sticky;
      bottom: 0;
      margin-bottom: 20px;
    }
  }
}
</style>
