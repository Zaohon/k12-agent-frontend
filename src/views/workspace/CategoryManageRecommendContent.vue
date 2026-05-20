<template>
  <div class="cm-category-content">
    <!-- 顶部卡片 -->
    <div class="cm-top-card">
      <div class="cm-top-left">
        <div class="cm-top-title-row">
          <img
            v-if="category?.name === '推荐页'"
            src="@/images/category-content-curated.png"
            class="cm-top-icon"
          />
          <div class="cm-top-title">{{ category?.name }}</div>
        </div>
        <div class="cm-top-desc">
          配置智能体集市推荐页面展示的智能体，所有人可见。
        </div>
      </div>

      <div class="cm-top-right">
        <button class="cm-btn-reset" @click="handleReset">重置</button>
        <button class="cm-btn-save" @click="handleSave">保存修改</button>
      </div>
    </div>

    <!-- 卡片A：精选专题 -->
    <div class="cm-section-card">
      <div class="cm-section-header">
        <div class="cm-section-left">
          <div class="cm-section-title-row">
            <img :src="iconCurated" class="cm-section-icon" />
            <div class="cm-section-title">精选专题</div>
          </div>
          <div class="cm-section-desc">
            管理推荐页下精选专题栏展示的智能体，最多展示3个。
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
          v-model="section2Agents"
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

        <!-- 空卡片（最多3个智能体） -->
        <div v-if="section2Agents.length < 3" class="cm-agent-card-empty" @click="openAgentDialog">
          <span>+ 关联智能体</span>
        </div>
      </div>
    </div>

    <!-- 智能体选择弹窗 -->
    <AgentSelectDialog
      v-model:visible="agentDialogVisible"
      :agents="filteredAvailableAgents"
      :max-select="3 - section2Agents.length"
      @confirm="handleAgentSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import iconCurated from '@/images/category-content-curated.png'
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

interface Category {
  id: number
  name: string
  weight?: number
}
//@ts-ignore
import { categoryLog, categoryLogError} from '@/utils/logManage'

const props = defineProps<{
  category?: Category
}>()

const selectedAgentIds = ref<Set<string | number>>(new Set())
const section2Agents = ref<Agent[]>([])
const availableAgents = ref<Agent[]>([])
const agentDialogVisible = ref(false)
const originalAgentIds = ref<(string | number)[]>([])

//const hasChanges = computed(() => {
//  const currentIds = section2Agents.value.map(a => a.id).sort()
//  const originalIds = originalAgentIds.value.sort()
//  return JSON.stringify(currentIds) !== JSON.stringify(originalIds)
//})

const filteredAvailableAgents = computed(() => {
  const addedIds = new Set(section2Agents.value.map(a => a.id))
  return availableAgents.value.filter(a => !addedIds.has(a.id))
})

const loadAgents = async () => {
  if (!props.category?.id) return
  categoryLog('推荐页 - 加载分类智能体, categoryId=', props.category?.id)
  const agents = await loadCategoryAgents(props.category.id)
  section2Agents.value = agents
  originalAgentIds.value = agents.map(a => a.id)
  categoryLog('推荐页 - 加载完成, 智能体数量=', agents.length)
}

const loadAvailable = async () => {
  categoryLog('推荐页 - 加载可用智能体列表')
  categoryLog('推荐页 - 请求数据: {}')
  const agents = await loadAvailableAgents()
  availableAgents.value = agents
  categoryLog('推荐页 - 可用智能体列表加载完成, 数量=', agents.length)
  categoryLog('推荐页 - 返回数据:', availableAgents.value.map((a, index) => ({
    index: index + 1,
    id: a.id,
    name: a.name,
    desc: a.desc,
    iconUrl: a.iconUrl
  })))
}

const handleAgentCardClick = (agentId: string | number) => {
  selectedAgentIds.value = toggleAgentSelection(agentId, selectedAgentIds.value)
}

const handleDragEnd = () => {
  categoryLog('推荐页 - 用户拖动完成')
  categoryLog('推荐页 - 拖动后的智能体顺序:', section2Agents.value.map((a, index) => ({
    index: index + 1,
    id: a.id,
    name: a.name
  })))
}

const handleDelete = () => {
  const idsToDelete = Array.from(selectedAgentIds.value)
  if (idsToDelete.length === 0) return

  section2Agents.value = deleteSelectedAgents(idsToDelete, section2Agents.value)
  selectedAgentIds.value = new Set()
}

const openAgentDialog = () => {
  agentDialogVisible.value = true
}

const handleAgentSelect = (selectedIds: (string | number)[]) => {
  const newAgents = availableAgents.value.filter(a => selectedIds.includes(a.id))
  section2Agents.value = [...section2Agents.value, ...newAgents]
}

const handleReset = () => {
  loadAgents()
}

const handleSave = async () => {
  if (!props.category?.id) return
  const agentIds = section2Agents.value.map(a => a.id)
  categoryLog('推荐页 - 保存智能体, categoryId=', props.category?.id, ', agentIds=', agentIds)
  const success = await saveCategoryAgents(props.category.id, agentIds)
  if (success) {
    originalAgentIds.value = agentIds
    categoryLog('推荐页 - 保存成功')
  }
}

watch(() => props.category?.id, (newId) => {
  if (newId) {
    loadAgents()
    loadAvailable()
  }
}, { immediate: true })
</script>
