<template>
  <div class="chat-page-container">

    <!-- 左侧侧边栏 -->
    <aside v-if="!agentId" class="secondary-sidebar">
      <div class="horizontal-border">
        <el-button class="new-chat-btn" @click="createNewSession">
          <span>+&nbsp;&nbsp;&nbsp;&nbsp;新建对话</span>
        </el-button>
      </div>

      <div class="horizontal-border search-border">
        <div class="search-input-container">
          <input
            v-model="sessionSearch"
            placeholder="搜索历史记录"
            class="search-input"
          />
          <img src="@/images/search.png" class="search-icon" />
        </div>
      </div>

      <div class="session-container">
        <div class="session-list-section">
          <div class="section-title">最近对话</div>
          <div class="session-items">
            <div
              v-for="s in filteredSessions"
              :key="s.id"
              class="session-item"
              :class="activeSessionId === s.id ? 'active' : ''"
              @click="selectSession(s.id)"
            >
              <img
                class="session-icon"
                :src="activeSessionId === s.id
                  ? '@/images/chatbox-selected.png'
                  : '@/images/chatbox-unselected.png'"
              />
              <input
                v-if="editingSessionId === s.id"
                v-model="editSessionName"
                class="session-edit-input"
                @blur="confirmEditSession"
                @keydown.enter.prevent="confirmEditSession"
                @click.stop
                ref="editInputRef"
              />
              <div v-else class="session-text">{{ s.topic ? (s.topic.length > 12 ? s.topic.slice(0,12) + '...' : s.topic) : '新对话' }}</div>
                <div
                  v-if="editingSessionId !== s.id"
                  class="edit-btn"
                  @click.stop="openEditDialog(s)"
                >
                  <el-icon><Edit /></el-icon>
                </div>
                <div
                  class="delete-btn"
                  @click.stop="deleteSession(s.id)"
                >
                  <el-icon><Delete /></el-icon>
                </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 中间窗口：动态切换 -->
    <main class="chat-main-content">
      <ChatInit v-if="!activeSessionId" @send-message="handleChatInitSend" />
      <Chating 
        v-else
        :agentId="agentId"
        :agentInfo="agentInfo"
        :messages="messages"
        :isStreaming="isStreaming"
        :userInput="userInput"
        :activeSession="activeSession"
        :commonPrompts="commonPrompts"
        @send="handleSend"
        @refreshSessions="refreshSessions"
      />
    </main>

    <!-- 右侧配置 -->
    <aside v-if="agentId" class="agent-config-sidebar">
      <h3 class="font-bold text-gray-800 mb-6 flex items-center">
        <el-icon class="mr-2 text-primary"><Setting /></el-icon>
        任务执行参数
      </h3>
      <el-form label-position="top">
        <el-form-item v-for="f in formConfig" :key="f.key" :label="f.label" :required="f.required">
          <el-input v-if="f.type === 'input'" v-model="formData[f.key]" :placeholder="f.placeholder" />
          <el-input v-else type="textarea" v-model="formData[f.key]" :placeholder="f.placeholder" :rows="3" />
        </el-form-item>
      </el-form>
    </aside>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Search, ChatDotSquare, Cpu, User, Monitor, Promotion, Setting, Delete, Edit } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'
import { ElMessage } from 'element-plus'
import { sessionApi } from '../../api/api'
import { processSSELine, processSSEBuffer } from '../../utils/chatSSE'
import ChatInit from './ChatInit.vue'
import Chating from './Chating.vue'

const route = useRoute()
const userStore = useUserStore()

const agentId = computed(() => route.params.agentId || '')
const agentInfo = ref(null)
const formConfig = ref([])
const formData = ref({})

const userInput = ref('')
const isStreaming = ref(false)
const messages = ref([])

const activeSessionId = ref(null)
const sessions = ref([])
const sessionSearch = ref('')

// 处理 URL 中的 sessionId 参数
const initFromUrl = () => {
  const sessionId = route.query.sessionId
  if (sessionId) {
    activeSessionId.value = sessionId
  }
}

// 加载会话列表
const loadSessions = async () => {
  try {
    const data = await sessionApi.getSessionList()
    if (data.success) {
      sessions.value = data.data || []
    } else {
      ElMessage.error('加载会话列表失败')
    }
  } catch (error) {
    console.error('加载会话列表失败:', error)
  }
}

// 刷新会话列表（供子组件调用）
const refreshSessions = () => {
  loadSessions()
}

const filteredSessions = computed(() => {
  if (!sessionSearch.value) return sessions.value
  return sessions.value.filter(s => s.topic?.includes(sessionSearch.value))
})

const activeSession = computed(() => sessions.value.find(s => s.id === activeSessionId.value))
const commonPrompts = ref(['生成一份教案', '批改一段作业', '帮我出3道选择题'])

