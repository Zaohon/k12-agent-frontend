<template>
  <div class="h-full w-full flex flex-col overflow-hidden" style="background: #F8F9FD">
    <div class="flex-1 overflow-y-auto">
      <!-- Top Navigation Tabs -->
      <div class="sticky top-0 z-50" style="background: #F8F9FD80; border-bottom: 1px solid #ADB2B90D; backdrop-filter: blur(4px)">
        <div class="max-w-[1600px] mx-auto px-6">
          <div class="flex items-center h-20 relative">
            <div 
              v-for="(tab, index) in tabs" 
              :key="index"
              :id="'tab-' + index"
              class="cursor-pointer group flex items-center justify-center mx-4"
              @click="activeTab = index"
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

      <div class="max-w-[1600px] mx-auto px-6 py-8">
        <!-- Hero Banner Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <!-- Card 1 - 智能教案生成 -->
          <div 
            class="relative h-64 rounded-3xl overflow-hidden cursor-pointer group"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            @click="goChat(1)"
          >
            <div class="absolute top-4 left-4">
              <el-tag size="small" class="bg-white/20 text-white border-white/30">热门推荐</el-tag>
            </div>
            <div class="absolute top-6 right-6 opacity-20">
              <el-icon :size="120"><Document /></el-icon>
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <h3 class="text-2xl font-bold text-white mb-3">智能教案生成</h3>
              <p class="text-white/90 text-sm mb-4 line-clamp-2">基于新课标深度学习，秒级生成符合学情、逻辑严密的教学方案。</p>
              <el-button size="small" class="bg-white text-purple-600 border-none hover:bg-white/90">立即开始</el-button>
            </div>
          </div>

          <!-- Card 2 - PPT 课件大师 -->
          <div 
            class="relative h-64 rounded-3xl overflow-hidden cursor-pointer group"
            style="background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)"
            @click="goChat(2)"
          >
            <div class="absolute top-6 left-6 bg-white rounded-xl p-3 shadow-lg">
              <el-icon :size="24" color="#8ec5fc"><Monitor /></el-icon>
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <h3 class="text-2xl font-bold text-white mb-3">PPT 课件大师</h3>
              <p class="text-white/90 text-sm mb-4 line-clamp-2">一键生成结构化课件，支持多主题切换与互动环节自动设计。</p>
              <el-button size="small" class="bg-white text-blue-600 border-none hover:bg-white/90">尝试制作</el-button>
            </div>
          </div>

          <!-- Card 3 - AI 智能组卷 -->
          <div 
            class="relative h-64 rounded-3xl overflow-hidden cursor-pointer group"
            style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
            @click="goChat(3)"
          >
            <div class="absolute top-6 left-6 bg-white rounded-xl p-3 shadow-lg">
              <el-icon :size="24" color="#667eea"><EditPen /></el-icon>
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <h3 class="text-2xl font-bold text-gray-800 mb-3">AI 智能组卷</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">千万题库精准匹配，智能难度调控。</p>
              <el-button size="small" class="bg-blue-600 text-white border-none hover:bg-blue-700">去出题</el-button>
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
              <div class="flex items-center space-x-2">
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
              </div>
            </div>

            <!-- Agent Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="(item, index) in filteredAgents" 
                :key="item.id"
                class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all cursor-pointer group"
                @click="goChat(item.id)"
              >
                <div class="flex items-start justify-between mb-4">
                  <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <el-icon :size="24" color="#667eea">
                      <component :is="item.iconUrl || 'Document'" />
                    </el-icon>
                  </div>
                  <el-tag v-if="item.isFeatured" size="small" class="bg-purple-50 text-purple-600 border-purple-100">精选</el-tag>
                </div>
                <h3 class="text-base font-bold text-gray-800 mb-2">{{ item.title }}</h3>
                <p class="text-sm text-gray-500 mb-4 line-clamp-3">{{ item.description || '暂无描述' }}</p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <el-tag size="small" class="bg-blue-50 text-blue-600 border-blue-100">联网上传</el-tag>
                    <el-tag size="small" class="bg-gray-50 text-gray-600 border-gray-100">深度思考</el-tag>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <span class="text-xs text-gray-400">{{ item.usageCount || '0' }}k 使用</span>
                  <span class="text-xs text-gray-400">@{{ item.creatorName || '小龙老师' }}</span>
                </div>
              </div>
            </div>
            <el-empty v-if="filteredAgents.length === 0" description="未找到匹配的智能体应用" class="py-20" />
          </div>

          <!-- Right: Sidebar -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Create Assistant Card -->
            <div class="bg-white rounded-2xl p-6 border border-gray-100">
              <div class="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <el-icon :size="28" color="#667eea"><MagicStick /></el-icon>
              </div>
              <h3 class="text-lg font-bold text-gray-800 mb-2">定制你的助手</h3>
              <p class="text-sm text-gray-500 mb-6">上传教学文档，只需三步即可训练一个专属于你的 AI 智能体。</p>
              <el-button type="primary" class="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:opacity-90" @click="goCreate">
                创建智能体
              </el-button>
            </div>

            <!-- Recommended List -->
            <div class="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 class="text-base font-bold text-gray-800 mb-4">推荐</h3>
              <div class="space-y-4">
                <div 
                  v-for="(rec, index) in recommendedList" 
                  :key="index"
                  class="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
                  @click="goChat(rec.id)"
                >
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <el-icon :size="20" color="#667eea"><User /></el-icon>
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-800">{{ rec.title }}</div>
                    <div class="text-xs text-gray-400">获 {{ rec.likes }}k 点赞</div>
                  </div>
                </div>
              </div>
            </div>
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
      tabs: ['精选', '全部应用', '教学助手', '学科助教', '行政工具'],
      activeTab: 0,
      underlineLeft: 0,
      underlineWidth: 0,
      agentList: [
        {
          id: 1,
          title: '作文批改助手',
          description: '深度解析学生习作，提供多维度点评与改进建议。',
          iconUrl: 'Document',
          isFeatured: true,
          usageCount: 12,
          creatorName: '小龙老师'
        },
        {
          id: 2,
          title: '教研计划专家',
          description: '制定长短期教学研究目标，自动化生成进度表。',
          iconUrl: 'Document',
          isFeatured: false,
          usageCount: 8,
          creatorName: '小龙老师'
        },
        {
          id: 3,
          title: '英语口语陪练',
          description: '实时语音交互，模拟多种真实教学场景对话。',
          iconUrl: 'User',
          isFeatured: false,
          usageCount: 8.1,
          creatorName: '小龙老师'
        },
        {
          id: 4,
          title: '口碑批改',
          description: '快速扫描并批改客观题，生成班级共性错误分析报告。',
          iconUrl: 'EditPen',
          isFeatured: false,
          usageCount: 12,
          creatorName: '小龙老师'
        },
        {
          id: 5,
          title: '学生学情分析',
          description: '多源数据采集，构建学生个体与班级群体画像。',
          iconUrl: 'Monitor',
          isFeatured: false,
          usageCount: 2.4,
          creatorName: '小龙老师'
        },
        {
          id: 6,
          title: '班主任助手',
          description: '处理班级琐事，自动生成评语、家长信及活动通知。',
          iconUrl: 'User',
          isFeatured: false,
          usageCount: 6.7,
          creatorName: '小龙老师'
        }
      ],
      recommendedList: [
        { id: 1, title: '李华老师的数学教案', likes: 1.2 },
        { id: 2, title: '张教授的英语词根解析', likes: 856 }
      ]
    }
  },
  computed: {
    filteredAgents(): any[] {
      return this.agentList
    }
  },
  methods: {
    goChat(id: number) {
      console.log('Navigate to chat:', id)
    },
    goCreate() {
      console.log('Navigate to create agent')
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
    this.updateUnderline()
  },
  watch: {
    activeTab() {
      this.updateUnderline()
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
</style>
