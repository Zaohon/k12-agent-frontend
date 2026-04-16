<template>
  <div class="h-full w-full bg-gray-50 flex overflow-hidden">
    <!-- Studio Sidebar (List of custom agents) -->
    <aside class="w-72 bg-white border-r border-gray-200 h-full flex flex-col pt-6 shrink-0">
      <div class="px-6 mb-4 flex justify-between items-center">
        <span class="font-bold text-lg text-gray-800">创作中心</span>
        <el-button type="primary" :icon="Plus" size="small" round @click="createNew">创建</el-button>
      </div>
      <div class="flex-1 overflow-y-auto px-4 space-y-2 pb-4" v-loading="loadingList">
        <div 
          v-for="agent in myAgents" :key="agent.id"
          @click="selectAgent(agent)"
          class="p-4 rounded-xl border border-gray-100 hover:border-primary hover:shadow-sm cursor-pointer transition-all flex items-center bg-gray-50 bg-opacity-50"
          :class="currentAgent?.id === agent.id ? 'border-primary shadow-sm bg-white' : ''"
        >
          <div class="w-10 h-10 rounded-lg bg-blueLight flex items-center justify-center text-primary mr-3 shrink-0">
            <el-icon><component :is="agent.iconUrl || 'Document'" /></el-icon>
          </div>
          <div class="overflow-hidden w-full">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-sm text-gray-800 line-clamp-1 truncate mr-1">{{ agent.title || '未命名应用' }}</h4>
              <el-tag size="small" :type="getStatusTag(agent)" effect="dark" class="scale-90 origin-right">
                {{ getStatusText(agent) }}
              </el-tag>
            </div>
            <p class="text-xs text-gray-400 mt-1 line-clamp-1">
              更新于: {{ new Date(agent.updatedAt).toLocaleDateString() }}
            </p>
          </div>
        </div>
        <div v-if="myAgents.length === 0 && !loadingList" class="text-center py-10 text-gray-400 text-sm">
          暂无智能体，快去新建一个吧！
        </div>
      </div>
    </aside>

    <!-- Studio Main Editor Area -->
    <main class="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div v-if="currentAgent" class="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-20 relative">
        
        <!-- Editor Header with Status Action -->
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
                <div class="flex items-center space-x-3" v-if="currentAgent.id">
                   <el-button :icon="ChatDotRound" @click="goTest" round>去测试</el-button>
                   <el-button type="primary" :icon="Upload" v-if="currentAgent.visibility === 'PRIVATE'" @click="showPublishDialog = true" round>申请发布</el-button>
                   <el-button type="warning" plain v-else-if="currentAgent.approvalStatus === 'APPROVED'" @click="cancelPublish" round>撤下/转私有</el-button>
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
                   :class="currentAgent.iconUrl === icon ? 'border-primary bg-blue-50 text-primary' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'"
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
            <el-button size="large" round @click="fetchMyAgents">丢弃更改</el-button>
            <el-button type="primary" size="large" round @click="saveAgent" :loading="saving" class="w-48 shadow-lg shadow-blue-500/20">
              立即保存配置
            </el-button>
         </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="h-full flex items-center justify-center">
        <el-empty description="在左侧选择一个智能体开始编辑" />
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
           <el-button @click="showReviewDialog = false">我再等等</el-button>
           <el-button type="primary" @click="confirmPublish" :loading="publishing">提交上架申请</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Search, MagicStick, Lock, Document, DataAnalysis, ChatDotRound, Delete, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { API_BASE } from '../../utils/api'

const userStore = useUserStore()
const router = useRouter()

const myAgents = ref<any[]>([])
const loadingList = ref(false)
const saving = ref(false)
const publishing = ref(false)

const currentAgent = ref<any>(null)
const currentFormConfig = ref<any[]>([])
const availableCategories = ref<any[]>([])

const showPublishDialog = ref(false)
const publishVisibility = ref('ORG_VISIBLE')

const iconOptions = [
  'MagicStick', 'Document', 'DataAnalysis', 'ChatDotRound', 'Opportunity', 
  'Collection', 'Reading', 'EditPen', 'TrendCharts', 'Compass'
]

