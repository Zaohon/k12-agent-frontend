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
    <div class="chat-message-wrap" ref="msgContainer" :style="{ paddingBottom: dynamicPaddingBottom + 'px' }">
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
          <div class="chat-bubble-wrapper" :class="msg.role === 'user' ? 'align-end' : 'align-start'">
            <div class="chat-bubble" :class="msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'">
              <div v-if="msg.isThinking" class="thinking-card">
                <span class="thinking-text">正在思考中...</span>
              </div>
              <pre v-else class="message-content">{{ msg.content }}</pre>
            </div>
            <!-- 用户消息显示附件卡片 -->
            <div v-if="msg.role === 'user' && msg.attachments && msg.attachments.length > 0" class="message-attachments">
              <div v-for="(item, index) in msg.attachments" :key="index" class="message-attachment-card">
                <div class="attachment-card-background">
                  <div class="attachment-card-icon-container">
                    <span class="attachment-card-icon">{{ getAttachmentIcon(item.type) }}</span>
                  </div>
                </div>
                <div class="attachment-card-content">
                  <div class="attachment-card-name-row">
                    <span class="attachment-card-name">{{ item.name || '附件' }}</span>
                  </div>
                  <div class="attachment-card-info-row">
                    <div class="attachment-card-size-container">
                      <span class="attachment-card-size">{{ formatFileSize(item.size) }}</span>
                    </div>
                    <div class="attachment-card-dot"></div>
                    <div class="attachment-card-status-container">
                      <span class="attachment-card-status">解析完成</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isStreaming && messages.length === 0" class="streaming-box">
        <div class="stream-avatar">
          <el-icon><Monitor /></el-icon>
        </div>
        <el-tag type="info" class="stream-text">正在为您生成最优教学建议...</el-tag>
      </div>
    </div>

    <!-- 底部输入 -->
    <footer class="chat-input-footer" ref="footerRef">
      <div class="box-wrap" :class="{ focused: isFocused }">
        <div class="textarea-wrap">
          <div class="flex-col" style="width: 100%;">
            <!-- 文字输入区 -->
            <textarea
              v-model="inputVal"
              ref="textareaRef"
              placeholder="输入您的问题或指令，按 Enter 发送。"
              class="chat-textarea-native"
              @focus="() => { isFocused = true }"
              @blur="() => { isFocused = false }"
              @keydown.enter.prevent="handleSend"
            />

            <!-- 附件卡片显示 -->
            <div v-if="attachments.length > 0" class="attachments-wrapper">
              <div v-for="(item, index) in attachments" :key="index" class="attachment-card">
                <span class="attachment-icon">{{ getAttachmentIcon(item.type) }}</span>
                <span class="attachment-name">{{ item.name || '附件' }}</span>
                <span class="attachment-remove" @click="handleRemoveAttachment(index)">×</span>
              </div>
            </div>
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
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Cpu, User, Monitor, MagicStick, ChatDotSquare, More, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { sessionApi } from '../../api/api'
import { useAttachment, formatFileSize } from '@/hooks/useAttachment'
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
  },
  messages: {
    type: Array,
    default: () => []
  },
  isStreaming: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['sendMessage', 'refreshSessions'])

const DEFAULT_PADDING = 140

// 监听会话切换，自动清除输入框
watch(() => props.activeSession, (newSession, oldSession) => {
  if (newSession?.id !== oldSession?.id) {
    inputVal.value = ''
    attachments.value = []
    resetInputHeight()
  }
})

const inputVal = ref('')
const messages = ref([])
const isStreaming = ref(false)
const msgContainer = ref(null)
const showUpdateTopicDialog = ref(false)
const newTopic = ref('')
const isFocused = ref(false)
const useTestData = ref(false)
const textareaRef = ref(null)
const footerRef = ref(null)
const initialFooterHeight = ref(0)
const dynamicPaddingBottom = ref(DEFAULT_PADDING)

// 动态调整textarea高度
const resetInputHeight = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = '50px'
  }
  dynamicPaddingBottom.value = DEFAULT_PADDING
}

