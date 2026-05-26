<template>
  <div class="h-full w-full flex flex-col overflow-hidden page-container">
    <div class="flex-1 overflow-y-auto min-w-[1200px]">
      <!-- Top Navigation Tabs -->
      <div class="sticky top-0 z-50 navigation-tabs">
        <div class="max-w-[1600px] mx-auto px-6">
          <div class="flex items-center h-20 relative">
            <div
              v-for="(tab, index) in tabs"
              :key="index"
              :id="'tab-' + index"
              class="cursor-pointer group flex items-center justify-center mx-4"
              @click="handleTabClick(index)"
            >
              <span
                :id="'tab-text-' + index"
                class="text-base font-medium py-3 transition-colors duration-300 ease-in-out"
                :class="activeTab === index ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'"
              >
                {{ tab }}
              </span>
            </div>
            <div
              class="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-in-out"
              :style="{ left: underlineLeft + 'px', width: underlineWidth + 'px' }"
            />
          </div>
        </div>
      </div>

      <div v-if="tabs[activeTab] == '精选页'" class="max-w-[1600px] mx-auto px-6 py-4 min-w-[1200px]">
        <!-- Hero Banner Cards -->
        <div class="grid grid-cols-3 gap-6 mb-10">
          <!-- Card 1 - 智能教案生成 -->
          <div
            class="relative h-72 rounded-3xl overflow-hidden cursor-pointer group hero-card-1"
            @click="goChat(1)"
          >
            <div class="absolute top-6 left-6">
              <el-tag size="small" class="bg-white/20 text-white border-white/30 backdrop-blur-sm rounded-full px-3 py-1">热门推荐</el-tag>
            </div>
            <div class="absolute top-8 right-8 w-32 h-32 opacity-80">
              <img src="@/images/book.png" alt="book" class="w-full h-full object-contain" />
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <h3 class="text-2xl font-bold text-white mb-3">智能教案生成</h3>
              <p class="text-white/90 text-sm mb-6 line-clamp-2">基于新课标深度学习，秒级生成符合学情、逻辑严密的教学方案。</p>
              <el-button size="small" class="hero-card-button">立即开始</el-button>
            </div>
          </div>

          <!-- Card 2 - PPT 课件大师 -->
          <div
            class="relative h-72 rounded-3xl overflow-hidden cursor-pointer group hero-card-2"
            @click="goChat(2)"
          >
            <div class="absolute top-6 left-6 bg-white rounded-xl p-3 shadow-lg">
              <img src="@/images/upload.png" alt="upload" class="w-6 h-auto" />
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <h3 class="text-2xl font-bold text-[#4018B3] mb-3">PPT 课件大师</h3>
              <p class="text-[#5D40D0] text-sm mb-4 line-clamp-2">一键生成结构化课件，支持多主题切换与互动环节自动设计。</p>
              <el-button size="small" class="hero-card-button">尝试制作</el-button>
            </div>
          </div>

          <!-- Card 3 - AI 智能组卷 -->
          <div
            class="relative h-72 rounded-3xl overflow-hidden cursor-pointer group hero-card-3"
            @click="goChat(3)"
          >
            <div class="absolute top-6 left-6 bg-white rounded-xl p-3 shadow-lg">
              <img src="@/images/paper1.png" alt="upload" class="w-6 h-auto" />
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <h3 class="text-2xl font-bold text-[#394154] mb-3">AI 智能组卷</h3>
              <p class="text-[#565D71] text-sm mb-4 line-clamp-2">千万题库精准匹配，智能难度调控。</p>
              <el-button size="small" class="hero-card-button">去出题</el-button>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Left: Agent Grid -->
          <div class="lg:col-span-3">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div class="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h2 class="text-xl font-bold text-gray-800">学科提效神器</h2>
              </div>
              <!-- <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">排序：</span>
                <el-dropdown size="small">
                  <span class="text-sm text-blue-600 cursor-pointer flex items-center">
                    最常使用 <el-icon class="ml-1"><ArrowDown /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>最常使用</el-dropdown-item>
                      <el-dropdown-item>最新发布</el-dropdown-item>
                      <el-dropdown-item>最多点赞</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div> -->
            </div>

            <!-- Agent Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="(item, index) in filteredAgents"
                :key="item.id"
                class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all cursor-pointer group flex flex-col h-full"
                @click="goChat(item.id)"
              >
                <div class="flex items-start justify-between mb-4">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors">
                    <img :src="item.iconUrl" alt="" class="w-12 h-12">
                  </div>
                  <el-tag v-if="item.isFeatured" size="small" class="bg-purple-50 text-purple-600 border-purple-100">精选</el-tag>
                </div>
                <div class="flex-1">
                  <h3 class="agent-card-title">{{ item.title }}</h3>
                  <p class="agent-card-description">{{ item.description || '暂无描述' }}</p>
                </div>
                <div class="border-t border-[#EBEEF4] pt-4 mt-auto">
                  <div v-if="item.isLabels" class="flex items-center space-x-2">
                    <span
                      v-for="(label, idx) in item.labels"
                      :key="label"
                      class="px-3 py-1 text-xs font-medium"
                      :style="{
                        backgroundColor: labelBgColors[Number(idx) % labelBgColors.length],
                        color: labelTextColors[Number(idx) % labelTextColors.length],
                        border: `1px solid ${labelBorderColors[Number(idx) % labelBorderColors.length]}`,
                        borderRadius: '50px'
                      }"
                    >{{ label }}</span>
                  </div>
                  <div v-else class="flex items-center justify-between">
                    <!--<span class="text-xs text-gray-400">{{ item.usageCount || '0' }}k 使用</span> -->
                    <span class="text-xs text-gray-400">@ {{ item.creatorName || '小龙老师' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-if="filteredAgents.length === 0" description="未找到匹配的智能体应用" class="py-20" />
          </div>

          <!-- Right: Sidebar -->
          <div class="lg:col-span-1 space-y-3">
            <!-- Create Assistant Card -->
            <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div class="w-14 h-14 bg-[#B4BDFF] rounded-2xl flex items-center justify-center mb-4">
                <img src="@/images/customize.png" alt="" class="h-6 w-6">
              </div>
              <h3 class="text-lg font-bold text-gray-800 mb-2">定制你的助手</h3>
              <p class="text-sm text-gray-500 mb-6">上传教学文档，只需三步即可训练一个专属于你的 AI 智能体。</p>
              <el-button type="primary" class="create-agent-btn border-none hover:opacity-90" @click="goCreate">
                创建智能体
              </el-button>
            </div>

            <!-- Recommended List -->
            <div class="bg-[#F2F4F8] rounded-xl p-4 border border-gray-100 h-60 shadow-sm">
              <h3 class="text-base font-bold text-[#5A6066] mb-4">推荐</h3>
              <div class="space-y-4 overflow-y-auto h-[calc(100%-50px)] pr-2">
                <div
                  v-for="(rec, index) in recommendedList"
                  :key="rec.id || index"
                  class="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
                  @click="goChat(rec.id)"
                >
                  <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <img :src="rec.iconUrl" alt="" class="w-5 h-5 object-contain">
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-[#2E3339]">{{ rec.title }}</div>
                    <div class="text-xs text-[#5A6066]">@ {{ rec.creatorName }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="max-w-[1600px] mx-auto px-6 py-4 min-w-[1200px]">
        <!-- 顶部标题和排序 -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">{{ tabs[activeTab] }}</h2>
          <!-- <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">排序：</span>
            <el-dropdown size="small">
              <span class="text-sm text-blue-600 cursor-pointer flex items-center">
                最常使用 <el-icon class="ml-1"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>最常使用</el-dropdown-item>
                  <el-dropdown-item>最新发布</el-dropdown-item>
                  <el-dropdown-item>最多点赞</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div> -->
        </div>

        <!-- 智能体卡片区域 -->
        <div class="agent-card-container mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="(item, index) in paginatedAgents"
              :key="item.id"
              class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all cursor-pointer group flex flex-col h-full"
              @click="goChat(item.id)"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors">
                  <img :src="item.iconUrl" alt="" class="w-12 h-12">
                </div>
                <el-tag v-if="item.isFeatured" size="small" class="bg-purple-50 text-purple-600 border-purple-100">精选</el-tag>
              </div>
              <div class="flex-1 mb-4">
                <h3 class="agent-card-title mb-2">{{ item.title }}</h3>
                <p class="agent-card-description">{{ item.description || '暂无描述' }}</p>
              </div>
              <div class="border-t border-[#EBEEF4] pt-4 mt-auto">
                <div v-if="item.isLabels" class="flex items-center space-x-2">
                  <span
                    v-for="(label, idx) in item.labels"
                    :key="label"
                    class="px-3 py-1 text-xs font-medium"
                    :style="{
                      backgroundColor: labelBgColors[Number(idx) % labelBgColors.length],
                      color: labelTextColors[Number(idx) % labelTextColors.length],
                      border: `1px solid ${labelBorderColors[Number(idx) % labelBorderColors.length]}`,
                      borderRadius: '50px'
                    }"
                  >{{ label }}</span>
                </div>
                <div v-else class="flex items-center justify-between">
                  <!-- <span class="text-xs text-gray-400">{{ item.usageCount || '0' }}k 使用</span> -->
                  <span class="text-xs text-gray-400">@{{ item.creatorName || '小龙老师' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页控制区域 -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">第 {{ currentPage }} 页，共 {{ Math.ceil(totalItems / pageSize) }} 页</span>
          <div class="flex items-center space-x-2">
            <el-pagination
              :current-page="currentPage"
              :page-size="pageSize"
              :total="totalItems"
              layout="prev, pager, next"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Document,
  Monitor,
  EditPen,
  MagicStick,
  User,
  ArrowDown
} from '@element-plus/icons-vue'
import { categoryApi } from '@/api/api'

export default {
  name: 'Square',
  data() {
    return {
      Document,
      Monitor,
      EditPen,
      MagicStick,
      User,
      ArrowDown,
      tabs: [] as string[],
      categories: [] as any[],
      recommendedId: null,
      activeTab: 0,  
      underlineLeft: 0,
      underlineWidth: 0,
      labelColors: [
        { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
        { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
        { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
        { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
        { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' }
      ],
      labelBgColors: ['#EFF6FF', '#F5F3FF', '#F0FDF4', '#FFFAEB', '#FDF2F8'],
      labelTextColors: ['#2563EB', '#7C3AED', '#16A34A', '#EA580C', '#DB2777'],
      labelBorderColors: ['#BFDBFE', '#DDD6FE', '#BBF7D0', '#FED7AA', '#FBCFE8'],
      agentList: [] as any[],
      filteredAgents: [] as any[],
      recommendedList: [] as any[],
      currentPage: 1,
      pageSize: 12
    }
  },
  computed: {
    currentCategoryId() {
      if (this.activeTab === 0) return null
      const categoryName = this.tabs[this.activeTab]
      const category = this.categories.find((c: any) => c.name === categoryName)
      return category?.id
    },
    paginatedAgents() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.agentList.slice(start, end)
    },
    totalItems() {
      return this.agentList.length
    },
    startItem() {
      if (this.totalItems === 0) return 0
      return (this.currentPage - 1) * this.pageSize + 1
    },
    endItem() {
      const end = this.currentPage * this.pageSize
      return end > this.totalItems ? this.totalItems : end
    }
  },
  methods: {
    handleTabClick(index: number) {
      this.activeTab = index
      this.currentPage = 1
      this.loadCategoryAgents(this.categories[index].id)
    },
    handlePageChange(page: number) {
      this.currentPage = page
    },
    async loadCategories() {
      try {
        const response = await categoryApi.getCategoryList()
        if (response.success && response.data) {
          this.categories = response.data
          const categoryNames = response.data.map((item: any) => item.name)
          //赋值推荐页
          this.recommendedId = this.categories.find((c: any) => c.name === '推荐页')?.id || null
          // 过滤掉"推荐页"，然后在前面添加"精选"和"全部应用"
          const filteredNames = categoryNames.filter((name: string) => name !== '推荐页')
          // 过滤掉"推荐页"
          this.categories = this.categories.filter((c: any) => c.name !== '推荐页')
          this.tabs = [...filteredNames]
          
          // 根据当前 activeTab 加载对应数据
          this.$nextTick(() => {
            if (this.activeTab === 0) {
              this.loadFeaturedAgents()
            } else {
              this.loadCategoryAgents(this.currentCategoryId)
            }
          })
          // 加载推荐页智能体
          this.loadRecommendedAgents()
        }
      } catch (error) {
        console.error('加载分类列表失败:', error)
        // 失败时使用默认分类
        this.tabs = ['精选', '教学助手', '学科助教', '行政工具']
      }
    },
    async loadFeaturedAgents() {
      const featuredCategory = this.categories.find((c: any) => c.name === '精选页')
      if (!featuredCategory?.id) return
      try {
        const response = await categoryApi.getCategoryAgents(featuredCategory.id)
        if (response.success && response.data) {
          this.filteredAgents = response.data
        }
      } catch (error) {
        console.error('加载精选智能体失败:', error)
      }
    },
    async loadCategoryAgents(categoryId?: number) {
      if (categoryId === undefined) return
      try {
        const response = await categoryApi.getCategoryAgents(categoryId)
        if (response.success && response.data) {
          this.agentList = response.data
          this.currentPage = 1
        }
      } catch (error) {
        console.error('加载分类智能体失败:', error)
      }
    },
    async loadRecommendedAgents() {
      const recommendCategoryId = this.recommendedId
      if (!recommendCategoryId) return
      try {
        const response = await categoryApi.getCategoryAgents(recommendCategoryId) 
        if (response.success && response.data) {
          this.recommendedList = response.data
        }
      } catch (error) {
        console.error('加载推荐智能体失败:', error)
      }
    },
    goChat(id: number) {
      this.$router.push(`/workspace/chat/${id}`)
    },
    goCreate() {
      this.$router.push('/workspace/agent/edit')
    },
    updateUnderline() {
      this.$nextTick(() => {
        const textEl = document.getElementById('tab-text-' + this.activeTab)
        const containerEl = document.getElementById('tab-' + this.activeTab)
        if (textEl && containerEl) {
          this.underlineLeft = containerEl.offsetLeft + (containerEl.offsetWidth - textEl.offsetWidth) / 2
          this.underlineWidth = textEl.offsetWidth
        }
      })
    }
  },
  mounted() {
    this.loadCategories()
  },
  watch: {
    activeTab() {
      this.updateUnderline()
      if (this.activeTab === 0) {
        // 精选页
        this.loadFeaturedAgents()
      } else if (this.activeTab === 1) {
        // 全部应用
        this.loadCategoryAgents()
      } else {
        // 分类页
        this.loadCategoryAgents(this.currentCategoryId)
      }
    },
    tabs() {
      this.$nextTick(() => {
        this.updateUnderline()
        // 初始加载全部应用数据
        if (this.activeTab === 1) {
          this.loadCategoryAgents()
        }
      })
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Agent card container with fixed height (3 rows) */
.agent-card-container {
  height: 720px;
  padding-right: 8px;
}

/* Pagination styles */
:deep(.el-pagination) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 0 8px;
  min-width: 28px;
  height: 28px;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  color: #314DE2;
}

:deep(.el-pagination .el-pager li) {
  background: transparent;
  border: none;
  color: #64748b;
  min-width: 28px;
  height: 28px;
  line-height: 28px;
  margin: 0 2px;
  border-radius: 4px;
  font-size: 14px;
}

:deep(.el-pagination .el-pager li:hover) {
  color: #314DE2;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: #314DE2;
  color: #ffffff;
  font-weight: 500;
}

:deep(.el-pagination .el-pager li.is-active:hover) {
  background: #1e40af;
  color: #ffffff;
}

/* Page container */
.page-container {
  background: #F8F9FD;
}

/* Navigation tabs */
.navigation-tabs {
  background: #F8F9FD80;
  border-bottom: 1px solid #ADB2B90D;
  backdrop-filter: blur(4px);
}

/* Hero Card 1 - 智能教案生成 */
.hero-card-1 {
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
}

/* Hero Card 2 - PPT 课件大师 */
.hero-card-2 {
  background: radial-gradient(circle at top right, #314DE233 30%, #E6DEFF 100%);
}

/* Hero Card 3 - AI 智能组卷 */
.hero-card-3 {
  background: #DEE5FD;
}

/* Recommended avatar */
.recommended-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #B4BDFF;
  border: 1px solid #314DE21A;
}

/* Hero Card Button */
.hero-card-button {
  width: 100px;
  height: 40px;
  padding: 10px 24px;
  border-radius: 12px;
  color: #314DE2;
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0px;
  text-align: center;
  background-color: #fff;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.hero-card-button:hover {
  transform: scale(1.1);
  border: 2px solid #314DE2;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Create Agent Button */
.create-agent-btn {
  width: 270px;
  height: 56px;
  padding: 16px 24px;
  border-radius: 12px;
  background: linear-gradient(to right, #314DE2, #6144D3);
  color: white;
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0px;
  text-align: center;
  box-shadow: 0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A;
  transition: opacity 0.3s ease;
}

/* Agent Card Title */
.agent-card-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 500;
  font-size: 18px;
  line-height: 28px;
  letter-spacing: 0px;
  color: #2E3339;
  margin-bottom: 8px;
}

/* Agent Card Description */
.agent-card-description {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0px;
  color: #5A6066;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
