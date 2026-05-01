<template>
  <div class="chat-content-container">
    <!-- 头部 -->
    <!--<header class="chat-header">
      <div class="header-left">
        <div v-if="agentInfo" class="agent-avatar">
          <el-icon><component :is="agentInfo.iconUrl || 'MagicStick'" /></el-icon>
        </div>
        <div v-else class="agent-avatar default-avatar">
          <el-icon><Cpu /></el-icon>
        </div>
        <h2 class="header-title">
          {{ agentId ? (agentInfo?.title || '正在加载智能体...') : (activeSession?.topic || '通用智能问答') }}
        </h2>
      </div>
      <div class="header-right">
        <el-dropdown>
          <el-button type="text" class="header-action">
            <el-icon><More /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="updateSessionTopic">
                <el-icon><Edit /></el-icon>
                <span>修改标题</span>
              </el-dropdown-item>
              <el-dropdown-item @click="deleteSession" type="danger">
                <el-icon><Delete /></el-icon>
                <span>删除会话</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>-->

    <!-- 消息区域 -->
    <div class="chat-message-wrap" ref="msgContainer">
      <!-- 测试数据按钮 -->
      <!--<div v-if="!useTestData && messages.length === 0" style="position: absolute; top: 10px; right: 10px; z-index: 100;">
        <el-button type="primary" size="small" @click="loadTestData">加载200条测试对话</el-button>
      </div>-->
      <div v-if="agentId && messages.length === 0" class="welcome-card">
        <div class="welcome-icon">
          <el-icon><component :is="agentInfo?.iconUrl || 'MagicStick'" /></el-icon>
        </div>
        <h1 class="welcome-title">{{ agentInfo?.title }}</h1>
        <p class="welcome-desc">{{ agentInfo?.description || '暂无详细介绍' }}</p>
        <div class="welcome-msg">
          {{ agentInfo?.welcomeMsg || '您好！我是您的专属辅教助手。' }}
        </div>
      </div>

      <div v-if="showMessages.length === 0" class="empty-chat-tip">
        <el-icon :size="80" class="empty-icon"><ChatDotSquare /></el-icon>
        <p class="empty-text">输入您想问的任何教育问题</p>
      </div>

      <!-- 有消息时显示对话 -->
      <div v-else v-for="(msg, idx) in showMessages" :key="idx" class="chat-message-row" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
        <div class="chat-message-box" :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
          <div class="chat-avatar" :class="msg.role === 'user' ? 'user-avatar' : 'assistant-avatar'">
            <el-icon class="icon" v-if="msg.role === 'user'"><User /></el-icon>
            <el-icon class="icon" v-else><Monitor /></el-icon>
          </div>
          <div class="chat-bubble" :class="msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'">
            <pre class="message-content">{{ msg.content }}</pre>
          </div>
        </div>
      </div>

      <div v-if="isStreaming" class="streaming-box">
        <div class="stream-avatar">
          <el-icon><Monitor /></el-icon>
        </div>
        <el-tag type="info" class="stream-text">正在为您生成最优教学建议...</el-tag>
      </div>
    </div>

    <!-- 底部输入 -->
    <footer class="chat-input-footer">
      <div class="box-wrap" :class="{ focused: isFocused }">
        <div class="textarea-wrap">
          <div class="flex-col" style="width: 100%;">
            <!-- 附件卡片显示 -->
            <div v-if="attachments.length > 0" class="attachments-wrapper">
              <div v-for="(item, index) in attachments" :key="index" class="attachment-card">
                <span class="attachment-icon">{{ getAttachmentIcon(item.type) }}</span>
                <span class="attachment-name">{{ item.name || '附件' }}</span>
                <span class="attachment-remove" @click="removeAttachment(index)">×</span>
              </div>
            </div>

            <!-- 文字输入区 -->
            <el-input
              v-model="inputVal"
              type="textarea"
              :rows="2"
              placeholder="输入您的问题或指令，按 Enter 发送。"
              class="chat-textarea"
              @focus="isFocused = true"
              @blur="isFocused = false"
              @keydown.enter.prevent="handleSend"
            />
          </div>
        </div>

        <!-- 底部按钮组 -->
        <div class="btn-group-bottom">
          <button class="icon-btn" @click="handleFileUpload">
            <div class="icon-inner">
              <img src="@/images/chatinit-link.png" alt="上传附件" />
            </div>
            <div class="tooltip">
              <span class="tooltip-text">上传附件</span>
            </div>
          </button>
          <div v-if="isRecording" class="icon-btn recording-btn" @click="stopRecording">
            <div class="icon-inner recording-indicator"></div>
          </div>
          <el-dropdown v-else trigger="click" @command="handleAudioCommand">
            <button class="icon-btn">
              <div class="icon-inner">
                <img src="@/images/chatinit-vedio.png" alt="音频" />
              </div>
              <div class="tooltip">
                <span class="tooltip-text">音频</span>
              </div>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="record">
                  <span>录音</span>
                </el-dropdown-item>
                <el-dropdown-item command="upload">
                  <span>上传音频</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <button class="icon-btn" @click="handleImageClick">
            <div class="icon-inner">
              <img src="@/images/chatinit-img.png" alt="图片" />
            </div>
            <div class="tooltip">
              <span class="tooltip-text">图片</span>
            </div>
          </button>
        </div>

        <!-- 右下角底部栏 -->
        <div class="bottom-right-bar">
          <span class="hint-text">Enter 发送 / Shift+Enter 换行</span>
          <button
            class="send-btn"
            :disabled="!inputVal.trim() || isStreaming"
            @click="handleSend"
          >
            <img src="@/images/chat_sendmsg.png" alt="发送" class="send-icon" />
          </button>
        </div>
      </div>
      
      <!-- 提示文字 -->
      <div class="hint-container">
        <span class="hint-text-bottom">AI生成的内容可能存在错误，请注意甄别核实。</span>
      </div>
    </footer>

    <!-- 修改会话标题弹窗 -->
    <el-dialog
      v-model="showUpdateTopicDialog"
      title="修改会话标题"
      width="400px"
    >
      <el-input v-model="newTopic" placeholder="请输入新的会话标题" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUpdateTopicDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdateTopic">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { Cpu, User, Monitor, MagicStick, ChatDotSquare, More, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { sessionApi } from '../../api/api'
