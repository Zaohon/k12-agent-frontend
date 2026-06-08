<template>
  <div v-if="message" class="chat-message-row" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
    <div class="chat-message-box" :class="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
      <div class="chat-avatar" :class="message.role === 'user' ? 'user-avatar' : 'assistant-avatar'" :style="message.role === 'user' ? { background: userAvatarBg } : {}">
        <span v-if="message.role === 'user'" class="user-avatar-letter" :style="{ color: userAvatarColor }">{{ userAvatarFirstChar }}</span>
        <img v-else src="@/images/longqi-logo.png" class="assistant-avatar-img" alt="assistant" />
      </div>
      <div class="chat-bubble-wrapper" :class="message.role === 'user' ? 'align-end' : 'align-start'">
        <div class="chat-bubble" :class="message.role === 'user' ? 'user-bubble' : 'assistant-bubble'">
          <details v-if="message.role === 'assistant' && message.reasoningContent" class="reasoning-panel">
            <summary class="reasoning-title">思考过程</summary>
            <div class="reasoning-content">{{ message.reasoningContent }}</div>
          </details>
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
                <img class="attachment-card-icon" :src="getAttachmentIcon(item.name)" alt="file" />
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
import { computed, watch } from 'vue'
import { useUserStore } from '@/store/user'
import fileNull from '@/images/file-null.png'
import filePdf from '@/images/file-pdf.png'
import fileDoc from '@/images/file-doc.png'
import fileXls from '@/images/file-xls.png'
import filePpt from '@/images/file-ppt.png'
import fileTxt from '@/images/file-txt.png'

const fileIconMap: Record<string, string> = {
  'pdf': filePdf,
  'doc': fileDoc,
  'docx': fileDoc,
  'xls': fileXls,
  'xlsx': fileXls,
  'ppt': filePpt,
  'pptx': filePpt,
  'txt': fileTxt
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  reasoningContent?: string
  isThinking?: boolean
  attachments?: Array<{
    type: string
    name: string
    size: number
  }>
}

const props = withDefaults(defineProps<{
  message?: Message
  thinkingText?: string
  showAttachments?: boolean
  attachmentStatus?: string
}>(), {
  message: undefined,
  thinkingText: '正在思考中...',
  showAttachments: true,
  attachmentStatus: '解析完成'
})

import { chatLog as log } from '@/utils/logManage'

const userStore = useUserStore()

const userAvatarFirstChar = computed(() => {
  return (userStore.userInfo?.username || '?').charAt(0).toUpperCase()
})

const userAvatarBg = computed(() => {
  const role = userStore.userInfo?.role
  switch (role) {
    case 'SUPER_ADMIN': return '#F3E8FF'
    case 'SCHOOL_ADMIN': return '#FFF7E6'
    case 'TEACHER': return '#DBEAFE'
    case 'STUDENT': return '#D6F7CF'
    case 'PARENT': return '#E0F2FE'
    default: return '#B4BDFF'
  }
})

const userAvatarColor = computed(() => {
  const role = userStore.userInfo?.role
  switch (role) {
    case 'SUPER_ADMIN': return '#8B5CF6'
    case 'SCHOOL_ADMIN': return '#FF9500'
    case 'TEACHER': return '#3B82F6'
    case 'STUDENT': return '#10B981'
    case 'PARENT': return '#0284C7'
    default: return '#FFFFFF'
  }
})

// 监听message变化
watch(() => props.message, (newMsg) => {
  if (!newMsg) return
  log('收到新message:', {
    role: newMsg.role,
    content: newMsg.content,
    isThinking: newMsg.isThinking
  })
}, { deep: true, immediate: true })

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

const getAttachmentIcon = (fileName: string): string => {
  if (!fileName) return fileNull
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  return fileIconMap[ext] || fileNull
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
