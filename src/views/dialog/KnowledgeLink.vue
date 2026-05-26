<template>
  <Teleport to="body">
    <div class="modal-wrapper" @click.self="handleClose">
      <div class="material-modal" ref="modalRef">
        <div class="modal-header" ref="dragHeaderRef" @mousedown="startDrag">
          <div class="header-title">
            <img src="@/images/dialog-plus.png" class="title-icon" />
            <span>关联资料</span>
          </div>
          <button class="close-btn" @click="handleClose">
            <div class="close-icon"></div>
          </button>
        </div>

        <div class="modal-content">
          <div class="left-sidebar">
            <div class="tree-container">
              <div class="tree-item parent" :class="{ expanded: expandedRoot }" @click="toggleRootExpand">
                <div class="arrow-icon" :class="{ rotated: expandedRoot }"></div>
                <span>知识库</span>
              </div>
              <!-- 非递归树：扁平数组渲染 -->
              <div v-if="expandedRoot" class="tree-sub-items">
                <div
                  v-for="node in flatTreeNodes"
                  :key="node.folder.id"
                  class="sub-item"
                  :class="{ active: currentFolderId === node.folder.id }"
                  :style="{ paddingLeft: `${12 + (node.depth - 1) * 16}px` }"
                  @click="selectTreeFolder(node)"
                >
                  <!-- 展开箭头 -->
                  <div
                    v-if="node.folder.folderCount > 0 || node.hasLoaded"
                    class="arrow-icon-small"
                    :class="{ rotated: node.isExpanded }"
                    @click.stop="toggleTreeNode(node)"
                  />
                  <div v-else style="width: 16px; flexShrink: 0" />
                  <span>{{ node.folder.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="center-content">
            <div class="breadcrumb">
              <span
                class="breadcrumb-item"
                :class="{ 'breadcrumb-item-clickable': breadcrumb.length > 0 }"
                @click="navigateToRoot"
              >知识库</span>
              <template v-for="(item, index) in breadcrumb" :key="index">
                <div class="breadcrumb-arrow"></div>
                <span
                  class="breadcrumb-item"
                  :class="{
                    'breadcrumb-item-clickable': index < breadcrumb.length - 1,
                    'active-path': index === breadcrumb.length - 1
                  }"
                  @click="navigateToFolder(item, index)"
                >{{ item.name }}</span>
              </template>
            </div>

            <div class="file-list-header">
              <input type="checkbox" class="check-all" :checked="allChecked" @change="toggleCheckAll" />
              <div class="header-texts">
                <span>文件名</span>
              </div>
              <span class="header-size">大小</span>
              <span class="header-time">修改时间</span>
            </div>

            <div class="file-list-body">
              <div
                v-for="file in filteredFiles"
                :key="file.id"
                class="file-item"
                :class="{ selected: isFileSelected(file.id), disabled: !isFileTypeAllowed(file.name) }"
              >
                <input
                  type="checkbox"
                  :checked="isFileSelected(file.id)"
                  :disabled="!isFileTypeAllowed(file.name)"
                  @click.stop="handleFileCheckbox(file)"
                />
                <div class="file-info" :class="{ disabled: !isFileTypeAllowed(file.name) }" @click="handleFileCheckbox(file)">
                  <img :src="getFileIconPath(file.name)" class="file-icon" />
                  <span>{{ file.name }}</span>
                </div>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <span class="file-time">{{ formatTime(file.createdAt || '') }}</span>
              </div>

              <div v-if="filteredFiles.length === 0 && !loading" class="empty-state">
                <p>暂无内容</p>
              </div>
            </div>
          </div>

          <div class="right-sidebar">
            <div class="sidebar-header">
              <span>已选文件</span>
              <div class="selected-count">{{ selectedFiles.length }}</div>
            </div>
            <div class="selected-list">
              <div v-for="file in selectedFilesData" :key="file.id" class="selected-item">
                <img :src="getFileIconPath(file.name)" class="selected-icon" />
                <span>{{ file.name }}</span>
                <button class="delete-btn" @click="removeSelectedFile(file.id)">
                  <div class="delete-icon"></div>
                </button>
              </div>
              <div v-if="selectedFiles.length === 0" class="empty-selected">
                <p>请选择文件</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="handleClose">取消</button>
          <button class="confirm-btn" :disabled="selectedFiles.length === 0" @click="handleConfirm">
            确定关联 ({{ selectedFiles.length }})
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, watch, onUnmounted } from 'vue'
import { knowledgeApi } from '@/api/api'
import { formatFileSize, formatTime } from '@/utils/knowledge'
import { knowledgeLog, knowledgeLogError } from '@/utils/logManage'
import { validateFileType, isFileTypeAllowed } from '@/hooks/useAttachment'

