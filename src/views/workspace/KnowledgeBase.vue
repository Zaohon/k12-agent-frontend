<template>
  <div class="kb-page">
    <!-- 主内容区 -->
    <div class="kb-main-content">
      <!-- 工具栏 -->
      <div class="kb-toolbar">
        <div class="title-group">
          <h1 class="kb-main-title">知识库</h1>
          <div class="kb-divider-vertical"></div>
          <span class="kb-subtitle">管理您的教育资源</span>
        </div>

        <!--<div class="kb-search-box">
          <img src="@/images/search.png" alt="搜索" class="search-icon-img" />
          <input v-model="searchKey" type="text" placeholder="搜索资源..." class="search-input-field" />
        </div>-->
      </div>

      <!-- 标题与操作按钮 -->
      <div class="kb-header-actions">
        <div class="kb-title-section">
          <h1 class="kb-main-title">我的文件夹</h1>
          <p class="kb-subtitle">查看并整理您的系统文件与教案。</p>
        </div>

        <div class="kb-action-buttons">
          <button class="kb-btn-outline" @click="handleCreateFolder">
            <img src="@/images/new-folder.png" alt="" />
            新建文件夹
          </button>
          <button class="kb-btn-primary">
            <img src="@/images/upLoad2.png" alt="" />
            上传文件
          </button>
        </div>
      </div>

      <!-- 文件夹卡片（响应式网格） -->
      <div v-if="folderList.length > 0" class="kb-folder-grid">
        <div 
          class="kb-folder-card" 
          v-for="item in folderList" 
          :key="item.id"
          @click="handleFolderClick(item.id, item.name)"
        >
          <div class="kb-folder-header">
            <div class="kb-folder-icon-wrapper" :style="{ background: item.iconBg }">
              <img src="@/images/chatinit-1.png" alt="" class="kb-folder-img" />
            </div>
            <div class="kb-more-wrapper">
              <img 
                src="@/images/more.png" 
                alt="更多" 
                class="kb-more-icon" 
                @click="openFolderDialog($event, item)"
              />
            </div>
          </div>

          <div v-if="renamingFolder && renamingFolder.id === item.id" class="kb-rename-input-wrapper">
            <input 
              ref="renameInputRef"
              v-model="renameInput"
              type="text"
              @keyup.enter="confirmRename"
              @keyup.escape="cancelRename"
              @blur="confirmRename"
              class="kb-rename-input"
            />
          </div>

          <h3 v-else class="kb-folder-title">{{ item.name }}</h3>
          <div class="kb-folder-tag">{{ item.name }}</div>

          <div class="kb-folder-footer">
            <span>{{ item.itemCount }} 个项目</span>
            <img src="@/images/vector2.png" alt="展开" class="kb-arrow-icon-img" />
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && folderList.length === 0" class="kb-empty-state">
        <!--<div class="kb-empty-icon">
          <span class="kb-icon-empty"></span>
        </div>-->
        <p class="kb-empty-text">暂无文件</p>
        <p class="kb-empty-hint">请新建文件夹</p>
      </div>

      <!-- 最近文件 -->
      <!--<div class="recent-section">
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
      </div>-->

      <div class="kb-ai-storage-row">
        <div class="kb-ai-card">
          <div class="kb-ai-blur"></div>
          <img src="@/images/database2.png" class="kb-ai-bg-icon" alt="" />
          <div class="kb-ai-content">
            <div class="kb-ai-tag">
              <img src="@/images/star.png" class="kb-ai-dot" alt="" />
              <span>AI 智能洞察</span>
            </div>
            <h3 class="kb-ai-title">正在"题库"中寻找特定内容？</h3>
            <p class="kb-ai-desc">
              我可以根据难度级别和课程标准，自动为您新上传的 512 道题目添加标签并进行分类。
            </p>
            <button class="kb-ai-button">开始自动打标</button>
          </div>
        </div>

        <div class="kb-storage-card">
          <div class="kb-storage-header">
            <h4>存储容量</h4>
            <div class="kb-progress-bar">
              <div class="kb-progress" :style="{ width: storage.usedPercent + '%' }"></div>
            </div>
            <div class="kb-storage-info">
              <span>{{ storage.used }}</span>
              <span>{{ storage.total }}</span>
            </div>
          </div>

          <div class="kb-quote">
            <p>"教育是你可以用来改变世界的最强大的武器。"</p>
            <div class="kb-author">
              <div class="kb-line"></div>
              <span>曼德拉</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件夹设置 Dialog -->
    <FolderDialog 
      :visible="showFolderDialog" 
      :folderId="currentDialogFolder?.id"
      :folderName="currentDialogFolder?.name"
      :triggerPosition="triggerPosition"
      @close="closeFolderDialog"
      @rename="handleDialogRename"
      @replaceIcon="handleDialogReplaceIcon"
      @delete="handleDialogDelete"
    />
  </div>