const createNewSession = async () => {
  try {
    const data = await sessionApi.createSession()
    if (data.success) {
      await loadSessions()
      activeSessionId.value = data.data.id
      messages.value = []
      ElMessage.success('已新建对话')
    } else {
      ElMessage.error('创建会话失败')
    }
  } catch (error) {
    console.error('创建会话失败:', error)
  }
}

const selectSession = (id) => {
  activeSessionId.value = id
  messages.value = []
}

const deleteSession = async (id) => {
  try {
    const data = await sessionApi.deleteSession(id)
    if (data.success) {
      await loadSessions()
      if (activeSessionId.value === id) {
        activeSessionId.value = null
        messages.value = []
      }
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('删除会话失败')
    }
  } catch (error) {
    console.error('删除会话失败:', error)
  }
}

const editSessionName = ref('')
const editingSessionId = ref(null)
const editInputRef = ref(null)

const openEditDialog = (session) => {
  editingSessionId.value = session.id
  editSessionName.value = session.topic || ''
  nextTick(() => {
    if (editInputRef.value) {
      editInputRef.value.focus()
    }
  })
}

const confirmEditSession = async () => {
  if (!editSessionName.value.trim()) {
    ElMessage.warning('对话名称不能为空')
    return
  }
  try {
    const data = await sessionApi.updateSessionTopic(editingSessionId.value, editSessionName.value)
    if (data.success) {
      await loadSessions()
      editingSessionId.value = null
      ElMessage.success('修改成功')
    } else {
      ElMessage.error('修改会话失败')
    }
  } catch (error) {
    console.error('修改会话失败:', error)
  }
}

const handleSend = async () => {
  if (!userInput.value.trim()) return
  const text = userInput.value
  userInput.value = ''

  messages.value.push({ role: 'user', content: text })
  isStreaming.value = true

  setTimeout(() => {
    messages.value.push({
      role: 'assistant',
      content: '这是 AI 回复（前端模拟）'
    })
    isStreaming.value = false
  }, 800)
}

// 处理 ChatInit 发送消息（与 Chating 发送逻辑一致）
const handleChatInitSend = async ({ content, attachments }) => {
  try {
    // 1. 新建会话
    const sessionResult = await sessionApi.createSession()
    if (!sessionResult.success) {
      ElMessage.error('创建会话失败')
      return
    }

    const sessionId = sessionResult.data.id

    // 2. 添加用户消息到 messages（包含附件信息）
    messages.value.push({ role: 'user', content, attachments })

    // 3. 创建一个空的 AI 消息（用于显示"思考中"状态）
    const aiMsg = { role: 'assistant', content: '', isThinking: true }
    messages.value.push(aiMsg)
    isStreaming.value = true

    // 4. 加载会话列表并切换到新会话
    await loadSessions()
    activeSessionId.value = sessionId

    // 5. 等待 Chating 组件渲染
    await nextTick()

    try {
      // 6. 调用 API 发送消息
      console.log('ChatBox sending message:', { sessionId, content, attachments })
      const response = await sessionApi.sendMessage(sessionId, content, attachments)
      console.log('ChatBox received response:', response)
      
      const contentType = response.headers.get('content-type') || ''
      
      if (contentType.includes('application/json')) {
        // 普通 JSON 响应
        const result = await response.json()
        
        if (result.success && result.data) {
          aiMsg.content = typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
        } else if (result.content) {
          aiMsg.content = result.content
        } else if (result.code === 'success' && result.result) {
          // 后端实际返回的格式
          if (result.result.content) {
            aiMsg.content = result.result.content
          } else if (result.result.id && !result.result.content) {
            // 只有任务ID，没有内容
            aiMsg.content = '抱歉，服务器未返回消息内容，请稍后重试。'
          } else {
            aiMsg.content = JSON.stringify(result.result)
          }
        } else {
          aiMsg.content = JSON.stringify(result)
        }
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
        aiMsg.content = text
      }
      
      aiMsg.isThinking = false
      isStreaming.value = false
    } catch (apiError) {
      console.error('API 调用失败:', apiError)
      aiMsg.content = '抱歉，服务器暂时无法响应，请稍后重试。'
      aiMsg.isThinking = false
      isStreaming.value = false
      ElMessage.error('消息发送失败')
    }

    // 7. 刷新会话列表以更新标题
    await loadSessions()
  } catch (error) {
    console.error('发送消息失败:', error)
    isStreaming.value = false
    ElMessage.error('发送失败，请稍后重试')
  }
}

// 组件挂载时加载会话列表
onMounted(() => {
  initFromUrl()
  loadSessions()
})

</script>

<style scoped>
/* 外层容器：flex 横向排列，侧边栏在最左 */
.chat-page-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  background: #f9fafb;
}

/* ------------------------------
  左侧二级侧边栏（固定在最左）
------------------------------ */
.secondary-sidebar {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  isolation: isolate;
  width: 288px;
  height: 100vh;
  background: rgba(255, 255, 255);
  border-right: 1px solid rgba(173, 178, 185, 0.1);
  backdrop-filter: blur(6px);
  flex: none;
  order: 0; /* 确保在最左 */
  align-self: stretch;
  flex-grow: 0;
  z-index: 2;
  position: relative;
}