interface Folder {
  id: number
  name: string
  folderCount: number
  fileCount: number
  createdAt?: string
  parentId?: number | null
}

interface File {
  id: number
  name: string
  size: number
  url?: string
  createdAt: string
  folderId?: number
}

interface TreeNode {
  folder: Folder
  depth: number
  children?: TreeNode[]
  isExpanded: boolean
  hasLoaded: boolean
  parent?: TreeNode | null
}

const emit = defineEmits(['close', 'confirm'])

// 拖拽
const modalRef = ref<HTMLDivElement | null>(null)
const dragHeaderRef = ref<HTMLDivElement | null>(null)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)

// 树结构（原结构）
const treeNodes = shallowRef<TreeNode[]>([])
// 扁平树节点（非递归渲染使用）
const flatTreeNodes = shallowRef<TreeNode[]>([])

const expandedRoot = ref(true)
const currentFolderId = ref<number | null>(null)
const breadcrumb = ref<{ id: number; name: string }[]>([])
const folders = ref<Folder[]>([])
const childFolders = ref<Folder[]>([])
const files = ref<File[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const selectedFiles = ref<number[]>([])
const allFilesData = ref<File[]>([])

// ==============================================
// 核心：扁平化树结构（无递归）
// ==============================================
const flattenTree = (nodes: TreeNode[], result: TreeNode[] = []) => {
  for (const node of nodes) {
    result.push(node)
    // 展开的节点才把子节点加入扁平数组
    if (node.isExpanded && node.children && node.children.length) {
      flattenTree(node.children, result)
    }
  }
  return result
}

// 监听树变化，自动更新扁平数组
watch(treeNodes, () => {
  flatTreeNodes.value = flattenTree(treeNodes.value)
}, { deep: true, immediate: true })

// ==============================================
// 文件夹加载与切换
// ==============================================
const loadSubFolders = async (folderId: number): Promise<Folder[]> => {
  try {
    const res = await knowledgeApi.getEntries({ parentId: folderId })
    if (res?.success && res.data) {
      knowledgeLog('loadSubFolders 获取到子文件夹数:', res.data.folders?.length)
      return Array.isArray(res.data.folders) ? res.data.folders : []
    }
    knowledgeLog('loadSubFolders 数据异常')
  } catch (err) {
    knowledgeLogError(err)
  }
  return []
}

// 切换节点展开（非递归）
const toggleTreeNode = async (node: TreeNode) => {
  if (!node.hasLoaded) {
    const subFolders = await loadSubFolders(node.folder.id)
    node.children = subFolders.map((f) => ({
      folder: f,
      depth: node.depth + 1,
      children: f.folderCount > 0 ? [] : undefined,
      isExpanded: false,
      hasLoaded: false,
      parent: node
    }))
    node.hasLoaded = true
  }
  node.isExpanded = !node.isExpanded
  // 触发更新
  treeNodes.value = [...treeNodes.value]
}

// 选中文件夹
const selectTreeFolder = (node: TreeNode) => {
  currentFolderId.value = node.folder.id
  const path: { id: number; name: string }[] = []
  let current: TreeNode | null = node
  while (current) {
    path.unshift({ id: current.folder.id, name: current.folder.name })
    current = current.parent || null
  }
  breadcrumb.value = path
  fetchData(node.folder.id)
}

// 初始化根目录树
const initRootTree = () => {
  treeNodes.value = folders.value.map((folder) => ({
    folder,
    depth: 1,
    children: folder.folderCount > 0 ? [] : undefined,
    isExpanded: false,
    hasLoaded: false,
    parent: null
  }))
}

const fetchRootFolders = async () => {
  try {
    const res = await knowledgeApi.getFolders()
    if (res?.success && res.data) {
      folders.value = Array.isArray(res.data) ? res.data : []
      knowledgeLog('fetchRootFolders 获取到根文件夹数:', folders.value.length)
      initRootTree()
    } else {
      folders.value = []
      knowledgeLog('fetchRootFolders 数据异常')
    }
  } catch (err) {
    knowledgeLogError(err)
    folders.value = []
  }
}

const toggleRootExpand = () => {
  expandedRoot.value = !expandedRoot.value
}

const navigateToRoot = () => {
  currentFolderId.value = null
  breadcrumb.value = []
  fetchData(null)
}

const navigateToFolder = (item: { id: number; name: string }, index: number) => {
  currentFolderId.value = item.id
  breadcrumb.value = breadcrumb.value.slice(0, index + 1)
  fetchData(item.id)
}

// ==============================================
// 文件列表
// ==============================================
const getFileIconPath = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return new URL('@/images/file-pdf.png', import.meta.url).href
    case 'docx':
    case 'doc':
      return new URL('@/images/file-doc.png', import.meta.url).href
    case 'xlsx':
    case 'xls':
      return new URL('@/images/file-xls.png', import.meta.url).href
    case 'pptx':
    case 'ppt':
      return new URL('@/images/file-ppt.png', import.meta.url).href
    case 'txt':
      return new URL('@/images/file-txt.png', import.meta.url).href
    default:
      return new URL('@/images/file-null.png', import.meta.url).href
  }
}

