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
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0">
            <el-icon class="w-6 h-6" :class="selectedAgent?.id === agent.id ? 'text-white' : 'text-blue-600'">
              <component :is="agent.iconUrl || 'MagicStick'" />
            </el-icon>
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
                    <div>
                      <label class="block text-sm font-medium text-[#475569] mb-1.5">
                        <span class="text-[#EF4444]">*</span> 分类选择
                      </label>
                      <DropdownSelect 
                        v-model="currentAgent.categoryId"
                        :options="categoryOptions"
                        direction="down"
                      />
                    </div>
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
                    <button class="text-xs text-[#314DE2] flex items-center gap-1 hover:underline">
                      <img src="@/images/pen-with-start.png" class="w-auto h-3" alt="optimize">
                      一键优化
                    </button>
                  </div>
                  <div class="relative">
                    <textarea 
                      v-model="currentAgent.systemPrompt"
                      class="w-full px-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#314DE2] focus:ring-1 focus:ring-[#314DE2] resize-none"
                      rows="5"
                      placeholder="# 角色设定
你是一位深耕教学十年的特级教师..."
                    ></textarea>
                    <div class="absolute bottom-2 right-3 text-xs text-[#94A3B8]">0/500</div>
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

              <!-- 图标和模型选择 -->
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-[#475569] mb-1.5">选择模型</label>
                  <DropdownSelect 
                    v-model="currentAgent.model"
                    :options="modelOptions"
                    direction="up"
                  />
                </div>
                <div>
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
      </div>

      <!-- 实时预览 -->
      <div class="flex-1 h-full bg-[#F8F9FD] flex flex-col overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-[#E2E8F0] bg-white/40 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 rounded-full bg-[#10B981]"></div>
            <span class="text-sm font-medium text-[#1E293B]">调试预览</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="flex items-center gap-1 px-3 py-1.5 text-xs text-[#475569] hover:bg-white rounded-lg transition-colors">
              <img src="@/images/reload.png" class="w-3 h-3" alt="reset">
              重置会话
            </button>
            <button class="flex items-center gap-1 px-3 py-1.5 text-xs text-[#475569] hover:bg-white rounded-lg transition-colors">
              <img src="@/images/share.png" class="w-3 h-3" alt="share">
              分享测试
            </button>
          </div>
        </div>

        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
            <div class="text-center space-y-4">
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
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-white border border-[#F1F5F9] rounded-2xl shadow-lg" style="box-shadow: 0px 8px 10px -6px rgba(226, 232, 240, 0.5), 0px 20px 25px -5px rgba(226, 232, 240, 0.5)">
              <div class="flex items-center gap-2 px-4 py-1.5">
                <img src="@/images/link-file.png" class="w-auto h-5" alt="attach" style="margin: 10px;">
                <img src="@/images/internal-grey.png" class="w-auto h-5" alt="image" style="margin: 10px;">
                <img src="@/images/speak.png" class="w-auto h-5" alt="link" style="margin: 10px;">
              </div>
              <div class="flex items-end gap-3 px-4 pb-4">
                <textarea 
                  v-model="previewInput"
                  style="line-height: 30px;"
                  ref="previewInputRef"
                  class="flex-1 text-sm bg-transparent border-0 focus:outline-none resize-none"
                  rows="3"
                  placeholder="请尽可能清晰地输入您的问题，shift+回车可换行。"
                  @input="autoResizePreviewInput"
                ></textarea>
                <button class="w-10 h-10 bg-gradient-to-br from-[#314DE2] to-[#6144D3] rounded-xl flex items-center justify-center flex-shrink-0" style="box-shadow: 0px 4px 6px -4px rgba(224, 231, 255, 1), 0px 10px 15px -3px rgba(224, 231, 255, 1)">
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
    @close="showIconPicker = false"
    @select="(key) => { currentAgent.iconUrl = key; showIconPicker = false; }"
  />
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import DropdownSelect from '../../components/DropdownSelect.vue'

import { agentApi, categoryApi } from '../../api/api'

const route = useRoute()
const router = useRouter()

const goBack = () => {
  router.push('/workspace/studio')
}

const loading = ref(false)
const saving = ref(false)
const publishing = ref(false)
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

const modelOptions = [
  {
    value: 'deepseek-v4-flash',
    label: 'qwen3.6-plus'
  },
  {
    value: 'deepseek-v3',
    label: 'gpt-4o'
  }
]

const categoryOptions = computed(() => {
  return availableCategories.value.map(c => ({
    value: c.id,
    label: c.name
  }))
})
const showIconPicker = ref(false)
const searchText = ref('')
const previewInput = ref('')
const previewInputRef = ref(null)
const publishVisibility = ref('ORG_VISIBLE')

const iconPathMap = {
  'book-icon': new URL('@/images/book-icon.png', import.meta.url).href,
  'computer-icon': new URL('@/images/computer-icon.png', import.meta.url).href,
  'file-icon': new URL('@/images/file-icon.png', import.meta.url).href
}

const myAgents = ref([])
const availableCategories = ref([])
const selectedAgent = ref(null)
const isEditMode = ref(false)

const currentAgent = ref({
  title: '',
  description: '',
  systemPrompt: '',
  welcomeMsg: '',
  iconUrl: 'book-icon',
  visibility: 'PRIVATE',
  categoryId: '',
  model: 'deepseek-v4-flash',
  enableWebSearch: true,
  enableWebParse: true,
  enableDeepThink: false,
  enableFileUpload: true,
  enableKnowledgeBase: false
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

// const iconOptions = [
//   'MagicStick', 'Document', 'DataAnalysis', 'ChatDotRound', 'Opportunity', 
//   'Collection', 'Reading', 'EditPen', 'TrendCharts', 'Compass'
// ]

const currentIconImage = computed(() => {
  return iconPathMap[currentAgent.value.iconUrl] || new URL('@/images/book-icon.png', import.meta.url).href
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

const loadCategories = async () => {
  try {
    const res = await categoryApi.getCategoryList()
    if (res.success && res.data) {
      availableCategories.value = res.data
    }
  } catch (error) {
    console.error('加载分类失败:', error)
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
        ...res.data,
        categoryId: res.data.categories && res.data.categories.length > 0 ? res.data.categories[0].categoryId : null
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
  selectedAgent.value = agent
  loadAgentDetail(agent.id)
}

const createNew = () => {
  isEditMode.value = false
  currentAgent.value = {
    title: '',
    description: '',
    systemPrompt: '',
    welcomeMsg: '',
    iconUrl: 'MagicStick',
    visibility: 'PRIVATE',
    categoryId: "",
    model: 'deepseek-v4-flash',
    enableWebSearch: true,
    enableWebParse: true,
    enableDeepThink: false,
    enableFileUpload: true,
    enableKnowledgeBase: false
  }
  currentFormConfig.value = []
  selectedAgent.value = null
  router.replace({ path: '/workspace/agent/edit', query: {} })
}

const saveAgent = async () => {
  if (!currentAgent.value.title || !currentAgent.value.systemPrompt) {
    ElMessage.warning('智能体名称与核心提示词(System Prompt)为必填项！')
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
      categoryId: currentAgent.value.categoryId,
      model: currentAgent.value.model || 'deepseek-v4-flash',
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
      const agentId = currentAgent.value.id || route.query.id
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
    const agentId = currentAgent.value.id || route.query.id
    if (!agentId) {
      ElMessage.error('请先保存智能体再发布！')
      return
    }
    await agentApi.updateAgent(agentId, {
      visibility: 'ORG_VISIBLE'
    })
    currentAgent.value.visibility = 'ORG_VISIBLE'
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

onMounted(async () => {
  await Promise.all([loadCategories(), loadAgents()])
  if (route.query.id) {
    isEditMode.value = true
    await loadAgentDetail(route.query.id)
    const agent = myAgents.value.find(a => a.id === route.query.id)
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
</style>
