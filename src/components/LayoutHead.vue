<template>
  <header class="layout-head">
    <!-- 左侧 Logo + 标题 -->
    <div class="head-left">
      <img src="@/images/longqi-logo.png" alt="龙启云" class="logo-img" />
      <div class="title-wrap">
        <div class="main-title">龙启云</div>
        <div class="sub-title">你的数字引航者</div>
      </div>
    </div>

    <div class="head-right">
      <!-- 邀请活动按钮 -->
      <button class="action-btn" @click="showInviteTip">
        <img src="@/images/invite-gift.png" class="btn-icon" />
        <span>邀请活动</span>
      </button>

      <!-- 分割线 -->
      <div class="vertical-divider"></div>

      <!-- 用户信息 -->
      <div class="user-info">
        <div class="user-text">
          <div class="username">{{ userStore.userInfo?.username || '未登录' }}</div>
          <div class="userid">ID: {{ userStore.userInfo?.id || '--' }}</div>
        </div>
        <div class="avatar-wrapper" ref="avatarWrapperRef">
          <div class="avatar-bg" @click="togglePopover">
            <img :src="avatarUrl" alt="用户头像" class="avatar-img" />
          </div>
          <!-- 个人信息悬浮窗 -->
          <Transition name="popover">
            <div v-if="showPopover" class="user-popover">
              <div class="popover-arrow"></div>
              <div class="popover-content">
                <!-- 用户头像和信息 -->
                <div class="popover-header">
                  <div class="popover-avatar">
                    <img :src="avatarUrl" alt="用户头像" class="popover-avatar-img" />
                  </div>
                  <div class="popover-user-info">
                    <div class="popover-username">{{ userStore.userInfo?.username || '未登录' }}</div>
                    <div class="popover-userid">ID: {{ userStore.userInfo?.id || '--' }}</div>
                  </div>
                </div>
                <!-- AI算力余额 -->
                <div class="popover-balance">
                  <div class="balance-header">
                    <span class="balance-title">AI 算力余额</span>
                    <span class="balance-text">剩余: {{ tokenLimit - tokenUsed }}/{{ tokenLimit }}</span>
                  </div>
                  <div class="balance-bar">
                    <div class="balance-progress" :style="{ width: tokenPercent + '%' }"></div>
                  </div>
                </div>
                <!-- 快捷操作 -->
                <div class="popover-actions">
                  <button class="action-item no-bg" @click="goToProfile">
                    <img :src="settingIcon" alt="设置" class="action-icon" />
                    <span>个人设置</span>
                  </button>
                  <button class="action-item logout" @click="handleLogout">
                    <img :src="exitIcon" alt="退出" class="action-icon" />
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';
import defaultAvatar from '@/images/default-avatar.png';
import settingIcon from '@/images/func-setting.png';
import exitIcon from '@/images/func-exit.png';

const router = useRouter();
const userStore = useUserStore();
const showPopover = ref(false);
const avatarWrapperRef = ref<HTMLElement | null>(null);

const avatarUrl = computed(() => {
  const userAvatar = userStore.userInfo?.avatarUrl;
  return userAvatar && userAvatar.trim() ? userAvatar : defaultAvatar;
});

const tokenLimit = computed(() => userStore.userInfo?.tokenLimit || 50000);
const tokenUsed = computed(() => userStore.userInfo?.consumedToken || 0);
const tokenPercent = computed(() => {
  const limit = tokenLimit.value;
  const used = tokenUsed.value;
  return Math.max(0, Math.min(100, ((limit - used) / limit) * 100));
});

const showInviteTip = () => {
  ElMessage.warning('功能施工中');
};

const togglePopover = () => {
  showPopover.value = !showPopover.value;
};

const closePopover = () => {
  showPopover.value = false;
};

const goToProfile = () => {
  closePopover();
  router.push('/workspace/profile');
};

const handleLogout = () => {
  closePopover();
  userStore.logout();
  router.push('/');
};

