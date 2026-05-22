<template>
  <div class="kb-page">
    <!-- 主内容区 -->
    <div class="kb-main-content">
      <!-- 工具栏 -->
      <div class="kb-toolbar">
        <div class="kb-title-group">
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
          <button class="kb-btn-primary" @click="triggerFileUpload">
            <img src="@/images/upLoad2.png" alt="" />
            上传文件
          </button>
          <input 
            ref="fileInputRef"
            type="file" 
            multiple 
            class="kb-file-input" 
            @change="handleFileSelect"
          />
        </div>
      </div>

      <!-- 文件夹网格 -->
      <div v-if="folders.length > 0" class="kb-folder-grid">
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
                <img src="@/images/more.png" class="kb-more-icon" alt="更多" />
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

      <!-- 文件列表 -->
      <div v-if="files.length > 0" class="kb-file-table-bg">
        <div class="kb-file-table">
          <div class="kb-table-header-row" :class="{ 'has-scrollbar': files.length > 4 }">
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
                <img src="@/images/chatinit-1.png" alt="" class="kb-doc-icon" />
                <span class="kb-data-name">{{ file.name }}</span>
              </div>
              <div class="kb-table-cell kb-table-cell-2"><span>文件</span></div>
              <div class="kb-table-cell kb-table-cell-3"><span>{{ formatTime(file.createdAt) }}</span></div>
              <div class="kb-table-cell kb-table-cell-4"><span>{{ formatFileSize(file.size) }}</span></div>
              <div class="kb-table-cell kb-table-cell-5"><span>知识库</span></div>
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

      <!-- 空状态 -->
      <div v-if="!loading && folders.length === 0 && files.length === 0" class="kb-empty-state">
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
            <div class="kb-ai-title-row">
              <div class="kb-ai-tag">
                <img src="@/images/star.png" class="kb-ai-dot" alt="" />
              </div>
              <h3 class="kb-ai-title">如何让AI学习您的专属资料</h3>
            </div>
            <div class="kb-ai-desc-row">
              <span class="kb-ai-num">1</span>
              <p class="kb-ai-desc">
                您可以在“题库”中上传您的教案、课件或题库。
              </p>
            </div>
            <div class="kb-ai-desc-row">
              <span class="kb-ai-num">2</span>
              <p class="kb-ai-desc">
                前往【我的智能体】，在配置界面打开“专属知识库”开关。
              </p>
            </div>
            <div class="kb-ai-desc-row">
              <span class="kb-ai-num">3</span>
              <p class="kb-ai-desc">
                勾选相关文件，您的智能体即可基于这些资料进行精准问答与生成！
              </p>
            </div>
            <button class="kb-ai-button" @click="goToAgentEdit">前往我的智能体</button>
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

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { knowledgeApi } from '@/api/api'
import { formatFileSize, formatTime, generateUniqueFolderName, validateFileSizes, uploadFile, appendToPath, handleDownload, handleDelete } from '@/utils/knowledge'
import { knowledgeLog, knowledgeLogError } from '@/utils/logManage'
import FolderDialog from '@/views/dialog/FolderDialog.vue'

const router = useRouter()
const route = useRoute()

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

// 搜索
//const searchKey = ref('')

// 文件夹列表
const folders = ref<Folder[]>([])

// 文件列表
const files = ref<File[]>([])

// 存储信息
const storage = ref({
  used: '已使用 0 B',
  total: '总量 0 B',
  usedPercent: 0
})

const loading = ref(false)

// 排序相关
const sortField = ref<string>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

// 文件夹设置 Dialog
const showFolderDialog = ref(false)
const currentDialogFolder = ref<Folder | null>(null)
const triggerPosition = ref({ x: 0, y: 0 })

// 文件上传相关
const fileInputRef = ref<HTMLInputElement | null>(null)

