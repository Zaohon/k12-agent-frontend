<template>
  <div class="chat-init-container">
    <div class="chat-init-box">
      <div class="init-icon-wrapper">
        <ChatDotSquare style="font-size: 60px; color: #314de2;" />
      </div>
      <h2 class="init-title">开始您的教学对话</h2>
      <p class="init-desc">
        点击左侧「新建对话」或选择历史记录，开启与 AI 助教的专业交流
      </p>
    </div>
  </div>
</template>

<script setup>
import { ChatDotSquare } from '@element-plus/icons-vue'
</script>

<style scoped>
.chat-init-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.chat-init-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  max-width: 480px;
}

.init-icon-wrapper {
  width: 120px;
  height: 120px;
  background: rgba(49, 77, 226, 0.05);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.init-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.init-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}
</style>