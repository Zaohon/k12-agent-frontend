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
        <button class="btn-cancel">取消</button>
        <button class="btn-save">保存修改</button>
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
          <button class="btn-link">
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
              :class="{ selected: isAgentSelected(agent.id) }"
              @click="toggleAgentSelection(agent.id)"
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
        <div v-if="section1Agents.length < 6" class="agent-card-empty">
          <span>+ 关联智能体</span>
        </div>
      </div>
    </div>

    <!-- 卡片B：推荐 -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-left">
          <div class="section-title-row">
            <img :src="iconCurated" class="section-icon" />
            <div class="section-title">推荐</div>
          </div>
          <div class="section-desc">
            管理精选页下推荐栏展示的智能体，最多展示3个。
          </div>
        </div>

        <div class="section-right">
          <button class="btn-delete" @click="handleDelete">删除</button>
          <button class="btn-link">
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
          v-model="section2Agents"
          item-key="id"
          ghost-class="ghost"
          animation="200"
          class="draggable-container"
        >
          <template #item="{ element: agent }">
            <div
              class="agent-card"
              :class="{ selected: isAgentSelected(agent.id) }"
              @click="toggleAgentSelection(agent.id)"
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

        <!-- 空卡片（最多3个智能体） -->
        <div v-if="section2Agents.length < 3" class="agent-card-empty">
          <span>+ 关联智能体</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import iconRecommend from '@/images/category-content-recommend.png'
import iconCurated from '@/images/category-content-curated.png'

interface Agent {
  id: string
  name: string
  desc: string
}

const props = defineProps<{
  selectedCategory?: string
}>()

const selectedAgentIds = ref<Set<string>>(new Set())

// 卡片A：学科提效神器 - 智能体列表
const section1Agents = ref<Agent[]>([
  {
    id: 'AGT-6789',
    name: '作文批改助手',
    desc: '提供多维度的高中语文作文批改与建议'
  },
  {
    id: 'AGT-6788',
    name: '古诗文赏析引擎',
    desc: '逐字逐句翻译，意境深度解析'
  },
  {
    id: 'AGT-6786',
    name: '古诗文赏析引擎',
    desc: '逐字逐句翻译，意境深度解析'
  }
])

// 卡片B：推荐 - 智能体列表
const section2Agents = ref<Agent[]>([])

// 合并智能体列表和空卡片（卡片A）
const section1DisplayItems = computed(() => {
  const items: Array<{ type: 'agent' | 'empty', data?: Agent }> = section1Agents.value.map(agent => ({ type: 'agent', data: agent }))
  if (section1Agents.value.length < 6) {
    items.push({ type: 'empty' })
  }
  return items
})

// 合并智能体列表和空卡片（卡片B）
const section2DisplayItems = computed(() => {
  const items: Array<{ type: 'agent' | 'empty', data?: Agent }> = section2Agents.value.map(agent => ({ type: 'agent', data: agent }))
  if (section2Agents.value.length < 3) {
    items.push({ type: 'empty' })
  }
  return items
})

const toggleAgentSelection = (agentId: string) => {
  const newSet = new Set(selectedAgentIds.value)
  if (newSet.has(agentId)) {
    newSet.delete(agentId)
  } else {
    newSet.add(agentId)
  }
  selectedAgentIds.value = newSet
}

const isAgentSelected = (agentId: string) => {
  return selectedAgentIds.value.has(agentId)
}

const handleDelete = () => {
  const idsToDelete = Array.from(selectedAgentIds.value)
  if (idsToDelete.length === 0) return

  section1Agents.value = section1Agents.value.filter(a => !idsToDelete.includes(a.id))
  section2Agents.value = section2Agents.value.filter(a => !idsToDelete.includes(a.id))
  selectedAgentIds.value = new Set()
}

// 过滤空卡片，只拖拽真实的智能体
const filterEmptyCard = (item: any) => {
  return item.type !== 'empty'
}
</script>

<style scoped>
/* 右侧内容整体 */
.category-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  gap: 20px;
  flex: 1;
  height: 1108px;
  background: #f2f4f8;
  overflow-y: auto;
}

/* 顶部卡片 */
.top-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  width: 100%;
  max-width: 1279px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

.top-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.top-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.top-title {
  font-family: "Noto Sans SC";
  font-weight: 700;
  font-size: 20px;
  color: #2e3339;
}

.top-desc {
  font-family: "Noto Sans SC";
  font-weight: 400;
  font-size: 14px;
  color: #5a6066;
}

.top-right {
  display: flex;
  gap: 12px;
}

.btn-cancel, .btn-save {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-family: "Noto Sans SC";
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}

.btn-cancel {
  background: #f5f6f7;
  border: 1px solid #adb2b9;
  color: #5a6066;
}

.btn-save {
  background: #314de2;
  border: 1px solid #314de2;
  color: #fff;
}

/* 模块卡片 */
.section-card {
  width: 100%;
  max-width: 1279px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.section-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  width: 22px;
  height: 19px;
  flex-shrink: 0;
}

.section-title {
  font-family: "Noto Sans SC";
  font-weight: 700;
  font-size: 16px;
  color: #2e3339;
}

.section-desc {
  font-family: "Noto Sans SC";
  font-weight: 400;
  font-size: 14px;
  color: #5a6066;
}

.section-right {
  display: flex;
  gap: 12px;
}

.btn-delete, .btn-link {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-family: "Noto Sans SC";
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  gap: 6px;
}

.btn-delete {
  background: #fff;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
}

.btn-link {
  background: #314de2;
  border: 1px solid #314de2;
  color: #fff;
}

.link-icon {
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}

/* 智能体卡片布局 */
.agent-card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}

.draggable-container {
  display: contents;
}

.agent-card {
  display: flex;
  align-items: center;
  padding: 12px;
  width: 48%;
  min-width: 300px;
  height: 80px;
  background: #f8f9fd;
  border: 1px solid rgba(173, 178, 185, 0.3);
  border-radius: 12px;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease;
}

.agent-card:hover {
  border-color: #314de2;
}

.agent-card.selected {
  border-color: #ff4d4f;
  background: rgba(255, 77, 79, 0.05);
}

.agent-card.ghost {
  opacity: 0.5;
  background: #e8f4ff;
  border: 2px dashed #314de2;
}

.agent-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.agent-drag-icon {
  width: 10px;
  height: 16px;
  flex-shrink: 0;
  cursor: grab;
}

.agent-drag-icon:active {
  cursor: grabbing;
}

.agent-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #314de2 0%, #6144d3 100%);
  border-radius: 12px;
}

.agent-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.agent-name {
  font-family: "Noto Sans SC";
  font-weight: 700;
  font-size: 14px;
  color: #2e3339;
}

.agent-id {
  font-family: "Noto Sans SC";
  font-weight: 400;
  font-size: 12px;
  color: #5a6066;
}

.agent-desc {
  font-family: "Noto Sans SC";
  font-weight: 400;
  font-size: 12px;
  color: #8a8f96;
}

.agent-card-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48%;
  min-width: 300px;
  height: 80px;
  background: #fff;
  border: 2px dashed rgba(173, 178, 185, 0.4);
  border-radius: 12px;
  cursor: pointer;
  box-sizing: border-box;
}

.agent-card-empty span {
  font-family: "Noto Sans SC";
  font-weight: 400;
  font-size: 14px;
  color: #8a8f96;
}
</style>