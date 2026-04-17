<template>
  <aside class="layout-sidebar">
    <div class="sidebar-top">
      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <router-link to="/workspace/chat" active-class="active">
          <img src="@/images/sidebar-chat.png" class="sidebar-icon" />
          <span>小龙问答</span>
        </router-link>

        <router-link to="/workspace/square" active-class="active">
          <img src="@/images/sidebar-eduagent.png" class="sidebar-icon" />
          <span>教育智能体</span>
        </router-link>

        <router-link to="/workspace/studio" active-class="active">
          <img src="@/images/sidebar-myagent.png" class="sidebar-icon" />
          <span>我的智能体</span>
        </router-link>

        <router-link to="/workspace/knowledge" active-class="active">
          <img src="@/images/sidebar-db.png" class="sidebar-icon" />
          <span>知识库</span>
        </router-link>

        <!-- 管理员分组 -->
        <div
          class="admin-title"
          v-if="userStore.userInfo?.role === 'SUPER_ADMIN' || userStore.userInfo?.role === 'SCHOOL_ADMIN'"
        >
          管理员控制台
        </div>

        <router-link
          v-if="userStore.userInfo?.role === 'SUPER_ADMIN' || userStore.userInfo?.role === 'SCHOOL_ADMIN'"
          to="/workspace/approval"
          active-class="active"
          class="admin-item"
        >
          <el-icon :size="20"><Check /></el-icon>
          <span>审批中心</span>
        </router-link>

        <router-link
          v-if="userStore.userInfo?.role === 'SUPER_ADMIN'"
          to="/workspace/org"
          active-class="active"
          class="admin-item"
        >
          <el-icon :size="20"><OfficeBuilding /></el-icon>
          <span>网点组织管理</span>
        </router-link>

        <router-link
          v-if="userStore.userInfo?.role === 'SUPER_ADMIN'"
          to="/workspace/category"
          active-class="active"
          class="admin-item"
        >
          <el-icon :size="20"><Collection /></el-icon>
          <span>分类目录管理</span>
        </router-link>
      </nav>
    </div>

    <!-- 底部：设置 + 帮助 -->
    <div class="sidebar-bottom">
      <div class="bottom-item" @click="goSetting">
        <el-icon :size="20"><Setting /></el-icon>
        <span>设置</span>
      </div>
      <div class="bottom-item" @click="goHelp">
        <el-icon :size="20"><QuestionFilled /></el-icon>
        <span>帮助</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Menu, ChatDotSquare, Cpu, Check, OfficeBuilding, Collection,
  Setting, QuestionFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const roleDisplay = computed(() => {
  const role = userStore.userInfo?.role
  if (role === 'SUPER_ADMIN') return '超级管理'
  if (role === 'SCHOOL_ADMIN') return '网点管理'
  if (role === 'TEACHER') return '认证教师'
  return '普通用户'
})

// 跳转设置
const goSetting = () => {
  router.push('/workspace/profile')
}

// 帮助（可自行改跳转）
const goHelp = () => {
  alert('帮助中心开发中...')
}
</script>

<style scoped>
/* 设计稿严格还原 */
.layout-sidebar {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  width: 231px;
  height: 100%;
  background: rgba(242, 244, 248, 0.7);
  border-right: 1px solid rgba(173, 178, 185, 0.1);
  backdrop-filter: blur(12px);
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  z-index: 2;
  overflow: hidden;
}

/* 上半部分容器 */
.sidebar-top {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 24px 16px;
  box-sizing: border-box;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  cursor: pointer;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #314de2;
  color: white;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #2e3339;
}

/* 导航 */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  color: #5a6066;
  text-decoration: none;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.sidebar-nav a:hover {
  background: rgba(49, 77, 226, 0.05);
  color: #314de2;
}

.sidebar-nav a.active {
  background: rgba(49, 77, 226, 0.1);
  color: #314de2;
  font-weight: 500;
}

.sidebar-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
  /* 保证图片和文字垂直居中 */
  display: block;
}

.admin-title {
  padding: 12px 16px 4px;
  font-size: 12px;
  font-weight: bold;
  color: #888;
  letter-spacing: 1px;
}

.admin-item {
  color: #314de2 !important;
}

/* ====================== */
/* 底部：设置 + 帮助 */
/* ====================== */
.sidebar-bottom {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bottom-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  color: #5a6066;
  cursor: pointer;
  transition: all 0.2s;
}

.bottom-item:hover {
  background: rgba(49, 77, 226, 0.05);
  color: #314de2;
}
</style>