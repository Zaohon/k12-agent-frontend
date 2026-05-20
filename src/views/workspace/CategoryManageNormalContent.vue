<template>
  <div class="cm-category-content">
    <!-- 顶部卡片 -->
    <div class="cm-top-card cm-top-card-normal">
      <div class="cm-top-header">
        <div class="cm-top-title">{{ category?.name }}</div>
        <div class="cm-top-right">
          <button
            v-if="category?.name !== '精选页' && category?.name !== '推荐页'"
            class="cm-btn-delete-group"
            @click="handleDeleteGroup"
          >
            删除该组
          </button>
          <button class="cm-btn-reset" @click="handleReset">重置</button>
          <button class="cm-btn-save" @click="handleSave">保存修改</button>
        </div>
      </div>
      <div class="cm-divider-line"></div>
      <div class="cm-form-group">
        <div class="cm-form-column">
          <label class="cm-form-label">分类名称</label>
          <input
            type="text"
            class="cm-form-input"
            v-model="categoryName"
            :disabled="category?.name === '精选页' || category?.name === '推荐页'"
          />
        </div>
        <div class="cm-form-column">
          <label class="cm-form-label">排序权重</label>
          <div class="cm-input-with-tip">
            <input type="text" class="cm-form-input cm-form-input-with-tip" v-model="sortWeight" @input="validateSortWeight($event.target)" />
            <span class="cm-input-tip">数值越大越靠前（1-99）</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 可见性与权限控制 -->
    <!--<div class="cm-section-card small-section">
      <div class="cm-section-header">
        <div class="cm-section-left">
          <div class="cm-section-title-row">
            <img src="@/images/eye.png" class="cm-section-icon" />
            <div class="cm-section-title">可见性与权限控制</div>
          </div>
          <div class="cm-section-desc">
            配置哪些用户角色可以在智能体集市的导航区看到此菜单节点及其内容（默认管理员可见）。
          </div>
        </div>
      </div>

      <div class="checkbox-group">
        <label class="checkbox-item" @click="togglePermission('teacher')">
          <div class="checkbox" :class="{ checked: permissions.teacher }"></div>
          <span>教职工组</span>
        </label>
        <label class="checkbox-item" @click="togglePermission('student')">
          <div class="checkbox" :class="{ checked: permissions.student }"></div>
          <span>学生组</span>
        </label>
        <label class="checkbox-item" @click="togglePermission('parent')">
          <div class="checkbox" :class="{ checked: permissions.parent }"></div>
          <span>家长组</span>
        </label>
        <label class="checkbox-item" :class="{ disabled: !isSuperAdmin }" @click="isSuperAdmin && togglePermission('admin')">
          <div class="checkbox" :class="{ checked: permissions.admin, 'disabled-bg': !isSuperAdmin }"></div>
          <span>管理员组</span>
          <img v-if="!isSuperAdmin" src="@/images/lock.png" class="lock-icon" />
        </label>
      </div>
    </div>-->

    <!-- 智能体列表卡片 -->
    <div class="cm-section-card">
      <div class="cm-section-header">
        <div class="cm-section-left">
          <div class="cm-section-title-row">
            <img :src="iconRecommend" class="cm-section-icon" />
            <div class="cm-section-title">{{ category?.name }} - 学科提效神器</div>
          </div>
          <div class="cm-section-desc">
            管理该分类下展示的智能体。
          </div>
        </div>

        <div class="cm-section-right">
          <button class="cm-btn-delete" @click="handleDelete">删除</button>
          <button class="cm-btn-link" @click="openAgentDialog">
            <div class="cm-link-icon">
              <span>+</span>
            </div>
            关联智能体
          </button>
        </div>
      </div>

      <!-- 智能体列表（可拖拽排序 + 空卡片） -->
      <div class="cm-agent-card-grid">
        <draggable
          v-model="sectionAgents"
          item-key="id"
          ghost-class="cm-ghost"
          animation="200"
          class="cm-draggable-container"
          @end="handleDragEnd"
        >
          <template #item="{ element: agent }">
            <div
              class="cm-agent-card"
              :class="{ 'cm-selected': isAgentSelected(agent.id, selectedAgentIds) }"
              @click="handleAgentCardClick(agent.id)"
            >
              <div class="cm-agent-left">
                <img src="@/images/category-content-drag.png" class="cm-agent-drag-icon" />
                <img v-if="agent.iconUrl" :src="agent.iconUrl" class="cm-agent-logo" />
                <div v-else class="cm-agent-logo"></div>
                <div class="cm-agent-info">
                  <div class="cm-agent-name">{{ agent.name }}</div>
                  <div class="cm-agent-id">ID: {{ agent.id }}</div>
                  <div class="cm-agent-desc">{{ agent.desc }}</div>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <!-- 空卡片（无数量限制） -->
        <div class="cm-agent-card-empty" @click="openAgentDialog">
          <span>+ 关联智能体</span>
        </div>
      </div>
    </div>

    <!-- 智能体选择弹窗 -->
    <AgentSelectDialog
      v-model:visible="agentDialogVisible"
      :agents="filteredAvailableAgents"
      :max-select="999"
      @confirm="handleAgentSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import iconRecommend from '@/images/category-content-recommend.png'