</template>

<style>
@import '@/styles/knowledgeBase.css';
</style>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { knowledgeApi } from '@/api/api'
import { formatFileSize, generateUniqueFolderName } from '@/utils/knowledge'
import FolderDialog from '@/views/dialog/FolderDialog.vue'

const router = useRouter()

// 搜索
const searchKey = ref('')

// 文件夹列表
const folderList = ref([])

// 最近文件
const recentFiles = ref([])

// 存储信息
const storage = ref({
  used: '已使用 0 B',
  total: '总量 0 B',
  usedPercent: 0
})

const loading = ref(false)

// 文件夹设置 Dialog
const showFolderDialog = ref(false)
const currentDialogFolder = ref(null)
const triggerPosition = ref({ x: 0, y: 0 })

// 重命名相关
const renamingFolder = ref(null)
const renameInput = ref('')
const renameInputRef = ref(null)

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 获取根目录下的文件夹
    const entriesRes = await knowledgeApi.getEntries()
    if (entriesRes && entriesRes.success && entriesRes.data) {
      const colors = [
        'rgba(180, 189, 255, 0.3)',
        'rgba(230, 222, 255, 0.3)',
        'rgba(222, 229, 253, 0.3)',
        'rgba(83, 52, 197, 0.1)',
        'rgba(247, 106, 128, 0.2)',
        'rgba(100, 200, 150, 0.3)',
        'rgba(255, 200, 100, 0.3)',
        'rgba(200, 150, 255, 0.3)'
      ]
      folderList.value = entriesRes.data.folders.map((folder, index) => ({
        id: folder.id,
        name: folder.name,
        itemCount: folder.folderCount + folder.fileCount,
        iconBg: colors[index % colors.length]
      }))
    }

    // 获取存储统计
    const storageRes = await knowledgeApi.getStorageStats()
    if (storageRes && storageRes.success && storageRes.data) {
      const stats = storageRes.data
      storage.value = {
        used: `已使用 ${formatFileSize(stats.usedBytes)}`,
        total: `总量 ${formatFileSize(stats.totalBytes)}`,
        usedPercent: Math.round((stats.usedBytes / stats.totalBytes) * 100)
      }
    }
  } catch (err) {
    console.error('数据加载失败', err)
  } finally {
    loading.value = false
  }
}

// 点击文件夹跳转
const handleFolderClick = (folderId, folderName) => {
  if (activeMenu.value || renamingFolder.value) return
  router.push({
    name: 'KnowledgeBaseFolder',
    params: { folderId, folderName }
  })
}

// 打开文件夹设置 Dialog
const openFolderDialog = (event, folder) => {
  event.stopPropagation()
  currentDialogFolder.value = folder
  
  // 获取触发按钮的位置
  const target = event.currentTarget
  const rect = target.getBoundingClientRect()
  triggerPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.bottom
  }
  
  showFolderDialog.value = true
}

// 关闭文件夹设置 Dialog
const closeFolderDialog = () => {
  showFolderDialog.value = false
  currentDialogFolder.value = null
}

// Dialog 重命名
const handleDialogRename = (folderId, folderName) => {
  renamingFolder.value = currentDialogFolder.value
  renameInput.value = currentDialogFolder.value?.name || folderName || ''
  closeFolderDialog()
  
  nextTick(() => {
    if (renameInputRef.value) {
      renameInputRef.value.focus()
      renameInputRef.value.select()
    }
  })
}

