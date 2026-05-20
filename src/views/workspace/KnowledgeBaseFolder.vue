<template>
  <div class="kb-page">
    <div class="kb-main-content-workspace">
      <div class="kb-workspace-toolbar">
        <div class="kb-nav-container">
          <button class="kb-back-btn" @click="goBack">
            <span class="kb-icon-back"></span>
          </button>
          <div class="kb-nav-path">
            <span v-for="(item, index) in breadcrumb" :key="index" class="kb-nav-item"
              :class="{ 'kb-nav-item-clickable': item.id !== null || index === 0 }"
              @click="navigateToFolder(item, index)">
              {{ item.name }}
              <span v-if="index < breadcrumb.length - 1" class="kb-nav-separator">/</span>
            </span>
          </div>
        </div>
      </div>

      <div class="kb-header-actions">
        <div class="kb-title-section">
          <h1 class="kb-main-title">{{ currentFolderName }}</h1>
          <p class="kb-subtitle">查看并整理您的系统文件与教案。</p>
        </div>

        <div class="kb-action-buttons">
          <button class="kb-btn-outline" @click="handleCreateFolder">
            <span class="kb-icon-add"></span>新建文件夹
          </button>
          <button class="kb-btn-primary" @click="triggerFileUpload">
            <span class="kb-icon-upload"></span>上传文件
          </button>
          <input ref="fileInputRef" type="file" multiple class="kb-file-input" @change="handleFileSelect" />
        </div>
      </div>

      <div class="kb-content-area">
        <div v-if="folders.length > 0" class="kb-folders-section">
          <h2 class="kb-section-title">子文件夹</h2>
          <div class="kb-folders-grid">
            <div class="kb-folder-card" v-for="folder in folders" :key="folder.id"
              @click="handleFolderClick(folder.id, folder.name)">
              <div class="kb-folder-header">
                <div class="kb-folder-icon-wrapper kb-default-bg">
                  <span class="kb-icon-folder"></span>
                </div>
                <div class="kb-more-wrapper">
                  <button class="kb-folder-more-btn" @click="openFolderDialog($event, folder)">
                    <img src="@/images/more.png" class="kb-more-icon" alt="更多" />
                  </button>
                </div>
              </div>

              <div v-if="renamingFolder && renamingFolder.id === folder.id" class="kb-rename-input-wrapper">
                <input ref="renameInputRef" v-model="renameInput" type="text" @keyup.enter="confirmRename"
                  @keyup.escape="cancelRename" @blur="confirmRename" class="kb-rename-input" />
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

        <div v-if="files.length > 0" class="kb-files-section">
          <h2 class="kb-section-title">文件</h2>
          <div class="kb-files-list">
            <div class="kb-file-item" v-for="file in files" :key="file.id">
              <div class="kb-file-icon-wrapper">
                <img src="@/images/chatinit-1.png" alt="" class="kb-file-img" />
              </div>
              <div class="kb-file-info">
                <span class="kb-file-name">{{ file.name }}</span>
                <span class="kb-file-meta">{{ formatFileSize(file.size) }} · {{ formatTime(file.createdAt) }}</span>
              </div>
              <div class="kb-file-tag-wrapper">
                <span class="kb-file-type-tag">文件</span>
                <span class="kb-file-size-tag">{{ formatFileSize(file.size) }}</span>
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

        <div v-if="folders.length === 0 && files.length === 0 && !loading" class="kb-empty-state">
          <p class="kb-empty-text">暂无内容</p>
          <p class="kb-empty-hint">点击上方按钮添加文件夹或上传文件</p>
        </div>
      </div>

      <FolderDialog :visible="showFolderDialog" :folderId="currentDialogFolder?.id"
        :folderName="currentDialogFolder?.name" :triggerPosition="triggerPosition" @close="closeFolderDialog"
        @rename="handleDialogRename" @replaceIcon="handleDialogReplaceIcon" @delete="handleDialogDelete" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { knowledgeApi } from '@/api/api'
import {
  formatFileSize, formatTime, generateUniqueFolderName,
  validateFileSizes, uploadFile,
  parsePath, appendToPath, getPathBeforeIndex, buildPath
} from '@/utils/knowledge'
import { knowledgeLog as log, knowledgeLogError as logError } from '@/utils/logManage'
import FolderDialog from '@/views/dialog/FolderDialog.vue'

const router = useRouter()
const route = useRoute()

const currentFolderId = ref(null)
const currentFolderName = ref('根目录')
const breadcrumb = ref([{ id: null, name: '知识库' }])

const folders = ref([])
const files = ref([])
const loading = ref(false)

const showFolderDialog = ref(false)
const currentDialogFolder = ref(null)
const triggerPosition = ref({ x: 0, y: 0 })

const fileInputRef = ref(null)
const renamingFolder = ref(null)
const renameInput = ref('')
const renameInputRef = ref(null)

