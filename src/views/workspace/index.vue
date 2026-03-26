<template>
  <div class="h-screen w-full flex bg-gray-50">
    <!-- Sidebar -->
    <LayoutSidebar />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Top navbar placeholder -->
      <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <div class="font-bold text-gray-700">
          {{ userStore.userInfo?.organization?.orgName || '幻境助教' }} - 系统工作台
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-500">额度剩余: 50,000 Tokens</span>
          <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
        </div>
      </header>
      
      <!-- Workspace child views -->
      <main class="flex-1 overflow-auto p-0 m-0 bg-transparent flex">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../../store/user'
import LayoutSidebar from '../../components/LayoutSidebar.vue'

const userStore = useUserStore()
</script>