const fetchData = async (folderId: number | null = null) => {
  loading.value = true
  try {
    const res = await knowledgeApi.getEntries(folderId ? { parentId: folderId } : {})
    if (res?.success && res.data) {
      childFolders.value = Array.isArray(res.data.folders) ? res.data.folders : []
      files.value = Array.isArray(res.data.files) ? res.data.files : []
      allFilesData.value = [...files.value]
      knowledgeLog('获取到文件数:', files.value.length)
    } else {
      childFolders.value = []
      files.value = []
      allFilesData.value = []
      knowledgeLog('数据异常，重置为空数组')
    }
  } catch (err) {
    knowledgeLogError(err)
    childFolders.value = []
    files.value = []
    allFilesData.value = []
  } finally {
    loading.value = false
  }
}

const filteredFiles = computed(() => {
  if (!searchKeyword.value.trim()) {
    return files.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return files.value.filter((file) =>
    file.name.toLowerCase().includes(keyword)
  )
})

// ==============================================
// 文件选择
// ==============================================
const isFileSelected = (fileId: number) => {
  return selectedFiles.value.includes(fileId)
}

const handleFileCheckbox = (file: File) => {
  if (!validateFileType(file.name)) {
    return
  }
  toggleFileSelect(file.id)
}

const toggleFileSelect = (fileId: number) => {
  const index = selectedFiles.value.indexOf(fileId)
  if (index >= 0) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value.push(fileId)
  }
}

const selectedFilesData = computed(() => {
  return allFilesData.value.filter((file) => selectedFiles.value.includes(file.id))
})

const allowedFiles = computed(() => {
  return filteredFiles.value.filter(file => isFileTypeAllowed(file.name))
})

const allChecked = computed(() => {
  return allowedFiles.value.length > 0 &&
    allowedFiles.value.every((file) => selectedFiles.value.includes(file.id))
})

const toggleCheckAll = () => {
  if (allChecked.value) {
    allowedFiles.value.forEach((file) => {
      const index = selectedFiles.value.indexOf(file.id)
      if (index >= 0) {
        selectedFiles.value.splice(index, 1)
      }
    })
  } else {
    allowedFiles.value.forEach((file) => {
      if (!selectedFiles.value.includes(file.id)) {
        selectedFiles.value.push(file.id)
      }
    })
  }
}

const removeSelectedFile = (fileId: number) => {
  const index = selectedFiles.value.indexOf(fileId)
  if (index >= 0) {
    selectedFiles.value.splice(index, 1)
  }
}

