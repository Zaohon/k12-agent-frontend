<template>
  <div class="h-full w-full bg-[#F8F9FD] flex overflow-hidden">
    <!-- 左侧栏 - 智能体列表 -->
    <div class="w-[280px] h-full bg-white border-r border-[#E2E8F0] flex flex-col overflow-hidden">
      <div class="p-4 border-b border-[#E2E8F0]">
        <el-button class="create-agent-btn" @click="createNew">
          <img src="@/images/add.png" alt="add" class="add-icon" />
          创建新的智能体
        </el-button>
        <div class="mt-4 relative">
          <img src="@/images/search.png" class="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2" alt="search">
          <input v-model="searchText" class="w-full pl-9 pr-4 py-2 text-sm bg-[#F8F9FD] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#314DE2]" placeholder="搜索智能体">
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-3 space-y-2">
        <div 
          v-for="agent in filteredAgents" 
          :key="agent.id"
          @click="selectAgent(agent)"
          :class="[
            'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
            selectedAgent?.id === agent.id 
              ? 'bg-gradient-to-r from-[#314DE2] to-[#6144D3] text-white' 
              : 'hover:bg-[#F8F9FD]'
          ]"
        >
          <div class="w-12 h-12 rounded-xl overflow-hidden shrink-0">
            <img :src="agent.iconUrl" class="w-full h-full object-cover" alt="icon">
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate" :class="selectedAgent?.id === agent.id ? 'text-white' : 'text-[#1E293B]'">
              {{ agent.title || '未命名智能体' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 合并右侧栏 -->
    <div class="flex-1 h-full flex overflow-hidden">
      <!-- 配置表单 -->
      <div class="flex-1 h-full overflow-y-auto bg-white border-r border-[#E2E8F0]">
        <div class="h-full flex flex-col">
          <div class="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] p-4 flex items-center justify-between z-10">
            <div class="flex items-center gap-3">
              <button @click="goBack" class="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8F9FD]">
                <img src="@/images/back.png" class="w-auto h-3 transform" alt="back">
              </button>
              <div class="flex items-center gap-2">
                <img src="@/images/config.png" class="w-auto h-5" alt="config">
                <span class="font-medium text-[#1E293B]">配置智能体</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button 
                @click="saveAgent" 
                :loading="saving"
                class="px-4 py-2 text-sm font-medium bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8F9FD] transition-all text-[#314DE2]"
              >
                <span class="flex items-center gap-2">
                  <img src="@/images/save.png" class="w-auto h-4" alt="save">
                  保存
                </span>
              </button>
              <button 
                @click="publishAgent"
                :loading="publishing"
                class="px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#314DE2] to-[#6144D3] rounded-xl hover:opacity-90 transition-all text-white"
              >
                <span class="flex items-center gap-2">
                  <img src="@/images/upload-cloud.png" class="w-auto h-4" alt="publish">
                  发布
                </span>
              </button>
            </div>
          </div>

          <div class="flex-1 p-6 overflow-y-auto">
            <div class="max-w-full mx-auto space-y-6">
              <!-- 基本信息 -->
              <div class="space-y-4">
                <div class="flex items-start gap-6">
                  <div class="relative flex-shrink-0">
                    <div class="w-36 h-36 rounded-[44px] flex items-center justify-center shadow-lg overflow-hidden bg-transparent">
                      <img :src="currentIconImage" class="w-full h-full" alt="agent icon">
                    </div>
                    <button @click="showIconPicker = true" class="absolute -right-2 -bottom-2 w-12 h-12 bg-[#1E293B] rounded-full border-[3px] border-[#FFFFFF] shadow flex items-center justify-center cursor-pointer">
                      <img src="@/images/white-pen-edit.png" class="w-5 h-5" alt="edit">
                    </button>
                  </div>
                  <div class="flex-1 space-y-5">
                    <div>
                      <label class="block text-sm font-medium text-[#475569] mb-1.5">
                        <span class="text-[#EF4444]">*</span> 智能体名称
                      </label>
                      <input 
                        v-model="currentAgent.title" 
                        class="w-full px-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#314DE2] focus:ring-1 focus:ring-[#314DE2]"
                        placeholder="请输入智能体名称"
                      >
                    </div>
                    <!-- <div>
                      <label class="block text-sm font-medium text-[#475569] mb-1.5">
                        <span class="text-[#EF4444]">*</span> 分类选择
                      </label>
                      <DropdownSelect 
                        v-model="currentAgent.categoryId"
                        :options="categoryOptions"
                        direction="down"
                      />
                    </div> -->
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[#475569] mb-1.5">
                    <span class="text-[#EF4444]">*</span> 智能体简介
                  </label>
                  <textarea 
                    v-model="currentAgent.description"
                    class="w-full px-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#314DE2] focus:ring-1 focus:ring-[#314DE2] resize-none"
                    rows="2"
                    placeholder="简要描述智能体的功能和定位..."
                  ></textarea>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="block text-sm font-medium text-[#475569]">
                      <span class="text-[#EF4444]">*</span> 提示词编辑 (Prompt)
                    </label>
                    <button 
                      class="text-xs text-[#314DE2] flex items-center gap-1 hover:underline"
                      @click="optimizePrompt"
                      :disabled="optimizing"
                    >
                      <img src="@/images/pen-with-start.png" class="w-auto h-3" alt="optimize">
                      <span v-if="!optimizing">一键优化</span>
                      <span v-else>优化中...</span>
                    </button>
                  </div>
                  <div class="relative">
                    <textarea 
                      v-model="currentAgent.systemPrompt"
                      :class="['prompt-textarea w-full px-3 py-2.5 text-sm bg-white border rounded-xl resize-none transition-all', optimizing ? 'border-[#314DE2] border-4 ring-4 ring-[#314DE2]/30 bg-blue-50/30' : 'border-[#E2E8F0] focus:border-[#314DE2] focus:ring-1 focus:ring-[#314DE2]']"
                      rows="5"
                      maxlength="500"
                      placeholder="# 角色设定
你是一位深耕教学十年的特级教师..."
                    ></textarea>
                    <div class="absolute bottom-2 right-3 text-xs text-[#94A3B8]"><span :class="(currentAgent.systemPrompt || '').length >= 500 ? 'text-red-500' : ''">{{ (currentAgent.systemPrompt || '').length }}</span>/500</div>
                  </div>
                </div>
              </div>

              <!-- 能力设置 -->
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <img src="@/images/power.png" class="w-auto h-4" alt="settings">
                  <span class="text-sm font-medium text-[#1E293B]">能力设置</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div
                    v-for="item in capabilityOptions"
                    :key="item.key"
                    class="flex items-center justify-between p-3 bg-white border border-[#E2E8F0] rounded-xl"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        :style="{ backgroundColor: item.bgColor }"
                      >
                        <img :src="item.image" class="w-auto h-4" :alt="item.alt">
                      </div>
                      <div>
                        <div class="text-sm font-medium text-[#334155]">{{ item.label }}</div>
                        <div class="text-xs text-[#94A3B8]">{{ item.description }}</div>
                      </div>
                    </div>
                    <button
                      @click="currentAgent[item.key] = !currentAgent[item.key]"
                      class="w-10 h-5 rounded-full transition-all p-1"
                      :style="{
                        backgroundColor: currentAgent[item.key] ? '#314DE2' : '#E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: currentAgent[item.key] ? 'flex-end' : 'flex-start'
                      }"
                    >
                      <div class="w-3 h-3 bg-white rounded-full shadow transition-all"></div>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 访问权限 -->
              <div class="w-[calc(50%-6px)]">
                <label class="block text-sm font-medium text-[#475569] mb-1.5">访问权限</label>
                <DropdownSelect 
                  v-model="currentAgent.visibility"
                  :options="visibilityOptions"
                  direction="up"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 实时预览 -->
      <div class="flex-1 h-full bg-[#F8F9FD] flex flex-col overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-[#E2E8F0] bg-white/40 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 rounded-full" :class="debugDotColor"></div>
            <span class="text-sm font-medium text-[#1E293B]">调试预览</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="flex items-center gap-1 px-3 py-1.5 text-xs text-[#475569] hover:bg-white rounded-lg transition-colors" @click="resetDebug">
              <img src="@/images/reload.png" class="w-3 h-3" alt="reset">
              重置会话
            </button>
            <button class="flex items-center gap-1 px-3 py-1.5 text-xs text-[#475569] hover:bg-white rounded-lg transition-colors" @click="shareDebug">
              <img src="@/images/share.png" class="w-3 h-3" alt="share">
              分享测试
            </button>
          </div>
        </div>

        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="chatContainerRef">
            <template v-if="debugMessages.length === 0">
              <div class="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div class="w-[78px] h-[78px] rounded-[24px] flex items-center justify-center mx-auto overflow-hidden shadow-lg">
                  <img :src="currentIconImage" class="w-full h-full object-cover" alt="agent icon">
                </div>
                <div>
                  <h3 class="text-xl font-medium text-[#0F172A]">{{ currentAgent.title || '未命名智能体' }}</h3>
                  <p class="text-sm text-[#94A3B8] mt-1">正在等待您的指令...</p>
                </div>
                <div class="flex flex-wrap items-center gap-4 pt-8">
                  <div 
                    v-for="capability in capabilityOptions" 
                    :key="capability.key"
                    v-show="currentAgent[capability.key]"
                    class="flex items-center gap-1.5 px-4 py-2 rounded-full"
                    :style="{ backgroundColor: capability.bgColor }"
                  >
                    <img :src="capability.image" class="w-auto h-3" :alt="capability.alt">
                    <span class="text-xs text-[#334155]">{{ capability.label }}</span>
                  </div>
                </div>
              </div>
            </template>
            <ChatMessage
              v-for="(msg, index) in debugMessages"
              :key="index"
              :message="msg"
              :show-attachments="false"
              :thinking-text="'AI正在思考中...'"
            />
          </div>

          <div class="p-6 space-y-4">
            <div :class="['bg-white border-2 rounded-2xl shadow-lg transition-all preview-input-container', isPreviewInputFocused ? 'border-[#314DE2]' : 'border-[#F1F5F9]']">
              <div class="flex items-center gap-2 px-4 py-1.5">
                <!-- <img src="@/images/link-file.png" class="w-auto h-5 preview-input-icon" alt="attach">
                <img src="@/images/internal-grey.png" class="w-auto h-5 preview-input-icon" alt="image"> -->
                <img 
                  src="@/images/speak.png" 
                  :class="['w-auto h-5 preview-input-icon cursor-pointer hover:opacity-80 transition-all', isRecording ? 'animate-pulse' : '']" 
                  :style="isRecording ? { filter: 'drop-shadow(0 0 4px #EF4444)' } : {}"
                  alt="voice" 
                  @click="handleVoiceClick"
                >
              </div>
              <div class="flex items-end gap-3 px-4 pb-4">
                <textarea 
                  v-model="previewInput"
                  ref="previewInputRef"
                  class="flex-1 text-sm bg-transparent border-0 focus:outline-none resize-none preview-textarea"
                  rows="3"
                  placeholder="请尽可能清晰地输入您的问题，shift+回车可换行。"
                  @input="autoResizePreviewInput"
                  @focus="isPreviewInputFocused = true"
                  @blur="isPreviewInputFocused = false"
                  @keydown.enter.exact.prevent="sendDebugMessage"
                  @keydown.shift.enter.exact="(e: any) => { e.stopPropagation(); }"
                ></textarea>
                <button class="w-10 h-10 bg-gradient-to-br from-[#314DE2] to-[#6144D3] rounded-xl flex items-center justify-center flex-shrink-0 send-button" @click="sendDebugMessage" :disabled="debugSending">
                  <img src="@/images/send.png" class="w-auto h-4 transform" alt="send">
                </button>
              </div>
            </div>
            <p class="text-xs text-center text-[#CBD5E1]">AI 可能会产生错误信息，请核实重要学术内容。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布弹窗 -->
    <div v-if="showPublishDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="showPublishDialog = false">
      <div class="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-[360px] p-6">
        <div class="text-center mb-6">
          <h3 class="text-lg font-medium text-[#1E293B] mb-2">确认发布</h3>
          <p class="text-sm text-[#475569]">确定要发布这个智能体吗？</p>
        </div>
        <div class="flex gap-3">
          <button @click="showPublishDialog = false" class="flex-1 py-3 text-sm font-medium text-[#1E293B] border border-[#E2E8F0] rounded-xl hover:bg-[#F8F9FD] transition-all">
            取消
          </button>
          <button @click="confirmPublish" :loading="publishing" class="flex-1 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#314DE2] to-[#6144D3] rounded-xl hover:opacity-90 transition-all">
            确认发布
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 图标选择弹窗 -->
  <IconPicker 
    :visible="showIconPicker" 
    :selected-key="currentAgent.iconUrl"
    :icon-list="agentLogos"
    @close="showIconPicker = false"
    @select="(key) => { currentAgent.iconUrl = key; showIconPicker = false; }"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import DropdownSelect from '../../components/DropdownSelect.vue'
import IconPicker from '../../components/IconPicker.vue'
import ChatMessage from '../../components/ChatMessage.vue'

import { agentApi, categoryApi, knowledgeApi, chatApi } from '../../api/api'
import { OSS_LOGO_BASE } from '../../costants/costant'

const route = useRoute()
const router = useRouter()

const goBack = () => {
  router.push('/workspace/studio')
}

const loading = ref(false)
const saving = ref(false)
const publishing = ref(false)
const optimizing = ref(false)
const showPublishDialog = ref(false)
const visibilityOptions = [
  {
    value: 'PUBLIC',
    label: '公开·所有人可使用',
    icon: new URL('@/images/earth.png', import.meta.url).href
  },
  {
    value: 'ORG_VISIBLE',
    label: '组织·组织内可见',
    icon: new URL('@/images/humans.png', import.meta.url).href
  },
  {
    value: 'PRIVATE',
    label: '私有·仅自己可见',
    icon: new URL('@/images/lock.png', import.meta.url).href
  }
]

// const categoryOptions = computed(() => {
//   return availableCategories.value.map(c => ({
//     value: c.id,
//     label: c.name
//   }))
// })
const showIconPicker = ref(false)
const searchText = ref('')
const previewInput = ref('')
const previewInputRef = ref<HTMLTextAreaElement | null>(null)
const isPreviewInputFocused = ref(false)
const publishVisibility = ref('ORG_VISIBLE')
const isRecording = ref(false)
const voiceProcessing = ref(false)
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

const debugMessages = ref<Array<{ role: 'user' | 'assistant'; content: string; isThinking?: boolean }>>([])
const debugSending = ref(false)
const debugStatus = ref<'idle' | 'waiting' | 'streaming'>('waiting')
const debugDotColor = computed(() => debugStatus.value === 'waiting' ? 'bg-[#EF4444]' : 'bg-[#10B981]')
const chatContainerRef = ref<HTMLElement | null>(null)

const agentLogos = ref<any[]>([])

const myAgents = ref<any[]>([])
// const availableCategories = ref([])
const selectedAgent = ref<any>(null)
const isEditMode = ref(false)

const currentAgent = ref({
  id: null as number | null,
  title: '',
  description: '',
  systemPrompt: '',
  welcomeMsg: '',
  iconUrl: '',
  visibility: 'PRIVATE',
  // categoryId: '',
  model: '',
  enableWebSearch: true,
  enableWebParse: true,
  enableDeepThink: false,
  enableFileUpload: true,
  enableKnowledgeBase: false,
  approvalStatus: ''
})

const currentFormConfig = ref([])

const capabilityOptions = [
  {
    key: 'enableWebSearch',
    label: '联网搜索',
    description: '实时检索网络最新信息并提高回复的时效性。',
    bgColor: '#DBEAFE',
    image: new URL('@/images/internal-blue.png', import.meta.url).href,
    alt: 'web'
  },
  {
    key: 'enableWebParse',
    label: '网页解析',
    description: '提供网页链接，模型可分析并使用网页信息。',
    bgColor: '#BEEBEE',
    image: new URL('@/images/web-read.png', import.meta.url).href,
    alt: 'parse'
  },
  {
    key: 'enableDeepThink',
    label: '深度思考',
    description: '启用后强制深度思考进行多步思考，处理更复杂任务。',
    bgColor: '#F3E8FF',
    image: new URL('@/images/think.png', import.meta.url).href,
    alt: 'deep'
  },
  {
    key: 'enableFileUpload',
    label: '文档上传',
    description: '支持图片上传文档，模型可分析并使用。',
    bgColor: '#FFF7ED',
    image: new URL('@/images/upload-file.png', import.meta.url).href,
    alt: 'file'
  },
  {
    key: 'enableKnowledgeBase',
    label: '专属知识库',
    description: '读取知识库信息，支持PDF、Word等多种格式。',
    bgColor: '#D6F7CF',
    image: new URL('@/images/database-green.png', import.meta.url).href,
    alt: 'kb'
  }
]

const currentIconImage = computed(() => {
  return currentAgent.value.iconUrl || (agentLogos.value.length > 0 ? agentLogos.value[0].src : '')
})



const selectIcon = (iconKey) => {
  currentAgent.value.iconUrl = iconKey
  showIconPicker.value = false
}

const filteredAgents = computed(() => {
  if (!searchText.value) return myAgents.value
  return myAgents.value.filter(agent => 
    agent.title?.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// const loadCategories = async () => {
//   try {
//     const res = await categoryApi.getCategoryList()
//     if (res.success && res.data) {
//       availableCategories.value = res.data
//     }
//   } catch (error) {
//     console.error('加载分类失败:', error)
//   }
// }

const fetchAgentLogos = async () => {
  try {
    const res = await knowledgeApi.getAgentLogos()
    if (res.success && Array.isArray(res.data)) {
      agentLogos.value = res.data.map(fileName => ({
        key: OSS_LOGO_BASE + fileName,
        src: OSS_LOGO_BASE + fileName
      }))
      if (agentLogos.value.length > 0 && !currentAgent.value.iconUrl) {
        currentAgent.value.iconUrl = agentLogos.value[0].src
      }
    }
  } catch (error) {
    console.error('加载图标列表失败:', error)
  }
}

const loadAgents = async () => {
  try {
    const res = await agentApi.getMyAgents()
    if (res.success && res.data) {
      myAgents.value = res.data
    }
  } catch (error) {
    console.error('加载智能体失败:', error)
  }
}

const loadAgentDetail = async (agentId) => {
  loading.value = true
  try {
    const res = await agentApi.getAgentById(agentId)
    if (res.success && res.data) {
      currentAgent.value = {
        ...res.data
        // categoryId: res.data.categories && res.data.categories.length > 0 ? res.data.categories[0].categoryId : null
      }
      try {
        currentFormConfig.value = res.data.formConfig ? JSON.parse(res.data.formConfig) : []
      } catch(e) {
        currentFormConfig.value = []
      }
    }
  } catch (error) {
    console.error('加载智能体详情失败:', error)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const selectAgent = (agent) => {
  optimizing.value = false
  resetDebug()
  selectedAgent.value = agent
  isEditMode.value = true
  router.replace({ path: '/workspace/agent/edit', query: { id: agent.id } })
  loadAgentDetail(agent.id)
}

const createNew = () => {
  isEditMode.value = false
  currentAgent.value = {
    id: null,
    title: '',
    description: '',
    systemPrompt: '',
    welcomeMsg: '',
    iconUrl: agentLogos.value[0]?.src || '',
    visibility: 'PRIVATE',
    // categoryId: "",
    model: '',
    enableWebSearch: true,
    enableWebParse: true,
    enableDeepThink: false,
    enableFileUpload: true,
    enableKnowledgeBase: false,
    approvalStatus: ''
  }
  currentFormConfig.value = []
  selectedAgent.value = null
  router.replace({ path: '/workspace/agent/edit', query: {} })
}

const saveAgent = async () => {
  if (!currentAgent.value.title || !currentAgent.value.description || !currentAgent.value.systemPrompt) {
    ElMessage.warning('智能体名称、智能体介绍与核心提示词(System Prompt)为必填项！')
    return
  }
  saving.value = true
  
  try {
    const agentData = {
      title: currentAgent.value.title,
      description: currentAgent.value.description,
      systemPrompt: currentAgent.value.systemPrompt,
      welcomeMsg: currentAgent.value.welcomeMsg,
      iconUrl: currentAgent.value.iconUrl,
      model: '',
      enableWebSearch: currentAgent.value.enableWebSearch || false,
      enableWebParse: currentAgent.value.enableWebParse || false,
      enableDeepThink: currentAgent.value.enableDeepThink || false,
      enableFileUpload: currentAgent.value.enableFileUpload || false,
      enableKnowledgeBase: currentAgent.value.enableKnowledgeBase || false,
      visibility: currentAgent.value.visibility || 'PRIVATE',
      formConfig: JSON.stringify(currentFormConfig.value)
    }

    let res
    if (isEditMode.value) {
      const agentId = currentAgent.value.id || route.query.id as string
      res = await agentApi.updateAgent(agentId, agentData)
    } else {
      res = await agentApi.createAgent(agentData)
    }

    if (res.success) {
      if (!isEditMode.value && res.data?.id) {
        currentAgent.value.id = res.data.id
        isEditMode.value = true
        router.replace({ path: '/workspace/agent/edit', query: { id: res.data.id } })
      }
      ElMessage.success(isEditMode.value ? '配置保存成功！' : '应用创建成功！')
      await loadAgents()
    }
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const publishAgent = () => {
  showPublishDialog.value = true
}

const confirmPublish = async () => {
  publishing.value = true
  try {
    const agentId = currentAgent.value.id || route.query.id as string
    if (!agentId) {
      ElMessage.error('请先保存智能体再发布！')
      return
    }
    await agentApi.updateAgent(agentId, {
      visibility: currentAgent.value.visibility,
      model: currentAgent.value.model
    })
    currentAgent.value.approvalStatus = 'PENDING'
    await loadAgents()
    ElMessage.success('发布申请已提交，请等待管理员审核。')
    showPublishDialog.value = false
  } catch (error) {
    console.error('发布失败:', error)
  } finally {
    publishing.value = false
  }
}

const autoResizePreviewInput = () => {
  nextTick(() => {
    if (previewInputRef.value) {
      previewInputRef.value.style.height = 'auto'
      previewInputRef.value.style.height = Math.min(previewInputRef.value.scrollHeight, 120) + 'px'
    }
  })
}

const optimizePrompt = async () => {
  if (!currentAgent.value.systemPrompt.trim()) {
    ElMessage.warning('请输入提示词内容')
    return
  }
  optimizing.value = true
  try {
    const res = await agentApi.optimizePrompt(currentAgent.value.systemPrompt)
    if (res.success && res.data?.optimizedText) {
      currentAgent.value.systemPrompt = res.data.optimizedText
      ElMessage.success('提示词优化成功')
    }
  } catch (error) {
    console.error('提示词优化失败:', error)
    ElMessage.error('优化失败，请重试')
  } finally {
    optimizing.value = false
  }
}

const sendDebugMessage = async () => {
  const text = previewInput.value.trim()
  if (!text || debugSending.value) return
  if (!currentAgent.value.systemPrompt.trim()) {
    ElMessage.warning('请先编辑提示词')
    return
  }

  debugMessages.value = []
  debugMessages.value.push({ role: 'user', content: text })
  debugMessages.value.push({ role: 'assistant', content: '', isThinking: true })
  previewInput.value = ''
  debugSending.value = true
  debugStatus.value = 'waiting'

  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  })

  try {
    const response = await agentApi.debugAgent({
      systemPrompt: currentAgent.value.systemPrompt,
      userMessage: text
    })

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder()
    let fullContent = ''
    const thinkingMsg = debugMessages.value[1]
    let streamDone = false
    let lastReceiveTime = Date.now()

    const heartbeatCheck = setInterval(() => {
      if (Date.now() - lastReceiveTime > 15000) {
        streamDone = true
      }
    }, 3000)

    while (true) {
      const { done, value } = await reader.read()
      if (done || streamDone) break

      lastReceiveTime = Date.now()
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line === 'data: [DONE]') {
          streamDone = true
          debugSending.value = false
          break
        }
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6))
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              if (!fullContent) {
                debugStatus.value = 'streaming'
              }
              fullContent += delta
              thinkingMsg.content = fullContent
              thinkingMsg.isThinking = false
            }
          } catch {
            // Skip parse errors
          }
        }
      }

      nextTick(() => {
        if (chatContainerRef.value) {
          chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
        }
      })
    }

    clearInterval(heartbeatCheck)

    if (!fullContent) {
      thinkingMsg.content = '抱歉，我没有生成有效回复，请重试。'
      thinkingMsg.isThinking = false
      debugStatus.value = 'waiting'
    }
  } catch {
    const thinkingMsg = debugMessages.value[1]
    if (thinkingMsg) {
      thinkingMsg.content = '网络错误，请检查后端服务是否启动。'
      thinkingMsg.isThinking = false
    }
    debugStatus.value = 'waiting'
  } finally {
    debugSending.value = false
  }
}