// 重命名相关
const renamingFolder = ref<Folder | null>(null)
const renameInput = ref('')
const renameInputRef = ref<HTMLInputElement | null>(null)

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 获取根目录下的文件夹和文件
    const entriesRes = await knowledgeApi.getEntries()
    if (entriesRes && entriesRes.success && entriesRes.data) {
      // 确保数据是数组
      folders.value = Array.isArray(entriesRes.data.folders) ? entriesRes.data.folders : []
      files.value = Array.isArray(entriesRes.data.files) ? entriesRes.data.files : []
      knowledgeLog('数据加载成功 - 文件夹数:', folders.value.length, '文件数:', files.value.length)
    } else {
      folders.value = []
      files.value = []
      knowledgeLog('数据结构异常，重置为空数组')
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
    knowledgeLogError('数据加载失败', err)
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
        comparison = '知识库'.localeCompare('知识库', 'zh-CN')
        break
      default:
        comparison = a.name.localeCompare(b.name, 'zh-CN')
    }
    return comparison * multiplier
  })
})

// 点击文件夹跳转
const handleFolderClick = (folderId: number, folderName: string) => {
  if (showFolderDialog.value || renamingFolder.value) return

  router.push({
    name: 'KnowledgeBaseFolder',
    params: { folderId },
    query: {
      path: appendToPath('', folderId, folderName)
    }
  })
}

// 前往我的智能体
const goToAgentEdit = () => {
  router.push({
    name: 'AgentStudio'
  })
}

// 打开文件夹设置 Dialog
const openFolderDialog = (event: MouseEvent, folder: Folder) => {
  event.stopPropagation()
  currentDialogFolder.value = folder
  
  // 获取触发按钮的位置
  const target = event.currentTarget as HTMLElement
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
const handleDialogRename = (folderName: string) => {
  renamingFolder.value = currentDialogFolder.value
  renameInput.value = currentDialogFolder.value?.name || folderName || ''
  closeFolderDialog()
  
  // 使用 setTimeout 确保 DOM 完全更新后再聚焦
  setTimeout(() => {
    const input = renameInputRef.value
    if (input && typeof input.focus === 'function') {
      input.focus()
      input.select()
    } else {
      knowledgeLog('重命名输入框未就绪或不是有效的 DOM 元素')
    }
  }, 100)
}

// 确认重命名
const confirmRename = async () => {
  if (!renamingFolder.value || !renameInput.value.trim()) {
    cancelRename()
    return
  }
  const folderId = renamingFolder.value.id
  const newName = renameInput.value.trim()
  
  try {
    const res = await knowledgeApi.updateFolder(folderId, {
      name: newName
    })
    
    if (res && res.success) {
      const folder = folders.value.find(f => f.id === folderId)
      if (folder) {
        folder.name = newName
      }
    }
  } catch (err) {
    knowledgeLogError('重命名失败', err)
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
const handleDialogReplaceIcon = (folderId: number) => {
  knowledgeLog('替换图标', folderId || currentDialogFolder.value?.id)
  closeFolderDialog()
}

// Dialog 删除文件夹
const handleDialogDelete = async (folderId: number) => {
  const folder = currentDialogFolder.value
  if (!folder) return
  if (!confirm(`确定要删除文件夹「${folder.name}」吗？`)) return
  
  try {
    const res = await knowledgeApi.deleteFolder(folder.id || folderId)
    
    if (res && res.success) {
      folders.value = folders.value.filter(f => f.id !== folder.id)
    }
  } catch (err) {
    knowledgeLogError('删除文件夹失败', err)
  } finally {
    closeFolderDialog()
  }
}

// 新建文件夹
const handleCreateFolder = async () => {
  try {
    const existingNames = folders.value.map(f => f.name)
    const folderName = generateUniqueFolderName(existingNames)
    const res = await knowledgeApi.createFolder({ name: folderName })

    if (res && res.success) {
      fetchData()
    }
  } catch (err) {
    knowledgeLogError('创建文件夹失败', err)
  }
}

// 触发文件选择
const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
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

  fetchData()
  target.value = ''
}

// 下载文件
const handleDownloadLocal = (file: File) => handleDownload(file)

// 删除文件
const handleDeleteLocal = async (file: File) => {
  const success = await handleDelete(file, files)
  if (success) {
    await fetchData()
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style>
@import '@/styles/knowledgeBase.css';
</style>

<style scoped>
/* KnowledgeBase 页面特有样式 - 不在公共样式中的样式 */

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

/* 文件夹卡片特有样式（当使用 img 标签时） */
.kb-folder-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* 响应式 */
@media (max-width: 768px) {
  .kb-folder-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>

