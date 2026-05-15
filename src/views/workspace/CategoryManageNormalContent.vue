<template>
  <!-- 主容器 -->
  <div class="org-container">
    <!-- 基础信息卡片 -->
    <div class="info-card">
      <!-- 标题栏 -->
      <div class="header-row">
        <div class="title-container">
          <h2 class="heading-2">学科助教</h2>
        </div>
        <div class="btn-group">
          <button class="btn danger-btn">
            <span>删除该组</span>
          </button>
          <button class="btn default-btn">
            <span>编辑</span>
          </button>
          <button class="btn primary-btn">
            <span>保存修改</span>
          </button>
        </div>
      </div>

      <!-- 表单行 -->
      <div class="form-row">
        <!-- 左侧：分类名称 -->
        <div class="form-item">
          <label class="form-label">分类名称</label>
          <input type="text" class="form-input" value="学科助教" />
        </div>
        <!-- 右侧：排序权重 -->
        <div class="form-item">
          <label class="form-label">排序权重</label>
          <div class="input-wrapper">
            <input type="text" class="form-input" value="10" />
            <span class="input-tip">数值越小越靠前</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 可见性与权限控制 -->
    <div class="info-card small-card">
      <div class="section-header">
        <div class="icon-box"></div>
        <h3 class="heading-3">可见性与权限控制</h3>
      </div>
      <p class="section-desc">
        配置哪些用户角色可以在智能体集市的导航区看到此菜单节点及其内容（默认管理员可见）。
      </p>

      <div class="checkbox-group">
        <label class="checkbox-item">
          <div class="checkbox checked"></div>
          <span>教职工组</span>
        </label>
        <label class="checkbox-item">
          <div class="checkbox checked"></div>
          <span>管理员</span>
        </label>
        <label class="checkbox-item">
          <div class="checkbox"></div>
          <span>学生组</span>
        </label>
        <label class="checkbox-item disabled">
          <div class="checkbox checked disabled-bg"></div>
          <span>访客</span>
          <div class="lock-icon"></div>
        </label>
      </div>
    </div>

    <!-- 智能体挂载与版位管理 -->
    <div class="info-card agent-card">
      <div class="section-header justify-between">
        <div class="header-left">
          <div class="icon-box agent-icon"></div>
          <h3 class="heading-3">智能体挂载与版位管理</h3>
        </div>
        <div class="header-right">
          <button class="btn small-danger-btn">选择删除</button>
          <button class="btn small-primary-line-btn">
            <div class="small-icon"></div>
            <span>关联智能体</span>
          </button>
        </div>
      </div>
      <p class="section-desc">管理该分类下展示的智能体。</p>

      <!-- 智能体列表 -->
      <div class="agent-list">
        <!-- 智能体1 -->
        <div class="agent-item">
          <div class="agent-left">
            <div class="drag-icon"></div>
            <div class="agent-avatar">
              <div class="edit-icon"></div>
            </div>
            <div class="agent-info">
              <h4 class="agent-title">作文批改助手</h4>
              <p class="agent-id">ID: AGT-6789</p>
              <p class="agent-desc">提供多维度的高中语文作文批改与建议</p>
            </div>
          </div>
        </div>

        <!-- 智能体2 -->
        <div class="agent-item">
          <div class="agent-left">
            <div class="drag-icon"></div>
            <div class="agent-avatar">
              <div class="file-icon"></div>
            </div>
            <div class="agent-info">
              <h4 class="agent-title">古诗文赏析引擎</h4>
              <p class="agent-id">ID: AGT-6788</p>
              <p class="agent-desc">逐字逐句翻译，意境深度解析</p>
            </div>
          </div>
        </div>

        <!-- 添加智能体 -->
        <div class="add-agent-box">
          <span>+ 关联智能体</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 业务逻辑可自行扩展
</script>

<style scoped>
/* 全局字体 */
* {
  font-family: 'Noto Sans SC', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 主容器 */
.org-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  gap: 20px;
  width: 1343px;
  height: 1108px;
  background: #f2f4f8;
  align-self: stretch;
}