const resetDebug = () => {
  debugMessages.value = []
  previewInput.value = ''
  debugSending.value = false
  debugStatus.value = 'waiting'
}

const shareDebug = () => {
  const userMsg = debugMessages.value.find(m => m.role === 'user')
  const assistantMsg = debugMessages.value.find(m => m.role === 'assistant')
  if (!userMsg || !assistantMsg) {
    ElMessage.warning('暂无对话内容可分享')
    return
  }
  const text = JSON.stringify({ question: userMsg.content, asked: assistantMsg.content })
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('对话内容已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const handleVoiceClick = async () => {
  if (voiceProcessing.value) {
    ElMessage.warning('正在处理语音，请稍候...')
    return
  }

  if (isRecording.value) {
    // 停止录音
    stopRecording()
  } else {
    // 开始录音
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      processAudio(audioBlob)
      // 停止所有轨道
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.start()
    isRecording.value = true
    ElMessage.info('正在录音，再次点击停止')
  } catch (error) {
    console.error('获取麦克风权限失败:', error)
    ElMessage.error('无法获取麦克风权限，请检查浏览器设置')
  }
}

const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    isRecording.value = false
  }
}

const processAudio = async (audioBlob: Blob) => {
  voiceProcessing.value = true
  try {
    ElMessage.info('正在处理语音...')
    const res = await chatApi.voiceToText(audioBlob, 'zh') as any
    if (res.success && res.data?.text) {
      previewInput.value = res.data.text
      ElMessage.success('语音转文字成功')
      nextTick(() => {
        previewInputRef.value?.focus()
      })
    } else {
      ElMessage.error(res.message || '语音转文字失败')
    }
  } catch (error) {
    console.error('语音转文字失败:', error)
    ElMessage.error('语音转文字失败，请重试')
  } finally {
    voiceProcessing.value = false
  }
}

