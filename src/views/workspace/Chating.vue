<template>
  <div class="chat-content-container">
    <!-- 头部 -->
    <header class="chat-header">
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
    </header>

    <!-- 消息区域 -->
    <div class="chat-message-wrap" ref="msgContainer">
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
      <div v-if="agentId" class="prompt-tags">
        <el-tag v-for="tag in commonPrompts" :key="tag" class="tag-item" hit @click="inputVal = tag">{{ tag }}</el-tag>
      </div>

      <div class="input-wrapper">
        <div class="input-glow"></div>
        <div class="input-body">
          <!-- 左侧功能按钮 -->
          <div class="action-left">
            <button class="icon-btn">
              <img src="@/images/chatinit-img.png" alt="图片" />
            </button>
            <button class="icon-btn">
              <img src="@/images/chatinit-link.png" alt="链接" />
            </button>
            <button class="icon-btn">
              <img src="@/images/chatinit-vedio.png" alt="音频" />
            </button>
          </div>

          <el-input 
            v-model="inputVal" 
            type="textarea" 
            :rows="2" 
            autosize
            placeholder="请输入您的问题（按 Enter 发送...）" 
            class="chat-textarea"
            @keydown.enter.prevent="handleSend"
          />

          <!-- 右侧发送按钮 -->
          <div class="action-right">
            <el-button 
              type="primary" 
              :icon="Promotion" 
              circle 
              class="send-btn" 
              :disabled="!inputVal.trim() || isStreaming" 
              @click="handleSend"
            />
          </div>
        </div>
      </div>

      <p class="copyright">Powered by K12 Agent Cloud | 内容由 AI 生成，请注意甄别</p>
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
import { Cpu, User, Monitor, Promotion, MagicStick, ChatDotSquare, More, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { sessionApi } from '../../api/api'

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
  height: 95%;
  background: #F8F9FD;
  font-family: 'Noto Sans SC', sans-serif;
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
  padding: 16px 32px 8px 32px;
  scroll-behavior: smooth;
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
  padding: 16px 48px 24px 48px;
  border-top: 1px solid rgba(0,0,0,0.05);
  background: white;
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
.input-wrapper {
  position: relative;
  max-width: 960px;
  margin: 0 auto;
}

.input-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(90deg, #314DE2, #6144D3);
  opacity: 0.1;
  filter: blur(6px);
  border-radius: 20px;
  z-index: 0;
}

.input-body {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: white;
  border-radius: 18px;
  border: 1px solid rgba(49,77,226,0.15);
  padding: 12px 16px;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(49,77,226,0.08);
}

.action-left {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(49,77,226,0.08);
}

.icon-btn img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.chat-textarea {
  flex: 1;
}

.chat-textarea :deep(.el-textarea__inner) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 14px;
  color: #2E3339;
  padding: 8px 12px;
  min-height: 50px;
  line-height: 1.5;
}

.action-right {
  padding-bottom: 4px;
}

.send-btn {
  flex-shrink: 0;
  background: linear-gradient(135deg, #314DE2, #6144D3) !important;
  border: none;
  width: 36px;
  height: 36px;
}

/* 底部版权 */
.copyright {
  text-align: center;
  font-size: 10px;
  color: rgba(90,96,102,0.5);
  margin-top: 12px;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>