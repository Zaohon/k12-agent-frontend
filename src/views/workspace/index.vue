<template>
  <div class="workspace-root">
    <!-- 顶部 -->
    <LayoutHead />
    <div class="workspace-body">
      <LayoutSidebar />
      <div class="content-container">
        <!-- 子页面 -->
        <main class="page-content">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../../store/user'
import LayoutSidebar from '../../components/LayoutSidebar.vue'
import LayoutHead from '../../components/LayoutHead.vue'

const userStore = useUserStore()
</script>

<style scoped>
.workspace-root {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(0deg, #f8f9fd, #f8f9fd), #f2f4f8;
  overflow: hidden;
}

.workspace-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 页面顶部栏 */
.page-header {
  height: 56px;
  background: white;
  border-bottom: 1px solid rgba(173, 178, 185, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #2e3339;
}

.extra {
  display: flex;
  align-items: center;
  gap: 16px;
}

.token {
  font-size: 14px;
  color: #5a6066;
}

.page-content {
  flex: 1;
  overflow: auto;
  padding: 0;
}
</style>