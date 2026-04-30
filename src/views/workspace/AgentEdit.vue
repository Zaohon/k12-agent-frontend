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
                <div class="flex items-start gap-4">
                  <div class="relative">
                    <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#314DE2] to-[#6144D3] flex items-center justify-center shadow-lg">
                      <el-icon class="w-10 h-10 text-white">
                        <component :is="currentAgent.iconUrl || 'MagicStick'" />
                      </el-icon>
                    </div>
                    <button class="absolute -right-1 -bottom-1 w-6 h-6 bg-white rounded-full border border-[#E2E8F0] shadow flex items-center justify-center">
                      <img src="@/images/icon-edit.png" class="w-3 h-3" alt="edit">
                    </button>
                  </div>
                  <div class="flex-1 space-y-4">
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
                      <div class="relative">
                        <select 
                          v-model="currentAgent.categoryId"
                          class="w-full px-3 py-2.5 pr-10 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#314DE2] focus:ring-1 focus:ring-[#314DE2] appearance-none"
                          :class="{ 'text-[#6B7280]': !currentAgent.categoryId }"
                        >
                          <option value="" disabled style="color: #6B7280;">请选择分类</option>
                          <option v-for="c in availableCategories" :key="c.id" :value="c.id" style="color: #1E293B;">{{ c.name }}</option>
                        </select>
                        <img src="@/images/arrow-grey.png" class="w-2 h-auto absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" alt="arrow">
                      </div>
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
                  <select 
                    v-model="currentAgent.model"
                    class="w-full px-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#314DE2] focus:ring-1 focus:ring-[#314DE2] appearance-none"
                    style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%2364748B%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22M19 9l-7 7-7-7%22/></svg>'); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px;"
                  >
                    <option value="deepseek-v4-flash">qwen3.6-plus</option>
                    <option value="deepseek-v3">gpt-4o</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[#475569] mb-1.5">访问权限</label>
                  <div class="relative">
                    <div 
                      @click="showVisibilityMenu = !showVisibilityMenu"
                      class="w-full px-3 py-2.5 pr-10 text-sm bg-white border border-[#E2E8F0] rounded-lg cursor-pointer flex items-center justify-between hover:border-[#CBD5E1] transition-colors"
                    >
                      <span class="flex items-center gap-4">
                        <img :src="visibilityIcon" class="w-3 h-auto flex-shrink-0" :alt="currentAgent.visibility" style="margin-right: 8px;">
                        <span class="text-left">{{ visibilityLabel }}</span>
                      </span>
                      <img src="@/images/arrow-grey.png" class="w-3 h-auto" alt="arrow">
                    </div>
                    <div 
                      v-if="showVisibilityMenu"
                      class="absolute left-0 right-0 mb-1 bg-white rounded-lg shadow-lg border border-[#E2E8F0] z-50"
                      :style="{ bottom: '100%', top: 'auto' }"
                      @mouseleave="showVisibilityMenu = false"
                    >
                      <div class="py-1">
                        <div 
                          @click="selectVisibility('PUBLIC')"
                          class="flex items-center gap-4 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <img src="@/images/earth.png" class="w-3 h-auto flex-shrink-0" alt="earth">
                          <span class="text-sm text-[#1E293B]">公开·所有人可使用</span>
                        </div>
                        <div 
                          @click="selectVisibility('ORG_VISIBLE')"
                          class="flex items-center gap-4 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <img src="@/images/humans.png" class="w-3 h-auto flex-shrink-0" alt="humans">
                          <span class="text-sm text-[#1E293B]">组织·组织内可见</span>
                        </div>
                        <div 
                          @click="selectVisibility('PRIVATE')"
                          class="flex items-center gap-4 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <img src="@/images/lock.png" class="w-3 h-auto flex-shrink-0" alt="lock">
                          <span class="text-sm text-[#1E293B]">私有·仅自己可见</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
              <img src="@/images/arrow.png" class="w-3 h-3" alt="reset">
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
              <div class="w-[78px] h-[78px] rounded-2xl bg-gradient-to-br from-[#314DE2] to-[#6144D3] flex items-center justify-center mx-auto" style="box-shadow: 0px 8px 10px -6px rgba(199, 210, 254, 1), 0px 20px 25px -5px rgba(199, 210, 254, 1)">
                <el-icon class="w-[34px] h-[34px] text-white">
                  <component :is="currentAgent.iconUrl || 'MagicStick'" />
                </el-icon>
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
            <div class="bg-white border border-[#E2E8F0] rounded-2xl shadow-lg" style="box-shadow: 0px 8px 10px -6px rgba(226, 232, 240, 0.5), 0px 20px 25px -5px rgba(226, 232, 240, 0.5)">
              <div class="flex items-center gap-2 px-4 py-1.5">
                <img src="@/images/link-file.png" class="w-auto h-5" alt="attach">
                <img src="@/images/internal-grey.png" class="w-auto h-5" alt="image">
                <img src="@/images/speak.png" class="w-auto h-5" alt="link">
              </div>
              <div class="flex items-end gap-3 px-4 pb-4">
                <textarea 
                  v-model="previewInput"
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
      <div class="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-[400px] p-6">
        <div class="text-center mb-6">
          <h3 class="text-lg font-medium text-[#1E293B] mb-2">申请上架分发</h3>
          <p class="text-xs text-[#475569] leading-relaxed italic p-4 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl mb-6">
            申请发布后，校内管理员或系统级管理员将会对您的智能体进行合规性审核。审核通过后，该应用将在相应的作用域公开显示。
          </p>
          <div class="space-y-3">
            <label class="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#314DE2] transition-all">
              <input type="radio" v-model="publishVisibility" value="ORG_VISIBLE" class="w-4 h-4 text-[#314DE2]">
              <div class="text-left">
                <div class="font-medium text-[#1E293B]">仅本校公开</div>
                <div class="text-xs text-[#64748B]">本校组织内的所有师生都可以从广场看到并使用</div>
              </div>
            </label>
            <label class="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#314DE2] transition-all">
              <input type="radio" v-model="publishVisibility" value="PUBLIC" class="w-4 h-4 text-[#314DE2]">
              <div class="text-left">
                <div class="font-medium text-[#1E293B]">全平台公开</div>
                <div class="text-xs text-[#64748B]">全网所有 K12 平台的注册用户均可探索发现</div>
              </div>
            </label>
          </div>
        </div>
        <div class="flex gap-3">
          <button @click="showPublishDialog = false" class="flex-1 py-2.5 text-sm font-medium text-[#1E293B] border border-[#E2E8F0] rounded-xl hover:bg-[#F8F9FD] transition-all">
            我再等等
          </button>
          <button @click="confirmPublish" :loading="publishing" class="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#314DE2] to-[#6144D3] rounded-xl hover:opacity-90 transition-all">
            提交上架申请
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MagicStick, Document, DataAnalysis, ChatDotRound, Opportunity, Collection, Reading, EditPen, TrendCharts, Compass } from '@element-plus/icons-vue'
import { agentApi, categoryApi } from '../../api/api'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const publishing = ref(false)
const showPublishDialog = ref(false)
const showVisibilityMenu = ref(false)
const searchText = ref('')
const previewInput = ref('')
const previewInputRef = ref(null)
const publishVisibility = ref('ORG_VISIBLE')