/* 折叠按钮：放在侧边栏右侧边缘 */
.sidebar-toggle {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 24px;
  height: 48px;
  left: 288px; /* 紧贴侧边栏右侧 */
  top: calc(50% - 24px);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(173, 178, 185, 0.2);
  box-shadow: 0px 1px 2px rgba(0,0,0,0.05);
  border-radius: 0 8px 8px 0;
  z-index: 0;
  cursor: pointer;
}

.toggle-icon {
  width: 5.55px;
  height: 9px;
  background: #5A6066;
}

.horizontal-border {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  width: 287px;
  border-bottom: 1px solid rgba(173, 178, 185, 0.05);
  align-self: stretch;
  z-index: 1;
}

.new-chat-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
  width: 255px;
  height: 41px;
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  box-shadow: 0px 8px 20px rgba(49,77,226,0.2);
  border-radius: 12px;
  border: none;
  font-family: "Noto Sans SC";
  font-weight: 500;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
}

.btn-icon {
  width: 8.17px;
  height: 8.17px;
  background: #fff;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 255px;
  height: 39px;
}

/* 输入框 */
.search-input {
  box-sizing: border-box;
  width: 100%;
  height: 39px;
  padding: 0 16px 0 40px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(173, 178, 185, 0.2);
  border-radius: 8px;
  font-family: 'Noto Sans SC';
  font-size: 14px;
  line-height: 39px;
  color: #6B7280;
  outline: none;
}

/* 搜索图标 */
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 13.5px;
  height: 13.5px;
  z-index: 1;
  object-fit: contain;
}

.delete-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #9ca3af;
  opacity: 0;
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
}

.session-item:hover {
  background: rgba(49, 77, 226, 0.03);
}

.session-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.edit-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #9ca3af;
  opacity: 0;
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
}

.session-item:hover .edit-btn {
  opacity: 1;
}

.edit-btn:hover {
  color: #314DE2;
  background: rgba(49, 77, 226, 0.1);
}

.session-edit-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #314DE2;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  background: white;
}

.session-container {
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 16px;
  width: 287px;
  flex: 1;
  overflow-y: auto;
  z-index: 3;
}

.session-list-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 263px;
}

.section-title {
  padding: 0 8px;
  font-family: "Noto Sans SC";
  font-weight: 500;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(90,96,102,0.6);
}

.session-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.session-item {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 12px;
  width: 263px;
  height: 42px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.5s ease;
}

.session-text {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #2E3339;
}

.session-icon {
  width: 11.67px;
  height: 11.67px;
  margin-right: 8px;
  object-fit: contain;
  border: none;
  background: none;
}

.session-item.active {
  background: rgba(49, 77, 226, 0.1);
  border: 1px solid rgba(49, 77, 226, 0.05);
  border-radius: 8px;
}

.session-item.active .session-text {
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #2E3339;
}

.session-item.active .session-text {
  color: #2E3339;
}

/* ------------------------------
  中间聊天区域（侧边栏右侧）
------------------------------ */
.chat-main-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100vh;
  background: #ffffff;
  position: relative;
  order: 1;
}

.chat-header {
  height: 64px;
  padding: 0 32px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(12px);
  z-index: 10;
  position: sticky;
  top: 0;
}

.chat-message-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 24px 40px;
  scroll-behavior: smooth;
}

.empty-chat-tip {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.3;
}

.chat-message-row {
  display: flex;
  width: 100%;
  margin-bottom: 24px;
}

.chat-message-box {
  display: flex;
  max-width: 85%;
  align-items: flex-start;
}

.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.user-avatar {
  background: #3B82F6;
  margin-left: 12px;
}

.assistant-avatar {
  background: #F3F4F6;
  margin-right: 12px;
}

.chat-bubble {
  padding: 16px;
  border-radius: 20px;
  font-size: 14px;
  line-height: 1.6;
}

.user-bubble {
  background: #3B82F6;
  color: #fff;
  border-top-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(59,130,246,0.15);
}

.assistant-bubble {
  background: #F9FAFB;
  color: #111827;
  border-top-left-radius: 4px;
  border: 1px solid rgba(173,178,185,0.1);
}

.streaming-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.chat-input-footer {
  padding: 24px 40px;
  border-top: 1px solid #E5E7EB;
  background: #fff;
}

.chat-input-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  background: #F9FAFB;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid rgba(173,178,185,0.2);
}

.chat-textarea :deep(.el-textarea__inner) {
  background: transparent;
  border: none;
  box-shadow: none;
  color: #374151;
  padding: 12px;
}

/* ------------------------------
  右侧配置面板（聊天窗口右侧）
------------------------------ */
.agent-config-sidebar {
  width: 320px;
  background: #fff;
  border-left: 1px solid rgba(173,178,185,0.1);
  padding: 32px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  order: 2;
}
</style>