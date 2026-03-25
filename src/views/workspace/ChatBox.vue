<template>
  <div class="h-full w-full bg-gray-50 flex overflow-hidden">
    
    <!-- Left Sidebar: Session History (Only for General Q&A) -->
    <aside v-if="!agentId" class="w-72 bg-white border-r border-gray-100 flex flex-col pt-6 shrink-0 transition-all shadow-sm">
       <div class="px-6 mb-6">
         <h2 class="text-xl font-extrabold text-gray-800">智能问答</h2>
         <p class="text-xs text-gray-400 mt-1">保存您的每一次教育灵感</p>
         <el-button type="primary" :icon="Plus" class="w-full mt-6 h-11 rounded-xl shadow-lg shadow-blue-500/20" @click="createNewSession">
           开启新对话
         </el-button>
       </div>

       <div class="px-6 mb-4">
         <el-input 
           v-model="sessionSearch" 
           placeholder="搜索历史主题..." 
           :prefix-icon="Search" 
           size="small" 
           class="session-search"
           clearable
         />
       </div>

       <div class="flex-1 overflow-y-auto px-4 space-y-2 pb-10" v-loading="loadingSessions">
          <div 
            v-for="s in filteredSessions" :key="s.id"
            @click="selectSession(s.id)"
            class="group p-4 rounded-xl cursor-pointer hover:bg-blue-50/50 transition-all flex items-center border border-transparent"
            :class="activeSessionId === s.id ? 'bg-blue-50 border-blue-100' : ''"
          >
            <el-icon class="mr-3 text-gray-400 group-hover:text-blue-500"><ChatDotRound /></el-icon>
            <div class="flex-1 overflow-hidden">
               <div class="text-sm font-bold text-gray-700 truncate">{{ s.topic || '新对话' }}</div>
               <div class="text-[10px] text-gray-400 mt-1">{{ formatDate(s.updatedAt) }}</div>
            </div>
            <el-icon class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-danger ml-2" @click.stop="deleteSession(s.id)"><Delete /></el-icon>
          </div>
          <el-empty v-if="filteredSessions.length === 0" description="暂无历史对话" :image-size="60" />
       </div>
    </aside>

    <!-- Main Chat Window -->
    <main class="flex-1 flex flex-col h-full bg-white relative">
      <!-- Chat Header -->
      <header class="h-16 px-8 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10 sticky top-0">
        <div class="flex items-center space-x-3">
          <div v-if="agentInfo" class="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
            <el-icon><component :is="agentInfo.iconUrl || 'MagicStick'" /></el-icon>
          </div>
          <div v-else class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <el-icon><Cpu /></el-icon>
          </div>
          <h2 class="font-bold text-gray-800 text-lg">
            {{ agentId ? (agentInfo?.title || '正在加载智能体...') : (activeSession?.topic || '通用智能问答') }}
          </h2>
        </div>
      </header>

      <!-- Message Area -->
      <div class="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth" ref="msgContainer">
        <!-- Agent Intro (One-shot Mode) -->
        <div v-if="agentId && messages.length === 0" class="max-w-3xl mx-auto py-10 text-center">
           <div class="w-20 h-20 rounded-3xl bg-blue-50 mx-auto flex items-center justify-center text-4xl text-primary mb-6">
              <el-icon><component :is="agentInfo?.iconUrl || 'MagicStick'" /></el-icon>
           </div>
           <h1 class="text-2xl font-black text-gray-800 mb-3">{{ agentInfo?.title }}</h1>
           <p class="text-gray-500 mb-8 max-w-lg mx-auto">{{ agentInfo?.description || '暂无详细介绍' }}</p>
           <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic text-sm text-gray-600">
             {{ agentInfo?.welcomeMsg || '您好！我是您的专属辅教助手，请在右侧填写参数后开始对话。' }}
           </div>
        </div>

        <!-- Session Welcome (Persistent Mode) -->
        <div v-if="!agentId && messages.length === 0" class="h-full flex flex-col items-center justify-center opacity-30 select-none">
           <el-icon :size="80"><ChatDotSquare /></el-icon>
           <p class="mt-4 text-sm font-medium">输入您想问的任何教育问题</p>
        </div>

        <!-- Chat Bubbles -->
        <div v-for="(msg, idx) in messages" :key="idx" class="flex w-full" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
          <div class="flex max-w-[85%] px-4" :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm" :class="msg.role === 'user' ? 'bg-primary ml-3' : 'bg-gray-100 mr-3'">
              <el-icon class="text-white" v-if="msg.role === 'user'"><User /></el-icon>
              <el-icon class="text-gray-600" v-else><Monitor /></el-icon>
            </div>
            <div class="p-4 rounded-3xl text-sm leading-relaxed" :class="msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-100 shadow-md' : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'">
               <pre class="whitespace-pre-wrap font-sans">{{ msg.content }}</pre>
            </div>
          </div>
        </div>
        
        <!-- Stream Loader Bubble -->
        <div v-if="isStreaming" class="flex w-full justify-start items-center space-x-2">
           <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mr-2 animate-pulse">
             <el-icon><Monitor /></el-icon>
           </div>
           <el-tag type="info" class="animate-pulse">正在为您生成最优教学建议...</el-tag>
        </div>
      </div>

      <!-- Input Bar (Shared) -->
      <footer class="p-6 md:px-10 border-t border-gray-100 bg-white">
        <!-- Floating Guide (For Agent usage) -->
        <div v-if="agentId" class="mb-4 flex flex-wrap gap-2">
           <el-tag v-for="tag in commonPrompts" :key="tag" class="cursor-pointer" hit @click="userInput = tag">{{ tag }}</el-tag>
        </div>

        <div class="max-w-4xl mx-auto flex items-end space-x-4 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-primary transition-all shadow-sm">
           <el-input 
             v-model="userInput" 
             type="textarea" 
             :rows="1" 
             autosize
             placeholder="请输入您的问题（按 Enter 发送...）" 
             class="chat-textarea"
             @keydown.enter.prevent="handleSend"
           />
           <el-button 
             type="primary" 
             :icon="Promotion" 
             circle 
             class="mb-1 mr-1" 
             :disabled="!userInput.trim() || isStreaming" 
             @click="handleSend"
           />
        </div>
        <p class="text-center text-[10px] text-gray-400 mt-4 tracking-wider">Powered by K12 Agent Cloud | 内容由 AI 生成，请注意甄别</p>
      </footer>
    </main>

    <!-- Right Sidebar: Form Config (Only for Agents) -->
    <aside v-if="agentId" class="w-80 bg-white border-l border-gray-100 p-8 shrink-0 flex flex-col overflow-y-auto">
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
       <div class="mt-auto px-4 py-8 bg-blue-50/50 rounded-2xl border border-blue-50">
          <p class="text-xs text-blue-600 leading-relaxed font-medium">配置说明：右侧参数将作为本次会话的上下文输入模型，调整参数可获得更精准的生成结果。</p>
       </div>
    </aside>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Search, ChatDotRound, Delete, MagicStick, Cpu, User, Monitor, Promotion, Setting, ChatDotSquare } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const userStore = useUserStore()

