<template>
  <aside class="w-64 bg-white border-r border-gray-200 h-full flex flex-col items-center py-6 shrink-0 relative">
    <!-- Logo area -->
    <div class="mb-10 w-full px-6 flex items-center justify-start space-x-3 cursor-pointer">
      <div class="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm bg-gradient-to-tr from-blue-600 to-blue-400">
        幻
      </div>
      <span class="text-xl font-bold text-gray-800 tracking-wide">幻境助教</span>
    </div>

    <!-- Navigation List -->
    <nav class="flex-1 w-full px-4 space-y-2 overflow-y-auto">
      <router-link
        to="/workspace/square"
        class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors hover:bg-gray-100 text-gray-700"
        active-class="bg-blueLight text-primary font-medium"
      >
        <el-icon :size="20"><Menu /></el-icon>
        <span>教育智能体</span>
      </router-link>

      <router-link
        to="/workspace/chat"
        class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors hover:bg-gray-100 text-gray-700"
        active-class="bg-blueLight text-primary font-medium"
      >
        <el-icon :size="20"><ChatDotSquare /></el-icon>
        <span>智能问答</span>
      </router-link>

      <router-link
        to="/workspace/studio"
        class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors hover:bg-gray-100 text-gray-700"
        active-class="bg-blueLight text-primary font-medium"
      >
        <el-icon :size="20"><Cpu /></el-icon>
        <span>我的智能体</span>
      </router-link>

      <div v-if="userStore.userInfo?.role === 'SUPER_ADMIN' || userStore.userInfo?.role === 'SCHOOL_ADMIN'" class="pt-6 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
        管理员控制台
      </div>

      <router-link
        v-if="userStore.userInfo?.role === 'SUPER_ADMIN' || userStore.userInfo?.role === 'SCHOOL_ADMIN'"
        to="/workspace/approval"
        class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-orange-600 hover:bg-orange-50"
        active-class="bg-orange-100 text-orange-700 font-medium"
      >
        <el-icon :size="20"><Check /></el-icon>
        <span>审批中心</span>
      </router-link>

      <router-link
        v-if="userStore.userInfo?.role === 'SUPER_ADMIN'"
        to="/workspace/org"
        class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-purple-600 hover:bg-purple-50"
        active-class="bg-purple-100 text-purple-700 font-medium"
      >
        <el-icon :size="20"><OfficeBuilding /></el-icon>
        <span>网点组织管理</span>
      </router-link>
    </nav>

    <div class="px-6 w-full mt-6 absolute bottom-6">
      <div 
        class="p-4 border border-gray-100 rounded-2xl bg-gray-50 flex items-center justify-between shadow-sm cursor-pointer hover:shadow transition-shadow group" 
        @click="router.push('/workspace/profile')"
      >
        <div class="flex items-center">
          <el-avatar :size="36" class="bg-indigo-100 text-indigo-600 font-bold mr-3 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            {{ userStore.userInfo?.username?.charAt(0).toUpperCase() || 'U' }}
          </el-avatar>
          <div class="overflow-hidden">
            <div class="font-bold text-sm text-gray-800 line-clamp-1">{{ userStore.userInfo?.username || 'Guest' }}</div>
            <div class="text-xs text-gray-400 flex items-center mt-0.5">
              <el-icon class="mr-1 text-green-500" v-if="userStore.userInfo?.role === 'SUPER_ADMIN'"><CircleCheckFilled /></el-icon>
              {{ roleDisplay }}
            </div>
          </div>
        </div>
        <el-icon class="text-gray-400 shrink-0 ml-2 hover:text-red-500" title="退出登录" @click.stop="logout"><SwitchButton /></el-icon>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, ChatDotSquare, Cpu, Check, OfficeBuilding, CircleCheckFilled, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const roleDisplay = computed(() => {
  const role = userStore.userInfo?.role;
  if (role === 'SUPER_ADMIN') return '超级管理';
  if (role === 'SCHOOL_ADMIN') return '网点管理';
  if (role === 'TEACHER') return '认证教师';
  return '普通用户';
})

const logout = () => {
  if (confirm('确认退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}
</script>
