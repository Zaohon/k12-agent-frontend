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
      <button class="action-btn">
        <img src="@/images/invite-gift.png" class="btn-icon" />
        <span>邀请活动</span>
      </button>

      <!-- 分割线 -->
      <div class="vertical-divider"></div>

      <!-- 用户信息 -->
      <div class="user-info">
        <div class="user-text">
          <div class="username">小龙老师</div>
          <div class="userid">ID: XL886699</div>
        </div>
        <div class="avatar-bg">
          <div class="avatar-icon"></div>
        </div>
      </div>
    </div>
  </header>
</template>

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
  width: 290.67px;
  height: 40px;
  flex: none;
  order: 1;
  flex-grow: 0;
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
}

/* 用户信息 */
.user-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 12px;
  width: 132px;
  height: 40px;
}

.user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0px;
  width: 80px;
  text-align: right;
}

.username {
  width: 100%;
  height: 20px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  align-items: center;
  text-align: right;
  color: #2e3339;
  text-align: right;
}

.userid {
  width: 100%;
  height: 15px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 15px;
  display: flex;
  align-items: center;
  text-align: right;
  color: #5a6066;
  text-align: right;  
}

/* 头像 */
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
}

.avatar-icon {
  width: 20px;
  height: 20px;
  background: #314de2;
}
</style>