const agentId = computed(() => route.params.agentId as string)
const agentInfo = ref<any>(null)
const formConfig = ref<any[]>([])
const formData = ref<Record<string, any>>({})

const userInput = ref('')
const isStreaming = ref(false)
const messages = ref<any[]>([])
const msgContainer = ref<any>(null)

// Session History logic (General Q&A)
const activeSessionId = ref<number | null>(null)
const sessions = ref<any[]>([])
const loadingSessions = ref(false)
const sessionSearch = ref('')

const filteredSessions = computed(() => {
  if (!sessionSearch.value) return sessions.value
  return sessions.value.filter(s => s.topic?.includes(sessionSearch.value))
})

const activeSession = computed(() => sessions.value.find(s => s.id === activeSessionId.value))

const commonPrompts = ['生成一份教案', '批改一段作业', '帮我出3道选择题']

const formatDate = (date: string) => {
  const d = new Date(date)
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}

const loadAgent = async (id: string) => {
  try {
    const res = await fetch(`http://localhost:3000/agent/${id}`)
    const data = await res.json()
    if (res.ok && data.success) {
      agentInfo.value = data.data
      formConfig.value = agentInfo.value.formConfig ? JSON.parse(agentInfo.value.formConfig) : []
    }
  } catch (e) {}
}

