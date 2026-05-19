<template>
  <!-- 主内容工作区 -->
  <div class="kb-main-content-workspace">
    <!-- 工作区工具栏 -->
    <div class="kb-workspace-toolbar">
      <!-- 左侧导航 -->
      <div class="kb-nav-container">
        <button class="kb-back-btn" @click="goBack">
          <span class="kb-icon-back"></span>
        </button>
        <div class="kb-nav-path">
          <span 
            v-for="(item, index) in breadcrumb" 
            :key="index"
            class="kb-nav-item"
            :class="{ 'kb-nav-item-clickable': item.id !== null }"
            @click="item.id !== null && navigateToFolder(item)"
          >
            {{ item.name }}
            <span v-if="index < breadcrumb.length - 1" class="kb-nav-separator">/</span>
          </span>
        </div>
        <div class="kb-vertical-divider"></div>
      </div>

      <!-- 搜索框 -->
      <div class="kb-search-input-wrapper">
        <div class="kb-search-input">
          <span class="kb-search-icon"></span>
          <input type="text" v-model="searchKey" placeholder="搜索资源..." />
        </div>
      </div>
    </div>

    <!-- 头部标题与操作区 -->
    <div class="kb-header-actions">
      <div class="kb-title-section">
        <h1 class="kb-main-title">{{ currentFolderName || '我的文件夹' }}</h1>
        <p class="kb-subtitle">查看并整理您的系统文件与教案。</p>
      </div>

      <div class="kb-action-buttons">
        <button class="kb-btn-outline" @click="handleCreateFolder">
          <span class="kb-icon-add"></span>
          新建文件夹
        </button>
        <button class="kb-btn-primary" @click="handleUploadFile">
          <span class="kb-icon-upload"></span>
          上传文件
        </button>
      </div>
    </div>

    <!-- 内容区域：文件夹和文件列表 -->
    <div class="kb-content-area">
      <!-- 子文件夹列表 -->
      <div v-if="folders.length > 0" class="kb-folders-section">
        <h2 class="kb-section-title">子文件夹</h2>
        <div class="kb-folders-grid">
          <div 
            class="kb-folder-card" 
            v-for="folder in folders" 
            :key="folder.id"
            @click="handleFolderClick(folder.id, folder.name)"
          >
            <div class="kb-folder-header">
              <div class="kb-folder-icon-wrapper kb-default-bg">
                <span class="kb-icon-folder"></span>
              </div>
              <div class="kb-more-wrapper">
                <button class="kb-folder-more-btn" @click="openFolderDialog($event, folder)">
                  <span class="kb-icon-more"></span>
                </button>
              </div>
            </div>
            
            <div v-if="renamingFolder && renamingFolder.id === folder.id" class="kb-rename-input-wrapper">
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
            
            <h3 v-else class="kb-folder-title">{{ folder.name }}</h3>
            <div class="kb-folder-tag">文件夹</div>
            <div class="kb-folder-footer">
              <span>{{ folder.folderCount + folder.fileCount }} 个项目</span>
              <span class="kb-arrow-icon"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 文件列表 -->
      <div v-if="files.length > 0" class="kb-files-section">
        <h2 class="kb-section-title">文件</h2>
        <div class="kb-files-list">
          <div class="kb-file-item" v-for="file in files" :key="file.id">
            <div class="kb-file-icon-wrapper">
              <span class="kb-icon-file"></span>
            </div>
            <div class="kb-file-info">
              <span class="kb-file-name">{{ file.name }}</span>
              <span class="kb-file-meta">{{ formatFileSize(file.size) }} · {{ formatTime(file.createdAt) }}</span>
            </div>
            <div class="kb-file-actions">
              <button class="kb-action-btn" @click="handleDownload(file)">
                <span class="kb-icon-download"></span>
              </button>
              <button class="kb-action-btn" @click="handleDelete(file)">
                <span class="kb-icon-delete"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="folders.length === 0 && files.length === 0 && !loading" class="kb-empty-state">
        <div class="kb-empty-icon">
          <span class="kb-icon-empty"></span>
        </div>
        <p class="kb-empty-text">暂无内容</p>
        <p class="kb-empty-hint">点击上方按钮添加文件夹或上传文件</p>
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

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { knowledgeApi } from '@/api/api'
import { formatFileSize, formatTime, generateUniqueFolderName } from '@/utils/knowledge'
import FolderDialog from '@/views/dialog/FolderDialog.vue'

const router = useRouter()
const route = useRoute()