import '@/styles/category-manage-content.css'
import AgentSelectDialog from '@/views/dialog/AgentSelectDialog.vue'
import { ElMessage } from 'element-plus'
//import { useUserStore } from '@/store/user'
//@ts-ignore
import { categoryApi } from '@/api/api'
import {
  loadCategoryAgents,
  saveCategoryAgents,
  loadAvailableAgents,
  toggleAgentSelection,
  isAgentSelected,
  deleteSelectedAgents
} from '@/utils/categoryManageContent'
import type { Agent } from '@/utils/categoryManageContent'

interface Category {
  id: number
  name: string
  weight?: number
  permissions?: {
    teacher: boolean
    admin: boolean
    student: boolean
    parent: boolean
    visitor: boolean
  }
  visible_roles?: string[]
}

import { categoryLog, categoryLogError } from '@/utils/logManage'

const emit = defineEmits(['delete-success', 'update-success'])

const props = defineProps<{
  category?: Category
}>()

const selectedAgentIds = ref<Set<string | number>>(new Set())
const sectionAgents = ref<Agent[]>([])
const availableAgents = ref<Agent[]>([])
const agentDialogVisible = ref(false)
const originalAgentIds = ref<(string | number)[]>([])
const categoryName = ref('')
const sortWeight = ref('')
const originalCategoryName = ref('')
const originalSortWeight = ref('')

const validateSortWeight = (target: EventTarget | null) => {
  const value = (target as HTMLInputElement)?.value || ''
  // 只保留数字
  let cleaned = value.replace(/\D/g, '')
  // 如果为空或0，保持为空
  if (cleaned === '' || cleaned === '0') {
    sortWeight.value = ''
    return
  }
  // 转换为数字并限制在1-99之间
  const num = parseInt(cleaned)
  if (num > 99) {
    sortWeight.value = '99'
  } else if (num < 1) {
    sortWeight.value = '1'
  } else {
    sortWeight.value = String(num)
  }
}
const permissions = ref({
  teacher: true,
  admin: true,
  student: false,
  parent: false,
  visitor: false
})
const originalPermissions = ref({
  teacher: true,
  admin: true,
  student: false,
  parent: false,
  visitor: false
})

//const userStore = useUserStore()

//const isSuperAdmin = computed(() => {
//  return userStore.userInfo?.role === 'SUPER_ADMIN'
//})

//const hasChanges = computed(() => {
//  const currentIds = sectionAgents.value.map(a => a.id).sort()
//  const originalIds = originalAgentIds.value.sort()
//  const idsChanged = JSON.stringify(currentIds) !== JSON.stringify(originalIds)
//  const nameChanged = categoryName.value !== originalCategoryName.value
//  const weightChanged = sortWeight.value !== originalSortWeight.value
//  const permChanged = JSON.stringify(permissions.value) !== JSON.stringify(originalPermissions.value)
//  return idsChanged || nameChanged || weightChanged || permChanged
//})