const myAgents = ref([])
const availableCategories = ref([])
const selectedAgent = ref(null)

const currentAgent = ref({
  title: '',
  description: '',
  systemPrompt: '',
  welcomeMsg: '',
  iconUrl: 'MagicStick',
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

const iconOptions = [
  'MagicStick', 'Document', 'DataAnalysis', 'ChatDotRound', 'Opportunity', 
  'Collection', 'Reading', 'EditPen', 'TrendCharts', 'Compass'
]

const visibilityIcon = computed(() => {
  const icons = {
    'PUBLIC': new URL('@/images/earth.png', import.meta.url).href,
    'ORG_VISIBLE': new URL('@/images/humans.png', import.meta.url).href,
    'PRIVATE': new URL('@/images/lock.png', import.meta.url).href
  }
  return icons[currentAgent.value.visibility] || new URL('@/images/lock.png', import.meta.url).href
})

const visibilityLabel = computed(() => {
  const labels = {
    'PUBLIC': '公开·所有人可使用',
    'ORG_VISIBLE': '组织·组织内可见',
    'PRIVATE': '私有·仅自己可见'
  }
  return labels[currentAgent.value.visibility] || '私有·仅自己可见'
})

const selectVisibility = (value) => {
  currentAgent.value.visibility = value
  showVisibilityMenu.value = false
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
    if (route.query.id) {
      res = await agentApi.updateAgent(route.query.id, agentData)
    } else {
      res = await agentApi.createAgent(agentData)
    }

    if (res.success) {
      ElMessage.success(route.query.id ? '配置保存成功！' : '应用创建成功！')
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
    await agentApi.updateAgent(currentAgent.value.id, {
      visibility: publishVisibility.value
    })
    currentAgent.value.visibility = publishVisibility.value
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
    await loadAgentDetail(route.query.id)
    const agent = myAgents.value.find(a => a.id === route.query.id)
    if (agent) {
      selectedAgent.value = agent
    }
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
