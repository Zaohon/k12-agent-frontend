<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="visible" class="feedback-popup-overlay" @click.self="handleClose">
        <div class="feedback-popup">
          <div class="feedback-header">
            <div class="feedback-title">意见反馈</div>
            <div class="feedback-close" @click="handleClose">
              <span class="close-icon">✕</span>
            </div>
          </div>
          <div class="feedback-content">
            <div class="feedback-form">
              <div class="form-group">
                <div class="form-label">
                  <span class="required">*</span>
                  <span>反馈类型</span>
                </div>
                <div class="form-options">
                  <div
                    v-for="option in feedbackOptions"
                    :key="option.value"
                    class="form-option"
                    :class="{ selected: formData.type === option.value }"
                    @click="formData.type = option.value"
                  >
                    <div class="option-radio" :class="{ selected: formData.type === option.value }"></div>
                    <span>{{ option.label }}</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <div class="form-label">
                  <span class="required">*</span>
                  <span>发生问题的模块</span>
                </div>
                <select v-model="formData.module" class="form-select">
                  <option value="">请选择模块</option>
                  <option v-for="option in moduleOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <div class="form-label">
                  <span class="required">*</span>
                  <span>问题描述</span>
                </div>
                <textarea
                  v-model="formData.description"
                  class="form-textarea"
                  placeholder="请详细描述您遇到的问题或建议..."
                ></textarea>
              </div>
              <div class="form-group">
                <div class="form-label">
                  <span>联系方式</span>
                </div>
                <input
                  v-model="formData.contact"
                  type="text"
                  class="form-input"
                  placeholder="请输入手机号或邮箱（选填）"
                />
              </div>
              <div class="form-actions">
                <button class="btn-cancel" @click="handleClose">取消</button>
                <button class="btn-submit" @click="handleSubmit" :disabled="submitting">
                  {{ submitting ? '提交中...' : '提交' }}
                </button>
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
  (e: 'submit', data: { type: string; module: string; description: string; contact: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const feedbackOptions = [
  { label: 'AI 生成质量问题', value: 'ai_quality' },
  { label: '产品功能故障', value: 'product_bug' },
  { label: '体验优化建议', value: 'experience' }
]

const moduleOptions = [
  { label: '小龙问答', value: 'chat' },
  { label: '教育智能体', value: 'eduagent' },
  { label: '我的智能体', value: 'myagent' },
  { label: '知识库', value: 'knowledge' },
  { label: '审批中心', value: 'approval' },
  { label: '网点组织管理', value: 'netmgt' },
  { label: '分类目录管理', value: 'catmgt' },
  { label: '模型与接口配置', value: 'model' }
]

const formData = ref({
  type: 'ai_quality',
  module: '',
  description: '',
  contact: ''
})

const submitting = ref(false)

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formData.value.description.trim() || !formData.value.module) {
    return
  }

  submitting.value = true
  try {
    emit('submit', {
      type: formData.value.type,
      module: formData.value.module,
      description: formData.value.description,
      contact: formData.value.contact
    })
    handleClose()
    formData.value = {
      type: 'ai_quality',
      module: '',
      description: '',
      contact: ''
    }
  } finally {
    submitting.value = false
  }
}

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    formData.value = {
      type: 'ai_quality',
      module: '',
      description: '',
      contact: ''
    }
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

.popup-enter-from .feedback-popup,
.popup-leave-to .feedback-popup {
  transform: scale(0.95);
}

.feedback-popup-overlay {
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

.feedback-popup {
  position: relative;
  width: 672px;
  max-width: 672px;
  max-height: 90vh;
  background: #FFFFFF;
  border: 1px solid #E4E8EF;
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.feedback-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #E2E8F0;
  flex-shrink: 0;
}

.feedback-title {
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

.feedback-close {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.feedback-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

.close-icon {
  font-size: 18px;
  color: #5A6066;
  line-height: 1;
}

.feedback-content {
  padding: 24px 24px 40px;
  overflow-y: auto;
  flex: 1;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.required {
  width: 10px;
  height: 20px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  display: flex;
  align-items: center;
  color: #FF7C7C;
}

.form-label span:last-child {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #334155;
}

.form-options {
  display: flex;
  flex-direction: row;
  gap: 24px;
}

.form-option {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.option-radio {
  width: 16px;
  height: 16px;
  border: 1px solid #E2E8F0;
  border-radius: 50%;
  background: #FFFFFF;
  transition: all 0.2s;
}

.option-radio.selected {
  background: #314DE2;
  border-color: #314DE2;
}

.form-option span {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #5A6066;
}

.form-select {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #334155;
  box-sizing: border-box;
  background: #FFFFFF;
  cursor: pointer;
  transition: border-color 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235A6066' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.form-select:focus {
  outline: none;
  border-color: #314DE2;
}

.form-select option {
  color: #334155;
  background: #FFFFFF;
}

.form-textarea {
  width: 100%;
  height: 200px;
  padding: 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #334155;
  resize: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #314DE2;
}

.form-textarea::placeholder {
  color: #94A3B8;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #334155;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #314DE2;
}

.form-input::placeholder {
  color: #94A3B8;
}

.form-actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.btn-cancel {
  width: 80px;
  height: 40px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #F8FAFC;
}

.btn-submit {
  width: 80px;
  height: 40px;
  background: #314DE2;
  border: none;
  border-radius: 8px;
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #2a3fc7;
}

.btn-submit:disabled {
  background: #94A3B8;
  cursor: not-allowed;
}
</style>