const fetchSessions = async () => {
  loadingSessions.value = true
  try {
    const res = await fetch('http://localhost:3000/session/list', {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    const data = await res.json()
    if (res.ok && data.success) {
      sessions.value = data.data
    }
  } catch (e) {}
  finally { loadingSessions.value = false }
}

const createNewSession = async () => {
  try {
    const res = await fetch('http://localhost:3000/session/create', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    const data = await res.json()
    if (res.ok && data.success) {
       await fetchSessions()
       selectSession(data.data.id)
       ElMessage.success('已开启新的纯净对话')
    }
  } catch (e) {}
}

const selectSession = async (id: number) => {
  activeSessionId.value = id
  messages.value = []
  try {
    const res = await fetch(`http://localhost:3000/session/history/${id}`, {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    const data = await res.json()
    if (res.ok && data.success) {
      messages.value = data.data
      scrollToBottom()
    }
  } catch (e) {}
}

const deleteSession = async (id: number) => {
  try {
    const res = await fetch(`http://localhost:3000/session/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    if (res.ok) {
       await fetchSessions()
       if(activeSessionId.value === id) {
          activeSessionId.value = null
          messages.value = []
       }
    }
  } catch (e) {}
}

const handleSend = async () => {
  if (!userInput.value.trim() || isStreaming.value) return
  if (!agentId.value && !activeSessionId.value) {
     await createNewSession()
  }

  const userText = userInput.value
  userInput.value = ''
  
  if (!agentId.value) {
    // Persistent Mode - Save first for UI
    messages.value.push({ role: 'user', content: userText })
  } else {
    // One-shot Mode - Clear old or just show current
    messages.value = [{ role: 'user', content: userText }]
  }

  isStreaming.value = true
  scrollToBottom()

  try {
    const url = agentId.value 
        ? `http://localhost:3000/chat/stream/${agentId.value}`
        : `http://localhost:3000/chat/stream-session/${activeSessionId.value}`
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify(agentId.value ? formData.value : { prompt: userText })
    })

    if (!res.body) return
    
    // Add empty assistant message to fill
    const assistantMsgIdx = messages.value.push({ role: 'assistant', content: '' }) - 1
    
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const data = JSON.parse(line.slice(5))
            const content = data.choices[0].delta.content
            if (content) {
              messages.value[assistantMsgIdx].content += content
              scrollToBottom()
            }
          } catch (e) {}
        }
      }
    }

    if (!agentId.value) {
       // Refresh sessions to update themes or timestamps if needed
       fetchSessions()
    }

  } catch (err) {
    ElMessage.error('对话同步中断')
  } finally {
    isStreaming.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    }
  })
}

watch(agentId, (newId) => {
  messages.value = []
  if (newId) {
    loadAgent(newId)
  } else {
    agentInfo.value = null
    fetchSessions()
  }
}, { immediate: true })

onMounted(() => {
  if (!agentId.value) fetchSessions()
})
</script>

<style scoped>
.chat-textarea :deep(.el-textarea__inner) {
  @apply bg-transparent border-none shadow-none text-gray-700 p-3;
}
.session-search :deep(.el-input__wrapper) {
  @apply rounded-xl bg-gray-50 border-none shadow-none;
}
</style>