// 当前文件夹ID
const currentFolderId = ref(null)
const currentFolderName = ref('')

// 面包屑导航
const breadcrumb = ref([
  { id: null, name: '知识库' }
])

// 搜索关键词
const searchKey = ref('')

// 文件夹列表
const folders = ref([])

// 文件列表
const files = ref([])

// 加载状态
const loading = ref(false)

// 文件夹设置 Dialog
const showFolderDialog = ref(false)
const currentDialogFolder = ref(null)
const triggerPosition = ref({ x: 0, y: 0 })

// 重命名相关
const renamingFolder = ref(null)
const renameInput = ref('')
const renameInputRef = ref(null)

// 获取当前文件夹数据
const fetchFolderData = async () => {
  loading.value = true
  try {
    const folderId = route.params.folderId
    currentFolderId.value = folderId
    currentFolderName.value = route.params.folderName || '我的文件夹'

    // 构建面包屑导航
    buildBreadcrumb()

    // 获取文件夹内容
    const res = await knowledgeApi.getEntries(folderId ? { parentId: folderId } : {})
    if (res && res.success && res.data) {
      folders.value = res.data.folders || []
      files.value = res.data.files || []
    }
  } catch (err) {
    console.error('加载文件夹数据失败', err)
  } finally {
    loading.value = false
  }
}

// 构建面包屑导航
const buildBreadcrumb = () => {
  breadcrumb.value = [{ id: null, name: '知识库' }]
  
  if (currentFolderName.value) {
    // 从路由参数中解析路径（如果路径格式为 "folder1/folder2/folder3"）
    const pathStr = route.params.path || ''
    if (pathStr) {
      const pathParts = pathStr.split('/').filter(p => p.trim())
      pathParts.forEach((name, index) => {
        breadcrumb.value.push({
          id: `path-${index}`,
          name: decodeURIComponent(name)
        })
      })
    }
    
    // 添加当前文件夹（如果不在路径中）
    if (!breadcrumb.value.find(item => item.name === currentFolderName.value)) {
      breadcrumb.value.push({
        id: currentFolderId.value,
        name: currentFolderName.value
      })
    }
  }
}

// 点击面包屑项跳转
const navigateToFolder = (item) => {
  if (item.id === null) {
    // 跳转到知识库首页
    router.push({ name: 'KnowledgeBase' })
  } else {
    // 跳转到指定文件夹
    router.push({
      name: 'KnowledgeBaseFolder',
      params: { 
        folderId: item.id, 
        folderName: item.name 
      }
    })
  }
}

// 返回上一级
const goBack = () => {
  router.back()
}

// 点击子文件夹
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
      folders.value = folders.value.filter(f => f.id !== folder.id)
    }
  } catch (err) {
    console.error('删除文件夹失败', err)
  } finally {
    closeFolderDialog()
  }
}

// 开始重命名（保持原有功能，用于其他调用）
const startRename = (event, folder) => {
  event.stopPropagation()
  renamingFolder.value = folder
  renameInput.value = folder.name
  
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
      const folder = folders.value.find(f => f.id === renamingFolder.value.id)
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

// 新建文件夹
const handleCreateFolder = async () => {
  try {
    const existingNames = folders.value.map(f => f.name)
    const folderName = generateUniqueFolderName(existingNames)
    const folderData = { name: folderName }
    
    if (currentFolderId.value) {
      folderData.parentId = currentFolderId.value
    }
    
    const res = await knowledgeApi.createFolder(folderData)
    
    if (res && res.success) {
      // 刷新文件夹列表
      fetchFolderData()
    }
  } catch (err) {
    console.error('创建文件夹失败', err)
  }
}

// 上传文件
const handleUploadFile = () => {
  console.log('上传文件')
}

// 下载文件
const handleDownload = (file) => {
  if (file.url) {
    window.open(file.url, '_blank')
  }
}

// 删除文件
const handleDelete = (file) => {
  console.log('删除文件', file.id)
}

// 监听路由变化
watch(() => route.params, () => {
  fetchFolderData()
}, { immediate: true })

// 点击外部关闭菜单（保持兼容）
const closeMenu = () => {}

onMounted(() => {
  fetchFolderData()
})
</script>

<style>
@import '@/styles/knowledgeBase.css';
</style>

<style scoped>
/* KnowledgeBaseFolder 页面特定样式 */
.more-wrapper {
  position: relative;
}

.folder-more-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 重命名输入框 */
.rename-input-wrapper {
  margin-top: 12px;
}

.rename-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #314de2;
  border-radius: 4px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
}
</style>
