<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 border-b-2 border-primary pb-2 w-max mx-auto">
        幻境助教 工作台
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        汇聚全球顶尖教育 AI 理念
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
        <el-form class="space-y-6" @submit.prevent="handleLogin">
          <el-form-item>
            <el-input 
              v-model="form.username"
              size="large"
              placeholder="请输入首发系统账号" 
              prefix-icon="User"
            />
          </el-form-item>
          <el-form-item>
            <el-input 
              v-model="form.password"
              size="large"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <el-checkbox>保持登录状态</el-checkbox>
            </div>
          </div>
          <el-form-item>
            <el-button 
              @click="handleLogin" 
              type="primary" 
              size="large" 
              class="w-full text-lg shadow-md hover:shadow-lg transition"
              :loading="loading"
            >
              登录系统
            </el-button>
          </el-form-item>
          
          <el-button 
            @click="handleLooseRegister" 
            type="info" plain size="large" class="w-full mt-2"
            :loading="loading"
          >
            新网点免密一键注册
          </el-button>

        </el-form>
      </div>
      <p class="mt-4 text-center text-xs text-gray-400">
        * 若您为机构教师，请使用学校下发的账号密码直接登录。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/user'
import { API_BASE } from '../../utils/api'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入账号和密码！')
    return
  }
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const data = await res.json()
    if (res.ok && data.access_token) {
      userStore.setLoginData(data)
      ElMessage.success('登录成功！')
      router.push('/workspace')
    } else {
      ElMessage.error(data.message || '登录失败，请检查账号密码')
    }
  } catch (err) {
    ElMessage.error('无法连接到服务器，请确保后端服务和数据库已启动')
  } finally {
    loading.value = false
  }
}

const handleLooseRegister = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入所需的账号和密码供注册！')
    return
  }
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const data = await res.json()
    if (res.ok && data.access_token) {
      userStore.setLoginData(data)
      ElMessage.success('快捷注册并登录成功！')
      router.push('/workspace')
    } else {
      ElMessage.error(data.message || '注册失败')
    }
  } catch (err) {
    ElMessage.error('无法连接到服务器，请确保后端服务和数据库已启动')
  } finally {
    loading.value = false
  }
}
</script>
