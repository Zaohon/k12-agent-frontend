<template>
  <Teleport to="body">
    <div v-if="visible" class="kb-folder-dialog-mask" @click="handleClose">
      <div 
        class="kb-folder-settings" 
        @click.stop
        :style="dialogStyle"
      >
        <div class="arrow" :style="arrowStyle"></div>
        <div class="settings-content">
          <div class="settings-item" @click="handleRename">
            <div class="item-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21H6.75L17.8125 9.9375L14.0625 6.1875L3 17.25ZM20.7125 7.0875C21.1025 6.6975 21.1025 6.0675 20.7125 5.6775L18.3225 3.2875C17.9325 2.8975 17.3025 2.8975 16.9125 3.2875L15.1325 5.0675L18.9325 8.8675L20.7125 7.0875Z" fill="#2E3339"/>
              </svg>
            </div>
            <span class="item-text">修改名称</span>
          </div>

          <!--<div class="settings-item" @click="handleReplaceIcon">
            <div class="item-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 10H18V6H14V10ZM16 18C18.2091 18 20 16.2091 20 14C20 11.7909 18.2091 10 16 10C13.7909 10 12 11.7909 12 14C12 16.2091 13.7909 18 16 18ZM16 20C12.134 20 9 16.866 9 13C9 9.13402 12.134 6 16 6C19.866 6 23 9.13402 23 13C23 16.866 19.866 20 16 20ZM4 18C6.20914 18 8 16.2091 8 14C8 11.7909 6.20914 10 4 10C1.79086 10 0 11.7909 0 14C0 16.2091 1.79086 18 4 18ZM4 20C0.134007 20 -3 16.866 -3 13C-3 9.13402 0.134007 6 4 6C7.866 6 11 9.13402 11 13C11 16.866 7.866 20 4 20Z" fill="#2E3339"/>
              </svg>
            </div>
            <span class="item-text">替换图标</span>
          </div>-->

          <div class="settings-item danger" @click="handleDelete">
            <div class="item-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z" fill="#FF7C7C"/>
              </svg>
            </div>
            <span class="item-text">删除文件夹</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  folderId: {
    type: [String, Number],
    default: null
  },
  folderName: {
    type: String,
    default: ''
  },
  triggerPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
})

const emit = defineEmits(['close', 'rename', 'replaceIcon', 'delete'])

const DIALOG_WIDTH = 161
const DIALOG_HEIGHT = 114
const ARROW_WIDTH = 14
const TRIGGER_OFFSET = 8 // 箭头指向位置偏移

const dialogStyle = computed(() => {
  const { x, y } = props.triggerPosition
  
  // 计算 Dialog 位置，使其出现在触发按钮下方
  let left = x - DIALOG_WIDTH / 2
  let top = y + TRIGGER_OFFSET
  
  // 确保不超出屏幕边界
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  // 左右边界检查
  if (left < 0) left = 0
  if (left + DIALOG_WIDTH > windowWidth) left = windowWidth - DIALOG_WIDTH
  
  // 底部边界检查，如果下方空间不够则向上显示
  if (top + DIALOG_HEIGHT > windowHeight) {
    top = y - DIALOG_HEIGHT - TRIGGER_OFFSET
  }
  
  return {
    left: `${left}px`,
    top: `${top}px`
  }
})

const arrowStyle = computed(() => {
  const { x, y } = props.triggerPosition
  const dialogLeft = parseFloat(dialogStyle.value.left)
  
  // 计算箭头位置，指向触发按钮中心
  const arrowLeft = x - dialogLeft - ARROW_WIDTH / 2
  
  // 确保箭头在 Dialog 范围内
  const maxLeft = DIALOG_WIDTH - ARROW_WIDTH
  const clampedLeft = Math.max(0, Math.min(arrowLeft, maxLeft))
  
  // 判断是向上还是向下显示
  const windowHeight = window.innerHeight
  const isAbove = y + TRIGGER_OFFSET + DIALOG_HEIGHT > windowHeight
  
  return {
    left: `${clampedLeft}px`,
    top: isAbove ? 'auto' : '0',
    bottom: isAbove ? '0' : 'auto',
    transform: isAbove ? 'rotate(180deg)' : 'none'
  }
})

const handleClose = () => {
  emit('close')
}

const handleRename = () => {
  emit('rename', props.folderId, props.folderName)
}

const handleReplaceIcon = () => {
  emit('replaceIcon', props.folderId)
}

const handleDelete = () => {
  emit('delete', props.folderId)
}
</script>

<style scoped>
.kb-folder-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.kb-folder-settings {
  position: fixed;
  width: 161px;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-shadow: 0px 5px 25px -5px rgba(226, 232, 240, 0.8);
}

.settings-content {
  width: 161px;
  height: 114px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 15px;
  gap: 12px;
  background: #ffffff;
  border-radius: 8px;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
}

.settings-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 10px;
  gap: 8px;
  width: 131px;
  height: 20px;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.settings-item:hover {
  background: #f8f9fd;
}

.item-icon {
  width: 20px;
  height: 20px;
  flex: none;
  flex-grow: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-icon svg {
  width: 20px;
  height: 20px;
}

.item-text {
  width: 100%;
  height: 20px;
  font-family: "Noto Sans SC", sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  align-items: center;
  color: #2e3339;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
}

.settings-item.danger .item-text {
  color: #ff7c7c;
}

.arrow {
  width: 14px;
  height: 8px;
  background: #ffffff;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  position: absolute;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}
</style>
