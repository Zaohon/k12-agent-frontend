<template>
  <div class="h-full w-full bg-gray-50 flex overflow-hidden">
    <main class="flex-1 overflow-y-auto p-12 bg-gray-50 mx-auto w-[95%]">
      <div class="flex justify-between items-center p-6 rounded-xl header-container">
         <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center icon-wrapper">
              <img src="../../images/approval.png" class="w-6 h-auto" alt="approval" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">智能体审批中心</h1>
              <p class="text-gray-500 mt-1 text-sm">审查来自于网点和平台的智能体发布申请。</p>
            </div>
         </div>
         <el-button type="default" size="small" class="export-btn">
           <img src="../../images/download-black.png" class="w-2.5 h-auto mr-[5px]" alt="download" />
           导出日志
         </el-button>
      </div>

     <div class="bg-white flex flex-col h-[calc(100vh-300px)] mt-[30px] rounded-xl overflow-hidden shadow-sm" v-loading="loading">
        <!-- 搜索筛选栏 -->
        <!-- <div class="flex items-center justify-between px-8 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div class="flex items-center gap-4 flex-1">
            <div class="relative search-input-wrapper">
              <div class="search-icon-wrapper"><el-icon><Search /></el-icon></div>
              <input 
                type="text" 
                placeholder="按智能体名称或ID搜索..." 
                class="search-input"
              />
            </div>
            <el-select v-model="statusFilter" placeholder="所有状态" popper-class="filter-select-popper" class="filter-select">
              <el-option label="所有状态" value="" />
              <el-option label="待审核" value="PENDING" />
              <el-option label="已通过" value="APPROVED" />
              <el-option label="已拒绝" value="REJECTED" />
            </el-select>
            <el-select v-model="roleFilter" placeholder="所有身份" popper-class="filter-select-popper" class="filter-select">
              <el-option label="所有身份" value="" />
              <el-option label="超级管理员" value="SUPER_ADMIN" />
              <el-option label="管理员" value="ADMIN" />
              <el-option label="教师" value="TEACHER" />
              <el-option label="学生" value="STUDENT" />
            </el-select>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-500">当前筛选:</span>
            <span class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">待审核</span>
            <button class="text-xs text-gray-400 hover:text-gray-600">清除全部</button>
          </div>
        </div> -->

        <div class="flex-1">
          <el-table :data="pendingList" style="width: 100%" class="custom-table" empty-text="当前全部处理完毕，无新的上架申请 🎉" height="100%">
            <el-table-column label="应用标识" width="280" class-name="first-col">
              <template #default="scope">
                <div class="flex items-center space-x-3 py-2">
                  <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img :src="scope.row.iconUrl" class="w-full h-full object-cover" alt="icon" />
                  </div>
                  <div class="flex flex-col min-w-0">
                     <span class="font-bold text-gray-800 truncate">{{ scope.row.title }}</span>
                     <span class="text-xs text-gray-400 mt-0.5">ID: {{ scope.row.id }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="description" label="能力描述" show-overflow-tooltip />

            <el-table-column label="申请人" width="160">
              <template #default="scope">
                <div class="flex flex-col">
                  <span class="text-sm text-gray-800">{{ scope.row.creator?.username || '-' }}</span>
                  <span class="text-xs text-gray-400">{{ scope.row.creator?.userId || '-' }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="身份" width="150" align="center">
              <template #default="scope">
                <el-tag 
                  :type="scope.row.creator?.role === 'SUPER_ADMIN' ? 'danger' : scope.row.creator?.role === 'ADMIN' ? 'warning' : scope.row.creator?.role === 'TEACHER' ? 'success' : 'info'" 
                  effect="plain" 
                  size="small"
                  class="role-tag"
                >
                  {{ scope.row.creator?.role === 'SUPER_ADMIN' ? '超级管理员' : scope.row.creator?.role === 'ADMIN' ? '管理员' : scope.row.creator?.role === 'TEACHER' ? '教师' : '学生' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="150" align="center">
              <template #default="scope">
                <el-tag 
                  v-if="scope.row.approvalStatus === 'PENDING'" 
                  type="warning" 
                  effect="plain" 
                  size="small"
                >
                  待审批
                </el-tag>
                <el-tag 
                  v-else-if="scope.row.approvalStatus === 'APPROVED'" 
                  type="success" 
                  effect="plain" 
                  size="small"
                >
                  已审批
                </el-tag>
                <el-tag 
                  v-else-if="scope.row.approvalStatus === 'REJECTED'" 
                  type="danger" 
                  effect="plain" 
                  size="small"
                >
                  已拒绝
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <div class="flex space-x-2">
                  <template v-if="scope.row.approvalStatus === 'PENDING'">
                    <el-button size="small" class="approve-btn" @click="openReview(scope.row)">批准</el-button>
                    <el-button size="small" class="reject-btn" @click="handleReview(scope.row.id, 'REJECTED')">拒绝</el-button>
                  </template>
                  <template v-else>
                    <el-button type="default" plain size="small" disabled>撤销</el-button>
                  </template>
                  <el-button type="default" text size="small" @click="viewDetail(scope.row)">
                    <img src="../../images/is-visable.png" class="h-2 w-auto" alt="view" />
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </main>

    <!-- Review Dialog -->
    <el-dialog v-model="showReviewDialog" width="1100px" :close-on-click-modal="false" class="review-dialog">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <img v-if="currentAgent?.iconUrl" :src="currentAgent.iconUrl" class="w-full h-full object-cover" alt="icon" />
              <span v-else class="text-white text-lg font-bold">{{ currentAgent?.title?.charAt(0) || 'A' }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold text-gray-800 truncate">{{ currentAgent?.title || '-' }}</h3>
                <span class="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded shrink-0">学科辅导</span>
                <span class="px-2 py-1 bg-amber-50 text-amber-600 text-xs rounded border border-amber-200 shrink-0">待审批</span>
              </div>
              <div class="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span>申请人：{{ currentAgent?.creator?.username || '-' }}({{ currentAgent?.creator?.userId || '-' }})</span>
                <span class="text-gray-300">|</span>
                <span>提交时间：{{ formatDate(currentAgent?.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <div class="flex gap-6 mt-4 w-full">
        <!-- 左侧：核心配置预览 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-4">
            <img src="../../images/config.png" class="w-5 h-5" alt="config" />
            <span class="font-bold text-gray-800">核心配置预览</span>
          </div>
          
          <div class="space-y-4">
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 class="text-sm font-bold text-gray-800 mb-2">智能体简介</h4>
              <p class="text-sm text-gray-600 leading-relaxed">{{ currentAgent?.description || '暂无简介' }}</p>
            </div>
            
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 class="text-sm font-bold text-gray-800 mb-2">提示词 (Prompt)</h4>
              <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{{ currentAgent?.systemPrompt || '暂无提示词' }}</p>
            </div>
          </div>
        </div>
        
        <!-- 右侧：能力与参数设置 -->
        <div class="w-[380px] shrink-0">
          <div class="flex items-center gap-2 mb-4">
            <img src="../../images/setting.png" class="w-5 h-5" alt="setting" />
            <span class="font-bold text-gray-800">能力与参数设置</span>
          </div>
          
          <div class="space-y-4">
            <!-- 能力插件 -->
            <div>
              <h4 class="text-sm font-bold text-gray-800 mb-2">开启的能力插件</h4>
              <div class="space-y-2">
                <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                      <img src="../../images/earth.png" class="w-3.5 h-3.5" alt="web" />
                    </div>
                    <div>
                      <div class="text-xs font-medium text-gray-800">联网搜索</div>
                      <div class="text-xs text-gray-400">实时搜索网络最新信息并提高回复的时效性。</div>
                    </div>
                  </div>
                  <div v-if="currentAgent?.enableWebSearch" class="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">
                      <img src="../../images/web-read.png" class="w-3.5 h-3.5" alt="web-parse" />
                    </div>
                    <div>
                      <div class="text-xs font-medium text-gray-800">网页解析</div>
                      <div class="text-xs text-gray-400">提取网页信息，模型可分析并使用网络信息辅助回复</div>
                    </div>
                  </div>
                  <div v-if="currentAgent?.enableWebParse" class="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
                      <img src="../../images/think.png" class="w-3.5 h-3.5" alt="think" />
                    </div>
                    <div>
                      <div class="text-xs font-medium text-gray-800">深度思考</div>
                      <div class="text-xs text-gray-400">启用逻辑推理模型进行多轮思考，处理复杂任务。</div>
                    </div>
                  </div>
                  <div v-if="currentAgent?.enableDeepThink" class="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                      <img src="../../images/upload-file.png" class="w-3.5 h-3.5" alt="file" />
                    </div>
                    <div>
                      <div class="text-xs font-medium text-gray-800">文档上传</div>
                      <div class="text-xs text-gray-400">支持用户上传文档，模型可分析并使用其中的信息</div>
                    </div>
                  </div>
                  <div v-if="currentAgent?.enableFileUpload" class="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">
                      <img src="../../images/database.png" class="w-3.5 h-3.5" alt="kb" />
                    </div>
                    <div>
                      <div class="text-xs font-medium text-gray-800">专属知识库</div>
                      <div class="text-xs text-gray-400">读取知识库信息，支持PDF、Word等多种格式。</div>
                    </div>
                  </div>
                  <div v-if="currentAgent?.enableKnowledgeBase" class="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 适用模型 -->
            <div>
              <h4 class="text-sm font-bold text-gray-800 mb-2">适用模型</h4>
              <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span class="text-sm text-gray-700">{{ currentAgent?.model || '-' }}</span>
              </div>
            </div>
            
            <!-- 访问权限 -->
            <div>
              <h4 class="text-sm font-bold text-gray-800 mb-2">访问权限</h4>
              <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                  <img src="../../images/internal.png" class="w-3.5 h-3.5" alt="visibility" />
                </div>
                <span class="text-sm text-gray-700">{{ currentAgent?.visibility === 'ORG_VISIBLE' ? '公开 · 所有人可见' : '仅自己可见' }}</span>
              </div>
            </div>
            
            <!-- 分配分类目录 -->
            <div class="pt-2 border-t border-gray-100">
              <el-form :model="reviewForm" label-position="top">
                <el-form-item label="分配分类目录" class="mb-2">
                  <el-select v-model="reviewForm.categoryId" placeholder="请选择该应用归属目录" style="width: 100%">
                    <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
                  </el-select>
                </el-form-item>
                <el-form-item label="首页精选推广" class="mb-0">
                  <div class="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div class="flex items-center gap-2">
                      <img src="../../images/star.png" class="w-4 h-4 text-orange-500" alt="star" />
                      <span class="text-xs text-orange-700">推荐至广场页顶部轮播图</span>
                    </div>
                    <el-switch v-model="reviewForm.isFeatured" size="small" />
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <el-button @click="showReviewDialog = false" class="close-btn">关闭</el-button>
          <el-button @click="handleReview(currentAgent?.id, 'REJECTED')" class="reject-dialog-btn">拒绝</el-button>
          <el-button @click="submitApproval" :loading="reviewing" class="approve-dialog-btn">通过审批</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { agentApi, categoryApi } from '../../api/api'

const userStore = useUserStore()
const pendingList = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)
const reviewing = ref(false)

const showReviewDialog = ref(false)
const currentAgent = ref<any>(null)
const statusFilter = ref('')
const roleFilter = ref('')
const reviewForm = ref({
  categoryId: null,
  isFeatured: false
})

const fetchPending = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (statusFilter.value) params.status = statusFilter.value
    if (roleFilter.value) params.role = roleFilter.value
    const res = await agentApi.getPendingApprovals(params)
    if (res.success) {
      pendingList.value = res.data
      console.log('审批列表数据:', res.data)
    }
  } catch (err) {
    ElMessage.error('无法同步审批数据流')
  } finally {
    loading.value = false
  }
}

watch([statusFilter, roleFilter], () => {
  fetchPending()
})

const fetchCategories = async () => {
  try {
    const res = await categoryApi.getCategoryList()
    if (res.success) {
      categories.value = res.data
    }
  } catch (e) {}
}

const openReview = (agent: any) => {
  currentAgent.value = agent
  reviewForm.value = {
    categoryId: null,
    isFeatured: false
  }
  showReviewDialog.value = true
}

const submitApproval = async () => {
  reviewing.value = true
  try {
    const res = await agentApi.reviewApproval(currentAgent.value.id, {
      status: 'APPROVED',
      ...reviewForm.value
    })
    if (res.success) {
      ElMessage.success('应用已成功上架！')
      showReviewDialog.value = false
      await fetchPending()
    }
  } catch(e) {
    ElMessage.error('网络校验失败')
  } finally {
    reviewing.value = false
  }
}

const viewDetail = (agent: any) => {
  ElMessage.info('查看详情功能开发中')
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const handleReview = (id: number, status: 'APPROVED' | 'REJECTED') => {
  if (status === 'APPROVED') return // Handled by dialog
  
  // 关闭对话框
  showReviewDialog.value = false
  
  ElMessageBox.confirm(
    `请确认是否驳回此应用服务申请？`,
    '决策验证',
    {
      confirmButtonText: '执行驳回',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    loading.value = true
    try {
      const res = await agentApi.reviewApproval(id, { status: 'REJECTED' })
      if (res.success) {
        ElMessage.success(`申请已驳回`)
        await fetchPending()
      }
    } catch(e) {
      ElMessage.error('网络出错')
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchPending()
  fetchCategories()
})
</script>

<style scoped>
.header-container {
  background: #FFFFFF;
  box-shadow: 0px 3px 5px -6px #C7D2FE;
}

.icon-wrapper {
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  box-shadow: 0px 3px 5px -6px #C7D2FE;
}

.export-btn {
  width: 160px;
  height: 46px;
  justify-content: center;
  align-items: center;
  padding: 12px 30px;
  border-radius: 8px;
  border: 1px solid #ADB2B9;
  background: #F8F9FD;
}

.custom-table :deep(.el-table__header-wrapper th) {
  color: #6b7280;
  font-weight: 600;
  text-align: center;
  height: 60px;
}

.custom-table :deep(.el-table__header-wrapper th .cell) {
  text-align: center;
}

.custom-table :deep(.el-table__body-wrapper td .cell) {
  text-align: center;
}

.custom-table :deep(.el-table__body-wrapper tr:first-child td) {
  border-top: none;
}

.custom-table :deep(.first-col .cell) {
  text-align: left !important;
}

.approve-btn {
  width: 48px;
  height: 28px;
  padding: 6px 12px;
  border-radius: 6px;
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  color: #fff;
  border: none;
  font-size: 12px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.approve-btn:hover {
  opacity: 0.9;
}

.reject-btn {
  width: 50px;
  height: 30px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ADB2B9;
  background: #FFFFFF;
  color: #5A6066;
  font-size: 12px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.search-input-wrapper {
  width: 30%;
  height: 41px;
}

.search-icon-wrapper {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  color: #5A6066;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-input {
  width: 100%;
  height: 41px;
  padding: 10px 16px 10px 37px;
  background: #F8F9FD;
  border: 1px solid #ADB2B9;
  border-radius: 8px;
  font-family: 'Noto Sans SC';
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: #6B7280;
  outline: none;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: #6B7280;
  font-weight: 500;
}

.role-tag {
  height: 20px;
  padding: 2px 8px;
  border-radius: 4px;
}

.filter-select {
  width: 114px;
}

.filter-select :deep(.el-select__wrapper) {
  height: 38px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ADB2B9;
  background: #F8F9FD;
  box-shadow: none;
}

.filter-select :deep(.el-select__caret) {
  background: url('../../images/arrow-grey.png') no-repeat center;
  background-size: contain;
  font-size: 0;
  width: 12px;
  height: 12px;
}

.filter-select :deep(.el-select__caret.is-reverse) {
  transform: rotate(90deg);
}

.filter-select :deep(.el-select__caret::before) {
  content: none;
}

.filter-select :deep(.el-select__suffix) {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.filter-select :deep(.el-select__placeholder) {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #6B7280;
}

.filter-select-popper {
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 14px;
}

/* 审批对话框样式 */
.review-dialog :deep(.el-dialog) {
  max-width: 1100px;
}

.review-dialog :deep(.el-dialog__header) {
  padding: 24px 24px 0;
  margin: 0;
}

.review-dialog :deep(.el-dialog__body) {
  padding: 20px 24px 0;
}

.review-dialog :deep(.el-dialog__footer) {
  padding: 20px 24px 24px;
}

.close-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
}

.reject-dialog-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #EF4444;
  background: #FEF2F2;
  color: #DC2626;
  font-size: 14px;
  font-weight: 500;
}

.approve-dialog-btn {
  padding: 10px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  border: none;
}

.approve-dialog-btn:hover {
  opacity: 0.9;
}
</style>