// ==============================================
// 拖拽逻辑
// ==============================================
const startDrag = (e: MouseEvent) => {
  if (!modalRef.value) return
  isDragging.value = true
  dragStartX.value = e.clientX - modalRef.value.getBoundingClientRect().left
  dragStartY.value = e.clientY - modalRef.value.getBoundingClientRect().top

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !modalRef.value) return

  let x = e.clientX - dragStartX.value
  let y = e.clientY - dragStartY.value

  const maxX = window.innerWidth - modalRef.value.offsetWidth
  const maxY = window.innerHeight - modalRef.value.offsetHeight

  x = Math.max(0, Math.min(x, maxX))
  y = Math.max(0, Math.min(y, maxY))

  modalRef.value.style.left = `${x}px`
  modalRef.value.style.top = `${y}px`
  modalRef.value.style.transform = 'none'
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// ==============================================
// 弹窗操作
// ==============================================
const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  const filesToSend = selectedFilesData.value.map((file) => ({
    id: file.id,
    name: file.name,
    url: file.url,
    size: file.size
  }))
  emit('confirm', filesToSend)
}

// ==============================================
// 生命周期
// ==============================================
onMounted(() => {
  fetchRootFolders()
  fetchData(null)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Noto Sans SC', sans-serif;
}

.modal-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  isolation: isolate;
}

.material-modal {
  width: 100%;
  max-width: 1200px;
  height: 100%;
  max-height: 90vh;
  background: #ffffff;
  border: 1px solid rgba(173, 178, 185, 0.2);
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  user-select: none;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  width: 100%;
  flex-shrink: 0;
  background: rgba(242, 244, 248, 0.3);
  border-bottom: 1px solid rgba(173, 178, 185, 0.2);
  cursor: move;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.header-title span {
  font-weight: 700;
  font-size: 18px;
  color: #2e3339;
}

.close-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.close-icon {
  width: 11.67px;
  height: 11.67px;
  position: relative;
}

.close-icon::before,
.close-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 1px;
  background: #767b82;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.close-icon::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.close-icon::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.modal-content {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.left-sidebar {
  width: 256px;
  flex-shrink: 0;
  background: #f8f9fd;
  border-right: 1px solid #dee3ea;
  overflow-x: auto;
  overflow-y: auto;
}

.tree-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: max-content;
}

.tree-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  background: #ebeef4;
  border-radius: 8px;
  cursor: pointer;
}

.tree-item:hover {
  background: #e2e8f0;
}

.arrow-icon {
  width: 6px;
  height: 6px;
  border-top: 1.5px solid #5a6066;
  border-right: 1.5px solid #5a6066;
  transform: rotate(45deg);
  transition: transform 0.2s;
}

.arrow-icon.rotated {
  transform: rotate(135deg);
}

.tree-item span {
  font-weight: 500;
  font-size: 14px;
  color: #2e3339;
}

.tree-sub-items {
  display: flex;
  flex-direction: column;
  padding: 4px 0 0 0;
  gap: 2px;
}

.arrow-icon-small {
  width: 6px;
  height: 6px;
  border-top: 1.5px solid #5a6066;
  border-right: 1.5px solid #5a6066;
  transform: rotate(45deg);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.arrow-icon-small.rotated {
  transform: rotate(135deg);
}

.sub-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  border-radius: 8px;
  cursor: pointer;
}

.sub-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.sub-item.active {
  background: rgba(180, 189, 255, 0.3);
  border: 1px solid #b4bdff;
}

.sub-item span {
  font-size: 14px;
  color: #5a6066;
}

.sub-item.active span {
  color: #314de2;
  font-weight: 500;
}

.center-content {
  flex: 1;
  background: #ffffff;
  border-right: 1px solid #dee3ea;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  gap: 8px;
  background: rgba(248, 249, 253, 0.5);
  border-bottom: 1px solid #ebeef4;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.breadcrumb-item {
  font-size: 14px;
  color: #5a6066;
}

.breadcrumb-item-clickable {
  cursor: pointer;
}

.breadcrumb-item-clickable:hover {
  color: #314de2;
}