import { useAttachment } from '@/hooks/useAttachment'
import { largeChatData } from '@/mock/large-chat-data'

const props = defineProps({
  agentId: {
    type: Number,
    default: null
  },
  agentInfo: {
    type: Object,
    default: null
  },
  activeSession: {
    type: Object,
    default: null
  },
  commonPrompts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['sendMessage', 'refreshSessions'])

const inputVal = ref('')
const messages = ref([])
const isStreaming = ref(false)
const msgContainer = ref(null)
const showUpdateTopicDialog = ref(false)
const newTopic = ref('')
const isFocused = ref(false)
const useTestData = ref(false) // 测试数据开关

const { attachments, isRecording, uploadImage, uploadAudioFile, uploadFile, startRecording, stopRecording, removeAttachment, getAttachmentIcon } = useAttachment()

const handleFileUpload = () => {
  uploadFile()
}

const handleAudioCommand = (command) => {
  if (command === 'record') {
    if (isRecording.value) {
      stopRecording()
    } else {
      startRecording()
    }
  } else if (command === 'upload') {
    uploadAudioFile()
  }
}

const handleImageClick = () => {
  uploadImage()
}

// 计算显示的消息
const showMessages = computed(() => {
  return messages.value || []
})

// 加载会话历史
const loadSessionHistory = async () => {
  if (props.activeSession?.id) {
    try {
      const data = await sessionApi.getSessionHistory(props.activeSession.id)
      if (data.success) {
        messages.value = data.data || []
      } else {
        ElMessage.error('加载会话历史失败')
      }
    } catch (error) {
      console.error('加载会话历史失败:', error)
    }
  }
}

// 发送消息
const handleSend = async () => {
  if (!inputVal.value.trim() || !props.activeSession?.id) return
  
  const content = inputVal.value.trim()
  inputVal.value = ''
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content
  })
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
  
  isStreaming.value = true

  try {
    const response = await sessionApi.sendMessage(props.activeSession.id, content)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let assistantContent = ''

    // 流式接收数据
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6).trim()
          if (dataStr === '[DONE]') break

          try {
            const data = JSON.parse(dataStr)
            if (data.choices && data.choices[0]?.delta?.content) {
              assistantContent += data.choices[0].delta.content
            }
          } catch (e) {
            console.error('解析SSE数据失败:', e)
          }
        }
      }
    }

    // 添加助手消息
    messages.value.push({
      role: 'assistant',
      content: assistantContent
    })

    // 流结束后刷新会话列表（更新标题），符合API文档推荐的调用顺序
    emit('refreshSessions')
  } catch (error) {
    console.error('发送消息失败:', error)
  } finally {
    isStreaming.value = false
    scrollToBottom()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}

// 修改会话标题
const updateSessionTopic = () => {
  if (props.activeSession) {
    newTopic.value = props.activeSession.topic
    showUpdateTopicDialog.value = true
  }
}