/* 白色卡片 */
.info-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  gap: 24px;
  width: 1279px;
  background: #ffffff;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  align-self: stretch;
}

.small-card {
  height: 132px;
  gap: 16px;
}

.agent-card {
  height: 284px;
  gap: 16px;
}

/* 标题行 */
.header-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  width: 1231px;
  border-bottom: 1px solid rgba(173, 178, 185, 0.3);
  align-self: stretch;
}

.title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.heading-2 {
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  color: #2e3339;
}

/* 按钮组 */
.btn-group {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
}

.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
  border: none;
}

.danger-btn {
  width: 90px;
  height: 38px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #d0435f;
}

.default-btn {
  width: 62px;
  height: 38px;
  border: 1px solid #adb2b9;
  color: #2e3339;
  background: #fff;
}

.primary-btn {
  width: 88px;
  height: 38px;
  background: linear-gradient(135deg, #314de2 0%, #6144d3 100%);
  color: #ffffff;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
}

/* 表单行 */
.form-row {
  position: relative;
  width: 1231px;
  height: 64px;
  display: flex;
  justify-content: space-between;
}

.form-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  width: 603.5px;
}

.form-label {
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #2e3339;
}

.form-input {
  width: 100%;
  height: 38px;
  padding: 8px 12px;
  background: #f8f9fd;
  border: 1px solid #adb2b9;
  border-radius: 8px;
  font-size: 14px;
  color: #2e3339;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-tip {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  line-height: 16px;
  color: #767b82;
}

/* 模块标题 */
.section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.justify-between {
  width: 100%;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-box {
  width: 22px;
  height: 15px;
  background: #1f3ed6;
}

.agent-icon {
  height: 19px;
}

.heading-3 {
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #2e3339;
}

.section-desc {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #5a6066;
}

/* 复选框组 */
.checkbox-group {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
}

.checkbox-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #767b82;
  border-radius: 4px;
  background: #f8f9fd;
}

.checkbox.checked {
  background: #314de2;
  border-color: #314de2;
}

.disabled {
  opacity: 0.6;
}

.disabled-bg {
  background: rgba(49, 77, 226, 0.5) !important;
  border-color: rgba(49, 77, 226, 0.5) !important;
}

.lock-icon {
  width: 9.33px;
  height: 12.25px;
  background: #767b82;
  margin-left: 4px;
}

/* 小按钮 */
.header-right {
  display: flex;
  gap: 10px;
}

.small-danger-btn {
  width: 90px;
  height: 32px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #d0435f;
  font-size: 14px;
}

.small-primary-line-btn {
  width: 110px;
  height: 32px;
  background: rgba(49, 77, 226, 0.1);
  border: 1px solid rgba(49, 77, 226, 0.2);
  color: #314de2;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
}

.small-icon {
  width: 10.5px;
  height: 10.5px;
  background: #314de2;
}

/* 智能体列表 */
.agent-list {
  position: relative;
  width: 1231px;
  height: 172px;
}

.agent-item {
  position: absolute;
  width: 609.5px;
  height: 80px;
  padding: 12px;
  background: #f8f9fd;
  border: 1px solid rgba(173, 178, 185, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.agent-item:nth-child(1) {
  left: 0;
  top: 0;
}

.agent-item:nth-child(2) {
  left: 621.5px;
  top: 0;
}

.agent-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.drag-icon {
  width: 10px;
  height: 16px;
  background: #adb2b9;
}

.agent-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #314de2 0%, #6144d3 100%);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.edit-icon {
  width: 24px;
  height: 24px;
  border: 2px solid #fff;
}

.file-icon {
  width: 24px;
  height: 24px;
  border: 2px solid #fff;
}

.agent-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.agent-title {
  font-weight: 700;
  font-size: 14px;
  line-height: 20px;
  color: #2e3339;
}

.agent-id {
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #5a6066;
}

.agent-desc {
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #5a6066;
}

/* 添加智能体 */
.add-agent-box {
  position: absolute;
  width: 609.5px;
  height: 80px;
  left: 0;
  top: 92px;
  border: 2px dashed rgba(173, 178, 185, 0.4);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #767b82;
}
</style>