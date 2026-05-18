<template>
  <!-- 主内容工作区 -->
  <div class="main-content-workspace">
    <!-- 工作区工具栏 -->
    <div class="workspace-toolbar">
      <!-- 左侧导航 -->
      <div class="nav-container">
        <div class="nav-path">知识库 / 我的文件夹</div>
        <div class="vertical-divider"></div>
      </div>

      <!-- 搜索框 -->
      <div class="search-input-wrapper">
        <div class="search-input">
          <span class="search-icon"></span>
          <input type="text" placeholder="搜索资源..." />
        </div>
      </div>
    </div>

    <!-- 头部标题与操作区 -->
    <div class="header-actions">
      <div class="title-section">
        <h1 class="main-title">我的文件夹</h1>
        <p class="subtitle">查看并整理您的系统文件与教案。</p>
      </div>

      <div class="action-buttons">
        <button class="btn-outline">
          <span class="icon-add"></span>
          新建文件夹
        </button>
        <button class="btn-primary">
          <span class="icon-upload"></span>
          上传文件
        </button>
      </div>
    </div>

    <!-- 文件夹网格布局 -->
    <div class="bento-grid">
      <!-- 生成库 -->
      <div class="folder-card">
        <div class="folder-header">
          <div class="folder-icon-wrapper generate-bg">
            <span class="icon-robot"></span>
          </div>
          <button class="folder-more-btn"></button>
        </div>
        <h3 class="folder-title">生成库</h3>
        <div class="folder-tag">AI生成文件</div>
        <div class="folder-footer">
          <span>42 个项目</span>
          <span class="arrow-icon"></span>
        </div>
      </div>

      <!-- 教案 -->
      <div class="folder-card">
        <div class="folder-header">
          <div class="folder-icon-wrapper lesson-bg">
            <span class="icon-lesson"></span>
          </div>
          <button class="folder-more-btn"></button>
        </div>
        <h3 class="folder-title">教案</h3>
        <div class="folder-tag">系统文件</div>
        <div class="folder-footer">
          <span>128 个项目</span>
          <span class="arrow-icon"></span>
        </div>
      </div>

      <!-- 课件 -->
      <div class="folder-card">
        <div class="folder-header">
          <div class="folder-icon-wrapper course-bg">
            <span class="icon-course"></span>
          </div>
          <button class="folder-more-btn"></button>
        </div>
        <h3 class="folder-title">课件</h3>
        <div class="folder-tag">系统文件</div>
        <div class="folder-footer">
          <span>84 个项目</span>
          <span class="arrow-icon"></span>
        </div>
      </div>

      <!-- 题库 -->
      <div class="folder-card">
        <div class="folder-header">
          <div class="folder-icon-wrapper question-bg">
            <span class="icon-question"></span>
          </div>
          <button class="folder-more-btn"></button>
        </div>
        <h3 class="folder-title">题库</h3>
        <div class="folder-tag">系统文件</div>
        <div class="folder-footer">
          <span>512 个项目</span>
          <span class="arrow-icon"></span>
        </div>
      </div>

      <!-- 工作事务 -->
      <div class="folder-card">
        <div class="folder-header">
          <div class="folder-icon-wrapper work-bg">
            <span class="icon-work"></span>
          </div>
          <button class="folder-more-btn"></button>
        </div>
        <h3 class="folder-title">工作事务</h3>
        <div class="folder-tag">系统文件</div>
        <div class="folder-footer">
          <span>16 个项目</span>
          <span class="arrow-icon"></span>
        </div>
      </div>
    </div>

    <!-- 最近内容区域 -->
    <div class="recent-content">
      <!-- 可扩展区域 -->
    </div>
  </div>
</template>

<script setup>
// 交互逻辑可在这里扩展
const handleCreateFolder = () => {
  console.log('新建文件夹')
}

const handleUploadFile = () => {
  console.log('上传文件')
}
</script>

<style scoped>
/* 全局字体 */
* {
  font-family: 'Noto Sans SC', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 主内容工作区 */
.main-content-workspace {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  gap: 23px;
  width: 1689px;
  height: 1080px;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}

/* 工具栏 */
.workspace-toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  gap: 613px;
  width: 1320px;
  height: 41px;
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* 导航路径 */
.nav-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 16px;
  width: 520px;
  height: 36px;
}

