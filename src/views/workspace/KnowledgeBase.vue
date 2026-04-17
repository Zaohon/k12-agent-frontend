<template>
  <div class="knowledge-page">
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="title-group">
          <h1 class="main-title">知识库</h1>
          <div class="divider-vertical"></div>
          <span class="sub-title">管理您的教育资源</span>
        </div>

        <div class="search-box">
          <img src="@/images/search.png" alt="搜索" class="search-icon" />
          <input v-model="searchKey" type="text" placeholder="搜索资源..." class="search-input" />
        </div>
      </div>

      <!-- 标题与操作按钮 -->
      <div class="header-actions">
        <div class="title-info">
          <h2 class="section-title">我的文件夹</h2>
          <p class="section-desc">查看并整理您的系统文件与教案。</p>
        </div>

        <div class="btn-group">
          <button class="btn-outline">
            <img src="@/images/new-folder.png" alt="" />
            新建文件夹
          </button>
          <button class="btn-primary">
            <img src="@/images/upLoad2.png" alt="" />
            上传文件
          </button>
        </div>
      </div>

      <!-- 文件夹卡片（响应式网格） -->
      <div class="folder-grid">
        <div class="folder-card" v-for="item in folderList" :key="item.id">
          <div class="card-header">
            <div class="icon-wrap" :style="{ background: item.iconBg }">
              <img src="@/images/chatinit-1.png" alt="" class="folder-img" />
            </div>
            <img src="@/images/more.png" alt="更多" class="more-icon" />
          </div>

          <h3 class="card-title">{{ item.name }}</h3>
          <div class="card-tag">{{ item.name }}</div>

          <div class="card-footer">
            <span>{{ item.itemCount }} 个项目</span>
            <img src="@/images/vector2.png" alt="展开" class="arrow-icon" />
          </div>
        </div>
      </div>

      <!-- 最近文件 -->
      <div class="recent-section">
        <div class="recent-header">
          <h2 class="section-title">最近文件</h2>
          <button class="view-all">查看全部</button>
        </div>

        <div class="table-container">
          <table class="file-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
                <th>修改时间</th>
                <th>大小</th>
                <th class="align-right">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="file in recentFiles" :key="file.id">
                <td>
                  <div class="file-name">
                    <img src="@/images/chatinit-1.png" class="file-icon" alt="" />
                    <span>{{ file.name }}</span>
                  </div>
                </td>
                <td>{{ file.type }}</td>
                <td>{{ file.updateTime }}</td>
                <td>{{ file.size }}</td>
                <td class="align-right">
                  <button class="action-btn">
                    <img src="@/images/download.png" alt="下载" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="ai-storage-row">
        <div class="ai-card">
          <div class="ai-blur"></div>
          <img src="@/images/database2.png" class="ai-bg-icon" alt="" />
          <div class="ai-content">
            <div class="ai-tag">
              <img src="@/images/star.png" class="ai-dot" alt="" />
              <span>AI 智能洞察</span>
            </div>
            <h3 class="ai-title">正在“题库”中寻找特定内容？</h3>
            <p class="ai-desc">
              我可以根据难度级别和课程标准，自动为您新上传的 512 道题目添加标签并进行分类。
            </p>
            <button class="ai-button">开始自动打标</button>
          </div>
        </div>

        <div class="storage-card">
          <div class="storage-header">
            <h4>存储容量</h4>
            <div class="progress-bar">
              <div class="progress" :style="{ width: storage.usedPercent + '%' }"></div>
            </div>
            <div class="storage-info">
              <span>{{ storage.used }}</span>
              <span>{{ storage.total }}</span>
            </div>
          </div>

          <div class="quote">
            <p>“教育是你可以用来改变世界的最强大的武器。”</p>
            <div class="author">
              <div class="line"></div>
              <span>曼德拉</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 搜索
const searchKey = ref('')

// 文件夹列表
const folderList = ref([])

// 最近文件
const recentFiles = ref([])

// 存储信息
const storage = ref({
  used: '已使用 6.5 GB',
  total: '总量 10 GB',
  usedPercent: 65
})