const filteredAvailableAgents = computed(() => {
  const addedIds = new Set(sectionAgents.value.map(a => a.id))
  return availableAgents.value.filter(a => !addedIds.has(a.id))
})

const loadAgents = async () => {
  if (!props.category?.id) return
  categoryLog('普通分类 - 加载分类智能体, categoryId=', props.category?.id)
  const agents = await loadCategoryAgents(props.category?.id)
  sectionAgents.value = agents
  originalAgentIds.value = agents.map(a => a.id)
  categoryLog('普通分类 - 加载完成, 智能体数量=', agents.length)
}

const loadAvailable = async () => {
  categoryLog('普通分类 - 加载可用智能体列表')
  const agents = await loadAvailableAgents()
  availableAgents.value = agents
  categoryLog('普通分类 - 可用智能体列表加载完成, 数量=', agents.length)
}

const handleAgentCardClick = (agentId: string | number) => {
  selectedAgentIds.value = toggleAgentSelection(agentId, selectedAgentIds.value)
}

const handleDragEnd = () => {
  categoryLog('普通分类 - 用户拖动完成')
  categoryLog('普通分类 - 拖动后的智能体顺序:', sectionAgents.value.map((a, index) => ({
    index: index + 1,
    id: a.id,
    name: a.name
  })))
}

const handleDelete = () => {
  const idsToDelete = Array.from(selectedAgentIds.value)
  if (idsToDelete.length === 0) return
  categoryLog('普通分类 - 删除智能体, ids=', idsToDelete)

  sectionAgents.value = deleteSelectedAgents(idsToDelete, sectionAgents.value)
  selectedAgentIds.value = new Set()
}

const openAgentDialog = () => {
  categoryLog('普通分类 - 打开智能体选择弹窗')
  agentDialogVisible.value = true
}

const handleAgentSelect = (selectedIds: (string | number)[]) => {
  categoryLog('普通分类 - 选择智能体, ids=', selectedIds)
  const newAgents = availableAgents.value.filter(a => selectedIds.includes(a.id))
  sectionAgents.value = [...sectionAgents.value, ...newAgents]
}

//const togglePermission = (key: 'teacher' | 'admin' | 'student' | 'parent') => {
//  if (props.category?.name === '精选页' || props.category?.name === '推荐页') {
//    return
//  }
//  // 只有 SUPER_ADMIN 可以修改管理员权限
//  if (key === 'admin' && !isSuperAdmin.value) {
//    return
//  }
//  permissions.value[key] = !permissions.value[key]
//}

const handleReset = () => {
  categoryLog('普通分类 - 重置所有变更')
  categoryName.value = originalCategoryName.value
  sortWeight.value = originalSortWeight.value
  permissions.value = { ...originalPermissions.value }
  loadAgents()
}

const handleDeleteGroup = async () => {
  if (!props.category?.id || !props.category?.name) return
  try {
    categoryLog('普通分类 - 开始删除该组')
    categoryLog('请求参数: categoryId=', props.category?.id, ', name=', props.category?.name)
    const response = await categoryApi.deleteCategory(props.category?.id)
    categoryLog('普通分类 - 删除该组成功')
    categoryLog('返回数据:', JSON.stringify(response, null, 2))
    emit('delete-success')
    ElMessage.success('删除成功')
  } catch (error) {
    categoryLogError('普通分类 - 删除该组失败')
    categoryLogError('错误信息:', error)
    ElMessage.error('删除失败')
  }
}