.breadcrumb-arrow {
  width: 0;
  height: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-top: 5px solid #5a6066;
  transform: rotate(-90deg);
}

.active-path {
  font-weight: 500 !important;
  color: #2e3339 !important;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  background: #f2f4f8;
  border-bottom: 1px solid #ebeef4;
  flex-shrink: 0;
}

.check-all {
  width: 18px;
  height: 18px;
  background: #fff;
  border: 1px solid #adb2b9;
  border-radius: 4px;
  cursor: pointer;
}

.header-texts {
  flex: 1;
  padding: 0 16px;
}

.file-list-header span {
  font-weight: 500;
  font-size: 12px;
  color: #5a6066;
}

.header-size {
  width: 80px;
  text-align: right;
}

.header-time {
  width: 150px;
  text-align: right;
}

.file-list-body {
  flex: 1;
  overflow-y: auto;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef4;
  cursor: pointer;
}

.file-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.file-item.selected {
  background: rgba(180, 189, 255, 0.1);
}

.file-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-item.disabled:hover {
  background: transparent;
}

.file-item.disabled input {
  cursor: not-allowed;
}

.file-info.disabled {
  pointer-events: none;
}

.file-item input {
  width: 18px;
  height: 18px;
  border: 1px solid #adb2b9;
  border-radius: 4px;
  cursor: pointer;
}

.file-item input:checked {
  background: #314de2;
  border: none;
}

.file-info {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  min-width: 0;
}

.file-icon {
  width: 16px;
  height: 20px;
  flex-shrink: 0;
  object-fit: contain;
}

.file-icon-pdf {
  background: #e74c3c;
}

.file-icon-doc {
  background: #3498db;
}

.file-icon-excel {
  background: #2ecc71;
}

.file-icon-ppt {
  background: #f39c12;
}

.file-icon-txt {
  background: #95a5a6;
}

.file-icon-default {
  background: #6144d3;
}

.file-info span {
  font-size: 14px;
  color: #2e3339;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  width: 80px;
  text-align: right;
  font-size: 14px;
  color: #5a6066;
  flex-shrink: 0;
}

.file-time {
  width: 150px;
  text-align: right;
  font-size: 14px;
  color: #5a6066;
  flex-shrink: 0;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
}

.right-sidebar {
  width: 250px;
  flex-shrink: 0;
  background: #f8f9fd;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #dee3ea;
  flex-shrink: 0;
}

.sidebar-header span {
  font-weight: 700;
  font-size: 14px;
  color: #2e3339;
}

.selected-count {
  padding: 4px 8px;
  background: rgba(180, 189, 255, 0.3);
  border-radius: 9999px;
  font-weight: 500;
  font-size: 12px;
  color: #314de2;
}

.selected-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #ebeef4;
  border: 1px solid #dee3ea;
  border-radius: 8px;
}

.selected-icon {
  width: 12px;
  height: 14px;
  flex-shrink: 0;
  object-fit: contain;
}

.selected-item span {
  flex: 1;
  padding: 0 8px;
  font-size: 12px;
  color: #2e3339;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
  width: 17.33px;
  height: 17.33px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.delete-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.delete-icon {
  width: 9.33px;
  height: 9.33px;
  position: relative;
}

.delete-icon::before,
.delete-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 1px;
  background: #5a6066;
  top: 50%;
}

.delete-icon::before {
  transform: rotate(45deg);
}

.delete-icon::after {
  transform: rotate(-45deg);
}

.empty-selected {
  padding: 40px 16px;
  text-align: center;
  color: #94a3b8;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;
  background: #f2f4f8;
  border-top: 1px solid rgba(173, 178, 185, 0.2);
  flex-shrink: 0;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid rgba(173, 178, 185, 0.3);
  border-radius: 8px;
  background: #fff;
  font-weight: 500;
  font-size: 14px;
  color: #2e3339;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #f8fafc;
}

.confirm-btn {
  padding: 11px 20px;
  background: linear-gradient(135deg, #314de2 0%, #6144d3 100%);
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  border: none;
  font-weight: 500;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
}

.confirm-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>