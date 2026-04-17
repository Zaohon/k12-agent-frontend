<template>
  <div class="chat-content-container">
    <!-- 头部 -->
    <header class="chat-header">
      <div class="header-left">
        <div v-if="agentInfo" class="agent-avatar">
          <el-icon><component :is="agentInfo.iconUrl || 'MagicStick'" /></el-icon>
        </div>
        <div v-else class="agent-avatar default-avatar">
          <el-icon><Cpu /></el-icon>
        </div>
        <h2 class="header-title">
          {{ agentId ? (agentInfo?.title || '正在加载智能体...') : (activeSession?.topic || '通用智能问答') }}
        </h2>
      </div>
    </header>

    <!-- 消息区域 -->
    <div class="chat-message-wrap" ref="msgContainer">
      <div v-if="agentId && messages.length === 0" class="welcome-card">
        <div class="welcome-icon">
          <el-icon><component :is="agentInfo?.iconUrl || 'MagicStick'" /></el-icon>
        </div>
        <h1 class="welcome-title">{{ agentInfo?.title }}</h1>
        <p class="welcome-desc">{{ agentInfo?.description || '暂无详细介绍' }}</p>
        <div class="welcome-msg">
          {{ agentInfo?.welcomeMsg || '您好！我是您的专属辅教助手。' }}
        </div>
      </div>

      <div v-if="showMessages.length === 0" class="empty-chat-tip">
        <el-icon :size="80" class="empty-icon"><ChatDotSquare /></el-icon>
        <p class="empty-text">输入您想问的任何教育问题</p>
      </div>

      <!-- 有消息时显示对话 -->
      <div v-else v-for="(msg, idx) in showMessages" :key="idx" class="chat-message-row" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
        <div class="chat-message-box" :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
          <div class="chat-avatar" :class="msg.role === 'user' ? 'user-avatar' : 'assistant-avatar'">
            <el-icon class="icon" v-if="msg.role === 'user'"><User /></el-icon>
            <el-icon class="icon" v-else><Monitor /></el-icon>
          </div>
          <div class="chat-bubble" :class="msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'">
            <pre class="message-content">{{ msg.content }}</pre>
          </div>
        </div>
      </div>

      <div v-if="isStreaming" class="streaming-box">
        <div class="stream-avatar">
          <el-icon><Monitor /></el-icon>
        </div>
        <el-tag type="info" class="stream-text">正在为您生成最优教学建议...</el-tag>
      </div>
    </div>

    <!-- 底部输入 -->
    <footer class="chat-input-footer">
      <div v-if="agentId" class="prompt-tags">
        <el-tag v-for="tag in commonPrompts" :key="tag" class="tag-item" hit @click="inputVal = tag">{{ tag }}</el-tag>
      </div>

      <div class="input-wrapper">
        <div class="input-glow"></div>
        <div class="input-body">
          <!-- 左侧功能按钮 -->
          <div class="action-left">
            <button class="icon-btn">
              <img src="/images/chatinit-img.png" alt="图片" />
            </button>
            <button class="icon-btn">
              <img src="/images/chatinit-link.png" alt="链接" />
            </button>
            <button class="icon-btn">
              <img src="/images/chatinit-vedio.png" alt="音频" />
            </button>
          </div>

          <el-input 
            v-model="inputVal" 
            type="textarea" 
            :rows="2" 
            autosize
            placeholder="请输入您的问题（按 Enter 发送...）" 
            class="chat-textarea"
            @keydown.enter.prevent="handleSend"
          />

          <!-- 右侧发送按钮 -->
          <div class="action-right">
            <el-button 
              type="primary" 
              :icon="Promotion" 
              circle 
              class="send-btn" 
              :disabled="!inputVal.trim() || isStreaming" 
              @click="handleSend"
            />
          </div>
        </div>
      </div>

      <p class="copyright">Powered by K12 Agent Cloud | 内容由 AI 生成，请注意甄别</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Cpu, User, Monitor, Promotion, MagicStick, ChatDotSquare } from '@element-plus/icons-vue'

const props = defineProps([
  'agentId',
  'agentInfo',
  'messages',
  'isStreaming',
  'userInput',
  'activeSession',
  'commonPrompts'
])

const emit = defineEmits(['sendMessage'])

const inputVal = ref(props.userInput || '')

watch(() => props.userInput, (val) => {
  inputVal.value = val
})

const handleSend = () => {
  if (!inputVal.value.trim()) return
  emit('sendMessage', inputVal.value)
  inputVal.value = ''
}

