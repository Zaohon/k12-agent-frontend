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
          <img src="/images/search.png" class="search-icon" />
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
                  ? '/images/chatbox-selected.png' 
                  : '/images/chatbox-unselected.png'" 
              />
              <div class="session-text">{{ s.topic ? (s.topic.length > 12 ? s.topic.slice(0,12) + '...' : s.topic) : '新对话' }}</div>
                <div 
                  class="delete-btn" 
                  @click.stop="deleteSession(s.id)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M10 11v6M14 11v6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 中间窗口：动态切换 -->
    <main class="chat-main-content">
      <ChatInit v-if="!activeSessionId" />
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
import { Plus, Search, ChatDotSquare, Cpu, User, Monitor, Promotion, Setting } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'
import { ElMessage } from 'element-plus'
import { API_BASE } from '../../utils/api'
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

sessions.value = [
  { id: 1, topic: "数学应用题解题思路" },
  { id: 2, topic: "语文作文批改" },
  { id: 3, topic: "英语语法讲解" },
  { id: 4, topic: "物理受力分析" },
  { id: 5, topic: "化学方程式配平" },
  { id: 6, topic: "历史简答题梳理" }
]

const filteredSessions = computed(() => {
  if (!sessionSearch.value) return sessions.value
  return sessions.value.filter(s => s.topic?.includes(sessionSearch.value))
})

const activeSession = computed(() => sessions.value.find(s => s.id === activeSessionId.value))
const commonPrompts = ref(['生成一份教案', '批改一段作业', '帮我出3道选择题'])

const createNewSession = async () => {
  const newId = sessions.value.length + 1
  sessions.value.unshift({ id: newId, topic: "新对话" })
  activeSessionId.value = newId
  messages.value = []
  ElMessage.success('已新建对话')
}

const selectSession = (id) => {
  activeSessionId.value = id
  messages.value = []
}

const deleteSession = async (id) => {
  sessions.value = sessions.value.filter(item => item.id !== id)
  if (activeSessionId.value === id) {
    activeSessionId.value = null
    messages.value = []
  }
  ElMessage.success('删除成功')
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
  background: rgba(255, 255, 255, 0.4);
  border-right: 1px solid rgba(173, 178, 185, 0.1);
  backdrop-filter: blur(6px);
  flex: none;
  order: 0; /* 确保在最左 */
  align-self: stretch;
  flex-grow: 0;
  z-index: 1;
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