// 确认修改标题
const confirmUpdateTopic = async () => {
  if (!newTopic.value.trim() || !props.activeSession?.id) return

  try {
    const data = await sessionApi.updateSessionTopic(props.activeSession.id, newTopic.value.trim())
    if (data.success) {
      ElMessage.success('标题修改成功')
      showUpdateTopicDialog.value = false
      emit('refreshSessions')
    } else {
      ElMessage.error('标题修改失败')
    }
  } catch (error) {
    console.error('修改标题失败:', error)
  }
}

// 删除会话
const deleteSession = async () => {
  if (!props.activeSession?.id) return

  try {
    const data = await sessionApi.deleteSession(props.activeSession.id)
    if (data.success) {
      ElMessage.success('会话删除成功')
      emit('refreshSessions')
    } else {
      ElMessage.error('会话删除失败')
    }
  } catch (error) {
    console.error('删除会话失败:', error)
  }
}

// 加载测试数据
const loadTestData = () => {
  useTestData.value = true
  messages.value = largeChatData
  ElMessage.success(`已加载 ${largeChatData.length} 条测试消息`)
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    }
  })
}

// 监听会话变化
watch(() => props.activeSession, (newSession) => {
  if (newSession?.id) {
    loadSessionHistory()
  } else {
    messages.value = []
  }
}, { immediate: true })

// 组件挂载时加载历史消息
onMounted(() => {
  if (props.activeSession?.id) {
    loadSessionHistory()
  }
})

// 监听智能体变化
watch(() => props.agentId, (newAgentId) => {
  if (newAgentId) {
    messages.value = []
  }
})

// 组件挂载时加载历史消息
onMounted(() => {
  if (props.activeSession?.id) {
    loadSessionHistory()
  }
})
</script>

<style scoped>
/* 整体布局 */
.chat-content-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  background: #F8F9FD;
  font-family: 'Noto Sans SC', sans-serif;
  overflow: hidden;
  min-height: 0;
  position: relative;
  padding-bottom: 80px;
  box-sizing: border-box;
}

/* 头部 */
.chat-header {
  height: 68px;
  padding: 0 32px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(12px);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-action {
  color: #5A6066;
}

.agent-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #314DE2, #6144D3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.default-avatar {
  background: #5B6BF1;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: #2E3339;
  margin: 0;
}

/* 消息区域 */
.chat-message-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 16px 32px 40px 32px;
  scroll-behavior: smooth;
  box-sizing: border-box;
  min-height: 0;
  position: relative;
}

/* 欢迎卡片 */
.welcome-card {
  max-width: 720px;
  margin: 40px auto;
  text-align: center;
}

.welcome-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  border-radius: 20px;
  background: rgba(49,77,226,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #314DE2;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: #2E3339;
  margin-bottom: 10px;
}

.welcome-desc {
  font-size: 15px;
  color: #5A6066;
  margin-bottom: 24px;
  line-height: 1.6;
}

.welcome-msg {
  padding: 20px;
  background: white;
  border-radius: 16px;
  font-size: 14px;
  color: #5A6066;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}

/* 空状态 */
.empty-chat-tip {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.25;
}

.empty-icon {
  color: #6144D3;
}

.empty-text {
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #5A6066;
}

/* 消息行 */
.chat-message-row {
  display: flex;
  width: 100%;
  margin-bottom: 16px;
}

.justify-end {
  justify-content: flex-end;
}

.justify-start {
  justify-content: flex-start;
}

.chat-message-box {
  display: flex;
  max-width: 70%;
  align-items: flex-start;
  gap: 10px;
}

/* 头像 */
.chat-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar {
  background: linear-gradient(135deg, #314DE2, #5B6BF1);
}

.assistant-avatar {
  background: #FFFFFF;
  border: 1px solid rgba(0,0,0,0.06);
}

.icon {
  font-size: 16px;
}

.user-avatar .icon {
  color: white;
}

/* 气泡 */
.chat-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
  word-break: break-word;
}

.message-content {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
}

.user-bubble {
  background: linear-gradient(135deg, #314DE2, #6144D3);
  color: #fff;
  border-top-right-radius: 6px;
  box-shadow: 0 4px 10px rgba(49,77,226,0.12);
}

.assistant-bubble {
  background: #FFFFFF;
  color: #2E3339;
  border-top-left-radius: 6px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.06);
}

/* 加载中 */
.streaming-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.stream-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.06);
}

.stream-text {
  animation: pulse 1.5s infinite ease-in-out;
  font-size: 13px;
}

