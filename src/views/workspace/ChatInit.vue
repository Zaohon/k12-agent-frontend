<template>
  <div class="main-content-right">
    <!-- 背景装饰层 -->
    <div class="content-bg"></div>
    <div class="blur-circle top-right"></div>
    <div class="blur-circle bottom-left"></div>

    <!-- 问候区域 - 普通模式 -->
    <div v-if="!agentInfo" class="greeting-wrapper">
      <h1 class="main-title">
        你好，我是
        <span class="purple-text">小龙助教</span>
      </h1>
      <p class="sub-title">今天我能帮您完成哪些教学任务？</p>
    </div>
    <!-- 问候区域 - 智能体模式 -->
    <div v-else class="agent-header">
      <div class="avatar-root">
        <div class="avatar-bg">
          <img v-if="agentInfo.iconUrl" :src="agentInfo.iconUrl" class="avatar-image" alt="avatar" />
          <div v-else class="avatar-vector"></div>
        </div>
      </div>

      <div class="info-container">
        <div class="name-row">
          <div class="heading3">
            <span class="title-text">{{ agentInfo.title || '智能体' }}</span>
          </div>
        </div>

        <div class="tag-group">
          <template v-if="agentInfo">
            <div v-for="item in capabilityOptions" :key="item.key" v-show="agentInfo[item.key]" class="tag-btn"
              :class="item.colorClass">
              <div class="tag-icon-wrapper" :style="{ backgroundColor: item.bgColor }">
                <img :src="item.image" class="tag-img" :alt="item.alt" />
              </div>
              <span class="tag-text">{{ item.label }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 中央聊天输入区域 -->
    <div class="input-wrapper">
      <div class="input-container" :class="{ focused: isFocused }">
        <div class="input-glow"></div>
        <div class="input-body">
          <div ref="textareaRef" class="textarea" contenteditable placeholder="输入您的指令，例如：生成一份初中物理《重力》的教案..."
            @keydown.enter.prevent="handleEnter" @focus="isFocused = true" @blur="isFocused = false"></div>
          <div v-if="attachments.length > 0" class="attachments-wrapper">
            <div v-for="(item, index) in attachments" :key="index" class="attachment-card">
              <span class="attachment-icon">{{ getAttachmentIcon(item.type) }}</span>
              <span class="attachment-name">{{ item.name || '附件' }}</span>
              <span class="attachment-remove" @click="removeAttachment(index)">×</span>
            </div>
          </div>
          <div class="input-bar">
            <div class="left-icons">
              <button class="icon-btn" @click="handleFileUpload">
                <img src="@/images/chatinit-link.png" alt="上传附件" />
              </button>
              <button 
                class="icon-btn" 
                :class="{ 'recording-btn': isRecording }" 
                @click="handleVoiceClick"
                :disabled="voiceProcessing"
              >
                <img v-if="!isRecording" src="@/images/chatinit-vedio.png" alt="音频" />
                <div v-else class="recording-indicator"></div>
              </button>
            </div>
            <button class="send-btn" :disabled="isLoading" @click="handleSend">
              {{ isLoading ? '处理中...' : '发送' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷功能卡片 -->
    <div class="cards-container">
      <div class="card" v-for="(item, index) in cards" :key="index">
        <div class="card-icon" :class="item.color">
          <img :src="item.icon" class="icon-img" alt />
        </div>
        <h3 class="card-title">{{ item.title }}</h3>
        <p class="card-desc">{{ item.desc }}</p>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="footer">
      生成的所有内容均由人工智能模型生成，其生成内容的准确性和完整性无法保证，不代表我们的态度或观点。
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import chatinit1 from '@/images/chatinit-1.png'
import chatinit2 from '@/images/chatinit-2.png'
import chatinit3 from '@/images/chatinit-3.png'
import chatinit4 from '@/images/chatinit-4.png'
import { useAttachment } from '@/hooks/useAttachment'
import { chatLogError } from '@/utils/logManage'
import { chatApi } from '@/api/api'

// 录音相关变量
let mediaRecorder = null
let audioChunks = []
const voiceProcessing = ref(false)

const props = defineProps({
  agentInfo: {
    type: Object,
    default: null
  }
})

watch(() => props.agentInfo, (newVal) => {
  console.log('[ChatInit] agentInfo changed:', newVal)
}, { immediate: true })

const capabilityOptions = [
  {
    key: 'enableWebSearch',
    label: '联网搜索',
    bgColor: '#DBEAFE',
    colorClass: 'blue',
    image: new URL('@/images/internal-blue.png', import.meta.url).href,
    alt: 'web'
  },
  {
    key: 'enableWebParse',
    label: '网页解析',
    bgColor: '#BEEBEE',
    colorClass: 'green',
    image: new URL('@/images/web-read.png', import.meta.url).href,
    alt: 'parse'
  },
  {
    key: 'enableDeepThink',
    label: '深度思考',
    bgColor: '#F3E8FF',
    colorClass: 'purple',
    image: new URL('@/images/think.png', import.meta.url).href,
    alt: 'deep'
  },
  {
    key: 'enableFileUpload',
    label: '文档上传',
    bgColor: '#FFF7ED',
    colorClass: 'orange',
    image: new URL('@/images/upload-file.png', import.meta.url).href,
    alt: 'file'
  },
  {
    key: 'enableKnowledgeBase',
    label: '知识库',
    bgColor: '#D6F7CF',
    colorClass: 'light-green',
    image: new URL('@/images/database-green.png', import.meta.url).href,
    alt: 'kb'
  }
]

const cards = ref([
  {
    title: '教案生成',
    desc: '快速生成符合大纲要求的详细教学方案。',
    color: 'blue',
    icon: chatinit1,
  },
  {
    title: '课件生成',
    desc: '智能排版与内容生成，一键导出精品课件。',
    color: 'purple',
    icon: chatinit2,
  },
  {
    title: 'AI 出题',
    desc: '根据知识点自动生成多难度等级试题。',
    color: 'blue',
    icon: chatinit3,
  },
  {
    title: '演讲稿',
    desc: '适用于开学典礼、家长会等多种教育场景。',
    color: 'purple',
    icon: chatinit4,
  },
])

const { attachments, isRecording, uploadImage, uploadVideo, uploadFile, addLink, clearAttachments, getAttachmentSummary, removeAttachment, getAttachmentIcon } = useAttachment()

const textareaRef = ref(null)
const isLoading = ref(false)
const isFocused = ref(false)

const emit = defineEmits(['sendMessage'])

const handleFileUpload = () => {
  uploadFile()
}

const handleVoiceClick = () => {
  if (voiceProcessing.value) {
    ElMessage.warning('正在处理语音，请稍候...')
    return
  }

  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = function(e) {
      if (e.data.size > 0) {
        audioChunks.push(e.data)
      }
    }

    mediaRecorder.onstop = function() {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      processAudio(audioBlob)
      stream.getTracks().forEach(function(track) {
        track.stop()
      })
    }

    mediaRecorder.start()
    isRecording.value = true
    ElMessage.info('正在录音，再次点击停止')
  } catch (error) {
    console.error('获取麦克风权限失败:', error)
    ElMessage.error('无法获取麦克风权限，请检查浏览器设置')
  }
}

const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    isRecording.value = false
  }
}

