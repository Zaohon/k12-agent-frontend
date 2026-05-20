<template>
  <div class="chat-message-row" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
    <div class="chat-message-box" :class="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
      <div class="chat-avatar" :class="message.role === 'user' ? 'user-avatar' : 'assistant-avatar'">
        <el-icon class="icon" v-if="message.role === 'user'">
          <component :is="userIconComponent" />
        </el-icon>
        <el-icon class="icon" v-else>
          <component :is="assistantIconComponent" />
        </el-icon>
      </div>
      <div class="chat-bubble-wrapper" :class="message.role === 'user' ? 'align-end' : 'align-start'">
        <div class="chat-bubble" :class="message.role === 'user' ? 'user-bubble' : 'assistant-bubble'">
          <!-- 如果有内容，优先显示内容，思考状态只在没有内容时显示 -->
          <div v-if="message.content" class="message-content">{{ message.content }}</div>
          <div v-else-if="message.isThinking" class="thinking-card">
            <span class="thinking-text">{{ thinkingText }}</span>
          </div>
        </div>
        <!-- AI消息显示复制按钮 -->
        <div v-if="message.role === 'assistant' && message.content && !message.isThinking" class="message-actions">
          <button class="copy-btn" @click="copyMessage">
            <span class="copy-icon"></span>
            <span class="copy-text">复制</span>
          </button>
        </div>
        <!-- 用户消息显示附件卡片 -->
        <div v-if="showAttachments && message.role === 'user' && message.attachments && message.attachments.length > 0" class="message-attachments">
          <div v-for="(item, index) in message.attachments" :key="index" class="message-attachment-card">
            <div class="attachment-card-background">
              <div class="attachment-card-icon-container">
                <div class="attachment-card-icon">{{ getAttachmentIcon(item.type) }}</div>
              </div>
            </div>
            <div class="attachment-card-content">
              <div class="attachment-card-name-row">
                <span class="attachment-card-name">{{ item.name || '附件' }}</span>
              </div>
              <div class="attachment-card-info-row">
                <div class="attachment-card-size-container">
                  <span class="attachment-card-size">{{ formatFileSize(item.size) }}</span>
                </div>
                <div class="attachment-card-dot"></div>
                <div class="attachment-card-status-container">
                  <span class="attachment-card-status">{{ attachmentStatus }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Monitor } from '@element-plus/icons-vue'
import { computed, watch } from 'vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isThinking?: boolean
  attachments?: Array<{
    type: string
    name: string
    size: number
  }>
}

const props = withDefaults(defineProps<{
  message: Message
  userIcon?: any
  assistantIcon?: any
  thinkingText?: string
  showAttachments?: boolean
  attachmentStatus?: string
}>(), {
  userIcon: User,
  assistantIcon: Monitor,
  thinkingText: '正在思考中...',
  showAttachments: true,
  attachmentStatus: '解析完成'
})

import { chatLog as log } from '@/utils/logManage'

// 监听message变化
watch(() => props.message, (newMsg) => {
  log('收到新message:', {
    role: newMsg.role,
    content: newMsg.content,
    isThinking: newMsg.isThinking
  })
}, { deep: true, immediate: true })

const userIconComponent = computed(() => {
  return props.userIcon
})

const assistantIconComponent = computed(() => {
  return props.assistantIcon
})

// 复制消息内容
import { ElMessage } from 'element-plus'

const copyMessage = async () => {
  try {
    // 尝试使用 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(props.message.content)
      ElMessage.success('复制成功')
    } else {
      // 回退方案：创建临时文本区域
      const textarea = document.createElement('textarea')
      textarea.value = props.message.content
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      textarea.style.top = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      
      try {
        const successful = document.execCommand('copy')
        if (successful) {
          ElMessage.success('复制成功')
        } else {
          ElMessage.error('复制失败，请手动复制')
        }
      } catch (e) {
        ElMessage.error('复制失败，请手动复制')
        console.error('复制失败:', e)
      } finally {
        document.body.removeChild(textarea)
      }
    }
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
    console.error('复制失败:', err)
  }
}

const getAttachmentIcon = (type: string): string => {
  const icons: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📽️',
    pptx: '📽️',
    image: '🖼️',
    img: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    video: '🎥',
    mp4: '🎥',
    avi: '🎥',
    audio: '🎵',
    mp3: '🎵',
    wav: '🎵',
    zip: '📦',
    rar: '📦',
    '7z': '📦'
  }
  return icons[type?.toLowerCase()] || '📎'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style>
/* 导入通用聊天气泡样式 */
@import '@/styles/chat-bubble.css';
</style>