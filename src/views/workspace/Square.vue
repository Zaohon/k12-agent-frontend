<template>
  <div class="h-full w-full bg-gray-50 flex flex-col overflow-hidden">
    <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 pb-20">
      
      <!-- Featured Banner / Swiper -->
      <div v-if="featuredList.length > 0" class="featured-section">
        <div class="flex items-center justify-between mb-4">
           <h2 class="text-xl font-bold text-gray-800 flex items-center">
             <el-icon class="mr-2 text-orange-500"><StarFilled /></el-icon>
             精选推荐方案
           </h2>
        </div>
        <el-carousel :interval="5000" type="card" height="240px" class="rounded-2xl overflow-hidden shadow-sm">
          <el-carousel-item v-for="item in featuredList" :key="item.id">
            <div class="h-full bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-white flex flex-col justify-between cursor-pointer group" @click="goChat(item.id)">
              <div>
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                    <el-icon><component :is="item.iconUrl || 'MagicStick'" /></el-icon>
                  </div>
                  <h3 class="ml-4 text-2xl font-bold line-clamp-1">{{ item.title }}</h3>
                </div>
                <p class="text-blue-100 text-sm line-clamp-2 max-w-lg mb-4">{{ item.description }}</p>
                <div class="flex space-x-2">
                   <el-tag size="small" effect="dark" class="bg-white/10 border-none text-white">#教育大模型</el-tag>
                   <el-tag size="small" effect="dark" class="bg-white/10 border-none text-white">#教学提效</el-tag>
                </div>
              </div>
              <div class="flex items-center text-sm font-medium text-blue-200">
                <span>立即开启探索</span>
                <el-icon class="ml-1"><ArrowRight /></el-icon>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- Main Directory -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800">全能智能体广场</h2>
            <p class="text-gray-400 text-sm mt-1">发现属于您的 AI 辅教助手</p>
          </div>
          
          <div class="flex items-center space-x-3">
             <el-input 
               v-model="searchQuery"
               size="large"
               class="w-64 search-input"
               placeholder="搜索智能体关键词..."
               :prefix-icon="Search"
               clearable
             />
          </div>
        </div>

        <!-- Filter System -->
        <div class="flex flex-wrap items-center gap-3 mb-8">
          <div 
            class="filter-tag" 
            :class="{ active: activeCategoryId === null }"
            @click="setCategory(null)"
          >
            全部分类
          </div>
          <div 
            v-for="cat in categories" :key="cat.id" 
            class="filter-tag"
            :class="{ active: activeCategoryId === cat.id }"
            @click="setCategory(cat.id)"
          >
            {{ cat.name }}
          </div>
        </div>

        <!-- Agent List -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" v-loading="loading">
          <AgentCard 
            v-for="item in filteredAgents" 
            :key="item.id"
            :id="item.id"
            :title="item.title"
            :description="item.description || '暂无描述'"
            :author="item.creatorId === 1 ? '@系统官推' : '@开发者'"
            :icon="item.iconUrl || 'Document'"
            :isFeatured="item.isFeatured"
            @click="goChat(item.id)"
          />
        </div>
        <el-empty v-if="filteredAgents.length === 0" description="未找到匹配的智能体应用" class="py-20" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Search, StarFilled, MagicStick, ArrowRight, Document } from '@element-plus/icons-vue'
import AgentCard from '../../components/AgentCard.vue'
import { useUserStore } from '../../store/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const searchQuery = ref('')
const activeCategoryId = ref<number | null>(null)
const categories = ref<any[]>([])
const agentList = ref<any[]>([])
const featuredList = ref<any[]>([])
const loading = ref(false)

const filteredAgents = computed(() => {
  let list = agentList.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(a => a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q))
  }
  return list
})

const setCategory = (id: number | null) => {
  activeCategoryId.value = id
  loadAgents()
}

const goChat = (id: number) => {
  router.push(`/workspace/chat/${id}`)
}

const loadCategories = async () => {
  try {
    const res = await fetch('http://localhost:3000/category/list')
    const data = await res.json()
    if (res.ok && data.success) {
      categories.value = data.data
    }
  } catch (e) {}
}

const loadAgents = async () => {
  loading.value = true
  try {
    let url = 'http://localhost:3000/agent/discover'
    if (activeCategoryId.value) {
      url += `?categoryId=${activeCategoryId.value}`
    }
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    const data = await res.json()
    if (res.ok && data.success) {
      agentList.value = data.data
    }
  } catch (err) {
    ElMessage.error('无法同步资源大厅数据')
  } finally {
    loading.value = false
  }
}

const loadFeatured = async () => {
  try {
    const res = await fetch('http://localhost:3000/agent/featured', {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    const data = await res.json()
    if (res.ok && data.success) {
      featuredList.value = data.data
    }
  } catch (e) {}
}

onMounted(() => {
  loadCategories()
  loadAgents()
  loadFeatured()
})
</script>

<style scoped>
.filter-tag {
  @apply px-5 py-2 rounded-full bg-white border border-gray-100 text-gray-500 text-sm cursor-pointer transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200;
}
.filter-tag.active {
  @apply bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100;
}

.search-input :deep(.el-input__wrapper) {
  @apply rounded-xl border-none bg-gray-100 shadow-none px-4;
}

.featured-section :deep(.el-carousel__mask) {
  @apply bg-transparent;
}

.featured-section :deep(.el-carousel__indicators--outside button) {
  @apply bg-gray-300;
}
.featured-section :deep(.el-carousel__indicator.is-active button) {
  @apply bg-blue-600;
}
</style>
