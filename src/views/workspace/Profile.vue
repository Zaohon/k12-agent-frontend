<template>
  <Transition name="modal">
    <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="close">
      <div class="bg-white rounded-[24px] max-w-5xl w-full relative modal-content overflow-hidden max-h-[90vh] overflow-y-auto" @click.stop>
        <!-- 关闭按钮 -->
        <button @click="close" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10">
          <img src="@/images/close.png" alt="关闭" class="h-3 w-3" />
        </button>

        <div class="p-8">
          <!-- Header -->
          <div class="mb-5 pb-4 border-b border-[#DEE3EA]">
            <h1 class="text-3xl font-extrabold text-gray-800 tracking-tight">个人中心</h1>
            <p class="text-gray-500 mt-2">管理您的账户设置、安全偏好及 AI 算力使用情况。</p>
          </div>

          <div class="flex flex-col lg:flex-row gap-8">
            
            <!-- Profile Card -->
            <div class="lg:w-[40%] space-y-6">
              <div class="bg-white p-8 text-center relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4">
                  <div class="status-tag">
                    <span class="status-dot"></span>
                    <span class="status-text">正常</span>
                  </div>
                </div>
                <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-6 border-4 border-white">
                  {{ userStore.userInfo?.username?.charAt(0).toUpperCase() }}
                </div>
                <h2 class="text-xl font-bold text-gray-800">{{ userStore.userInfo?.username }}</h2>
                <p class="text-sm text-gray-400 mt-1 capitalize">{{ userStore.userInfo?.role }}</p>
                
                <div class="mt-8 pt-8">
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
              <div class="quota-card rounded-xl p-6 text-white">
                <img src="@/images/logo-white.png" class="quota-card-logo w-auto h-[72px] opacity-10" alt="logo" />
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-blue-100">AI 算力剩余额度</span>
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

            <!-- Settings -->
            <div class="lg:w-[60%]">
              <div class="bg-white min-h-[100%] border-l border-[#DEE3EA]">
                <div class="section-title-container">
                  <h2 class="text-xl font-bold text-gray-800 ml-8">安全设置</h2>
                </div>
                <div class="ml-auto mr-auto w-[90%]">
                  <div class="section-description">
                    更新您的密码并管理您的账户安全。
                  </div>
                  <div class="password-form-container">
                    <div class="p-4">
                      <div class="flex items-center mb-6">
                        <img src="@/images/key-blue.png" alt="key" class="h-2.5 w-auto mr-2.5" />
                        <h3 class="text-lg font-bold text-gray-800">修改密码</h3>
                      </div>
                      <el-form :model="pwdForm" label-position="top">
                        <el-form-item label="当前密码" required>
                          <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入当前密码以验证身份" class="custom-input" />
                        </el-form-item>
                        <el-form-item label="新密码" required>
                          <el-input 
                            v-model="pwdForm.newPassword" 
                            type="password" 
                            show-password 
                            placeholder="长度不少于8位" 
                            class="custom-input"
                            @blur="validateNewPassword"
                            @focus="clearNewPasswordError"
                          />
                          <div v-if="validationErrors.newPassword" class="error-message">
                            {{ validationErrors.newPassword }}
                          </div>
                          <div v-else class="error-placeholder">    </div>
                        </el-form-item>
                        <el-form-item label="确认新密码" required>
                          <el-input 
                            v-model="pwdForm.confirmPassword" 
                            type="password" 
                            show-password 
                            placeholder="请再次输入新密码" 
                            class="custom-input"
                            @blur="validateConfirmPassword"
                            @focus="clearConfirmPasswordError"
                          />
                          <div v-if="validationErrors.confirmPassword" class="error-message">
                            {{ validationErrors.confirmPassword }}
                          </div>
                          <div v-else class="error-placeholder">    </div>
                        </el-form-item>
                        <div class="flex justify-center">
                          <el-button type="primary" class="custom-submit-button mt-4" :loading="updatingPwd" @click="handleUpdatePwd">
                            更新账户密码
                          </el-button>
                        </div>
                      </el-form>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useUserStore } from '../../store/user'
import { ElMessage } from 'element-plus'
import { API_BASE } from '../../utils/api'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const userStore = useUserStore()
const userProfile = ref<any>(null)

const pwdForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const updatingPwd = ref(false)

const validationErrors = ref({
  newPassword: '',
  confirmPassword: ''
})

