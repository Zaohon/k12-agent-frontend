<template>
  <div class="h-full w-full bg-gray-50 p-8 md:p-12 overflow-y-auto">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-3xl font-extrabold text-gray-800 tracking-tight">个人中心</h1>
        <p class="text-gray-500 mt-2">管理您的账户设置、安全偏好及 AI 算力使用情况。</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Profile Card -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
             <div class="absolute top-0 right-0 p-4">
                <el-tag size="small" effect="plain" type="success">正常运行</el-tag>
             </div>
             <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-6 border-4 border-white">
               {{ userStore.userInfo?.username?.charAt(0).toUpperCase() }}
             </div>
             <h2 class="text-xl font-bold text-gray-800">{{ userStore.userInfo?.username }}</h2>
             <p class="text-sm text-gray-400 mt-1 capitalize">{{ userStore.userInfo?.role }}</p>
             
             <div class="mt-8 pt-8 border-t border-gray-50">
                <div class="flex justify-between items-center text-sm mb-4">
                  <span class="text-gray-500">归属组织</span>
                  <span class="font-medium text-gray-800">{{ userProfile?.organization?.orgName || '公共节点' }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500">加入时间</span>
                  <span class="font-medium text-gray-800">{{ formatDate(userProfile?.createdAt) }}</span>
                </div>
             </div>
          </div>

          <!-- Quota Card -->
          <div class="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20">
             <div class="flex items-center justify-between mb-6">
                <span class="text-sm font-medium text-blue-100">AI 算力剩余额度</span>
                <el-icon :size="20"><Cpu /></el-icon>
             </div>
             <div class="text-4xl font-black mb-2">{{ remainingTokens.toLocaleString() }}</div>
             <div class="text-[10px] text-blue-100 uppercase tracking-widest opacity-80">Remaining Tokens</div>
             
             <div class="mt-8">
                <el-progress 
                  :percentage="Math.min(100, (userProfile?.consumedToken / userProfile?.tokenLimit) * 100)" 
                  status="warning" 
                  :show-text="false"
                  :stroke-width="8"
                  class="custom-progress"
                />
                <div class="flex justify-between text-[11px] mt-2 opacity-80">
                   <span>已消耗 {{ userProfile?.consumedToken?.toLocaleString() }}</span>
                   <span>总量 {{ userProfile?.tokenLimit?.toLocaleString() }}</span>
                </div>
             </div>
          </div>
        </div>

        <!-- Settings Tabs -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
             <el-tabs v-model="activeTab" class="custom-tabs">
                <el-tab-pane label="安全设置" name="security">
                   <div class="py-6 max-w-md">
                      <h3 class="text-lg font-bold text-gray-800 mb-6">修改登录密码</h3>
                      <el-form :model="pwdForm" label-position="top">
                        <el-form-item label="当前登录密码" required>
                           <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入当前密码以验证身份" />
                        </el-form-item>
                        <el-form-item label="新密码" required>
                           <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="长度不少于6位" />
                        </el-form-item>
                        <el-form-item label="确认新密码" required>
                           <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
                        </el-form-item>
                        <el-button type="primary" class="w-full h-11 mt-4 rounded-xl" :loading="updatingPwd" @click="handleUpdatePwd">
                           更新账户密码
                        </el-button>
                      </el-form>
                   </div>
                </el-tab-pane>

                <el-tab-pane label="偏好设置" name="preference">
                   <div class="py-10 text-center text-gray-400">
                      <el-icon :size="48" class="mb-4"><Setting /></el-icon>
                      <p>更多个性化设置（深色模式、语言选择、通知提醒）正在开发中...</p>
                   </div>
                </el-tab-pane>
             </el-tabs>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Cpu, Setting } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'
import { ElMessage } from 'element-plus'
import { API_BASE } from '../../utils/api'

const userStore = useUserStore()
const userProfile = ref<any>(null)
const activeTab = ref('security')

const pwdForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const updatingPwd = ref(false)

const remainingTokens = computed(() => {
  if (!userProfile.value) return 0
  return userProfile.value.tokenLimit - userProfile.value.consumedToken
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

const fetchProfile = async () => {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    const data = await res.json()
    if (res.ok && data.success) {
      userProfile.value = data.data
    }
  } catch (err) {}
}

const handleUpdatePwd = async () => {
  if (pwdForm.value.newPassword !== pwdForm.value.confirmPassword) {
    return ElMessage.error('两次输入的新密码不一致！')
  }
  if (pwdForm.value.newPassword.length < 6) {
    return ElMessage.error('新密码长度至少为 6 位！')
  }

  updatingPwd.value = true
  try {
    const res = await fetch(`${API_BASE}/auth/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify({ newPassword: pwdForm.value.newPassword })
    })
    if (res.ok) {
      ElMessage.success('密码更新成功，请下次使用新密码登录')
      pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    }
  } catch (err) {
    ElMessage.error('更新失败')
  } finally {
    updatingPwd.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.custom-progress :deep(.el-progress-bar__outer) {
  @apply bg-blue-900/30;
}
.custom-tabs :deep(.el-tabs__header) {
  @apply border-none mb-8;
}
.custom-tabs :deep(.el-tabs__item) {
  @apply text-lg font-bold text-gray-400 px-0 mr-10;
}
.custom-tabs :deep(.el-tabs__item.is-active) {
  @apply text-blue-600;
}
.custom-tabs :deep(.el-tabs__active-bar) {
  @apply bg-blue-600 h-1 rounded-full;
}
</style>