// 自动计算高度（文本 + 附件）
const calcTextareaHeight = async () => {
  await nextTick()
  const textarea = textareaRef.value
  const footerEl = footerRef.value
  if (!textarea || !footerEl) return

  // 空内容 → 恢复默认
  if (!inputVal.value.trim() && attachments.value.length === 0) {
    resetInputHeight()
    await nextTick()
    scrollToBottom()
    return
  }

  textarea.style.height = 'auto'
  const sh = textarea.scrollHeight
  const finalTextareaHeight = Math.max(50, Math.min(sh, 200))
  textarea.style.height = finalTextareaHeight + 'px'

  await nextTick()

  const currentHeight = footerEl.offsetHeight
  const growth = currentHeight - initialFooterHeight.value
  dynamicPaddingBottom.value = DEFAULT_PADDING + growth

  await nextTick()
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}

const { attachments, isRecording, uploadImage, uploadAudioFile, uploadFile, startRecording, stopRecording, removeAttachment, getAttachmentIcon } = useAttachment()

const handleFileUpload = () => {
  uploadFile()
  nextTick().then(() => calcTextareaHeight())
}

const handleAudioCommand = (command) => {
  if (command === 'record') {
    isRecording.value ? stopRecording() : startRecording()
  } else if (command === 'upload') {
    uploadAudioFile()
    nextTick().then(() => calcTextareaHeight())
  }
}

const handleImageClick = () => {
  uploadImage()
  nextTick().then(() => calcTextareaHeight())
}

const handleRemoveAttachment = (index) => {
  removeAttachment(index)
  nextTick().then(() => calcTextareaHeight())
}

// 计算显示的消息（使用内部消息列表）
const showMessages = computed(() => {
  return messages.value || []
})

// 加载会话历史
const loadSessionHistory = async () => {
  if (!props.activeSession?.id) return
  
  // 如果外部传入了消息且有内容（来自 ChatInit），合并到内部消息列表
  if (props.messages && props.messages.length > 0) {
    messages.value = [...props.messages]
    nextTick(scrollToBottom)
    return
  }
  
  const { data } = await sessionApi.getSessionHistory(props.activeSession.id)
  messages.value = data || []
  nextTick(scrollToBottom)
}

