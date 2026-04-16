<template>
  <div class="h-full w-full bg-gray-50 flex overflow-hidden">
    <main class="flex-1 overflow-y-auto p-12 bg-gray-50 mx-auto max-w-7xl">
      <div class="mb-8 flex justify-between items-end">
         <div>
            <h1 class="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center">
              <el-icon class="mr-3 text-orange-500"><Check /></el-icon>
              生态应用审批中心
            </h1>
            <p class="text-gray-500 mt-2 text-sm">审查来自于网点或平台的智能体生态应用上架申请请求。</p>
         </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-full p-8" v-loading="loading">
        <el-table :data="pendingList" style="width: 100%" class="custom-table" empty-text="当前全部处理完毕，无新的上架申请 🎉">
          <el-table-column label="应用标识" width="250">
            <template #default="scope">
              <div class="flex items-center space-x-3 py-2">
                <div class="w-10 h-10 rounded-lg bg-blueLight flex items-center justify-center text-primary shrink-0">
                  <el-icon><component :is="scope.row.iconUrl || 'MagicStick'" /></el-icon>
                </div>
                <div class="flex flex-col">
                   <span class="font-bold text-gray-800">{{ scope.row.title }}</span>
                   <span class="text-xs text-gray-400 mt-0.5" v-if="scope.row.creator">申请人: {{ scope.row.creator.username }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="description" label="功能简述" show-overflow-tooltip />

          <el-table-column label="申请作用域" width="150">
            <template #default="scope">
              <el-tag :type="scope.row.visibility === 'PUBLIC' ? 'danger' : 'warning'" disable-transitions effect="plain">
                <el-icon class="mr-1"><Lock /></el-icon>
                {{ scope.row.visibility === 'PUBLIC' ? '大厅公开' : '校内公开' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="所属组织点" width="180">
            <template #default="scope">
              <div class="flex flex-col">
                <span class="text-xs text-gray-800">{{ scope.row.organization?.orgName || '未分配' }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="审核管理" width="220" fixed="right">
            <template #default="scope">
              <div class="flex space-x-2">
                <el-button type="success" plain size="small" @click="openReview(scope.row)" :icon="Select">予以通过</el-button>
                <el-button type="danger" text size="small" @click="handleReview(scope.row.id, 'REJECTED')" :icon="CloseBold">驳回</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </main>

    <!-- Review Dialog -->
    <el-dialog v-model="showReviewDialog" title="应用上线审批" width="450px" center>
      <el-form :model="reviewForm" label-position="top">
        <el-form-item label="分配分类目录">
          <el-select v-model="reviewForm.categoryId" placeholder="请选择该应用归属目录" style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="首页精选推广">
          <div class="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div class="flex items-center">
              <el-icon class="text-orange-500 mr-2 text-lg"><StarFilled /></el-icon>
              <span class="text-xs text-orange-700">推荐至广场页顶部轮播图，增加平台曝光度</span>
            </div>
            <el-switch v-model="reviewForm.isFeatured" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showReviewDialog = false">返回</el-button>
          <el-button type="primary" @click="submitApproval" :loading="reviewing">确认上架</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { API_BASE } from '../../utils/api'
import { Check, MagicStick, Select, CloseBold, Lock, StarFilled } from '@element-plus/icons-vue'

const userStore = useUserStore()
const pendingList = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)
const reviewing = ref(false)

const showReviewDialog = ref(false)
const currentAgent = ref<any>(null)
const reviewForm = ref({
  categoryId: null,
  isFeatured: false
})

const fetchPending = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/approval/pending`, {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    const data = await res.json()
    if (res.ok && data.success) {
      pendingList.value = data.data
    }
  } catch (err) {
    ElMessage.error('无法同步审批数据流')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE}/category/list`)
    const data = await res.json()
    if (res.ok && data.success) {
      categories.value = data.data
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
    const res = await fetch(`${API_BASE}/approval/review/${currentAgent.value.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify({ 
        status: 'APPROVED',
        ...reviewForm.value
      })
    })
    const data = await res.json()
    if (res.ok && data.success) {
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

const handleReview = (id: number, status: 'APPROVED' | 'REJECTED') => {
  if (status === 'APPROVED') return // Handled by dialog
  
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
      const res = await fetch(`${API_BASE}/approval/review/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userStore.token}`
        },
        body: JSON.stringify({ status: 'REJECTED' })
      })
      const data = await res.json()
      if (res.ok && data.success) {
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
.custom-table :deep(.el-table__header-wrapper th) {
  background-color: #f9fafb !important;
  color: #6b7280;
  font-weight: 600;
}
</style>
