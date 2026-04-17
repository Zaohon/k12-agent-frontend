<template>
  <!-- 登录弹窗 -->
  <Transition name="modal">
    <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
      <div class="bg-white rounded-[24px] p-8 max-w-md w-full mx-4 relative modal-content" style="box-shadow: 0 20px 60px rgba(0,0,0,0.15);" @click.stop>
        <!-- 关闭按钮 -->
        <button @click="closeModal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <img src="@/images/close.png" alt="关闭" class="h-3 w-3"  />
        </button>

        <!-- 标题区域 -->
        <div class="flex items-center mb-8">
          <div class="w-12 h-12 rounded-[12px] bg-gradient-to-tl from-[#6144D3] to-[#314DE2] flex items-center justify-center mr-4 overflow-hidden" style="box-shadow: 0px 4px 6px -4px #314DE233, 0px 10px 15px -3px #314DE233;">
            <img src="@/images/logo-white.png" alt="logo" class="max-w-[80%] max-h-[80%] object-contain" />
          </div>
          <div>
            <h2 class="text-2xl font-bold" style="color: #2E3339">登录</h2>
            <p class="text-sm" style="color: #5A6066">探索个性化 AI 教学新体验</p>
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
                class="whitespace-nowrap"
                style="background-color: #E6E5FF; color: #314DE2; border: none; border-radius: 12px; padding: 0 24px; height: 48px;"
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
            class="w-full"
            style="margin-top: 30px; height: 56px; border-radius: 12px; background: linear-gradient(90deg, #314DE2 0%, #6144D3 100%); border: none; opacity: 1;"
            :loading="loading"
          >
            确定
          </el-button>
        </form>

        <!-- 底部协议 -->
        <div class="mt-6 text-center">
          <p class="mb-1" style="font-family: Noto Sans SC; font-weight: 500; font-style: Medium; font-size: 10px; line-height: 15px; letter-spacing: 1px; text-align: center; vertical-align: middle; text-transform: uppercase; color: #5A6066CC;">继续操作即表示您同意</p>
          <p style="font-family: Noto Sans SC; font-weight: 500; font-style: Medium; font-size: 11px; line-height: 16.5px; letter-spacing: 0px; text-align: center; vertical-align: middle; color: #5A6066CC;">
            <a href="#" class="text-[#5A6066] hover:underline">隐私政策</a>
            <img src="@/images/point.png" alt="分隔符" class="mx-2 inline-block" style="height: 4px; width: 4px; margin: 0 15px 0 15px;" />
            <a href="#" class="text-[#5A6066] hover:underline">服务条款</a>
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>


<style scoped>
/* 登录弹窗样式 */
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

/* 自定义输入框样式 */
:deep(.custom-input .el-input__wrapper) {
  background-color: #F2F4F8;
  border-radius: 12px;
  box-shadow: none;
  padding: 0 16px;
  transition: box-shadow 0.3s ease;
}

:deep(.custom-input .el-input__inner) {
  height: 48px;
}

:deep(.custom-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #314DE2;
}

/* 底部协议文字样式 */
.text-xs {
  font-size: 12px !important;
  line-height: 1.5 !important;
}

.text-gray-500 {
  color: #9CA3AF !important;
}


/* 自定义 el-select 样式 */
.el-select {
  width: 184px !important;
  height: 48px !important;
  position: relative;
}

.el-select .el-input__wrapper {
  background-color: #F2F4F8 !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  padding: 0 16px !important;
  height: 48px !important;
}

.el-select .el-input__inner {
  height: 48px !important;
  line-height: 48px !important;
}

.el-select.is-focus .el-input__wrapper {
  box-shadow: 0 0 0 2px #314DE2 !important;
}

/* 隐藏默认箭头 */
.el-select .el-input__suffix-inner .el-select__caret {
  display: none !important;
}

/* 添加自定义箭头 */
.el-select .el-input__suffix-inner {
  position: relative !important;
}

.el-select .el-input__suffix-inner::after {
  content: '' !important;
  position: absolute !important;
  right: 0 !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 12px !important;
  height: 12px !important;
  background-image: url('@/images/vector.png') !important;
  background-size: contain !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  transition: transform 0.3s ease !important;
}

/* 下拉菜单打开时旋转箭头 */
.el-select.open .el-input__suffix-inner::after {
  transform: translateY(-50%) rotate(90deg) !important;
}

/* 自定义 el-select 下拉选项样式 */
.el-select-dropdown {
  border-radius: 12px !important;
  box-shadow: 0px 4px 6px -4px #314DE233, 0px 10px 15px -3px #314DE233 !important;
}

.el-select-dropdown__item {
  padding: 8px 16px !important;
  font-family: 'Noto Sans SC', sans-serif !important;
  font-size: 14px !important;
  color: #000000 !important;
}

.el-select-dropdown__item:hover {
  background-color: #B4BDFF66 !important;
  color: #000000 !important;
}

.el-select-dropdown__item.selected {
  background-color: #F2F4F8 !important;
  color: #000000 !important;
}

</style>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import CustomSelect from '@/components/CustomSelect.vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { API_BASE } from '../../utils/api'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'login', data: { name: string; phone: string; code: string; education: string; subject: string }): void
}>()

const router = useRouter()
const loading = ref(false)
const countdown = ref(0)

const loginForm = reactive({
  phone: '',
  code: ''
})

// 定义选项数组
const educationOptions = [
  { label: '小学', value: 'elementary' },
  { label: '初中', value: 'middle' },
  { label: '高中', value: 'high' }
]

const subjectOptions = [
  { label: '语文', value: 'chinese' },
  { label: '数学', value: 'math' },
  { label: '英语', value: 'english' },
  { label: '物理', value: 'physics' }
]

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
      // 开始倒计时
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      ElMessage.error(data.message || '发送验证码失败')
    }
  } catch (err) {
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
      ElMessage.success('登录成功！')
      router.push('/workspace')
      emit('close')
      // 重置表单
      Object.assign(loginForm, {
        phone: '',
        code: ''
      })
      // 重置倒计时
      countdown.value = 0
    } else {
      ElMessage.error(data.message || '登录失败，请检查信息')
    }
  } catch (err) {
    ElMessage.error('无法连接到服务器，请确保后端服务和数据库已启动')
  } finally {
    loading.value = false
  }
}


</script>
