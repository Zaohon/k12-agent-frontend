<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="visible" class="agent-select-overlay" @click.self="handleClose">
        <div class="agent-select-dialog">
          <div class="dialog-header">
            <div class="dialog-title">选择智能体</div>
            <div class="dialog-close" @click="handleClose">
              <span class="close-icon">✕</span>
            </div>
          </div>
          <div class="dialog-content">
            <div class="search-section">
              <div class="search-input-container">
                <img src="@/images/search.png" class="search-icon" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索智能体"
                  class="search-input"
                />
              </div>
            </div>
            <div class="agent-list">
              <div
                v-for="agent in filteredAgents"
                :key="agent.id"
                class="agent-item"
                :class="{ selected: isAgentSelected(agent.id) }"
                @click="handleAgentClick(agent.id)"
              >
                <div class="agent-logo"></div>
                <div class="agent-info">
                  <div class="agent-name">{{ agent.name }}</div>
                  <div class="agent-desc">{{ agent.desc }}</div>
                </div>
                <div class="agent-check">
                  <div class="check-icon" :class="{ selected: isAgentSelected(agent.id) }">✓</div>
                </div>
              </div>
              <div v-if="filteredAgents.length === 0" class="no-agents">
                暂无可关联的智能体
              </div>
            </div>
          </div>
          <div class="dialog-footer">
            <div class="selected-count">已选择 {{ selectedCount }} 个</div>
            <div class="dialog-actions">
              <button class="btn-cancel" @click="handleClose">取消</button>
              <button class="btn-confirm" @click="handleConfirm" :disabled="selectedCount === 0">
                确定
              </button>
            </div>
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

.agent-select-dialog {
  position: relative;
  width: 600px;
  max-width: 600px;
  max-height: 80vh;
  background: #FFFFFF;
  border: 1px solid #E4E8EF;
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #E2E8F0;
  flex-shrink: 0;
}

.dialog-title {
  font-family: 'Noto Sans SC';
  font-weight: 700;
  font-size: 20px;
  color: #2E3339;
}

.dialog-close {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.dialog-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

.close-icon {
  font-size: 18px;
  color: #5A6066;
  line-height: 1;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.search-section {
  padding: 16px 24px;
  border-bottom: 1px solid #E2E8F0;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 12px 0 40px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-family: 'Noto Sans SC';
  font-size: 14px;
  color: #334155;
  background: #FFFFFF;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #314DE2;
}

.search-input::placeholder {
  color: #94A3B8;
}

.agent-list {
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  gap: 8px;
}

.agent-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.agent-item:hover {
  border-color: #314DE2;
  background: rgba(49, 77, 226, 0.03);
}

.agent-item.selected {
  border-color: #314DE2;
  background: rgba(49, 77, 226, 0.05);
}

.agent-logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  border-radius: 10px;
  margin-right: 12px;
  flex-shrink: 0;
}

.agent-info {
  flex: 1;
  min-width: 0;
}

.agent-name {
  font-family: 'Noto Sans SC';
  font-weight: 700;
  font-size: 14px;
  color: #2E3339;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agent-desc {
  font-family: 'Noto Sans SC';
  font-weight: 400;
  font-size: 12px;
  color: #8A8F96;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
}

.agent-check {
  margin-left: 12px;
  flex-shrink: 0;
}

.check-icon {
  width: 20px;
  height: 20px;
  border: 1px solid #E2E8F0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: transparent;
  transition: all 0.2s;
}

.check-icon.selected {
  background: #314DE2;
  border-color: #314DE2;
  color: #FFFFFF;
}

.no-agents {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  font-family: 'Noto Sans SC';
  font-size: 14px;
  color: #94A3B8;
}

.dialog-footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #E2E8F0;
  flex-shrink: 0;
}

.selected-count {
  font-family: 'Noto Sans SC';
  font-size: 14px;
  color: #5A6066;
}

.dialog-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  width: 80px;
  height: 40px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #F8FAFC;
}

.btn-confirm {
  width: 80px;
  height: 40px;
  background: #314DE2;
  border: none;
  border-radius: 8px;
  font-family: 'Noto Sans SC';
  font-weight: 500;
  font-size: 14px;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background: #2a3fc7;
}

.btn-confirm:disabled {
  background: #94A3B8;
  cursor: not-allowed;
}
</style>