@keyframes pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 底部输入 */
.chat-input-footer {
  padding: 0 48px 80px 48px;
  border-top: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  z-index: 10;
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.prompt-tags {
  max-width: 960px;
  margin: 0 auto 12px auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.tag-item:hover {
  background: rgba(49,77,226,0.08);
  border-color: #314DE2;
}

/* 输入框 */
/* 聊天框样式 */
.box-wrap {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 896px;
  height: 122px;
  background: #FFFFFF;
  border: 1px solid #DEE3EA;
  box-shadow: 0px 8px 30px rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.box-wrap.focused {
  border: 1px solid #6144D3;
  box-shadow: 0px 5px 20px -6px rgba(199, 210, 254, 0.5);
}

.textarea-wrap {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  padding: 16px 16px 84px;
  width: 894px;
  height: 120px;
  min-height: 120px;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  z-index: 0;
}

.flex-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  flex: none;
  flex-grow: 1;
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 8px;
  flex: none;
}

.text-base {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400;
  display: flex;
  align-items: center;
}

.text-desc {
  width: 862px;
  height: 20px;
  font-size: 14px;
  line-height: 20px;
  color: #767B82;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}

.btn-group-bottom {
  position: absolute;
  width: 285.42px;
  height: 32.67px;
  left: 13px;
  bottom: 13px;
  order: 1;
  flex-grow: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px;
  isolation: isolate;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
}

.icon-btn:hover {
  background: rgba(90, 96, 102, 0.1);
}

.icon-btn:hover .tooltip {
  opacity: 1;
}

.icon-inner {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  padding: 0;
  flex: none;
  order: 0;
  flex-grow: 0;
  z-index: 0;
}

.icon-inner img {
  width: 15.34px;
  height: 15.34px;
  object-fit: contain;
}

.icon-bg {
  background: #5A6066;
}

.tooltip {
  display: none;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 4px;
  background: #0C0E11;
  border-radius: 4px;
  flex: none;
  order: 1;
  flex-grow: 0;
  z-index: 1;
  white-space: nowrap;
}

.tooltip-text {
  width: 40px;
  height: 15px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 15px;
  text-align: center;
  color: #9B9DA1;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.btn-normal {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 18px;
  gap: 5px;
  width: 84px;
  height: 30px;
  border-radius: 16px;
  flex: none;
  flex-grow: 0;
}

.btn-think {
  background: #E0E7FF;
  border: 1px solid #B4BDFF;
}

.btn-search {
  background: #F1F5F9;
  border: 1px solid #DEE3EA;
}

.text-think {
  width: 40px;
  height: 20px;
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 10px;
  line-height: 20px;
  color: #314DE2;
  flex: none;
  order: 1;
  flex-grow: 0;
}

.text-search {
  width: 40px;
  height: 20px;
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 10px;
  line-height: 20px;
  color: #334155;
  flex: none;
  order: 1;
  flex-grow: 0;
}

.bottom-right-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 12px;
  position: absolute;
  width: 204.83px;
  height: 33.33px;
  right: 13px;
  bottom: 13px;
  flex: none;
  order: 2;
  flex-grow: 0;
  z-index: 2;
}

.hint-text {
  width: 157px;
  height: 16px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #767B82;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.send-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px;
  width: 35.83px;
  height: 33.33px;
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  flex: none;
  order: 1;
  flex-grow: 0;
  border: none;
  cursor: pointer;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  width: 15.83px;
  height: 13.33px;
  object-fit: contain;
}

.recording-btn {
  background: transparent;
}

.recording-indicator {
  width: 14px;
  height: 14px;
  background: #D0435F;
  border-radius: 2px;
}

.attachments-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 0 8px 0;
}

.attachment-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
}

.attachment-icon {
  font-size: 16px;
}

.attachment-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-remove {
  cursor: pointer;
  color: #94A3B8;
  font-size: 16px;
  line-height: 1;
  margin-left: 4px;
}

.attachment-remove:hover {
  color: #D0435F;
}

.chat-textarea {
  flex: 1;
  width: 100%;
}

.chat-textarea :deep(.el-textarea__inner) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 14px;
  color: #2E3339;
  padding: 0;
  min-height: 50px;
  max-height: 120px;
  overflow-y: auto;
  line-height: 20px;
  resize: none;
}

.chat-textarea :deep(.el-textarea__inner)::placeholder {
  color: #767B82;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.hint-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 15px;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
  margin-top: 4px;
}

.hint-text-bottom {
  width: auto;
  height: 15px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 15px;
  display: flex;
  align-items: center;
  text-align: center;
  color: #767B82;
  flex: none;
  order: 0;
  flex-grow: 0;
}
</style>