<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="visible" class="agent-select-overlay" @click.self="handleClose">
        <div class="agent-select-dialog">
          <!-- 头部 -->
          <div class="dialog-header">
            <div class="header-title">
              <img src="@/images/dialog-plus.png" class="title-icon" />
              <span>关联智能体</span>
            </div>
            <div class="dialog-close" @click="handleClose">
              <span class="close-icon">✕</span>
            </div>
          </div>

          <!-- 搜索 -->
          <div class="search-section">
            <div class="search-input-wrapper">
              <img src="@/images/search.png" class="search-icon" />
              <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索智能体名称、描述或ID" />
            </div>
          </div>

          <!-- 内容区 -->
          <div class="dialog-content">
            <div class="agent-list">
              <div v-for="agent in filteredAgents" :key="agent.id" class="agent-card"
                :class="{ selected: isAgentSelected(agent.id) }" @click="handleAgentClick(agent.id)">
                <img v-if="agent.iconUrl" :src="agent.iconUrl" class="card-icon" />
                <div v-else class="card-icon"></div>
                <div class="card-info">
                  <div class="card-title">{{ agent.name }}</div>
                  <div class="card-id">ID: {{ agent.id }}</div>
                  <div class="card-desc">{{ agent.desc }}</div>
                </div>
                <div class="check-box" :class="{ checked: isAgentSelected(agent.id) }">
                  <img v-if="isAgentSelected(agent.id)" src="@/images/check.png" class="check-img" />
                </div>
              </div>

              <div v-if="filteredAgents.length === 0" class="no-agents">
                暂无可关联的智能体
              </div>
            </div>
          </div>

          <!-- 底部 -->
          <div class="dialog-footer">
            <button class="cancel-btn" @click="handleClose">取消</button>
            <button class="confirm-btn" @click="handleConfirm" :disabled="selectedCount === 0">
              确定关联 ({{ selectedCount }}/{{ maxSelect }})
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface Agent {
  id: string | number
  name: string
  desc: string
  iconUrl?: string
}

interface Props {
  visible: boolean
  agents: Agent[]
  maxSelect?: number
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', selectedIds: (string | number)[]): void
}

const props = withDefaults(defineProps<Props>(), {
  maxSelect: 999
})

const emit = defineEmits<Emits>()

const searchQuery = ref('')
const selectedIds = ref<(string | number)[]>([])

const filteredAgents = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.agents
  }
  const query = searchQuery.value.toLowerCase().trim()
  return props.agents.filter(agent =>
    agent.name.toLowerCase().includes(query) ||
    agent.desc.toLowerCase().includes(query)
  )
})

const selectedCount = computed(() => selectedIds.value.length)

const isAgentSelected = (agentId: string | number): boolean => {
  return selectedIds.value.includes(agentId)
}

const handleAgentClick = (agentId: string | number) => {
  const index = selectedIds.value.indexOf(agentId)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    if (selectedIds.value.length < props.maxSelect) {
      selectedIds.value.push(agentId)
    }
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleConfirm = () => {
  emit('confirm', [...selectedIds.value])
  handleClose()
}

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    searchQuery.value = ''
    selectedIds.value = []
  }
})
</script>

<style scoped>
/* 动画 */
.popup-enter-active,
.popup-leave-active {
  transition: all 0.3s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}

.popup-enter-from .agent-select-dialog,
.popup-leave-to .agent-select-dialog {
  transform: scale(0.95);
}

/* 遮罩 */
.agent-select-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

/* 主弹窗 */
.agent-select-dialog {
  position: relative;
  width: 768px;
  max-width: 768px;
  height: 716px;
  max-height: 870.4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  background: #ffffff;
  border: 1px solid rgba(173, 178, 185, 0.2);
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  overflow: hidden;
}

/* 头部 */
.dialog-header {
  width: 100%;
  height: 69px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(242, 244, 248, 0.3);
  border-bottom: 1px solid rgba(173, 178, 185, 0.2);
  flex: none;
  align-self: stretch;
}

.header-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 8px;
}

.title-icon {
  width: 20px;
  height: 20px;
}

.header-title span {
  width: 90px;
  height: 28px;
  font-family: 'Noto Sans SC';
  font-weight: 700;
  font-size: 18px;
  line-height: 28px;
  color: #2e3339;
}

.dialog-close {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  cursor: pointer;
}

.close-icon {
  font-size: 16px;
  color: #767b82;
}

/* 搜索 */
.search-section {
  width: 100%;
  height: 82px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  gap: 16px;
  background: #f8f9fd;
  border-bottom: 1px solid rgba(173, 178, 185, 0.2);
  flex: none;
  align-self: stretch;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  height: 41px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  width: 15px;
  height: 15px;
  left: 12px;
  z-index: 1;
}

.search-input {
  width: 100%;
  height: 41px;
  padding: 10px 16px 10px 40px;
  background: #ffffff;
  border: 1px solid rgba(173, 178, 185, 0.6);
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: #6b7280;
  outline: none;
}

/* 内容 */
.dialog-content {
  width: 100%;
  height: 488px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px;
  background: rgba(242, 244, 248, 0.2);
  flex: none;
  align-self: stretch;
  overflow-y: auto;
}

.agent-list {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  justify-items: center;
  align-content: start;
}

.agent-card {
  width: 95%;
  height: 128px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 8px;
  gap: 8px;
  background: #ffffff;
  border: 2px solid rgba(173, 178, 185, 0.3);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
}

.agent-card.selected {
  background: rgba(180, 189, 255, 0.1);
  border: 2px solid rgba(49, 77, 226, 0.2);
}

/* 卡片图标 */
.card-icon {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  flex: none;
  object-fit: cover;
}

/* 卡片信息 */
.card-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.card-title {
  font-family: 'Noto Sans SC';
  font-weight: 700;
  font-size: 16px;
  line-height: 28px;
  color: #2e3339;
}

.agent-card.selected .card-title {
  color: #314de2;
}

.card-id {
  font-family: 'Noto Sans SC';
  font-weight: 400;
  font-size: 10px;
  line-height: 16px;
  color: #5a6066;
}

.card-desc {
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 11px;
  line-height: 16px;
  color: #5a6066;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 复选框 */
.check-box {
  position: absolute;
  width: 20px;
  height: 20px;
  right: 18px;
  top: 18px;
  background: #f8f9fd;
  border: 2px solid #767b82;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.check-box.checked {
  background: #314DE2;
  border: 2px solid #314DE2;
}

.check-img {
  width: 12px;
  height: 12px;
}

/* 空状态 */
.no-agents {
  grid-column: 1 / 3;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  font-family: 'Noto Sans SC';
  font-size: 14px;
  color: #94a3b8;
}

/* 底部 */
.dialog-footer {
  width: 100%;
  height: 75px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
  background: #f2f4f8;
  border-top: 1px solid rgba(173, 178, 185, 0.2);
  flex: none;
  align-self: stretch;
}

.cancel-btn {
  width: 70px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(173, 178, 185, 0.3);
  border-radius: 8px;
  background: transparent;
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #2e3339;
  cursor: pointer;
}

.confirm-btn {
  width: 118px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #314de2;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  border: none;
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #ffffff;
  cursor: pointer;
}

.confirm-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>