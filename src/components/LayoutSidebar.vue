<template>
  <aside class="layout-sidebar">
    <div class="sidebar-top">
      <!-- 普通功能菜单 -->
      <nav class="sidebar-nav">
        <router-link to="/workspace/chat" active-class="active" class="nav-item">
          <div class="icon-wrapper">
            <img :src="icons.chat.normal" class="sidebar-icon icon-normal" />
            <img :src="icons.chat.selected" class="sidebar-icon icon-selected" />
          </div>
          <span>小龙问答</span>
        </router-link>

        <router-link to="/workspace/square" active-class="active" class="nav-item">
          <div class="icon-wrapper">
            <img :src="icons.eduagent.normal" class="sidebar-icon icon-normal" />
            <img :src="icons.eduagent.selected" class="sidebar-icon icon-selected" />
          </div>
          <span>教育智能体</span>
        </router-link>

        <router-link to="/workspace/studio" active-class="active" class="nav-item">
          <div class="icon-wrapper">
            <img :src="icons.myagent.normal" class="sidebar-icon icon-normal" />
            <img :src="icons.myagent.selected" class="sidebar-icon icon-selected" />
          </div>
          <span>我的智能体</span>
        </router-link>

        <router-link to="/workspace/knowledge" active-class="active" class="nav-item">
          <div class="icon-wrapper">
            <img :src="icons.db.normal" class="sidebar-icon icon-normal" />
            <img :src="icons.db.selected" class="sidebar-icon icon-selected" />
          </div>
          <span>知识库</span>
        </router-link>
      </nav>
    </div>

    <!-- 底部：管理员控制台 + 设置 + 帮助 -->
    <div class="sidebar-bottom">
      <!-- 管理员分组 -->
      <div
        class="admin-section"
        v-if="userStore.userInfo?.role === 'SUPER_ADMIN' || userStore.userInfo?.role === 'SCHOOL_ADMIN'"
      >
        <div class="admin-title">管理员控制台</div>
        <router-link
          to="/workspace/approval"
          active-class="active"
          class="admin-item"
        >
          <div class="icon-wrapper">
            <img :src="icons.adminCenter.normal" class="sidebar-icon icon-normal" />
            <img :src="icons.adminCenter.selected" class="sidebar-icon icon-selected" />
          </div>
          <span>审批中心</span>
        </router-link>

        <router-link
          v-if="userStore.userInfo?.role === 'SUPER_ADMIN'"
          to="/workspace/org"
          active-class="active"
          class="admin-item"
        >
          <div class="icon-wrapper">
            <img :src="icons.adminNetmgt.normal" class="sidebar-icon icon-normal" />
            <img :src="icons.adminNetmgt.selected" class="sidebar-icon icon-selected" />
          </div>
          <span>网点组织管理</span>
        </router-link>

        <router-link
          v-if="userStore.userInfo?.role === 'SUPER_ADMIN'"
          to="/workspace/category"
          active-class="active"
          class="admin-item"
        >
          <div class="icon-wrapper">
            <img :src="icons.adminCatmgt.normal" class="sidebar-icon icon-normal" />
            <img :src="icons.adminCatmgt.selected" class="sidebar-icon icon-selected" />
          </div>
          <span>分类目录管理</span>
        </router-link>

        <router-link
          v-if="userStore.userInfo?.role === 'SUPER_ADMIN'"
          to="/workspace/model-config"
          active-class="active"
          class="admin-item"
        >
          <div class="icon-wrapper">
            <img :src="icons.adminModel.normal" class="sidebar-icon icon-normal" />
            <img :src="icons.adminModel.selected" class="sidebar-icon icon-selected" />
          </div>
          <span>模型与接口配置</span>
        </router-link>
      </div>

      <div class="bottom-divider"></div>
      <!-- 交流群 -->
      <div class="bottom-item-wrapper">
        <div class="bottom-item" @click="toggleWeichatPopup">
          <img src="@/images/sidebar-bottom-weichat.png" class="sidebar-icon" />
          <span>交流群</span>
        </div>
        <Teleport to="body">
          <Transition name="popup">
            <div v-if="showWeichatPopup" class="qr-popup" :style="weichatPopupStyle" @click.stop>
              <div class="qr-popup-inner">
                <img :src="weichatQr" alt="交流群二维码" class="qr-image" />
                <div class="qr-text">微信扫一扫<br>加入用户交流群</div>
              </div>
            </div>
          </Transition>
        </Teleport>
      </div>
      <!-- 个人客服 -->
      <div class="bottom-item-wrapper">
        <div class="bottom-item" @click="toggleSupportPopup">
          <img src="@/images/sidebar-bottom-support.png" class="sidebar-icon" />
          <span>个人客服</span>
        </div>
        <Teleport to="body">
          <Transition name="popup">
            <div v-if="showSupportPopup" class="qr-popup" :style="supportPopupStyle" @click.stop>
              <div class="qr-popup-inner">
                <img :src="supportQr" alt="客服二维码" class="qr-image" />
                <div class="qr-text">微信扫一扫<br>联系客服</div>
              </div>
            </div>
          </Transition>
        </Teleport>
      </div>
      <!-- 意见反馈
      <div class="bottom-item" @click="toggleFeedbackPopup">
        <img src="@/images/sidebar-bottom-feedback.png" class="sidebar-icon" />
        <span>意见反馈</span>
      </div>-->
    </div>
      
  
    <!--意见反馈弹窗
    <FeedbackPopup
      v-model:visible="showFeedbackPopup"
      @submit="handleFeedbackSubmit"
    />
    -->
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Menu, ChatDotSquare, Cpu,
  Setting, QuestionFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'