//预设对话
const showMessages = computed(() => {
  // 如果父组件已经传了消息，就用真实的
  if (props.messages && props.messages.length > 0) {
    return props.messages
  }
  // 否则返回预设示例
  return [
    {
      role: 'assistant',
      content: '你好！我是K12智能助教，有什么可以帮你的吗？'
    },
    {
      role: 'user',
      content: '初一数学一元一次方程怎么解？'
    },
    {
      role: 'assistant',
      content: '一元一次方程解题步骤：\n1. 去分母（两边同乘分母最小公倍数）\n2. 去括号\n3. 移项（注意变号）\n4. 合并同类项\n5. 系数化为1'
    },
    {
      role: 'user',
      content: '能给我举个例子吗？'
    },
    {
      role: 'assistant',
      content: '例如：2x + 5 = 15\n解：\n2x = 15 - 5\n2x = 10\nx = 5'
    }
  ]
})
</script>

<style scoped>
/* 整体布局 */
.chat-content-container {
  display: flex;
  flex-direction: column;
  height: 95%;
  background: #F8F9FD;
  font-family: 'Noto Sans SC', sans-serif;
}

/* 头部 */
.chat-header {
  height: 68px;
  padding: 0 32px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(12px);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #314DE2, #6144D3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.default-avatar {
  background: #5B6BF1;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: #2E3339;
  margin: 0;
}

/* 消息区域 */
.chat-message-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 16px 32px 8px 32px;
  scroll-behavior: smooth;
}

/* 欢迎卡片 */
.welcome-card {
  max-width: 720px;
  margin: 40px auto;
  text-align: center;
}

.welcome-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  border-radius: 20px;
  background: rgba(49,77,226,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #314DE2;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: #2E3339;
  margin-bottom: 10px;
}

.welcome-desc {
  font-size: 15px;
  color: #5A6066;
  margin-bottom: 24px;
  line-height: 1.6;
}

.welcome-msg {
  padding: 20px;
  background: white;
  border-radius: 16px;
  font-size: 14px;
  color: #5A6066;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}

/* 空状态 */
.empty-chat-tip {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.25;
}

.empty-icon {
  color: #6144D3;
}

.empty-text {
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #5A6066;
}

/* 消息行 */
.chat-message-row {
  display: flex;
  width: 100%;
  margin-bottom: 16px;
}

.justify-end {
  justify-content: flex-end;
}

.justify-start {
  justify-content: flex-start;
}

.chat-message-box {
  display: flex;
  max-width: 70%;
  align-items: flex-start;
  gap: 10px;
}

/* 头像 */
.chat-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar {
  background: linear-gradient(135deg, #314DE2, #5B6BF1);
}

.assistant-avatar {
  background: #FFFFFF;
  border: 1px solid rgba(0,0,0,0.06);
}

.icon {
  font-size: 16px;
}

.user-avatar .icon {
  color: white;
}

/* 气泡 */
.chat-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
  word-break: break-word;
}

.message-content {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
}

.user-bubble {
  background: linear-gradient(135deg, #314DE2, #6144D3);
  color: #fff;
  border-top-right-radius: 6px;
  box-shadow: 0 4px 10px rgba(49,77,226,0.12);
}

.assistant-bubble {
  background: #FFFFFF;
  color: #2E3339;
  border-top-left-radius: 6px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.06);
}

/* 加载中 */
.streaming-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.stream-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.06);
}

.stream-text {
  animation: pulse 1.5s infinite ease-in-out;
  font-size: 13px;
}

@keyframes pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 底部输入 */
.chat-input-footer {
  padding: 16px 48px 24px 48px;
  border-top: 1px solid rgba(0,0,0,0.05);
  background: white;
}

.prompt-tags {
  max-width: 960px;
  margin: 0 auto 12px auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.tag-item:hover {
  background: rgba(49,77,226,0.08);
  border-color: #314DE2;
}

/* 输入框 */
.input-wrapper {
  position: relative;
  max-width: 960px;
  margin: 0 auto;
}

.input-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(90deg, #314DE2, #6144D3);
  opacity: 0.1;
  filter: blur(6px);
  border-radius: 20px;
  z-index: 0;
}

.input-body {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: white;
  border-radius: 18px;
  border: 1px solid rgba(49,77,226,0.15);
  padding: 12px 16px;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(49,77,226,0.08);
}

.action-left {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
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
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(49,77,226,0.08);
}

.icon-btn img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.chat-textarea {
  flex: 1;
}

.chat-textarea :deep(.el-textarea__inner) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 14px;
  color: #2E3339;
  padding: 8px 12px;
  min-height: 50px;
  line-height: 1.5;
}

.action-right {
  padding-bottom: 4px;
}

.send-btn {
  flex-shrink: 0;
  background: linear-gradient(135deg, #314DE2, #6144D3) !important;
  border: none;
  width: 36px;
  height: 36px;
}

/* 底部版权 */
.copyright {
  text-align: center;
  font-size: 10px;
  color: rgba(90,96,102,0.5);
  margin-top: 12px;
}
</style>