// 发送消息
const handleSend = async () => {
  console.log('handleSend called')
  console.log('inputVal:', inputVal.value)
  console.log('activeSession:', props.activeSession)
  
  if (!inputVal.value.trim() && attachments.value.length === 0) return
  if (!props.activeSession?.id) return
  
  const content = inputVal.value.trim()
  inputVal.value = ''
  
  // 保存附件副本，然后清空附件
  const currentAttachments = [...attachments.value]
  attachments.value = []

  resetInputHeight()
  await nextTick()

  // 1. 先 push 用户消息（包含附件信息）
  messages.value.push({ role: 'user', content, attachments: currentAttachments })
  await nextTick()
  scrollToBottom()

  // 2. 创建一个空的 AI 消息（用于写入）
  const aiMsg = { role: 'assistant', content: '', isThinking: true }
  messages.value.push(aiMsg)
  isStreaming.value = true
  await nextTick()
  scrollToBottom() // 发送后立即滚动到底部，确保"思考中"状态可见

  try {
    console.log('Calling sessionApi.sendMessage...')
    const response = await sessionApi.sendMessage(props.activeSession.id, content)
    console.log('Response received:', response)
    
    const contentType = response.headers.get('content-type') || ''
    console.log('Content-Type:', contentType)
    
    if (contentType.includes('application/json')) {
      // 普通 JSON 响应
      const result = await response.json()
      console.log('JSON response:', result)
      console.log('result.success:', result.success)
      console.log('result.code:', result.code)
      console.log('result.result:', result.result)
      console.log('result.content:', result.content)
      
      if (result.success && result.data) {
        console.log('Case 1: success + data')
        aiMsg.content = typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
      } else if (result.content) {
        console.log('Case 2: content')
        aiMsg.content = result.content
      } else if (result.code === 'success' && result.result) {
        console.log('Case 3: code=success + result')
        // 后端实际返回的格式
        if (result.result.content) {
          console.log('Case 3a: result.content exists')
          aiMsg.content = result.result.content
        } else if (result.result.id && !result.result.content) {
          console.log('Case 3b: only result.id, no content')
          // 只有任务ID，没有内容
          aiMsg.content = '抱歉，服务器未返回消息内容，请稍后重试。'
        } else {
          console.log('Case 3c: other result')
          aiMsg.content = JSON.stringify(result.result)
        }
      } else {
        console.log('Case 4: fallback')
        aiMsg.content = JSON.stringify(result)
      }
      console.log('Final aiMsg.content:', aiMsg.content)
    } else if (contentType.includes('text/event-stream')) {
      // SSE 流式响应（根据 API 文档格式）
      console.log('Processing SSE stream...')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let receivedContent = false
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (value) {
          buffer += decoder.decode(value, { stream: true })
        }
        
        if (done) {
          // 流结束时处理剩余数据
          if (buffer.trim()) {
            console.log('Final buffer:', buffer)
            
            // 检查是否是错误格式
            try {
              const parsed = JSON.parse(buffer)
              if (parsed.error) {
                // 后端返回错误
                aiMsg.content = '错误：' + (parsed.error.message || '服务器错误')
              } else {
                // 尝试处理为普通内容
                processSSEBuffer(buffer, aiMsg)
              }
            } catch (e) {
              // 不是JSON，直接显示
              aiMsg.content = buffer
            }
          }
          break
        }
        
        // 处理完整的行
        const lines = buffer.split('\n')
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          // 检查是否是错误格式（直接返回JSON错误）
          if (line.startsWith('{')) {
            try {
              const parsed = JSON.parse(line)
              if (parsed.error) {
                aiMsg.content = '错误：' + (parsed.error.message || '服务器错误')
                receivedContent = true
                reader.releaseLock()
                return
              }
            } catch (e) {}
          }
          
          processSSELine(lines[i], aiMsg)
        }
        buffer = lines[lines.length - 1]
      }
      
      // 如果没有收到任何内容，显示错误提示
      if (!receivedContent && !aiMsg.content) {
        aiMsg.content = '抱歉，服务器没有返回有效内容，请稍后重试。'
      }
    } else {
      // 其他格式
      const text = await response.text()
      console.log('Text response:', text)
      aiMsg.content = text
    }
  } catch (error) {
    console.error('Send message error:', error)
    aiMsg.content = '抱歉，服务器暂时无法响应，请稍后重试。'
  } finally {
    aiMsg.isThinking = false
    isStreaming.value = false
    await nextTick()
    scrollToBottom()
  }
}

// 处理 SSE 行数据
const processSSELine = (line, aiMsg) => {
  const trimmedLine = line.trim()
  if (!trimmedLine) return
  
  if (trimmedLine.startsWith('data: ')) {
    const dataStr = trimmedLine.substring(6).trim()
    
    if (dataStr === '[DONE]') {
      return
    }
    
    try {
      const data = JSON.parse(dataStr)
      console.log('Received data:', data)
      
      // 根据 API 文档格式: {"choices":[{"delta":{"content":"..."}}]}
      const delta = data.choices?.[0]?.delta?.content || data.content || ''
      console.log('Delta:', delta)
      
      if (delta) {
        aiMsg.content += delta
        nextTick().then(() => scrollToBottom())
      }
    } catch (e) {
      console.error('Parse error:', e, 'Data:', dataStr)
    }
  }
}

// 处理 SSE 缓冲区
const processSSEBuffer = (buffer, aiMsg) => {
  const lines = buffer.split('\n')
  for (const line of lines) {
    processSSELine(line, aiMsg)
  }
}