const processAudio = async (audioBlob) => {
  voiceProcessing.value = true
  try {
    ElMessage.info('正在处理语音...')
    const res = await chatApi.voiceToText(audioBlob, 'zh')
    if (res.success && res.data && res.data.text) {
      if (textareaRef.value) {
        textareaRef.value.innerText = res.data.text
      }
      ElMessage.success('语音转文字成功')
    } else {
      ElMessage.error(res.message || '语音转文字失败')
    }
  } catch (error) {
    console.error('语音转文字失败:', error)
    ElMessage.error('语音转文字失败，请重试')
  } finally {
    voiceProcessing.value = false
  }
}

const handleImageClick = () => {
  uploadImage()
}

const getTextareaContent = () => {
  return textareaRef.value?.innerText.trim() || ''
}

const clearTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.innerText = ''
  }
}

const handleEnter = (e) => {
  if (e.ctrlKey || e.metaKey) {
    return
  }
  e.preventDefault()
  handleSend()
}

const handleSend = async () => {
  const content = getTextareaContent()
  if (!content && attachments.value.length === 0) {
    ElMessage.warning('请输入内容或上传附件')
    return
  }

  isLoading.value = true

  try {
    const currentAttachments = [...attachments.value]
    emit('sendMessage', { content, attachments: currentAttachments })
    clearTextarea()
    clearAttachments()
  } catch (error) {
    chatLogError('发送消息失败:', error)
    ElMessage.error('发送失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Noto Sans SC', sans-serif;
}

.main-content-right {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: clamp(60px, 10vw, 140px) 16px;
  gap: 40px;
  background: #f8f9fd;
  z-index: 1;
}

.content-bg {
  position: absolute;
  inset: 0;
  background: #f8f9fd;
  z-index: -2;
}

.blur-circle {
  position: absolute;
  border-radius: 50%;
  z-index: -1;
  opacity: 0.2;
}

.top-right {
  width: clamp(200px, 35vw, 400px);
  height: clamp(200px, 35vw, 400px);
  right: -10%;
  top: -15%;
  background: #314de2;
  filter: blur(60px);
}

.bottom-left {
  width: clamp(180px, 30vw, 350px);
  height: clamp(180px, 30vw, 350px);
  left: -8%;
  bottom: -12%;
  background: #6144d3;
  filter: blur(50px);
}

/* 欢迎语 */
.greeting-wrapper {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.main-title {
  font-size: clamp(26px, 5vw, 40px);
  font-weight: 700;
  color: #2e3339;
  white-space: nowrap;
}

.purple-text {
  color: #6144D3;
}

.sub-title {
  font-size: clamp(15px, 2.5vw, 18px);
  color: #5a6066;
}

/* 智能体头部 */
.agent-header {
  width: 100%;
  max-width: 800px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 0 12px;
}

.avatar-root {
  width: 78px;
  height: 78px;
  flex-shrink: 0;
}

.avatar-bg {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24px;
}

.avatar-vector {
  width: 34px;
  height: 34px;
  background: #ccc;
  border-radius: 8px;
}

.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.heading3 {
  display: flex;
  align-items: center;
}

.title-text {
  font-size: clamp(20px, 4vw, 26px);
  font-weight: 500;
  color: #2E3339;
  white-space: nowrap;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #F1F5F9;
  border-radius: 16px;
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-btn.blue { background: #DBEAFE; }
.tag-btn.orange { background: #FFF7ED; }
.tag-btn.green { background: #BEEBEE; }
.tag-btn.purple { background: #F3E8FF; }
.tag-btn.light-green { background: #D6F7CF; }

.tag-icon-wrapper {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.tag-img {
  height: 10px;
  object-fit: contain;
}

.tag-text {
  font-size: 12px;
  color: #334155;
}

/* 输入框 */
.input-wrapper {
  width: 100%;
  max-width: 768px;
}

.input-container {
  position: relative;
  width: 100%;
}

.input-glow {
  position: absolute;
  inset: -3px;
  background: linear-gradient(90deg, #314de2, #6144d3);
  opacity: 0.1;
  filter: blur(4px);
  border-radius: 16px;
}

.input-body {
  position: relative;
  background: #fff;
  border-radius: 16px;
  border: 2px solid transparent;
  box-shadow: 0 10px 20px -8px rgba(49, 77, 226, 0.1);
  overflow: hidden;
  transition: all 0.3s;
}

.input-container.focused .input-body {
  border-color: #E6DEFF;
  box-shadow: 0 10px 25px -6px #C7D2FE;
}

.textarea {
  width: 100%;
  min-height: 120px;
  max-height: 200px;
  padding: 20px 24px;
  font-size: 16px;
  color: #2e3339;
  outline: none;
  overflow-y: auto;
}

.textarea:empty::before {
  content: attr(placeholder);
  color: rgba(90, 96, 102, 0.4);
}

.attachments-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 24px 12px;
}

.attachment-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 13px;
}

.attachment-remove {
  cursor: pointer;
  color: #94A3B8;
}

.input-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(242, 244, 248, 0.3);
}

.left-icons {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
}

.icon-btn img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.recording-indicator {
  width: 14px;
  height: 14px;
  background: #D0435F;
  border-radius: 2px;
}

.send-btn {
  padding: 8px 20px;
  background: linear-gradient(110deg, #314de2, #6144d3);
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  border: none;
  cursor: pointer;
}

/* 卡片 */
.cards-container {
  width: 100%;
  max-width: 800px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(49, 77, 226, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon.blue {
  background: rgba(49, 77, 226, 0.1);
}
.card-icon.purple {
  background: rgba(97, 68, 211, 0.1);
}

.icon-img {
  width: 22px;
  height: 22px;
}

.card-title {
  font-size: 17px;
  font-weight: 500;
  color: #2e3339;
}

.card-desc {
  font-size: 13px;
  color: #5a6066;
  line-height: 1.5;
}

.footer {
  width: 100%;
  max-width: 600px;
  font-size: 11px;
  color: rgba(90, 96, 102, 05);
  text-align: center;
  line-height: 1.5;
}
</style>