const fetchData = async () => {
  try {
    const mockData = {
      folders: [
        { id: 1, name: '教案', itemCount: 128, iconBg: 'rgba(180, 189, 255, 0.3)' },
        { id: 2, name: '课件', itemCount: 84, iconBg: 'rgba(230, 222, 255, 0.3)' },
        { id: 3, name: '卷库', itemCount: 42, iconBg: 'rgba(222, 229, 253, 0.3)' },
        { id: 4, name: '题库', itemCount: 512, iconBg: 'rgba(83, 52, 197, 0.1)' },
        { id: 5, name: '工作事务', itemCount: 16, iconBg: 'rgba(247, 106, 128, 0.2)' },
      ],
      files: [
        { id: 1, name: '2024秋季数学教案_V2.pdf', type: 'PDF 文档', updateTime: '2 小时前', size: '4.2 MB' },
        { id: 2, name: '微积分入门课件_互动版.pptx', type: '演示文稿', updateTime: '昨天', size: '28.5 MB' },
      ]
    }

    folderList.value = mockData.folders
    recentFiles.value = mockData.files
  } catch (err) {
    console.error('数据加载失败', err)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* 全局页面 */
.knowledge-page {
  width: 100%;
  min-height: 100vh;
  padding: 24px 16px;
  background: #fff;
}

/* 主内容最大宽度限制 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 工具栏 */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.main-title {
  font-size: 24px;
  font-weight: 500;
  color: #2e3339;
}

.divider-vertical {
  width: 1px;
  height: 20px;
  background: rgba(173, 178, 185, 0.3);
}

.sub-title {
  font-size: 16px;
  color: #5a6066;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  width: 240px;
  background: #fff;
}

.search-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  flex-shrink: 0;
}

.search-input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  background: transparent;
}

/* 头部操作 */
.header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.title-info .section-title {
  font-size: 20px;
  font-weight: 500;
  color: #2e3339;
  margin-bottom: 4px;
}

.title-info .section-desc {
  font-size: 14px;
  color: #5a6066;
}

.btn-group {
  display: flex;
  gap: 10px;
}

.btn-outline,
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

/* 边框按钮 */
.btn-outline {
  border: 1px solid #ccc;
  background: #fff;
}

/* 主按钮 */
.btn-primary {
  background: #007bff;
  color: #fff;
  border: none;
}

/* 按钮里的图片大小 */
.btn-group img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* 文件夹卡片（响应式网格） */
.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

.folder-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(49, 77, 226, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.icon-wrap {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.more-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  cursor: pointer;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  color: #2e3339;
  margin-top: 12px;
}

.card-tag {
  font-size: 12px;
  color: #314de2;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.card-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #ebeef4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #5a6066;
}

.arrow-icon {
  width: 12px;
  height: 12px;
  object-fit: contain;
  flex-shrink: 0;
}

/* 最近文件 */
.recent-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-all {
  background: none;
  border: none;
  color: #314de2;
  font-size: 14px;
  cursor: pointer;
}

.table-container {
  background: #f2f4f8;
  border-radius: 16px;
  overflow: hidden;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
}

.file-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #5a6066;
  background: rgba(235, 238, 244, 0.6);
  vertical-align: middle;
  line-height: 1.2;
}

.file-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #2e3339;
  border-top: 1px solid rgba(222, 227, 234, 0.2);
  vertical-align: middle;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
}

.align-right {
  text-align: right;
  vertical-align: middle;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: none;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  position: relative;
  top: 1px;
  float: left;
}

.action-btn img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* AI + 存储 响应式行 */
.ai-storage-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.ai-card {
  flex: 1;
  min-width: 320px;
  position: relative;
  background: linear-gradient(135deg, #314de2, #6144d3);
  border-radius: 24px;
  padding: 32px;
  color: #fff;
  overflow: hidden;
}

.ai-blur {
  position: absolute;
  right: -50px;
  bottom: -50px;
  width: 240px;
  height: 240px;
  background: rgba(255, 255, 255, 0.1);
  filter: blur(30px);
  border-radius: 50%;
}

.ai-bg-icon {
  position: absolute;
  right: 30px;
  top: 15%;
  width: 180px;
  height: 180px;
  object-fit: contain;
  opacity: 0.2;
}

.ai-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  font-size: 12px;
  white-space: nowrap;
  width: fit-content;
}

.ai-dot {
  width: 14px;
  height: 14px;
  object-fit: contain;
  flex-shrink: 0;
}

.ai-title {
  font-size: 22px;
  font-weight: 500;
  margin-top: 8px;
}

.ai-desc {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  max-width: 460px;
}

.ai-button {
  margin-top: 8px;
  width: 160px;
  height: 46px;
  border-radius: 12px;
  border: none;
  background: #fff;
  color: #314de2;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

/* 存储卡片 */
.storage-card {
  width: 100%;
  max-width: 320px;
  background: #e4e8ef;
  border-radius: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.storage-header h4 {
  font-size: 16px;
  font-weight: 500;
  color: #2e3339;
  margin-bottom: 8px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #ebeef4;
  border-radius: 999px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #314de2;
  border-radius: 999px;
  transition: width 0.3s;
}

.storage-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #2e3339;
}

.storage-info span:last-child {
  color: #5a6066;
}

.quote {
  margin-top: 24px;
}

.quote p {
  font-size: 12px;
  line-height: 1.8;
  color: #5a6066;
}

.author {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #2e3339;
}

.line {
  width: 20px;
  height: 2px;
  background: #314de2;
}

/* 响应式 */
@media (max-width: 768px) {
  .ai-card {
    min-width: 100%;
  }

  .storage-card {
    max-width: 100%;
  }

  .folder-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>