const handleClickOutside = (event: MouseEvent) => {
  if (avatarWrapperRef.value && !avatarWrapperRef.value.contains(event.target as Node)) {
    closePopover();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* 顶部导航 */
.layout-head {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 32px;
  box-sizing: border-box;
  background: linear-gradient(0deg, #f8f9fd, #f8f9fd), #f2f4f8;
  border-bottom: 1px solid rgba(173, 178, 185, 0.1);
  backdrop-filter: blur(6px);
  flex-shrink: 0;
  position: relative;
  z-index: 100;
}

/* 左侧 */
.head-left {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 33px;
}

.logo-img {
  width: 54px;
  height: 25px;
  object-fit: contain;
}

.title-wrap {
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 22px;
  background: linear-gradient(135deg, #314de2 0%, #6144d3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sub-title {
  font-size: 8px;
  font-weight: 500;
  color: #5a6066;
  letter-spacing: 0.8px;
  line-height: 10px;
}

/* ===========  右侧  =========== */
.head-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 24px;
  flex-shrink: 0;
}

/* 邀请活动按钮 */
.action-btn {
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding: 6px 16px;
  gap: 8px;
  height: 34px;
  background: rgba(49, 77, 226, 0.05);
  border: 1px solid rgba(49, 77, 226, 0.1);
  border-radius: 9999px;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-icon {
  width: 11.67px;
  height: 11.08px;
  object-fit: contain;
}

.action-btn span {
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 14px;
  color: #314de2;
}

/* 垂直分割线 */
.vertical-divider {
  width: 1px;
  height: 24px;
  background: rgba(173, 178, 185, 0.3);
  flex-shrink: 0;
}

/* 用户信息 */
.user-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 12px;
  flex-shrink: 0;
}

.user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0px;
  text-align: right;
}

.username {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  align-items: center;
  text-align: right;
  color: #2e3339;
  white-space: nowrap;
}

.userid {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 15px;
  display: flex;
  align-items: center;
  text-align: right;
  color: #5a6066;
  white-space: nowrap;
}

/* 头像 */
.avatar-wrapper {
  position: relative;
}

.avatar-bg {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 40px;
  height: 40px;
  background: #b4bdff;
  border: 1px solid rgba(49, 77, 226, 0.1);
  border-radius: 9999px;
  flex-shrink: 0;
  cursor: pointer;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ========= 个人信息悬浮窗 ========= */
.user-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  height: 317px;
  z-index: 9999;
}

.popover-arrow {
  position: absolute;
  width: 30px;
  height: 17px;
  right: 8px;
  top: 0;
  background: #FFFFFF;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.popover-content {
  position: absolute;
  top: 17px;
  left: 0;
  right: 0;
  height: 300px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 5px 25px -5px rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  gap: 15px;
}

/* 用户头像和信息 */
.popover-header {
  width: 166px;
  height: auto;
  min-height: 93px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
}

.popover-avatar {
  width: 50px;
  height: 50px;
  background: #B4BDFF;
  border: 1px solid rgba(49, 77, 226, 0.1);
  border-radius: 9999px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 8px 10px -6px rgba(199, 210, 254, 0.5);
  overflow: hidden;
  flex-shrink: 0;
}

.popover-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  flex-shrink: 0;
}

.popover-user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.popover-username {
  font-family: 'Noto Sans SC';
  font-weight: 700;
  font-size: 15px;
  line-height: 28px;
  color: #2E3339;
}

.popover-userid {
  font-family: 'Noto Sans SC';
  font-weight: 400;
  font-size: 10px;
  line-height: 20px;
  color: #5A6066;
}

/* AI算力余额 */
.popover-balance {
  width: 240px;
  height: 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  gap: 8px;
}

.balance-header {
  width: 186px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-title {
  font-family: 'Noto Sans SC';
  font-weight: 700;
  font-size: 12px;
  line-height: 20px;
  color: #2E3339;
}

.balance-text {
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 10px;
  line-height: 16px;
  color: #5A6066;
}

.balance-bar {
  width: 186px;
  height: 8px;
  background: #DEE3EA;
  border-radius: 9999px;
  overflow: hidden;
}

.balance-progress {
  height: 100%;
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

/* 快捷操作 */
.popover-actions {
  width: 240px;
  height: 86px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 11px 0 8px;
  gap: 4px;
  border-top: 1px solid rgba(90, 96, 102, 0.2);
}

.action-item {
  width: 208px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: #F2F4F8;
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 12px;
  color: #2E3339;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.action-item:hover {
  background: #E6E5FF;
  color: #314DE2;
}

.action-item.no-bg {
  background: transparent;
  color: #5A6066;
}

.action-item.no-bg:hover {
  background: #F2F4F8;
  color: #314DE2;
}

.action-item.logout {
  background: transparent;
  color: #D0435F;
}

.action-item.logout:hover {
  background: #FEE2E2;
  color: #D0435F;
}

/* 弹出窗动画 */
.popover-enter-active,
.popover-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>