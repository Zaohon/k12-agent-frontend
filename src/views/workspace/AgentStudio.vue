<template>
  <div class="h-full w-full bg-[#FFFFFF66] flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="px-8 py-4 flex justify-between items-center shrink-0">
      <el-button class="create-agent-btn" @click="createNew">
        <img src="@/images/add.png" alt="add" class="add-icon" />
        创建新的智能体
      </el-button>
      <div class="flex items-center gap-4">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索智能体"
          class="w-64"
        >
          <template #prefix>
            <img src="@/images/search.png" alt="search" class="w-auto h-3">
          </template>
        </el-input>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto px-8 pt-6">
      <div v-if="!isEditing" class="">
        <!-- Agent Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <div 
            v-for="agent in filteredAgents" 
            :key="agent.id"
            class="agent-card bg-white rounded-[16px] shadow-sm border border-[#DEE3EA] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            @mouseleave="handleCardMouseLeave"
          >
            <div class="px-6 pt-6 pb-4">
              <div class="flex items-start gap-4 mb-5">
                <!-- 左侧图标 -->
                <div class="w-[78px] h-[78px] rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <el-icon class="text-[34px] text-white"><component :is="agent.iconUrl || 'MagicStick'" /></el-icon>
                </div>
                <!-- 右侧内容 -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-[20px] leading-[28px] text-[#0F172A] truncate mb-1">{{ agent.title || '未命名应用' }}</h3>
                  <p class="font-medium text-[14px] leading-[20px] text-[#5A6066] line-clamp-2">{{ agent.description || '暂无描述' }}</p>
                </div>
              </div>
              <!-- 底部信息 -->
              <div class="border-t border-[#EBEEF4] pt-[20px] flex items-center justify-between">
                <div class="flex items-center gap-[5px]">
                  <img src="@/images/is-visable.png" alt="visibility" class="w-auto h-3">
                  <span class="font-medium text-[12px] leading-[16px] text-[#767B82]">{{ getVisibilityText(agent) }}</span>
                </div>
                <div class="flex items-center gap-6">
                  <div class="flex items-center gap-[5px]">
                  <img src="@/images/time.png" alt="time" class="w-auto h-3">
                    <span class="font-medium text-[12px] leading-[16px] text-[#767B82]">最后修改: {{ getTimeText(agent.updatedAt) }}</span>
                  </div>
                  <!-- 设置按钮和点击菜单 -->
                  <div 
                    class="relative"
                    @mouseenter="openMenuAgentId = agent.id"
                  >
                    <img 
                      src="@/images/setting.png" 
                      alt="setting" 
                      class="w-[18px] h-[18px] cursor-pointer"
                      @click.stop="toggleMenu(agent.id)"
                    />
                    <!-- 点击菜单 -->
                    <div 
                      v-if="openMenuAgentId === agent.id"
                      class="absolute bottom-full right-1/2 translate-x-1/2 mb-4 w-40 bg-white rounded-lg shadow-lg border border-[#DEE3EA] p-[15px] z-50 dropdown-menu"
                      @mouseenter="openMenuAgentId = agent.id"
                      @mouseleave="handleCardMouseLeave"
                    >
                      <div class="space-y-3">
                        <!-- 对话 -->
                        <div 
                          class="flex items-center gap-2 px-[10px] py-0 cursor-pointer hover:bg-gray-50 rounded transition-colors"
                          @click.stop="handleMenuItemClick(() => goTest(agent))"
                        >
                          <img src="@/images/icon-chat.png" alt="chat" class="w-auto h-4">
                          <span class="font-medium text-[14px] leading-[20px] text-[#2E3339]">对话</span>
                        </div>
                        <!-- 分享 -->
                        <div 
                          class="flex items-center gap-2 px-[10px] py-0 cursor-pointer hover:bg-gray-50 rounded transition-colors"
                          @click.stop="handleMenuItemClick(() => ElMessage.info('分享功能开发中'))"
                        >
                          <img src="@/images/icon-share.png" alt="share" class="w-auto h-4">
                          <span class="font-medium text-[14px] leading-[20px] text-[#2E3339]">分享</span>
                        </div>
                        <!-- 修改配置 -->
                        <div 
                          class="flex items-center gap-2 px-[10px] py-0 cursor-pointer hover:bg-gray-50 rounded transition-colors"
                          @click.stop="handleMenuItemClick(() => editAgent(agent))"
                        >
                          <img src="@/images/icon-edit.png" alt="edit" class="w-auto h-4">
                          <span class="font-medium text-[14px] leading-[20px] text-[#2E3339]">修改配置</span>
                        </div>
                        <!-- 删除智能体 -->
                        <div 
                          class="flex items-center gap-2 px-[10px] py-0 cursor-pointer hover:bg-gray-50 rounded transition-colors"
                          @click.stop="handleMenuItemClick(() => deleteAgent(agent))"
                        >
                          <img src="@/images/icon-delete.png" alt="delete" class="w-auto h-4">
                          <span class="font-medium text-[14px] leading-[20px] text-[#FF7C7C]">删除智能体</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Create New Card -->
          <div 
            @click="createNew"
            class="bg-white rounded-2xl border-2 border-dashed border-[#ADB2B9] hover:border-blue-400 transition-all cursor-pointer flex items-center justify-center min-h-[180px]"
          >
            <div class="text-center">
              <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <el-icon class="text-2xl text-gray-400"><Plus /></el-icon>
              </div>
              <span class="text-gray-500 font-medium text-sm">创建新智能体</span>
            </div>
          </div>
        </div>

        <div v-if="myAgents.length === 0" class="text-center py-20">
          <el-empty description="暂无智能体，快去新建一个吧！" />
        </div>
      </div>

      <!-- Editor Mode -->
      <div v-else class="max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 relative">
          <!-- Editor Header -->
          <div class="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
            <div class="flex items-center space-x-4 w-full">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-3xl shadow-md shrink-0">
                <el-icon><component :is="currentAgent.iconUrl || 'MagicStick'" /></el-icon>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <h2 class="text-2xl font-bold text-gray-800">{{ currentAgent.title || '新智能体应用' }}</h2>
                    <el-tag :type="getStatusTag(currentAgent)" effect="plain">
                      {{ getStatusText(currentAgent) }}
                    </el-tag>
                  </div>
                  <!-- Action Buttons -->
                  <div class="flex items-center space-x-3">
                    <el-button :icon="ChatDotRound" @click="goTest(currentAgent)" round>去测试</el-button>
                    <el-button type="primary" :icon="Upload" v-if="currentAgent.visibility === 'PRIVATE'" @click="showPublishDialog = true" round>申请发布</el-button>
                    <el-button type="warning" plain v-else @click="cancelPublish" round>撤下/转私有</el-button>
                  </div>
                </div>
                <p class="text-sm text-gray-500 mt-1">{{ currentAgent.description || '配置您的个性化 AI 辅教助手' }}</p>
              </div>
            </div>
          </div>

          <el-form label-position="top" class="space-y-6">
            <div class="grid grid-cols-2 gap-8">
              <el-form-item label="智能体名称" required>
                <el-input size="large" placeholder="如：班级值日生排班管家" v-model="currentAgent.title" />
              </el-form-item>
              <el-form-item label="一句话简介">
                <el-input size="large" placeholder="向其他老师介绍这个助理能做什么" v-model="currentAgent.description" />
              </el-form-item>
            </div>

            <el-form-item label="核心角色设定 (System Prompt)" required>
              <p class="text-xs text-gray-400 mb-2 leading-relaxed">详细描述该智能体的角色、背景、逻辑规则。此配置是大模型的大脑内核。</p>
              <el-input 
                type="textarea" 
                :rows="10" 
                placeholder="# 角色设定&#10;你是一位深耕教学十年的特级教师..."
                class="font-mono bg-gray-50 border-none"
                v-model="currentAgent.systemPrompt"
              />
            </el-form-item>

            <el-form-item label="参数配置向导 (Form Config)">
              <p class="text-xs text-gray-400 mb-2">定义对话侧边栏的输入字段。这些内容将自动拼接到 Prompt 中。</p>
              <div class="border border-gray-100 rounded-xl p-6 bg-gray-50/50">
                <div v-for="(field, index) in currentFormConfig" :key="index" class="bg-white p-5 rounded-xl shadow-sm mb-4 border border-gray-100 flex items-start gap-5">
                  <div class="flex-1 grid grid-cols-2 gap-5">
                    <el-input v-model="field.label" placeholder="显示标签 (如：学生姓名)">
                      <template #prepend>字段显示</template>
                    </el-input>
                    <el-input v-model="field.key" placeholder="变量标识 (不可重复)">
                      <template #prepend>参数Key</template>
                    </el-input>
                    <el-select v-model="field.type" style="width: 100%">
                      <el-option label="单行文本框 (Input)" value="input" />
                      <el-option label="多行文本区域 (Textarea)" value="textarea" />
                    </el-select>
                    <div class="flex items-center justify-between px-2">
                      <el-switch v-model="field.required" active-text="必选参数" />
                      <el-input v-model="field.placeholder" size="small" placeholder="占位提示" class="w-32" />
                    </div>
                  </div>
                  <el-button type="danger" :icon="Delete" circle plain @click="removeField(index)" />
                </div>
                <el-button type="primary" plain class="w-full h-12 border-dashed rounded-xl" :icon="Plus" @click="addField">添加表单输入变量</el-button>
              </div>
            </el-form-item>

            <div class="grid grid-cols-2 gap-8">
              <el-form-item label="分发分类" required>
                <el-select v-model="currentAgent.categoryId" placeholder="选择所属领域/分类" size="large" style="width: 100%">
                  <el-option v-for="c in availableCategories" :key="c.id" :label="c.name" :value="c.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="图标标识">
                <div class="flex flex-wrap gap-2">
                   <div 
                     v-for="icon in iconOptions" :key="icon"
                     @click="currentAgent.iconUrl = icon"
                     class="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer border-2 transition-all"
                     :class="currentAgent.iconUrl === icon ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'"
                   >
                     <el-icon><component :is="icon" /></el-icon>
                   </div>
                </div>
              </el-form-item>
            </div>

            <el-form-item label="开场欢迎语 (Welcome Message)">
              <el-input size="large" placeholder="打开应用时的开场白..." v-model="currentAgent.welcomeMsg" />
            </el-form-item>
          </el-form>

          <!-- Save Actions Dock -->
           <div class="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4">
              <el-button size="large" round @click="cancelEdit">返回</el-button>
              <el-button type="primary" size="large" round @click="saveAgent" :loading="saving" class="w-48 shadow-lg shadow-blue-500/20">
                立即保存配置
              </el-button>
           </div>
        </div>
      </div>
    </main>

    <!-- Publish Dialog -->
    <el-dialog v-model="showPublishDialog" title="申请上架分发" width="450px" center>
      <div class="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
        <p class="text-xs text-blue-700 leading-relaxed italic">申请发布后，校内管理员或系统级管理员将会对您的智能体进行合规性审核。审核通过后，该应用将在相应的作用域公开显示。</p>
      </div>
      <el-form label-position="top">
        <el-form-item label="选择分发范围">
          <el-radio-group v-model="publishVisibility" class="flex flex-col space-y-3 w-full publish-radios">
             <el-radio label="ORG_VISIBLE" border class="m-0 w-full h-auto py-3">
               <div class="flex flex-col">
                  <span class="font-bold">仅本校公开 (Internal)</span>
                  <span class="text-xs text-gray-400 font-normal">本校组织内的所有师生都可以从广场看到并使用</span>
               </div>
             </el-radio>
             <el-radio label="PUBLIC" border class="m-0 w-full h-auto py-3">
               <div class="flex flex-col">
                  <span class="font-bold">全平台公开 (Global)</span>
                  <span class="text-xs text-gray-400 font-normal">全网所有 K12 平台的注册用户均可探索发现</span>
               </div>
             </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end space-x-3">
           <el-button @click="showPublishDialog = false">我再等等</el-button>
           <el-button type="primary" @click="confirmPublish" :loading="publishing">提交上架申请</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Delete Confirm Dialog -->
    <div v-if="showDeleteDialog" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30" @click="showDeleteDialog = false"></div>
      <div class="relative bg-white rounded-[16px] shadow-lg border border-[#DEE3EA] w-[360px] p-6">
        <div class="text-center mb-6">
          <h3 class="text-lg font-medium text-[#2E3339] mb-2">删除确认</h3>
          <p class="text-sm text-[#767B82]">确定要删除这个智能体吗？此操作不可恢复。</p>
        </div>
        <div class="flex gap-3">
          <button 
            class="flex-1 py-3 rounded-[12px] border border-[#DEE3EA] text-[#2E3339] font-medium hover:bg-gray-50 transition-colors"
            @click="showDeleteDialog = false"
          >
            取消
          </button>
          <button 
            class="flex-1 py-3 rounded-[12px] bg-gradient-to-r from-[#314DE2] to-[#6144D3] text-white font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all"
            @click="confirmDelete"
          >
            确定删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Plus, Search, MagicStick, Document, DataAnalysis, ChatDotRound, Delete, Upload, View, Clock, Setting, Share, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data - 本地状态
const myAgents = ref([
  {
    id: 1,
    title: '微积分高手',
    description: '支持上传微积分作业，自动识别并生成分析报告，详细解答题目与答题思路',
    systemPrompt: '你是一位资深的微积分老师，擅长帮助学生理解和解决各种微积分问题。',
    welcomeMsg: '你好！我是微积分高手，有什么问题需要我帮助吗？',
    iconUrl: 'Document',
    visibility: 'PUBLIC',
    approvalStatus: 'APPROVED',
    categoryId: 1,
    updatedAt: Date.now() - 86400000,
    formConfig: JSON.stringify([
      { label: '题目描述', key: 'problem', type: 'textarea', required: true, placeholder: '请输入题目内容' }
    ])
  },
  {
    id: 2,
    title: '教案生成专家',
    description: '根据课程标准和教学目标，快速生成结构化的教学方案',
    systemPrompt: '你是一位优秀的教案设计专家，擅长设计符合教学大纲的完整教案。',
    welcomeMsg: '你好！我是教案生成专家，请告诉我您需要什么样的教案。',
    iconUrl: 'Document',
    visibility: 'ORG_VISIBLE',
    approvalStatus: 'APPROVED',
    categoryId: 2,
    updatedAt: Date.now() - 172800000,
    formConfig: JSON.stringify([])
  },
  {
    id: 3,
    title: '期末总结',
    description: '客观梳理全学期工作，提炼成果与不足，利于复盘与规划',
    systemPrompt: '你是一位教育管理专家，擅长帮助教师进行学期总结和规划。',
    welcomeMsg: '欢迎！让我们一起来回顾这个学期吧。',
    iconUrl: 'DataAnalysis',
    visibility: 'PRIVATE',
    approvalStatus: null,
    categoryId: 3,
    updatedAt: Date.now() - 259200000,
    formConfig: JSON.stringify([])
  },
  {
    id: 4,
    title: '期末总结',
    description: '客观梳理全学期工作，提炼成果与不足，利于复盘与规划',
    systemPrompt: '你是一位教育管理专家，擅长帮助教师进行学期总结和规划。',
    welcomeMsg: '欢迎！让我们一起来回顾这个学期吧。',
    iconUrl: 'DataAnalysis',
    visibility: 'PRIVATE',
    approvalStatus: null,
    categoryId: 3,
    updatedAt: Date.now() - 259200000,
    formConfig: JSON.stringify([])
  },
  {
    id: 5,
    title: '期末总结',
    description: '客观梳理全学期工作，提炼成果与不足，利于复盘与规划',
    systemPrompt: '你是一位教育管理专家，擅长帮助教师进行学期总结和规划。',
    welcomeMsg: '欢迎！让我们一起来回顾这个学期吧。',
    iconUrl: 'DataAnalysis',
    visibility: 'PRIVATE',
    approvalStatus: null,
    categoryId: 3,
    updatedAt: Date.now() - 259200000,
    formConfig: JSON.stringify([])
  },
  {
    id: 6,
    title: '期末总结',
    description: '客观梳理全学期工作，提炼成果与不足，利于复盘与规划',
    systemPrompt: '你是一位教育管理专家，擅长帮助教师进行学期总结和规划。',
    welcomeMsg: '欢迎！让我们一起来回顾这个学期吧。',
    iconUrl: 'DataAnalysis',
    visibility: 'PRIVATE',
    approvalStatus: null,
    categoryId: 3,
    updatedAt: Date.now() - 259200000,
    formConfig: JSON.stringify([])
  },
  {
    id: 7,
    title: '期末总结',
    description: '客观梳理全学期工作，提炼成果与不足，利于复盘与规划',
    systemPrompt: '你是一位教育管理专家，擅长帮助教师进行学期总结和规划。',
    welcomeMsg: '欢迎！让我们一起来回顾这个学期吧。',
    iconUrl: 'DataAnalysis',
    visibility: 'PRIVATE',
    approvalStatus: null,
    categoryId: 3,
    updatedAt: Date.now() - 259200000,
    formConfig: JSON.stringify([])
  }
])

// Mock categories
const availableCategories = ref([
  { id: 1, name: '数学学科' },
  { id: 2, name: '语文/语言' },
  { id: 3, name: '教学管理' },
  { id: 4, name: '班主任助手' },
  { id: 5, name: '通用工具' }
])

const loadingList = ref(false)
const saving = ref(false)
const publishing = ref(false)
const searchKeyword = ref('')
const isEditing = ref(false)
const currentAgent = ref(null)
const currentFormConfig = ref([])
const showPublishDialog = ref(false)
const publishVisibility = ref('ORG_VISIBLE')
const openMenuAgentId = ref(null)
const showDeleteDialog = ref(false)
const deleteTargetAgent = ref(null)

// 切换菜单显示/隐藏
const toggleMenu = (agentId) => {
  if (openMenuAgentId.value === agentId) {
    openMenuAgentId.value = null
  } else {
    openMenuAgentId.value = agentId
  }
}

// 点击菜单项后的处理
const handleMenuItemClick = (callback) => {
  openMenuAgentId.value = null
  callback()
}

// 鼠标离开卡片关闭菜单
const handleCardMouseLeave = () => {
  openMenuAgentId.value = null
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  openMenuAgentId.value = null
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const iconOptions = [
  'MagicStick', 'Document', 'DataAnalysis', 'ChatDotRound', 'Opportunity', 
  'Collection', 'Reading', 'EditPen', 'TrendCharts', 'Compass'
]

const filteredAgents = computed(() => {
  if (!searchKeyword.value) return myAgents.value
  return myAgents.value.filter(agent => 
    agent.title?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const getStatusText = (agent) => {
  if (!agent.visibility || agent.visibility === 'PRIVATE') return '未发布'
  if (agent.approvalStatus === 'PENDING') return '审核中'
  if (agent.approvalStatus === 'REJECTED') return '已驳回'
  return agent.visibility === 'PUBLIC' ? '已发布(大厅)' : '已发布(校内)'
}

const getStatusTag = (agent) => {
  if (!agent.visibility || agent.visibility === 'PRIVATE') return 'info'
  if (agent.approvalStatus === 'PENDING') return 'warning'
  if (agent.approvalStatus === 'REJECTED') return 'danger'
  return 'success'
}

const getVisibilityText = (agent) => {
  if (!agent.visibility || agent.visibility === 'PRIVATE') return '私有'
  if (agent.visibility === 'PUBLIC') return '公开'
  if (agent.visibility === 'ORG_VISIBLE') return '校内公开'
  return '私有'
}

const getTimeText = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return new Date(timestamp).toLocaleDateString()
}

const selectAgent = (agent) => {
  currentAgent.value = JSON.parse(JSON.stringify(agent))
  if (agent.categories && agent.categories.length > 0) {
    currentAgent.value.categoryId = agent.categories[0].categoryId
  }
  try {
    currentFormConfig.value = agent.formConfig ? JSON.parse(agent.formConfig) : []
  } catch(e) {
    currentFormConfig.value = []
  }
}

const createNew = () => {
  currentAgent.value = {
    id: Date.now(),
    title: '',
    description: '',
    systemPrompt: '',
    welcomeMsg: '',
    iconUrl: 'MagicStick',
    visibility: 'PRIVATE',
    categoryId: null,
    updatedAt: Date.now()
  }
  currentFormConfig.value = []
  isEditing.value = true
}

const editAgent = (agent) => {
  selectAgent(agent)
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  currentAgent.value = null
  currentFormConfig.value = []
}

const addField = () => {
  currentFormConfig.value.push({
    label: '',
    key: `var_${Date.now().toString().slice(-4)}`,
    type: 'input',
    required: false,
    placeholder: ''
  })
}

const removeField = (idx) => {
  currentFormConfig.value.splice(idx, 1)
}

const goTest = (agent) => {
  ElMessage.success('跳转到测试页面（功能演示）')
}

const deleteAgent = (agent) => {
  deleteTargetAgent.value = agent
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (deleteTargetAgent.value) {
    const index = myAgents.value.findIndex(a => a.id === deleteTargetAgent.value.id)
    if (index !== -1) {
      myAgents.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }
  showDeleteDialog.value = false
  deleteTargetAgent.value = null
}

const cancelPublish = () => {
  ElMessageBox.confirm('确定要将该应用下架并转为私有预览状态吗？', '撤销发布', {
    confirmButtonText: '确定下架',
    type: 'warning'
  }).then(() => {
    currentAgent.value.visibility = 'PRIVATE'
    currentAgent.value.approvalStatus = null
    ElMessage.success('已转为私有状态')
  })
}

const confirmPublish = async () => {
  publishing.value = true
  setTimeout(() => {
    currentAgent.value.visibility = publishVisibility.value
    currentAgent.value.approvalStatus = 'PENDING'
    ElMessage.success('发布申请已提交，请等待管理员审核。')
    showPublishDialog.value = false
    publishing.value = false
  }, 1000)
}

const saveAgent = () => {
  if (!currentAgent.value.title || !currentAgent.value.systemPrompt) {
    ElMessage.warning('智能体名称与核心提示词(System Prompt)为必填项！')
    return
  }
  saving.value = true
  
  setTimeout(() => {
    currentAgent.value.formConfig = JSON.stringify(currentFormConfig.value)
    currentAgent.value.updatedAt = Date.now()
    
    const existingIndex = myAgents.value.findIndex(a => a.id === currentAgent.value.id)
    if (existingIndex !== -1) {
      myAgents.value[existingIndex] = JSON.parse(JSON.stringify(currentAgent.value))
      ElMessage.success('配置保存成功！')
    } else {
      myAgents.value.unshift(JSON.parse(JSON.stringify(currentAgent.value)))
      ElMessage.success('应用创建成功！')
    }
    
    saving.value = false
  }, 800)
}
</script>

<style scoped>
.publish-radios :deep(.el-radio.is-bordered) {
  margin-left: 0 !important;
}
.publish-radios :deep(.el-radio__label) {
  padding-left: 10px;
}

.agent-card {
  min-height: 178.8px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
}

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
  font-style: Medium;
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

.dropdown-menu::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #FFFFFF;
}

.dropdown-menu::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 9px solid #DEE3EA;
  z-index: -1;
}
</style>