import FeedbackPopup from '@/views/dialog/FeedbackPopup.vue'
import chatIcon from '@/images/sidebar-chat.png'
import chatIconSelected from '@/images/sidebar-chat-selected.png'
import eduagentIcon from '@/images/sidebar-eduagent.png'
import eduagentIconSelected from '@/images/sidebar-eduagent-selected.png'
import myagentIcon from '@/images/sidebar-myagent.png'
import myagentIconSelected from '@/images/sidebar-myagent-selected.png'
import dbIcon from '@/images/sidebar-db.png'
import dbIconSelected from '@/images/sidebar-db-selected.png'
import adminCenterIcon from '@/images/sidebar-admin-center.png'
import adminCenterIconSelected from '@/images/sidebar-admin-center-selected.png'
import adminNetmgtIcon from '@/images/sidebar-admin-netmgt.png'
import adminNetmgtIconSelected from '@/images/sidebar-admin-netmgt-selected.png'
import adminCatmgtIcon from '@/images/sidebar-admin-catmgt.png'
import adminCatmgtIconSelected from '@/images/sidebar-admin-catmgt-selected.png'
import adminModelIcon from '@/images/sidebar-admin-model.png'
import adminModelIconSelected from '@/images/sidebar-admin-model-selected.png'
import weichatQr from '@/images/barcode-weichat.png'
import supportQr from '@/images/barcode-support.png'

const router = useRouter()
const userStore = useUserStore()

const showWeichatPopup = ref(false)
const showSupportPopup = ref(false)
const showFeedbackPopup = ref(false)
const weichatRef = ref<HTMLElement | null>(null)
const supportRef = ref<HTMLElement | null>(null)

const roleDisplay = computed(() => {
  const role = userStore.userInfo?.role
  if (role === 'SUPER_ADMIN') return '超级管理'
  if (role === 'SCHOOL_ADMIN') return '网点管理'
  if (role === 'TEACHER') return '认证教师'
  return '普通用户'
})

const icons = {
  chat: { normal: chatIcon, selected: chatIconSelected },
  eduagent: { normal: eduagentIcon, selected: eduagentIconSelected },
  myagent: { normal: myagentIcon, selected: myagentIconSelected },
  db: { normal: dbIcon, selected: dbIconSelected },
  adminCenter: { normal: adminCenterIcon, selected: adminCenterIconSelected },
  adminNetmgt: { normal: adminNetmgtIcon, selected: adminNetmgtIconSelected },
  adminCatmgt: { normal: adminCatmgtIcon, selected: adminCatmgtIconSelected },
  adminModel: { normal: adminModelIcon, selected: adminModelIconSelected }
}

const toggleWeichatPopup = (event: MouseEvent) => {
  showWeichatPopup.value = !showWeichatPopup.value
  if (showWeichatPopup.value) {
    showSupportPopup.value = false
    weichatRef.value = event.currentTarget as HTMLElement
  } else {
    weichatRef.value = null
  }
}

const toggleSupportPopup = (event: MouseEvent) => {
  showSupportPopup.value = !showSupportPopup.value
  if (showSupportPopup.value) {
    showWeichatPopup.value = false
    supportRef.value = event.currentTarget as HTMLElement
  } else {
    supportRef.value = null
  }
}

const toggleFeedbackPopup = () => {
  showFeedbackPopup.value = !showFeedbackPopup.value
  if (showFeedbackPopup.value) {
    showWeichatPopup.value = false
    showSupportPopup.value = false
  }
}

const handleFeedbackSubmit = (data: { type: string; description: string; contact: string }) => {
  console.log('Feedback submitted:', data)
}

const weichatPopupStyle = computed(() => {
  if (!weichatRef.value) return {}
  const rect = weichatRef.value.getBoundingClientRect()
  const popupHeight = 217
  let top = rect.top + rect.height / 2

  if (top + popupHeight / 2 > window.innerHeight) {
    top = window.innerHeight - popupHeight / 2 - 10
  }
  if (top - popupHeight / 2 < 10) {
    top = popupHeight / 2 + 10
  }

  return {
    left: `${rect.right + 8}px`,
    top: `${top}px`,
    transform: 'translateY(-50%)'
  }
})