.nav-path {
  width: 133px;
  height: 36px;
  font-weight: 500;
  font-size: 15px;
  line-height: 36px;
  display: flex;
  align-items: center;
  color: #2e3339;
}

/* 垂直分割线 */
.vertical-divider {
  width: 1px;
  height: 24px;
  background: rgba(173, 178, 185, 0.3);
}

/* 搜索框 */
.search-input-wrapper {
  width: 256px;
  height: 41px;
  position: relative;
}

.search-input {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  padding: 12px 16px 10px 48px;
  width: 256px;
  height: 41px;
  background: #f2f4f8;
  border-radius: 9999px;
  border: none;
  outline: none;
}

.search-input input {
  width: 192px;
  height: 17px;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: #6b7280;
  background: transparent;
  border: none;
  outline: none;
}

.search-icon {
  position: absolute;
  width: 15px;
  left: 18.5px;
  top: 31.25%;
  bottom: 31.25%;
  background: #5a6066;
}

/* 头部标题与操作 */
.header-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0;
  gap: 589.97px;
  width: 1320px;
  height: 52px;
  flex: none;
  order: 1;
  flex-grow: 0;
}

.title-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 210px;
  height: 52px;
}

.main-title {
  width: 118px;
  height: 28px;
  font-weight: 500;
  font-size: 24px;
  line-height: 28px;
  letter-spacing: -0.5px;
  color: #2e3339;
}

.subtitle {
  width: 210px;
  height: 20px;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #5a6066;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 15.99px;
  width: 313.98px;
  height: 48px;
}

.btn-outline {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  gap: 7.99px;
  width: 155.99px;
  height: 48px;
  background: #ffffff;
  box-shadow: 0px 12px 40px rgba(49, 77, 226, 0.06);
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  color: #314de2;
}

.btn-primary {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  gap: 8px;
  width: 142px;
  height: 48px;
  background: linear-gradient(135deg, #314de2 0%, #6144d3 100%);
  box-shadow: 0px 12px 40px rgba(49, 77, 226, 0.06);
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  color: #ffffff;
}

.icon-add {
  width: 20px;
  height: 16px;
  background: #314de2;
}

.icon-upload {
  width: 22px;
  height: 16px;
  background: #ffffff;
}

/* 文件夹网格 */
.bento-grid {
  width: 1320px;
  height: 231px;
  display: flex;
  gap: 24px;
  position: relative;
  flex: none;
  order: 2;
  flex-grow: 0;
}

/* 文件夹卡片 */
.folder-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  gap: 4px;
  width: 194.8px;
  height: 231px;
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0px 12px 40px rgba(49, 77, 226, 0.06);
  border-radius: 12px;
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  height: 56px;
}

.folder-icon-wrapper {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

/* 图标背景色 */
.generate-bg { background: rgba(222, 229, 253, 0.3); }
.lesson-bg { background: rgba(180, 189, 255, 0.3); }
.course-bg { background: rgba(230, 222, 255, 0.3); }
.question-bg { background: rgba(83, 52, 197, 0.1); }
.work-bg { background: rgba(247, 106, 128, 0.2); }

/* 图标样式（占位） */
.icon-robot { width: 34px; height: 34px; background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%); }
.icon-lesson { width: 20px; height: 25px; background: #314DE2; }
.icon-course { width: 25px; height: 20px; background: #6144D3; }
.icon-question { width: 25px; height: 25px; background: #5334C5; }
.icon-work { width: 26.25px; height: 26.25px; background: #AC3149; }

.folder-more-btn {
  width: 4px;
  height: 16px;
  background: #adb2b9;
  border: none;
  cursor: pointer;
}

.folder-title {
  padding-top: 20px;
  width: 100%;
  height: 28px;
  font-weight: 500;
  font-size: 18px;
  line-height: 28px;
  color: #2e3339;
}

.folder-tag {
  padding-bottom: 12px;
  width: 100%;
  height: 16px;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #314de2;
}

.folder-footer {
  margin-top: auto;
  width: 100%;
  padding-top: 16px;
  border-top: 1px solid #ebeef4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 37px;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #5a6066;
}

.arrow-icon {
  width: 4.32px;
  height: 7px;
  background: rgba(90, 96, 102, 0.4);
}

/* 最近内容区域 */
.recent-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 0 0;
  gap: 16px;
  width: 1625px;
  height: 261px;
  flex: none;
  order: 3;
  align-self: stretch;
  flex-grow: 0;
}
</style>