<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="visible" class="help-popup-overlay" @click.self="handleClose">
        <div class="help-popup">
          <div class="help-header">
            <div class="help-title">帮助中心</div>
            <div class="help-close" @click="handleClose">
              <span class="close-icon">✕</span>
            </div>
          </div>
          <div class="help-content">
            <div class="help-section">
              <div class="section-title">常见问题</div>
              <div class="help-list">
                <div class="help-item" @click="toggleItem(0)">
                  <div class="item-header">
                    <span class="item-question">如何创建智能体？</span>
                    <span class="item-arrow" :class="{ expanded: expandedItems.includes(0) }">▼</span>
                  </div>
                  <div v-if="expandedItems.includes(0)" class="item-answer">
                    进入「我的智能体」页面，点击「创建智能体」按钮，填写名称、描述等信息后即可创建。
                  </div>
                </div>
                <div class="help-item" @click="toggleItem(1)">
                  <div class="item-header">
                    <span class="item-question">如何上传知识库文件？</span>
                    <span class="item-arrow" :class="{ expanded: expandedItems.includes(1) }">▼</span>
                  </div>
                  <div v-if="expandedItems.includes(1)" class="item-answer">
                    进入「知识库」页面，选择目标文件夹后点击「上传文件」按钮，支持上传 PDF、Word、TXT 等格式文件。
                  </div>
                </div>
                <div class="help-item" @click="toggleItem(2)">
                  <div class="item-header">
                    <span class="item-question">AI 算力如何计算？</span>
                    <span class="item-arrow" :class="{ expanded: expandedItems.includes(2) }">▼</span>
                  </div>
                  <div v-if="expandedItems.includes(2)" class="item-answer">
                    每次使用 AI 功能会消耗一定的算力，具体消耗量根据对话长度和复杂度而定。您可以在个人中心查看剩余算力。
                  </div>
                </div>
                <div class="help-item" @click="toggleItem(3)">
                  <div class="item-header">
                    <span class="item-question">如何申请更多权限？</span>
                    <span class="item-arrow" :class="{ expanded: expandedItems.includes(3) }">▼</span>
                  </div>
                  <div v-if="expandedItems.includes(3)" class="item-answer">
                    请联系学校管理员或网点管理员申请相应权限，管理员可在审批中心处理您的申请。
                  </div>
                </div>
              </div>
            </div>
            <div class="help-section">
              <div class="section-title">联系我们</div>
              <div class="contact-info">
                <div class="contact-item">
                  <span class="contact-label">客服热线：</span>
                  <span class="contact-value">400-XXX-XXXX</span>
                </div>
                <div class="contact-item">
                  <span class="contact-label">工作时间：</span>
                  <span class="contact-value">周一至周五 9:00-18:00</span>
                </div>
                <div class="contact-item">
                  <span class="contact-label">官方邮箱：</span>
                  <span class="contact-value">support@example.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const expandedItems = ref<number[]>([])

const handleClose = () => {
  emit('update:visible', false)
}

const toggleItem = (index: number) => {
  if (expandedItems.value.includes(index)) {
    expandedItems.value = expandedItems.value.filter(i => i !== index)
  } else {
    expandedItems.value.push(index)
  }
}

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    expandedItems.value = []
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

.popup-enter-from .help-popup,
.popup-leave-to .help-popup {
  transform: scale(0.95);
}

.help-popup-overlay {
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

.help-popup {
  position: relative;
  width: 480px;
  max-width: 480px;
  max-height: 90vh;
  background: #FFFFFF;
  border: 1px solid #E4E8EF;
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.help-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #E2E8F0;
  flex-shrink: 0;
}

.help-title {
  width: 80px;
  height: 28px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  display: flex;
  align-items: center;
  color: #2E3339;
}

.help-close {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.help-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

.close-icon {
  font-size: 18px;
  color: #5A6066;
  line-height: 1;
}

.help-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.help-section {
  margin-bottom: 24px;
}

.help-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #2E3339;
  margin-bottom: 16px;
}

.help-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-item {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.help-item:hover {
  background: #F1F5F9;
}

.item-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.item-question {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #334155;
}

.item-arrow {
  font-size: 12px;
  color: #94A3B8;
  transition: transform 0.2s;
}

.item-arrow.expanded {
  transform: rotate(180deg);
}

.item-answer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E2E8F0;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #5A6066;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.contact-label {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #334155;
}

.contact-value {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #5A6066;
}
</style>