// 滚动到底部
const scrollToBottom = () => {
  const el = msgContainer.value
  if (el) el.scrollTop = el.scrollHeight
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
watch(() => props.activeSession, () => loadSessionHistory(), { immediate: true })

// 监听外部传入的消息变化（来自 ChatInit）
watch(() => props.messages, (newMessages) => {
  // 只在内部消息为空且有外部消息时才合并
  if (newMessages && newMessages.length > 0 && messages.value.length === 0) {
    messages.value = [...newMessages]
    nextTick(scrollToBottom)
  }
}, { immediate: true })

// 监听智能体变化
watch(() => props.agentId, (newAgentId, oldAgentId) => {
  if (newAgentId && newAgentId !== oldAgentId) {
    messages.value = []
  }
})

// 监听输入框内容变化 → 调整高度
watch(inputVal, () => {
  calcTextareaHeight()
})

// 监听附件变化 → 调整高度
watch(attachments, () => {
  calcTextareaHeight()
}, { deep: true })

// 初始化
onMounted(() => {
  loadSessionHistory()

  if (footerRef.value) {
    initialFooterHeight.value = footerRef.value.offsetHeight
  }

  resetInputHeight()
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
  padding: 16px 32px 180px 32px;
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

.thinking-card {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(91, 107, 241, 0.08);
  border-radius: 8px;
  animation: pulse 1.5s infinite ease-in-out;
}

.thinking-text {
  font-size: 14px;
  color: #5B6BF1;
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
  max-width: calc(100% - 20px);
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
  height: auto;
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
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 16px 16px 60px;
  width: 100%;
  z-index: 0;
  box-sizing: border-box;
}

.flex-col {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  width: 100%;
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
  min-height: 50px;
  max-height: 480px;
  display: flex;
  flex-direction: column;
}

.chat-textarea :deep(.el-textarea) {
  flex: 1;
  width: 100%;
  min-height: 50px;
  max-height: 480px;
  display: flex;
  flex-direction: column;
}

.chat-textarea :deep(.el-textarea__wrapper) {
  flex: 1;
  width: 100%;
  min-height: 50px;
  max-height: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-textarea :deep(.el-textarea__inner) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 14px !important;
  color: #2E3339 !important;
  padding: 0 !important;
  min-height: 50px !important;
  max-height: 480px !important;
  height: auto !important;
  overflow-y: auto !important;
  line-height: 20px !important;
  resize: none !important;
  flex: 1 !important;
  box-sizing: border-box !important;
}

.chat-textarea :deep(.el-textarea__inner)::placeholder {
  color: #767B82;
}

.chat-textarea-native {
  width: 100%;
  min-height: 50px;
  font-size: 14px;
  color: #2E3339;
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  resize: none;
  overflow: auto;
  line-height: 20px;
  box-sizing: border-box;
}

.chat-textarea-native::placeholder {
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

/* 消息气泡包装器 */
.chat-bubble-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.chat-bubble-wrapper.align-end {
  align-items: flex-end;
}

/* 消息附件区域 */
.message-attachments {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 消息附件卡片 */
.message-attachment-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  gap: 12px;
  width: 256px;
  background: #F2F4F8;
  border: 1px solid #E4E8EF;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

/* 附件卡片左侧背景 */
.attachment-card-background {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 40px;
  height: 40px;
  background: #DBEAFE;
  border-radius: 8px;
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* 附件卡片图标容器 */
.attachment-card-icon-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  width: 16px;
  height: 20px;
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* 附件卡片图标 */
.attachment-card-icon {
  width: 16px;
  height: 20px;
  background: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* 附件卡片内容 */
.attachment-card-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 2px;
  width: 178px;
  height: 41px;
  flex: none;
  order: 1;
  flex-grow: 1;
}

/* 附件卡片名称行 */
.attachment-card-name-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  width: 178px;
  height: 20px;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}

/* 附件卡片名称 */
.attachment-card-name {
  width: 178px;
  height: 20px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  align-items: center;
  color: #2E3339;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}

/* 附件卡片信息行 */
.attachment-card-info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
  width: 178px;
  height: 19px;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}

/* 附件卡片大小容器 */
.attachment-card-size-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  width: 35px;
  height: 16px;
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* 附件卡片大小 */
.attachment-card-size {
  width: 35px;
  height: 16px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  display: flex;
  align-items: center;
  color: #767B82;
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* 附件卡片分隔点 */
.attachment-card-dot {
  width: 4px;
  height: 4px;
  background: #DEE3EA;
  border-radius: 9999px;
  flex: none;
  order: 1;
  flex-grow: 0;
}

/* 附件卡片状态容器 */
.attachment-card-status-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 2px 6px;
  width: 52px;
  height: 19px;
  background: #E7EAFF;
  border: 1px solid #D9DDFF;
  border-radius: 4px;
  flex: none;
  order: 2;
  flex-grow: 0;
}

/* 附件卡片状态 */
.attachment-card-status {
  width: 40px;
  height: 15px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  line-height: 15px;
  display: flex;
  align-items: center;
  color: #314DE2;
  flex: none;
  order: 0;
  flex-grow: 0;
}
</style>