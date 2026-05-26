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

        <div v-if="files.length > 0" class="kb-file-table-bg">
          <div class="kb-file-table">
            <div class="kb-table-header-row" :class="{ 'has-scrollbar': files.length > 3 }">
              <div class="kb-table-cell kb-table-cell-1 kb-sortable" @click="handleSort('name')">
                <span class="kb-cell-text">名称</span>
                <span class="kb-sort-icon" :class="{ 'asc': sortField === 'name' && sortOrder === 'asc', 'desc': sortField === 'name' && sortOrder === 'desc' }">↑</span>
              </div>
              <div class="kb-table-cell kb-table-cell-2 kb-sortable" @click="handleSort('type')">
                <span class="kb-cell-text">类型</span>
                <span class="kb-sort-icon" :class="{ 'asc': sortField === 'type' && sortOrder === 'asc', 'desc': sortField === 'type' && sortOrder === 'desc' }">↑</span>
              </div>
              <div class="kb-table-cell kb-table-cell-3 kb-sortable" @click="handleSort('createdAt')">
                <span class="kb-cell-text">修改时间</span>
                <span class="kb-sort-icon" :class="{ 'asc': sortField === 'createdAt' && sortOrder === 'asc', 'desc': sortField === 'createdAt' && sortOrder === 'desc' }">↑</span>
              </div>
              <div class="kb-table-cell kb-table-cell-4 kb-sortable" @click="handleSort('size')">
                <span class="kb-cell-text">大小</span>
                <span class="kb-sort-icon" :class="{ 'asc': sortField === 'size' && sortOrder === 'asc', 'desc': sortField === 'size' && sortOrder === 'desc' }">↑</span>
              </div>
              <div class="kb-table-cell kb-table-cell-5 kb-sortable" @click="handleSort('location')">
                <span class="kb-cell-text">位置</span>
                <span class="kb-sort-icon" :class="{ 'asc': sortField === 'location' && sortOrder === 'asc', 'desc': sortField === 'location' && sortOrder === 'desc' }">↑</span>
              </div>
              <div class="kb-table-cell kb-table-cell-6"><span class="kb-cell-text">操作</span></div>
            </div>
            <div class="kb-table-body">
              <div class="kb-table-body-row" v-for="file in sortedFiles" :key="file.id">
                <div class="kb-table-cell kb-table-cell-1 kb-data-name-cell">
                  <img :src="getFileIcon(file.name)" alt="" class="kb-doc-icon" />
                  <span class="kb-data-name">{{ file.name }}</span>
                </div>
                <div class="kb-table-cell kb-table-cell-2"><span>文件</span></div>
                <div class="kb-table-cell kb-table-cell-3"><span>{{ formatTime(file.createdAt) }}</span></div>
                <div class="kb-table-cell kb-table-cell-4"><span>{{ formatFileSize(file.size) }}</span></div>
                <div class="kb-table-cell kb-table-cell-5"><span>{{ currentFolderName }}</span></div>
                <div class="kb-table-cell kb-table-cell-6 kb-data-action">
                  <button class="kb-table-action-btn" @click="handleDownloadLocal(file)" title="下载">
                    <img src="@/images/download.png" alt="下载" class="kb-action-icon" />
                  </button>
                  <button class="kb-table-action-btn" @click="handleDeleteLocal(file)" title="删除">
                    <img src="@/images/icon-delete.png" alt="删除" class="kb-action-icon" />
                  </button>
                </div>
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { knowledgeApi } from '@/api/api'
import {
  formatFileSize, formatTime, generateUniqueFolderName,
  validateFileSizes, uploadFile,
  parsePath, appendToPath, getPathBeforeIndex,
  handleDownload, handleDelete,
  type BreadcrumbItem
} from '@/utils/knowledge'
import { knowledgeLog, knowledgeLogError } from '@/utils/logManage'
import FolderDialog from '@/views/dialog/FolderDialog.vue'
import fileNull from '@/images/file-null.png'
import filePdf from '@/images/file-pdf.png'
import fileDoc from '@/images/file-doc.png'
import fileXls from '@/images/file-xls.png'
import filePpt from '@/images/file-ppt.png'
import fileTxt from '@/images/file-txt.png'

const fileIconMap: Record<string, string> = {
  'pdf': filePdf,
  'doc': fileDoc,
  'docx': fileDoc,
  'xls': fileXls,
  'xlsx': fileXls,
  'ppt': filePpt,
  'pptx': filePpt,
  'txt': fileTxt
}

const getFileIcon = (fileName: string): string => {
  if (!fileName) return fileNull
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  return fileIconMap[ext] || fileNull
}

interface Folder {
  id: number
  name: string
  folderCount: number
  fileCount: number
  createdAt?: string
  updatedAt?: string
}

interface File {
  id: number
  name: string
  size: number
  url?: string
  createdAt: string
  updatedAt?: string
}

const router = useRouter()
const route = useRoute()