const supportPopupStyle = computed(() => {
  if (!supportRef.value) return {}
  const rect = supportRef.value.getBoundingClientRect()
  const popupHeight = 217
  let top = rect.top + rect.height / 2

  if (top + popupHeight / 2 > window.innerHeight) {
    top = window.innerHeight - popupHeight / 2 - 10
  }
  if (top - popupHeight / 2 < 10) {
    top = popupHeight / 2 + 10
  }

  return {
    left: `${rect.right + 8}px`,
    top: `${top}px`,
    transform: 'translateY(-50%)'
  }
})

const closeAllPopups = () => {
  showWeichatPopup.value = false
  showSupportPopup.value = false
  showFeedbackPopup.value = false
  weichatRef.value = null
  supportRef.value = null
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.bottom-item-wrapper') && !target.closest('.bottom-item') && !target.closest('.feedback-popup-overlay')) {
    closeAllPopups()
  }
}

const handleResize = () => {
  closeAllPopups()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
})
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
  z-index: 1000;
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
  align-items: center;
  gap: 4px;
  width: 182px;
}

.sidebar-nav a {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  width: 182px;
  height: 48px;
  border-radius: 12px;
  color: #5A6066;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  flex: none;
  order: 0;
  flex-grow: 0;
  transform: translateX(0);
}

.sidebar-nav a:hover {
  background: rgba(49, 77, 226, 0.05);
  color: #314de2;
}

.sidebar-nav a.active {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-weight: 500;
}

.sidebar-nav a span {
  width: 114px;
  height: 24px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  display: flex;
  align-items: center;
  letter-spacing: -0.4px;
  color: #5A6066;
  flex: none;
  order: 1;
  flex-grow: 0;
}

.sidebar-nav a.active span {
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  transition: all 0.3s ease;
}

.sidebar-nav .sidebar-icon {
  width: 22px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
  display: block;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.icon-wrapper {
  position: relative;
  width: 22px;
  height: 20px;
  flex-shrink: 0;
}

.icon-wrapper .sidebar-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease;
}

.icon-wrapper .icon-normal {
  opacity: 1;
}

.icon-wrapper .icon-selected {
  opacity: 0;
}

.sidebar-nav a.active .icon-wrapper .icon-normal,
.admin-section a.active .icon-wrapper .icon-normal {
  opacity: 0;
}

.sidebar-nav a.active .icon-wrapper .icon-selected,
.admin-section a.active .icon-wrapper .icon-selected {
  opacity: 1;
}

/* 管理员分组 */
.admin-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 13px;
  width: 182px;
  height: auto;
}

.admin-section a {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  width: 182px;
  height: 48px;
  border-radius: 12px;
  color: #5A6066;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  flex: none;
  order: 0;
  flex-grow: 0;
  transform: translateX(0);
}

.admin-section a:hover {
  background: rgba(49, 77, 226, 0.05);
  color: #314de2;
}

.admin-section a.active {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-weight: 500;
}

.admin-section a span {
  width: 114px;
  height: 24px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  display: flex;
  align-items: center;
  letter-spacing: -0.4px;
  color: #5A6066;
  flex: none;
  order: 1;
  flex-grow: 0;
}

.admin-section a.active span {
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  transition: all 0.3s ease;
}

.sidebar-icon {
  width: 22px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
  display: block;
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* 管理员标题样式 */
.admin-title {
  width: 182px;
  height: 24px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 24px;
  display: flex;
  align-items: center;
  letter-spacing: -0.4px;
  color: #5A6066;
  padding: 0;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}

.bottom-divider {
  width: 100%;
  height: 1px;
  background: rgba(173, 178, 185, 0.3);
  margin: 8px 0;
}

/* ====================== */
/* 底部：设置 + 帮助 */
/* ====================== */
.sidebar-bottom {
  width: 100%;
  padding: 0px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bottom-item-wrapper {
  position: relative;
}

.bottom-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  width: 182px;
  height: 48px;
  border-radius: 12px;
  color: #5A6066;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.bottom-item:hover {
  background: rgba(49, 77, 226, 0.05);
  color: #314de2;
}

.bottom-item .el-icon {
  width: 22px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5A6066;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.bottom-item span {
  width: 114px;
  height: 24px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  display: flex;
  align-items: center;
  letter-spacing: -0.4px;
  color: #5A6066;
  flex: none;
  order: 1;
  flex-grow: 0;
}

/* 二维码弹窗 */
.qr-popup {
  position: fixed;
  z-index: 9999;
}

.qr-popup-inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 15px 15px;
  gap: 15px;
  width: 166px;
  height: 217px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 1;
  overflow: hidden;
}

.qr-image {
  width: 112px;
  height: 111px;
  object-fit: contain;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.qr-text {
  width: 100%;
  height: auto;
  min-height: 45px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 20px;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  color: #5A6066;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  border-top: 1px solid rgba(90, 96, 102, 0.1);
  padding-top: 10px;
  box-sizing: border-box;
  word-break: break-all;
}

/* 弹窗动画 */
.popup-enter-active,
.popup-leave-active {
  transition: all 0.3s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>