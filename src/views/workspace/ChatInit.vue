<template>
  <div class="main-content-right">
    <!-- 背景装饰层 -->
    <div class="content-bg"></div>
    <div class="blur-circle top-right"></div>
    <div class="blur-circle bottom-left"></div>

    <!-- 问候区域 -->
    <div class="greeting-wrapper">
      <h1 class="main-title">
        你好，我是
        <span class="purple-text">小龙助教</span>
      </h1>
      <p class="sub-title">今天我能帮您完成哪些教学任务？</p>
    </div>

    <!-- 中央聊天输入区域 -->
    <div class="input-wrapper">
      <div class="input-container" :class="{ focused: isFocused }">
        <div class="input-glow"></div>
        <div class="input-body">
          <div
            ref="textareaRef"
            class="textarea"
            contenteditable
            placeholder="输入您的指令，例如：生成一份初中物理《重力》的教案..."
            @keydown.enter.prevent="handleEnter"
            @focus="isFocused = true"
            @blur="isFocused = false"
          ></div>
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
              <div v-if="isRecording" class="icon-btn recording-btn" @click="stopRecording">
                <div class="recording-indicator"></div>
              </div>
              <el-dropdown v-else trigger="click" @command="handleAudioCommand">
                <button class="icon-btn">
                  <img src="@/images/chatinit-vedio.png" alt="音频" />
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="record">
                      <span>录音</span>
                    </el-dropdown-item>
                    <el-dropdown-item command="upload">
                      <span>上传音频</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <button class="icon-btn" @click="handleImageClick">
                <img src="@/images/chatinit-img.png" alt="图片" />
              </button>
            </div>
            <button
              class="send-btn"
              :disabled="isLoading"
              @click="handleSend"
            >
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import chatinit1 from '@/images/chatinit-1.png'
import chatinit2 from '@/images/chatinit-2.png'
import chatinit3 from '@/images/chatinit-3.png'
import chatinit4 from '@/images/chatinit-4.png'
import { useAttachment } from '@/hooks/useAttachment'

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

const { attachments, isRecording, uploadImage, uploadVideo, uploadAudioFile, uploadFile, addLink, startRecording, stopRecording, clearAttachments, getAttachmentSummary, removeAttachment, getAttachmentIcon } = useAttachment()

const textareaRef = ref(null)
const isLoading = ref(false)
const isFocused = ref(false)

const emit = defineEmits(['sendMessage'])

const handleFileUpload = () => {
  uploadFile()
}

const handleAudioCommand = (command) => {
  if (command === 'record') {
    if (isRecording.value) {
      stopRecording()
    } else {
      startRecording()
    }
  } else if (command === 'upload') {
    uploadAudioFile()
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
    // 允许 Ctrl+Enter 换行
    return
  }
  e.preventDefault()
  handleSend()
}

const handleSend = async () => {
  const content = getTextareaContent()
  if (!content) {
    ElMessage.warning('请输入内容')
    return
  }

  isLoading.value = true
  
  try {
    // 通知父组件创建会话并发送消息
    emit('sendMessage', content)
    clearTextarea()
  } catch (error) {
    console.error('发送消息失败:', error)
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

/* 主容器：全屏自适应 */
.main-content-right {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: clamp(60px, 12vw, 149px) 24px;
  gap: 44px;
  background: #f8f9fd;
  z-index: 1;
}

/* 模糊装饰 */
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
}
.top-right {
  width: clamp(300px, 40vw, 500px);
  height: clamp(300px, 40vw, 500px);
  right: -10%;
  top: -15%;
  background: rgba(49, 77, 226, 0.2);
  filter: blur(60px);
}
.bottom-left {
  width: clamp(240px, 32vw, 400px);
  height: clamp(240px, 32vw, 400px);
  left: -8%;
  bottom: -12%;
  background: rgba(97, 68, 211, 0.2);
  filter: blur(50px);
}


/* 标题区域 */
.greeting-wrapper {
  width: 100%;
  max-width: 840px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}
.main-title {
  font-weight: 700;
  font-size: clamp(28px, 5vw, 40px);
  line-height: 1.2;
  letter-spacing: -1.2px;
  color: #2e3339;
  white-space: nowrap;
}
/* 小龙助教紫色 */
.purple-text {
  color: #6144D3;
}
.sub-title {
  font-weight: 500;
  font-size: clamp(16px, 2.5vw, 18px);
  line-height: 28px;
  color: #5a6066;
}

/* 输入框区域 */
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
  inset: -4px;
  background: linear-gradient(90deg, #314de2 0%, #6144d3 100%);
  opacity: 0.1;
  filter: blur(4px);
  border-radius: 16px;
  z-index: 0;
}
.input-body {
  position: relative;
  width: 100%;
  background: #fff;
  border: 2px solid transparent;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(49, 77, 226, 0.05),
    0 8px 10px -6px rgba(49, 77, 226, 0.05);
  overflow: hidden;
  z-index: 1;
  transition: all 0.3s ease;
}
.input-container.focused .input-body {
  border-color: #E6DEFF;
  box-shadow: 0px 10px 25px -5px #C7D2FE, 0px 8px 10px -6px #C7D2FE;
}
.textarea {
  width: 100%;
  min-height: 128px;
  max-height: 200px;
  padding: 20px 24px;
  font-size: 18px;
  color: #2e3339;
  outline: none;
  overflow-y: auto;
  resize: none;
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
  padding: 8px 14px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
}
.attachment-icon {
  font-size: 16px;
}
.attachment-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.attachment-remove {
  cursor: pointer;
  color: #94A3B8;
  font-size: 16px;
  line-height: 1;
  margin-left: 4px;
}
.attachment-remove:hover {
  color: #D0435F;
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
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
.recording-btn {
  background: transparent;
}
.recording-indicator {
  width: 14px;
  height: 14px;
  background: #D0435F;
  border-radius: 2px;
}
.send-btn {
  padding: 8px 24px;
  background: linear-gradient(111.41deg, #314de2, #6144d3);
  border-radius: 12px;
  border: none;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

/* 卡片区域 */
.cards-container {
  width: 100%;
  max-width: 860px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}
.card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 12px 40px rgba(49, 77, 226, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.card-icon {
  width: 48px;
  height: 48px;
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

/* 图片图标 */
.icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  color: #2e3339;
  line-height: 28px;
}
.card-desc {
  font-size: 14px;
  color: #5a6066;
  line-height: 1.6;
}

/* 底部 */
.footer {
  width: 100%;
  max-width: 600px;
  font-size: 10px;
  line-height: 20px;
  color: rgba(90, 96, 102, 0.5);
  text-align: center;
  margin-top: 20px;
}
</style>