// 加载数据
const fetchFolderData = async () => {
  loading.value = true
  try {
    const folderId = route.params.folderId
    const numericFolderId = folderId ? Number(folderId) : null
    currentFolderId.value = numericFolderId

    // 强制获取路径
    const pathStr = route.query.path as string || ''
    const pathItems = parsePath(pathStr)

    // 面包屑赋值
    breadcrumb.value = [{ id: null, name: '知识库' }, ...pathItems]
    log('最终面包屑:', breadcrumb.value)

    // 设置当前文件夹名称
    if (pathItems.length) {
      currentFolderName.value = pathItems.at(-1)?.name || '根目录'
    } else {
      currentFolderName.value = '根目录'
    }

    // 请求数据
    log('获取文件夹内容, parentId:', numericFolderId)
    const res = await knowledgeApi.getEntries(numericFolderId ? { parentId: numericFolderId } : {})
    if (res?.success && res.data) {
      // 确保数据是数组
      folders.value = Array.isArray(res.data.folders) ? res.data.folders : []
      files.value = Array.isArray(res.data.files) ? res.data.files : []
      log('获取到文件数:', files.value.length)
    } else {
      folders.value = []
      files.value = []
      log('数据结构异常，重置为空数组')
    }
  } catch (err) {
    logError(err)
    folders.value = []
    files.value = []
  } finally {
    loading.value = false
  }
}

// 点击文件夹（正确拼接路径）
const handleFolderClick = (folderId: number, folderName: string) => {
  if (renamingFolder.value) return

  const currentPath = route.query.path as string || ''
  const newPath = appendToPath(currentPath, folderId, folderName)

  router.push({
    name: 'KnowledgeBaseFolder',
    params: { folderId },
    query: { path: newPath }
  })
}

// 面包屑跳转
const navigateToFolder = (item: any, index: number) => {
  if (item.id === null) {
    // 点击知识库，跳转到知识库首页
    router.push({ name: 'KnowledgeBase' })
    return
  }

  const pathStr = route.query.path as string || ''
  const newPath = getPathBeforeIndex(pathStr, index)

  router.push({
    name: 'KnowledgeBaseFolder',
    params: { folderId: item.id },
    query: newPath ? { path: newPath } : {}
  })
}

const goBack = () => router.back()

const openFolderDialog = (event, folder) => {
  event.stopPropagation()
  currentDialogFolder.value = folder
  const rect = event.currentTarget.getBoundingClientRect()
  triggerPosition.value = { x: rect.left + rect.width / 2, y: rect.bottom }
  showFolderDialog.value = true
}

const closeFolderDialog = () => {
  showFolderDialog.value = false
  currentDialogFolder.value = null
}

const handleDialogRename = () => {
  renamingFolder.value = currentDialogFolder.value
  renameInput.value = currentDialogFolder.value?.name || ''
  closeFolderDialog()
}

const handleDialogReplaceIcon = () => closeFolderDialog()

const handleDialogDelete = async () => {
  const f = currentDialogFolder.value
  if (!f || !confirm(`确定删除「${f.name}」？`)) return closeFolderDialog()
  const res = await knowledgeApi.deleteFolder(f.id)
  if (res?.success) folders.value = folders.value.filter(x => x.id !== f.id)
  closeFolderDialog()
}

const confirmRename = async () => {
  if (!renamingFolder.value || !renameInput.value.trim()) return
  const res = await knowledgeApi.updateFolder(renamingFolder.value.id, { name: renameInput.value.trim() })
  if (res?.success) {
    const f = folders.value.find(x => x.id === renamingFolder.value.id)
    if (f) f.name = renameInput.value.trim()
  }
  renamingFolder.value = null
}

const cancelRename = () => renamingFolder.value = null

const handleCreateFolder = async () => {
  const names = folders.value.map(f => f.name)
  const name = generateUniqueFolderName(names)
  const data = { name }
  if (currentFolderId.value) data.parentId = currentFolderId.value
  const res = await knowledgeApi.createFolder(data)
  if (res?.success) fetchFolderData()
}

const triggerFileUpload = () => fileInputRef.value?.click()

const handleFileSelect = async (e) => {
  const selectedFiles = e.target.files
  if (!selectedFiles?.length) return
  const { validFiles } = validateFileSizes(selectedFiles)
  const targetFolderId = route.params.folderId ? Number(route.params.folderId) : null
  log('上传文件到文件夹:', targetFolderId)
  for (const f of validFiles) {
    const uploadedFile = await uploadFile(f, targetFolderId)
    if (uploadedFile) {
      files.value.push(uploadedFile)
    }
  }
  fetchFolderData() // 刷新确保数据一致
  e.target.value = ''
}

const handleDownload = (file) => file.url && window.open(file.url, '_blank')
const handleDelete = (file) => log('删除文件', file.id)

// 监听路由
watch(
  () => [route.params.folderId, route.query.path],
  () => fetchFolderData(),
  { immediate: true }
)

onMounted(fetchFolderData)
</script>

<style>
@import '@/styles/knowledgeBase.css';
</style>