// 确认重命名
const confirmRename = async () => {
  if (!renamingFolder.value || !renameInput.value.trim()) {
    cancelRename()
    return
  }
  
  try {
    const res = await knowledgeApi.updateFolder(renamingFolder.value.id, {
      name: renameInput.value.trim()
    })
    
    if (res && res.success) {
      const folder = folderList.value.find(f => f.id === renamingFolder.value.id)
      if (folder) {
        folder.name = renameInput.value.trim()
      }
    }
  } catch (err) {
    console.error('重命名失败', err)
  } finally {
    renamingFolder.value = null
    renameInput.value = ''
  }
}

// 取消重命名
const cancelRename = () => {
  renamingFolder.value = null
  renameInput.value = ''
}

// Dialog 替换图标
const handleDialogReplaceIcon = (folderId) => {
  console.log('替换图标', folderId || currentDialogFolder.value?.id)
  closeFolderDialog()
}

// Dialog 删除文件夹
const handleDialogDelete = async (folderId) => {
  const folder = currentDialogFolder.value
  if (!folder) return
  if (!confirm(`确定要删除文件夹「${folder.name}」吗？`)) return
  
  try {
    const res = await knowledgeApi.deleteFolder(folder.id || folderId)
    
    if (res && res.success) {
      folderList.value = folderList.value.filter(f => f.id !== folder.id)
    }
  } catch (err) {
    console.error('删除文件夹失败', err)
  } finally {
    closeFolderDialog()
  }
}

// 新建文件夹
const handleCreateFolder = async () => {
  try {
    const existingNames = folderList.value.map(f => f.name)
    const folderName = generateUniqueFolderName(existingNames)
    const res = await knowledgeApi.createFolder({ name: folderName })
    
    if (res && res.success) {
      // 刷新文件夹列表
      fetchData()
    }
  } catch (err) {
    console.error('创建文件夹失败', err)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* KnowledgeBase 页面特定样式 - 页面独有的样式 */

/* 标题组 */
.title-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 头部操作区域 */
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

.search-icon-img {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  flex-shrink: 0;
}

.search-input-field {
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  background: transparent;
}

/* 文件夹卡片特定样式 */
.kb-folder-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.kb-more-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  cursor: pointer;
}

.kb-arrow-icon-img {
  width: 12px;
  height: 12px;
  object-fit: contain;
  flex-shrink: 0;
}

/* AI + 存储 响应式行 */
.kb-ai-storage-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.kb-ai-card {
  flex: 1;
  min-width: 320px;
  position: relative;
  background: linear-gradient(135deg, #314de2, #6144d3);
  border-radius: 24px;
  padding: 32px;
  color: #fff;
  overflow: hidden;
}

.kb-ai-blur {
  position: absolute;
  right: -50px;
  bottom: -50px;
  width: 240px;
  height: 240px;
  background: rgba(255, 255, 255, 0.1);
  filter: blur(30px);
  border-radius: 50%;
}

.kb-ai-bg-icon {
  position: absolute;
  right: 30px;
  top: 15%;
  width: 180px;
  height: 180px;
  object-fit: contain;
  opacity: 0.2;
}

.kb-ai-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kb-ai-tag {
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

.kb-ai-dot {
  width: 14px;
  height: 14px;
  object-fit: contain;
  flex-shrink: 0;
}

.kb-ai-title {
  font-size: 22px;
  font-weight: 500;
  margin-top: 8px;
}

.kb-ai-desc {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  max-width: 460px;
}

.kb-ai-button {
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
.kb-storage-card {
  width: 100%;
  max-width: 320px;
  background: #e4e8ef;
  border-radius: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.kb-storage-header h4 {
  font-size: 16px;
  font-weight: 500;
  color: #2e3339;
  margin-bottom: 8px;
}

.kb-progress-bar {
  width: 100%;
  height: 12px;
  background: #ebeef4;
  border-radius: 999px;
  overflow: hidden;
}

.kb-progress {
  height: 100%;
  background: #314de2;
  border-radius: 999px;
  transition: width 0.3s;
}

.kb-storage-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #2e3339;
}

.kb-storage-info span:last-child {
  color: #5a6066;
}

.kb-quote {
  margin-top: 24px;
}

.kb-quote p {
  font-size: 12px;
  line-height: 1.8;
  color: #5a6066;
}

.kb-author {
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

.kb-line {
  width: 20px;
  height: 2px;
  background: #314de2;
}

/* 最近文件（注释掉的部分） */
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

  .kb-folder-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
