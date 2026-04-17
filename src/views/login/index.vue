<template>
  <!-- 登录弹窗 -->
  <Transition name="modal">
    <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
      <div class="bg-white rounded-[24px] p-8 max-w-md w-full mx-4 relative modal-content" @click.stop>
        <!-- 关闭按钮 -->
        <button @click="closeModal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <img src="@/images/close.png" alt="关闭" class="h-3 w-3" />
        </button>

        <!-- 标题区域 -->
        <div class="flex items-center mb-8">
          <div class="w-12 h-12 rounded-[12px] bg-gradient-to-tl from-[#6144D3] to-[#314DE2] flex items-center justify-center mr-4 overflow-hidden logo-container">
            <img src="@/images/logo-white.png" alt="logo" class="max-w-[80%] max-h-[80%] object-contain" />
          </div>
          <div>
            <h2 class="text-2xl font-bold modal-title">登录</h2>
            <p class="text-sm modal-subtitle">探索个性化 AI 教学新体验</p>
          </div>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-[#314DE2] mb-2">手机号</label>
            <el-input
              v-model="loginForm.phone"
              type="tel"
              placeholder="请输入 11 位手机号"
              class="custom-input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-[#314DE2] mb-2">验证码</label>
            <div class="flex space-x-3">
              <el-input
                v-model="loginForm.code"
                type="text"
                maxlength="6"
                placeholder="6 位数字"
                class="custom-input flex-1"
              />
              <el-button
                type="primary"
                class="sms-button whitespace-nowrap"
                @click="sendSmsCode"
                :disabled="countdown > 0"
              >
                {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
              </el-button>
            </div>
          </div>

          <el-button
            type="primary"
            native-type="submit"
            class="submit-button w-full"
            :loading="loading"
          >
            确定
          </el-button>
        </form>

        <!-- 底部协议 -->
        <div class="mt-6 text-center">
          <p class="mb-1 agreement-text">继续操作即表示您同意</p>
          <p class="agreement-text-links">
            <a href="#" class="text-[#5A6066] hover:underline">隐私政策</a>
            <img src="@/images/point.png" alt="分隔符" class="mx-2 inline-block divider-icon" />
            <a href="#" class="text-[#5A6066] hover:underline">服务条款</a>
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { API_BASE } from '../../utils/api'

export default {
  name: 'LoginModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'login'],
  setup(props, { emit }) {
    const router = useRouter()
    const loading = ref(false)
    const countdown = ref(0)
    let countdownTimer = null

    const loginForm = reactive({
      phone: '',
      code: ''
    })

    const closeModal = () => {
      emit('close')
    }

    const sendSmsCode = async () => {
      if (!loginForm.phone) {
        ElMessage.warning('请输入手机号！')
        return
      }
      try {
        const res = await fetch(`${API_BASE}/auth/sms_send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: loginForm.phone })
        })
        const data = await res.json()
        if (res.ok) {
          ElMessage.success(data.message || '验证码已发送')
          countdown.value = 60
          countdownTimer = setInterval(() => {
            countdown.value--
            if (countdown.value <= 0 && countdownTimer) {
              clearInterval(countdownTimer)
              countdownTimer = null
            }
          }, 1000)
        } else {
          ElMessage.error(data.message || '发送验证码失败')
        }
      } catch {
        ElMessage.error('无法连接到服务器，请确保后端服务和数据库已启动')
      }
    }

    const handleLogin = async () => {
      if (!loginForm.phone || !loginForm.code) {
        ElMessage.warning('请填写手机号和验证码！')
        return
      }
      loading.value = true
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: loginForm.phone, code: loginForm.code })
        })
        const data = await res.json()
        if (res.ok && data.access_token) {
          localStorage.setItem('k12_token', data.access_token)
          if (data.user) {
            localStorage.setItem('k12_user', JSON.stringify(data.user))
          }
          ElMessage.success('登录成功！')
          router.push('/workspace')
          emit('close')
          Object.assign(loginForm, { phone: '', code: '' })
          countdown.value = 0
        } else {
          ElMessage.error(data.message || '登录失败，请检查信息')
        }
      } catch {
        ElMessage.error('无法连接到服务器，请确保后端服务和数据库已启动')
      } finally {
        loading.value = false
      }
    }

    return {
      loginForm,
      loading,
      countdown,
      closeModal,
      sendSmsCode,
      handleLogin
    }
  }
}
</script>

<style scoped>
/* 登录弹窗样式 */
.modal-content {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

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
  transform: translateY(-50px);
}

/* logo 容器样式 */
.logo-container {
  box-shadow: 0px 4px 6px -4px #314DE233, 0px 10px 15px -3px #314DE233;
}

/* 标题样式 */
.modal-title {
  color: #2E3339;
}

.modal-subtitle {
  color: #5A6066;
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

/* 短信按钮样式 */
:deep(.sms-button) {
  background-color: #E6E5FF;
  color: #314DE2;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 0 24px;
  height: 48px;
  transition: all 0.3s ease;
}

/* 短信按钮悬停样式 */
:deep(.sms-button:hover) {
  border-color: #314DE2 !important;
  box-shadow: 0 0 0 2px #314DE233;
}

/* 提交按钮样式 */
:deep(.submit-button) {
  margin-top: 30px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(90deg, #314DE2 0%, #6144D3 100%);
  border: none;
  opacity: 1;
  transition: all 0.3s ease;
}

/* 提交按钮悬停样式 */
:deep(.submit-button:hover) {
  opacity: 0.9;
  box-shadow: 0 4px 12px #314DE240;
}

/* 底部协议文字样式 */
.agreement-text {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 500;
  font-style: Medium;
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 1px;
  text-align: center;
  vertical-align: middle;
  text-transform: uppercase;
  color: #5A6066CC;
}

.agreement-text-links {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 500;
  font-style: Medium;
  font-size: 11px;
  line-height: 16.5px;
  letter-spacing: 0px;
  text-align: center;
  vertical-align: middle;
  color: #5A6066CC;
}

.divider-icon {
  height: 4px;
  width: 4px;
  margin: 0 15px;
}

/* 底部协议文字样式 */
.text-xs {
  font-size: 12px !important;
  line-height: 1.5 !important;
}

.text-gray-500 {
  color: #9CA3AF !important;
}
</style>