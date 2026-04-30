<template>
  <div class="h-full w-full bg-[#FFFFFF66] flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="px-8 py-4 flex justify-between items-center shrink-0">
      <el-button class="create-agent-btn" @click="createNew">
        <img src="@/images/add.png" alt="add" class="add-icon" />
        创建新的智能体
      </el-button>
      <div class="relative">
        <img src="@/images/search.png" class="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2" alt="search">
        <input v-model="searchKeyword" class="w-64 pl-9 pr-4 py-2 text-sm bg-[#F8F9FD] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#314DE2]" placeholder="搜索智能体">
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto px-8 pt-6">
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
                <img src="@/images/is-visable.png" alt="visibility" class="w-auto h-3" />
                <span class="font-medium text-[12px] leading-[16px] text-[#767B82]">{{ getVisibilityText(agent) }}</span>
              </div>
              <div class="flex items-center gap-6">
                <div class="flex items-center gap-[5px]">
                  <img src="@/images/time.png" alt="time" class="w-auto h-3" />
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
                        <img src="@/images/icon-chat.png" alt="chat" class="w-auto h-4" />
                        <span class="font-medium text-[14px] leading-[20px] text-[#2E3339]">对话</span>
                      </div>
                      <!-- 分享 -->
                      <div 
                        class="flex items-center gap-2 px-[10px] py-0 cursor-pointer hover:bg-gray-50 rounded transition-colors"
                        @click.stop="handleMenuItemClick(() => ElMessage.info('分享功能开发中'))"
                      >
                        <img src="@/images/icon-share.png" alt="share" class="w-auto h-4" />
                        <span class="font-medium text-[14px] leading-[20px] text-[#2E3339]">分享</span>
                      </div>
                      <!-- 修改配置 -->
                      <div 
                        class="flex items-center gap-2 px-[10px] py-0 cursor-pointer hover:bg-gray-50 rounded transition-colors"
                        @click.stop="handleMenuItemClick(() => editAgent(agent))"
                      >
                        <img src="@/images/icon-edit.png" alt="edit" class="w-auto h-4" />
                        <span class="font-medium text-[14px] leading-[20px] text-[#2E3339]">修改配置</span>
                      </div>
                      <!-- 删除智能体 -->
                      <div 
                        class="flex items-center gap-2 px-[10px] py-0 cursor-pointer hover:bg-gray-50 rounded transition-colors"
                        @click.stop="handleMenuItemClick(() => deleteAgent(agent))"
                      >
                        <img src="@/images/icon-delete.png" alt="delete" class="w-auto h-4" />
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

      <div v-if="myAgents.length === 0 && !loadingList" class="text-center py-20">
        <el-empty description="暂无智能体，快去新建一个吧！" />
      </div>
      
      <div v-if="loadingList" class="text-center py-20">
        <el-icon class="text-4xl text-gray-400 animate-spin"><Loading /></el-icon>
        <p class="text-gray-500 mt-2">加载中...</p>
      </div>
    </main>

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
import { Plus, MagicStick, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { agentApi } from '../../api/api'

const router = useRouter()

const myAgents = ref([])
const loadingList = ref(false)
const searchKeyword = ref('')
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

// 加载数据
const loadData = async () => {
  loadingList.value = true
  try {
    const res = await agentApi.getMyAgents()
    if (res.success && res.data) {
      myAgents.value = res.data.map(agent => ({
        ...agent,
        updatedAt: agent.updatedAt ? new Date(agent.updatedAt).getTime() : Date.now()
      }))
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loadingList.value = false
  }
}

const filteredAgents = computed(() => {
  if (!searchKeyword.value) return myAgents.value
  return myAgents.value.filter(agent => 
    agent.title?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const getVisibilityText = (agent) => {
  if (!agent.visibility || agent.visibility === 'PRIVATE') return '私有'
  if (agent.visibility === 'PUBLIC') return '公开'
  if (agent.visibility === 'ORG_VISIBLE') return '校内公开'
  return '私有'
}

const getTimeText = (timestamp) => {
  if (!timestamp) return '刚刚'
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

const createNew = () => {
  router.push('/workspace/agent/edit')
}

const editAgent = (agent) => {
  router.push({
    path: '/workspace/agent/edit',
    query: { id: agent.id }
  })
}

const goTest = (agent) => {
  router.push(`/workspace/chat?agentId=${agent.id}`)
}

const deleteAgent = (agent) => {
  deleteTargetAgent.value = agent
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deleteTargetAgent.value) return
  
  try {
    loadingList.value = true
    await agentApi.deleteAgent(deleteTargetAgent.value.id)
    await loadData()
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
  } finally {
    loadingList.value = false
    showDeleteDialog.value = false
    deleteTargetAgent.value = null
  }
}

onMounted(() => {
  loadData()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
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