onMounted(async () => {
  optimizing.value = false
  await Promise.all([/* loadCategories(), */ loadAgents(), fetchAgentLogos()])
  const queryId = route.query.id as string
  if (queryId) {
    isEditMode.value = true
    await loadAgentDetail(queryId)
    const agent = myAgents.value.find(a => a.id === queryId)
    if (agent) {
      selectedAgent.value = agent
    }
  } else {
    isEditMode.value = false
  }
})
</script>

<style scoped>
.create-agent-btn {
  width: 255px;
  height: 41px;
  gap: 8px;
  border-radius: 12px;
  padding: 12px 0;
  background: linear-gradient(177deg, rgba(49, 77, 226, 1) 0%, rgba(97, 68, 211, 1) 100%);
  box-shadow: 0px 8px 20px 0px rgba(49, 77, 226, 0.2);
  border: none;
  font-family: Noto Sans SC, sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -2.5%;
  color: #FFFFFF;
}

.create-agent-btn:hover {
  background: linear-gradient(177deg, rgba(49, 77, 226, 1) 0%, rgba(97, 68, 211, 1) 100%);
  opacity: 0.9;
}

.add-icon {
  width: 8px;
  height: 8px;
  object-fit: contain;
  transform: translateX(-10px);
}

.prompt-textarea::-webkit-scrollbar {
  display: none;
}

.prompt-textarea {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

textarea.prompt-textarea:focus {
  border-color: #314DE2 !important;
  outline: none !important;
  box-shadow: 0 0 0 1px #314DE2 !important;
}

.preview-input-container {
  box-shadow: 0px 8px 10px -6px rgba(226, 232, 240, 0.5), 0px 20px 25px -5px rgba(226, 232, 240, 0.5);
}

.preview-input-icon {
  margin: 10px;
}

.preview-textarea {
  line-height: 30px;
}

.send-button {
  box-shadow: 0px 4px 6px -4px rgba(224, 231, 255, 1), 0px 10px 15px -3px rgba(224, 231, 255, 1);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