const validateNewPassword = () => {
  if (!pwdForm.value.newPassword) {
    validationErrors.value.newPassword = '请输入新密码'
  } else if (pwdForm.value.newPassword.length < 8) {
    validationErrors.value.newPassword = '新密码长度不能少于 8 位'
  } else {
    validationErrors.value.newPassword = ''
  }
}

const validateConfirmPassword = () => {
  if (!pwdForm.value.confirmPassword) {
    validationErrors.value.confirmPassword = '请再次输入新密码'
  } else if (pwdForm.value.newPassword !== pwdForm.value.confirmPassword) {
    validationErrors.value.confirmPassword = '两次输入的新密码不一致'
  } else {
    validationErrors.value.confirmPassword = ''
  }
}

const clearNewPasswordError = () => {
  validationErrors.value.newPassword = ''
}

const clearConfirmPasswordError = () => {
  validationErrors.value.confirmPassword = ''
}

const remainingTokens = computed(() => {
  if (!userProfile.value) return 0
  return userProfile.value.tokenLimit - userProfile.value.consumedToken
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

const close = () => {
  emit('close')
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
  if (pwdForm.value.newPassword.length < 8) {
    return ElMessage.error('新密码长度不能少于 8 位！')
  }

  updatingPwd.value = true
  try {
    const res = await fetch(`${API_BASE}/auth/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify({
        currentPassword: pwdForm.value.oldPassword,
        newPassword: pwdForm.value.newPassword,
        confirmPassword: pwdForm.value.confirmPassword
      })
    })
    
    const data = await res.json()
    
    if (res.ok && data.success) {
      ElMessage.success('密码更新成功，请下次使用新密码登录')
      pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    } else {
      ElMessage.error(data.message || '更新失败')
    }
  } catch (err) {
    ElMessage.error('更新失败')
  } finally {
    updatingPwd.value = false
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    fetchProfile()
  }
})

onMounted(() => {
  if (props.visible) {
    fetchProfile()
  }
})
</script>

<style scoped>
/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  opacity: 0;
  transform: translateY(-20px);
}

/* 算力卡片样式 */
.quota-card {
  background: linear-gradient(114.4deg, #314DE2 3.17%, #6144D3 92.04%);
  box-shadow: 0px 8px 10px -6px #C7D2FE, 0px 20px 25px -5px #C7D2FE;
  position: relative;
}

.quota-card-logo {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

/* 状态标签样式 */
.status-tag {
  width: 58.02000045776367px;
  height: 24px;
  padding: 4px 10px;
  gap: 6px;
  border-radius: 20px;
  background: #CFF1E6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22C55E;
}

.status-text {
  font-size: 12px;
  color: #5A6066;
}

/* 安全设置标题容器样式 */
.section-title-container {
  width: 100%;
  height: 65px;
  padding: 0 3%;
  opacity: 1;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
}

/* 安全设置描述文字样式 */
.section-description {
  padding: 20px 0;
  font-family: Noto Sans SC;
  font-weight: 400;
  font-style: Regular;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0px;
  vertical-align: middle;
  color: #5A6066;
}

/* 密码表单容器样式 */
.password-form-container {
  border: 1px solid #DEE3EA;
  border-radius: 20px;
}

.custom-progress :deep(.el-progress-bar__outer) {
  @apply bg-blue-900/30;
}

/* 自定义输入框样式 */
:deep(.custom-input .el-input__wrapper) {
  background-color: #F2F4F8;
  border-radius: 12px;
  box-shadow: none;
  padding: 0 16px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

:deep(.custom-input .el-input__inner) {
  height: 48px;
}

:deep(.custom-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #314DE2;
  border-color: #314DE2;
}

:deep(.custom-input .el-input__wrapper:hover) {
  border-color: #314DE2;
}

/* 自定义提交按钮样式 */
:deep(.custom-submit-button) {
  width: 236px;
  height: 38px;
  padding: 9px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  box-shadow: 0px 1px 2px 0px #0000000D;
  border: none;
  opacity: 1;
  transition: all 0.3s ease;
}

:deep(.custom-submit-button:hover) {
  opacity: 0.9;
  box-shadow: 0 4px 12px #314DE240;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  min-height: 18px;
  height: 18px;
  line-height: 18px;
  padding-left: 12px;
}

.error-placeholder {
  color: white;
  margin-top: 4px;
  min-height: 18px;
  height: 18px;
  line-height: 18px;
  padding-left: 12px;
}
</style>