const handleSave = async () => {
  if (!props.category?.id) return

  try {
    categoryLog('普通分类 - 开始保存所有变更')

    // 1. 保存分类信息（名称、权重）- 权限字段后端暂不支持
    const categoryData: any = {
      name: categoryName.value,
      weight: sortWeight.value ? parseInt(sortWeight.value) : 0
    }

    categoryLog('普通分类 - 保存分类信息, categoryId=', props.category?.id)
    categoryLog('普通分类 - 分类数据:', JSON.stringify(categoryData, null, 2))

    await categoryApi.updateCategory(props.category?.id, categoryData)
    categoryLog('普通分类 - 分类信息保存成功')

    // 2. 保存智能体关联
    const agentIds = sectionAgents.value.map(a => a.id)
    categoryLog('普通分类 - 保存智能体关联, categoryId=', props.category?.id, ', agentIds=', agentIds)
    await saveCategoryAgents(props.category?.id, agentIds)
    categoryLog('普通分类 - 智能体关联保存成功')

    // 3. 更新原始值
    originalAgentIds.value = agentIds
    originalCategoryName.value = categoryName.value
    originalSortWeight.value = sortWeight.value
    originalPermissions.value = { ...permissions.value }

    // 4. 通知父组件更新列表
    emit('update-success', { 
      id: props.category?.id, 
      name: categoryName.value,
      weight: sortWeight.value ? parseInt(sortWeight.value) : 0
    })

    categoryLog('普通分类 - 保存所有变更成功')
    ElMessage.success('保存成功')
  } catch (error) {
    categoryLogError('普通分类 - 保存所有变更失败')
    categoryLogError('错误信息:', error)
    ElMessage.error('保存失败')
  }
}

watch(() => props.category, (newCategory) => {
  if (newCategory?.id) {
    categoryLog('普通分类 - category 变更, 重新加载数据, categoryId=', newCategory.id, ', name=', newCategory.name, ', weight=', newCategory.weight)
    categoryName.value = newCategory.name || ''
    originalCategoryName.value = categoryName.value
    sortWeight.value = newCategory.weight !== undefined ? String(newCategory.weight) : ''
    originalSortWeight.value = sortWeight.value
    // 从后端数据获取权限状态，如果没有则使用默认值
    // 支持两种格式：permissions 对象 和 visible_roles 数组
    const defaultPermissions = { teacher: true, admin: true, student: false, parent: false, visitor: false }
    
    if (newCategory.permissions) {
      // 后端返回的是 permissions 对象
      permissions.value = { ...defaultPermissions, ...newCategory.permissions }
    } else if (newCategory.visible_roles && Array.isArray(newCategory.visible_roles)) {
      // 后端返回的是 visible_roles 数组，转换为对象格式
      const roles = newCategory.visible_roles
      permissions.value = {
        teacher: roles.includes('teacher'),
        admin: roles.includes('admin'),
        student: roles.includes('student'),
        parent: roles.includes('parent'),
        visitor: roles.includes('visitor')
      }
    } else {
      permissions.value = defaultPermissions
    }
    
    originalPermissions.value = { ...permissions.value }
    loadAgents()
    loadAvailable()
  }
}, { immediate: true })
</script>

<style scoped>
.top-card {
  flex-direction: column;
  align-items: flex-start;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
}

.top-right {
  display: flex;
  gap: 12px;
}

.btn-delete-group, .btn-save, .btn-reset {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}

.btn-delete-group {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #D0435F;
}

.btn-reset {
  background: transparent;
  border: 1px solid #ADB2B9;
  color: #2e3339;
}

.btn-reset:disabled, .form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save {
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  border: 1px solid #314DE2;
  box-shadow: 0px 1px 2px 0px #0000000D;
  color: #fff;
}

.divider-line {
  width: 100%;
  height: 1px;
  background: rgba(173, 178, 185, 0.3);
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 16px 0;
  width: 100%;
  box-sizing: border-box;
}

.form-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  outline: none;
  box-sizing: border-box;
}

.input-with-tip {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.form-input-with-tip {
  padding-right: 120px;
  width: 100%;
}

.form-input-small {
  width: 150px !important;
  flex-shrink: 0;
}

.input-tip {
  position: absolute;
  right: 12px;
  font-size: 14px;
  color: #767B82;
  pointer-events: none;
}

.form-input::placeholder {
  color: #767B82;
  font-size: 14px;
}

.form-input:focus {
  border-color: #314de2;
}

.small-section {
  height: auto;
  padding-bottom: 24px;
}

.checkbox-group {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  margin-top: 8px;
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
  margin-left: 4px;
}
</style>