const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE}/category/list`)
    const data = await res.json()
    if (res.ok && data.success) {
      availableCategories.value = data.data
    }
  } catch (e) {}
}

const getStatusText = (agent: any) => {
  if (agent.visibility === 'PRIVATE') return '未发布'
  if (agent.approvalStatus === 'PENDING') return '审核中'
  if (agent.approvalStatus === 'REJECTED') return '已驳回'
  return agent.visibility === 'PUBLIC' ? '已发布(大厅)' : '已发布(校内)'
}

const getStatusTag = (agent: any) => {
  if (agent.visibility === 'PRIVATE') return 'info'
  if (agent.approvalStatus === 'PENDING') return 'warning'
  if (agent.approvalStatus === 'REJECTED') return 'danger'
  return 'success'
}

const fetchMyAgents = async () => {
  loadingList.value = true
  try {
    const res = await fetch(`${API_BASE}/agent/my`, {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    const data = await res.json()
    if (res.ok && data.success) {
      myAgents.value = data.data
      if (currentAgent.value?.id) {
         const updated = myAgents.value.find(a => a.id === currentAgent.value.id)
         if (updated) selectAgent(updated)
      }
    }
  } catch (err) {
    ElMessage.error('无法读取我的应用列表')
  } finally {
    loadingList.value = false
  }
}

const selectAgent = (agent: any) => {
  currentAgent.value = JSON.parse(JSON.stringify(agent))
  // Extract categoryId from categories relation if exists
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
    title: '',
    description: '',
    systemPrompt: '',
    welcomeMsg: '',
    iconUrl: 'MagicStick',
    visibility: 'PRIVATE'
  }
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

const removeField = (idx: number) => {
  currentFormConfig.value.splice(idx, 1)
}

const goTest = () => {
  router.push(`/workspace/chat/${currentAgent.value.id}`)
}

const cancelPublish = () => {
  ElMessageBox.confirm('确定要将该应用下架并转为私有预览状态吗？', '撤销发布', {
    confirmButtonText: '确定下架',
    type: 'warning'
  }).then(async () => {
    currentAgent.value.visibility = 'PRIVATE'
    await saveAgent()
  })
}

const confirmPublish = async () => {
  publishing.value = true
  try {
     const res = await fetch(`${API_BASE}/agent/update/${currentAgent.value.id}`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${userStore.token}`
       },
       body: JSON.stringify({ 
         visibility: publishVisibility.value 
       })
     })
     const data = await res.json()
     if (res.ok && data.success) {
       ElMessage.success('发布申请已提交，请等待管理员审核。')
       showPublishDialog.value = false
       await fetchMyAgents()
     }
  } catch (e) {
     ElMessage.error('网络通讯失败')
  } finally {
     publishing.value = false
  }
}

const saveAgent = async () => {
  if (!currentAgent.value.title || !currentAgent.value.systemPrompt) {
    ElMessage.warning('智能体名称与核心提示词(System Prompt)为必填项！')
    return
  }
  saving.value = true
  const payload = { ...currentAgent.value }
  payload.formConfig = JSON.stringify(currentFormConfig.value)

  try {
    const isEditing = !!payload.id
    const url = isEditing 
        ? `${API_BASE}/agent/update/${payload.id}`
        : `${API_BASE}/agent/create`
        
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify(payload)
    })
    
    const data = await res.json()
    if (res.ok && data.success) {
      ElMessage.success(isEditing ? '配置保存成功！' : '应用创世纪成功！')
      await fetchMyAgents()
      if (!isEditing) {
         const found = myAgents.value.find(a => a.title === payload.title)
         if (found) selectAgent(found)
      }
    } else {
      ElMessage.error(data.message || '操作失败')
    }
  } catch(e) {
    ElMessage.error('网络出错')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchMyAgents()
  fetchCategories()
})
</script>

<style scoped>
.publish-radios :deep(.el-radio.is-bordered) {
  margin-left: 0 !important;
}
.publish-radios :deep(.el-radio__label) {
  padding-left: 10px;
}
</style>
