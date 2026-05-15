<template>
  <div class="category-content">
    <!-- 顶部卡片 -->
    <div class="top-card">
      <div class="top-left">
        <div class="top-title-row">
          <img
            v-if="selectedCategory === '精选页'"
            src="@/images/category-star.png"
            class="top-icon"
          />
          <div class="top-title">{{ selectedCategory }}</div>
        </div>
        <div class="top-desc">
          配置智能体集市精选页面展示的智能体，所有人可见。
        </div>
      </div>

      <div class="top-right">
        <button class="btn-cancel" @click="handleCancel">取消</button>
        <button class="btn-save" @click="handleSave">保存修改</button>
      </div>
    </div>

    <!-- 卡片A：学科提效神器 -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-left">
          <div class="section-title-row">
            <img :src="iconRecommend" class="section-icon" />
            <div class="section-title">{{ selectedCategory }} - 学科提效神器</div>
          </div>
          <div class="section-desc">
            管理精选页下模块中展示的智能体，最多展示6个。
          </div>
        </div>

        <div class="section-right">
          <button class="btn-delete" @click="handleDelete">删除</button>
          <button class="btn-link" @click="openAgentDialog">
            <div class="link-icon">
              <span>+</span>
            </div>
            关联智能体
          </button>
        </div>
      </div>

      <!-- 智能体列表（可拖拽排序 + 空卡片） -->
      <div class="agent-card-grid">
        <draggable
          v-model="section1Agents"
          item-key="id"
          ghost-class="ghost"
          animation="200"
          class="draggable-container"
        >
          <template #item="{ element: agent }">
            <div
              class="agent-card"
              :class="{ selected: isAgentSelected(agent.id, selectedAgentIds) }"
              @click="handleAgentCardClick(agent.id)"
            >
              <div class="agent-left">
                <img src="@/images/category-content-drag.png" class="agent-drag-icon" />
                <div class="agent-logo"></div>
                <div class="agent-info">
                  <div class="agent-name">{{ agent.name }}</div>
                  <div class="agent-id">ID: {{ agent.id }}</div>
                  <div class="agent-desc">{{ agent.desc }}</div>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <!-- 空卡片（最多6个智能体） -->
        <div v-if="section1Agents.length < 6" class="agent-card-empty" @click="openAgentDialog">
          <span>+ 关联智能体</span>
        </div>
      </div>
    </div>

    <!-- 智能体选择弹窗 -->
    <AgentSelectDialog
      v-model:visible="agentDialogVisible"
      :agents="availableAgents"
      :max-select="6 - section1Agents.length"
      @confirm="handleAgentSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import draggable from 'vuedraggable'
import iconRecommend from '@/images/category-content-recommend.png'
import '@/styles/category-manage-content.css'
import AgentSelectDialog from '@/views/dialog/AgentSelectDialog.vue'
import {
  loadCategoryAgents,
  saveCategoryAgents,
  loadAvailableAgents,
  toggleAgentSelection,
  isAgentSelected,
  deleteSelectedAgents
} from '@/utils/categoryManageContent'
import type { Agent } from '@/utils/categoryManageContent'

// 日志输出开关，设置为 false 可关闭所有日志
const ENABLE_LOG = true

const props = defineProps<{
  selectedCategory?: string
  categoryId?: number
}>()

const selectedAgentIds = ref<Set<string | number>>(new Set())
const section1Agents = ref<Agent[]>([])
const availableAgents = ref<Agent[]>([])
const agentDialogVisible = ref(false)
const originalAgentIds = ref<(string | number)[]>([])

const hasChanges = computed(() => {
  const currentIds = section1Agents.value.map(a => a.id).sort()
  const originalIds = originalAgentIds.value.sort()
  return JSON.stringify(currentIds) !== JSON.stringify(originalIds)
})

const loadAgents = async () => {
  if (!props.categoryId) return
  ENABLE_LOG && console.log('精选页 - 加载分类智能体, categoryId=', props.categoryId)
  const agents = await loadCategoryAgents(props.categoryId)
  section1Agents.value = agents
  originalAgentIds.value = agents.map(a => a.id)
  ENABLE_LOG && console.log('精选页 - 加载完成, 智能体数量=', agents.length)
}

const loadAvailable = async () => {
  ENABLE_LOG && console.log('精选页 - 加载可用智能体列表')
  const agents = await loadAvailableAgents()
  availableAgents.value = agents
  ENABLE_LOG && console.log('精选页 - 可用智能体列表加载完成, 数量=', agents.length)
}

const handleAgentCardClick = (agentId: string | number) => {
  selectedAgentIds.value = toggleAgentSelection(agentId, selectedAgentIds.value)
}

const handleDelete = () => {
  const idsToDelete = Array.from(selectedAgentIds.value)
  if (idsToDelete.length === 0) return

  section1Agents.value = deleteSelectedAgents(idsToDelete, section1Agents.value)
  selectedAgentIds.value = new Set()
}

const openAgentDialog = () => {
  agentDialogVisible.value = true
}

const handleAgentSelect = (selectedIds: (string | number)[]) => {
  const newAgents = availableAgents.value.filter(a => selectedIds.includes(a.id))
  section1Agents.value = [...section1Agents.value, ...newAgents]
}

const handleCancel = () => {
  loadAgents()
}

const handleSave = async () => {
  if (!props.categoryId) return
  const agentIds = section1Agents.value.map(a => a.id)
  ENABLE_LOG && console.log('精选页 - 保存智能体, categoryId=', props.categoryId, ', agentIds=', agentIds)
  const success = await saveCategoryAgents(props.categoryId, agentIds)
  if (success) {
    originalAgentIds.value = agentIds
    ENABLE_LOG && console.log('精选页 - 保存成功')
  }
}

watch(() => props.categoryId, (newId) => {
  if (newId) {
    loadAgents()
    loadAvailable()
  }
}, { immediate: true })
</script>