const currentFolderId = ref<number | null>(null)
const currentFolderName = ref('根目录')
const breadcrumb = ref<(BreadcrumbItem | { id: number | null; name: string })[]>([{ id: null, name: '知识库' }])

const folders = ref<Folder[]>([])
const files = ref<File[]>([])
const loading = ref(false)

// 排序相关
const sortField = ref<string>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const showFolderDialog = ref(false)
const currentDialogFolder = ref<Folder | null>(null)
const triggerPosition = ref({ x: 0, y: 0 })

const fileInputRef = ref<HTMLInputElement | null>(null)
const renamingFolder = ref<Folder | null>(null)
const renameInput = ref('')
//const renameInputRef = ref(null)

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
    knowledgeLog('最终面包屑:', breadcrumb.value)

    // 设置当前文件夹名称
    if (pathItems.length) {
      currentFolderName.value = pathItems.at(-1)?.name || '根目录'
    } else {
      currentFolderName.value = '根目录'
    }

    // 请求数据
    knowledgeLog('获取文件夹内容, parentId:', numericFolderId)
    const res = await knowledgeApi.getEntries(numericFolderId ? { parentId: numericFolderId } : {})
    if (res?.success && res.data) {
      // 确保数据是数组
      folders.value = Array.isArray(res.data.folders) ? res.data.folders : []
      files.value = Array.isArray(res.data.files) ? res.data.files : []
      knowledgeLog('获取到文件数:', files.value.length)
    } else {
      folders.value = []
      files.value = []
      knowledgeLog('数据结构异常，重置为空数组')
    }
  } catch (err) {
    knowledgeLogError(err)
    folders.value = []
    files.value = []
  } finally {
    loading.value = false
  }
}

// 文件排序
const handleSort = (field: string) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

// 排序后的文件列表
const sortedFiles = computed(() => {
  const field = sortField.value
  const order = sortOrder.value
  const multiplier = order === 'asc' ? 1 : -1
  
  return [...files.value].sort((a, b) => {
    let comparison = 0
    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'zh-CN')
        break
      case 'type':
        comparison = '文件'.localeCompare('文件', 'zh-CN')
        break
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'size':
        comparison = a.size - b.size
        break
      case 'location':
        comparison = currentFolderName.value.localeCompare(currentFolderName.value, 'zh-CN')
        break
      default:
        comparison = a.name.localeCompare(b.name, 'zh-CN')
    }
    return comparison * multiplier
  })
})

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

const openFolderDialog = (event: MouseEvent, folder: Folder) => {
  event.stopPropagation()
  currentDialogFolder.value = folder
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
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
  const renameId = renamingFolder.value.id
  const res = await knowledgeApi.updateFolder(renameId, { name: renameInput.value.trim() })
  if (res?.success) {
    const f = folders.value.find(x => x.id === renameId)
    if (f) f.name = renameInput.value.trim()
  }
  renamingFolder.value = null
}

const cancelRename = () => renamingFolder.value = null

const handleCreateFolder = async () => {
  const names = folders.value.map(f => f.name)
  const name = generateUniqueFolderName(names)
  const data: { name: string; parentId?: number | null } = { name }
  if (currentFolderId.value) data.parentId = currentFolderId.value
  const res = await knowledgeApi.createFolder(data)
  if (res?.success) fetchFolderData()
}

const triggerFileUpload = () => fileInputRef.value?.click()

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const selectedFiles = target.files
  if (!selectedFiles?.length) return

  // 获取存储空间信息
  let remainingBytes: number | null = null
  try {
    const storageRes = await knowledgeApi.getStorageStats()
    if (storageRes?.success && storageRes.data) {
      const { usedBytes, totalBytes } = storageRes.data
      remainingBytes = totalBytes - usedBytes
      knowledgeLog('存储空间 - 已用:', usedBytes, '总计:', totalBytes, '剩余:', remainingBytes)
    }
  } catch (err) {
    knowledgeLogError('获取存储空间信息失败', err)
  }

  const { validFiles, tooLargeFiles, insufficientSpaceFiles } = validateFileSizes(selectedFiles, remainingBytes)

  // 显示错误提示
  if (tooLargeFiles.length > 0) {
    ElMessage.warning(`以下文件超出大小限制：${tooLargeFiles.join('、')}`)
  }
  if (insufficientSpaceFiles.length > 0) {
    ElMessage.warning(`空间不足，无法上传：${insufficientSpaceFiles.join('、')}`)
  }

  const targetFolderId = route.params.folderId ? Number(route.params.folderId) : null

  if (!files.value) files.value = []

  for (const f of validFiles) {
    try {
      const uploadedFile = await uploadFile(f, targetFolderId)
      if (uploadedFile) {
        files.value.push(uploadedFile)
      }
    } catch (err) {
      knowledgeLogError('上传失败', err)
    }
  }

  fetchFolderData()
  target.value = ''
}

// 下载文件
const handleDownloadLocal = (file: File) => handleDownload(file)

// 删除文件
const handleDeleteLocal = async (file: File) => {
  await handleDelete(file, files)
}

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