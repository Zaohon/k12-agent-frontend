<template>
  <div class="chat-content-container">
    <!-- 头部 -->
    <header class="chat-header">
      <div class="flex items-center space-x-3">
        <div v-if="agentInfo" class="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
          <el-icon><component :is="agentInfo.iconUrl || 'MagicStick'" /></el-icon>
        </div>
        <div v-else class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
          <el-icon><Cpu /></el-icon>
        </div>
        <h2 class="font-bold text-gray-800 text-lg">
          {{ agentId ? (agentInfo?.title || '正在加载智能体...') : (activeSession?.topic || '通用智能问答') }}
        </h2>
      </div>
    </header>

    <!-- 消息区域 -->
    <div class="chat-message-wrap" ref="msgContainer">
      <div v-if="agentId && messages.length === 0" class="max-w-3xl mx-auto py-10 text-center">
        <div class="w-20 h-20 rounded-3xl bg-blue-50 mx-auto flex items-center justify-center text-4xl text-primary mb-6">
          <el-icon><component :is="agentInfo?.iconUrl || 'MagicStick'" /></el-icon>
        </div>
        <h1 class="text-2xl font-black text-gray-800 mb-3">{{ agentInfo?.title }}</h1>
        <p class="text-gray-500 mb-8 max-w-lg mx-auto">{{ agentInfo?.description || '暂无详细介绍' }}</p>
        <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic text-sm text-gray-600">
          {{ agentInfo?.welcomeMsg || '您好！我是您的专属辅教助手，请在右侧填写参数后开始对话。' }}
        </div>
      </div>

      <div v-if="!agentId && messages.length === 0" class="empty-chat-tip">
        <el-icon :size="80"><ChatDotSquare /></el-icon>
        <p class="mt-4 text-sm font-medium">输入您想问的任何教育问题</p>
      </div>

      <div v-for="(msg, idx) in messages" :key="idx" class="chat-message-row" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
        <div class="chat-message-box" :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
          <div class="chat-avatar" :class="msg.role === 'user' ? 'user-avatar' : 'assistant-avatar'">
            <el-icon class="text-white" v-if="msg.role === 'user'"><User /></el-icon>
            <el-icon class="text-gray-600" v-else><Monitor /></el-icon>
          </div>
          <div class="chat-bubble" :class="msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'">
            <pre class="whitespace-pre-wrap font-sans">{{ msg.content }}</pre>
          </div>
        </div>
      </div>

      <div v-if="isStreaming" class="streaming-loading">
        <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mr-2 animate-pulse">
          <el-icon><Monitor /></el-icon>
        </div>
        <el-tag type="info" class="animate-pulse">正在为您生成最优教学建议...</el-tag>
      </div>
    </div>

    <!-- 底部输入 -->
    <footer class="chat-input-footer">
      <div v-if="agentId" class="mb-4 flex flex-wrap gap-2">
        <el-tag v-for="tag in commonPrompts" :key="tag" class="cursor-pointer" hit @click="inputVal = tag">{{ tag }}</el-tag>
      </div>

      <div class="chat-input-inner">
        <el-input 
          v-model="inputVal" 
          type="textarea" 
          :rows="1" 
          autosize
          placeholder="请输入您的问题（按 Enter 发送...）" 
          class="chat-textarea"
          @keydown.enter.prevent="handleSend"
        />
        <el-button 
          type="primary" 
          :icon="Promotion" 
          circle 
          class="mb-1 mr-1" 
          :disabled="!inputVal.trim() || isStreaming" 
          @click="handleSend"
        />
      </div>
      <p class="text-center text-[10px] text-gray-400 mt-4">Powered by K12 Agent Cloud | 内容由 AI 生成，请注意甄别</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
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

// 🔥 修复：本地变量，不直接修改 prop
const inputVal = ref(props.userInput || '')

watch(() => props.userInput, (val) => {
  inputVal.value = val
})

const handleSend = () => {
  emit('sendMessage', inputVal.value)
  inputVal.value = ''
}
</script>

<style scoped>
.chat-content-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  height: 64px;
  padding: 0 32px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(12px);
  z-index: 10;
}

.chat-message-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 24px 40px;
  scroll-behavior: smooth;
}

.empty-chat-tip {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.3;
}

.chat-message-row {
  display: flex;
  width: 100%;
  margin-bottom: 24px;
}

.chat-message-box {
  display: flex;
  max-width: 85%;
  align-items: flex-start;
}

.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.user-avatar {
  background: #3B82F6;
  margin-left: 12px;
}

.assistant-avatar {
  background: #F3F4F6;
  margin-right: 12px;
}

.chat-bubble {
  padding: 16px;
  border-radius: 20px;
  font-size: 14px;
  line-height: 1.6;
}

.user-bubble {
  background: #3B82F6;
  color: #fff;
  border-top-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(59,130,246,0.15);
}

.assistant-bubble {
  background: #F9FAFB;
  color: #111827;
  border-top-left-radius: 4px;
  border: 1px solid rgba(173,178,185,0.1);
}

.streaming-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.chat-input-footer {
  padding: 24px 40px;
  border-top: 1px solid #E5E7EB;
  background: #fff;
}

.chat-input-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  background: #F9FAFB;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid rgba(173,178,185,0.2);
}

.chat-textarea :deep(.el-textarea__inner) {
  background: transparent;
  border: none;
  box-shadow: none;
  color: #374151;
  padding: 12px;
}
</style>