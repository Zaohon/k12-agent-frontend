<template>
  <!-- 系统设置整体容器 -->
  <div class="system-settings">
    <!-- 主工作区 -->
    <div class="settings-workspace">
      <!-- 头部标题区域 -->
      <div class="settings-header">
        <div class="header-left">
          <h2 class="heading-title">模型与接口</h2>
          <p class="heading-desc">管理系统核心模型与接口通讯参数</p>
        </div>
        <button class="primary-btn">
          <img src="@/images/save-white.png" class="btn-icon" />
          <span>保存设置</span>
        </button>
      </div>

      <!-- 内容卡片区域 -->
      <div class="settings-content">
        <!-- 模型设置卡片 -->
        <div class="settings-card">
          <div class="card-header">
            <h3 class="card-title">默认模型设置</h3>
          </div>
          <div class="card-body">
            <label class="form-label">默认推理模型</label>
            <input class="model-input" type="text" placeholder="请输入模型名称" value="qwen3.6-plus" />
            <p class="form-tip">选择用于处理任务的主力大语言模型。</p>
          </div>
        </div>

        <!-- API 配置卡片 -->
        <div class="settings-card">
          <div class="card-header">
            <h3 class="card-title">API 配置</h3>
          </div>
          <div class="card-body">
            <label class="form-label">请求 URL (Base URL)</label>
            <input class="input-box" type="text" value="https://api.xiaolongai.com/v1" />

            <label class="form-label mt-20">API Key</label>
            <div class="input-box input-key">
              <div class="key-content">
                <img src="@/images/key.png" class="key-icon" />
                <input 
                  class="key-input" 
                  :type="showKey ? 'text' : 'password'" 
                  :value="apiKey"
                  placeholder="请输入API Key"
                  @input="apiKey = $event.target.value"
                />
              </div>
              <img 
                :src="showKey ? isVisable : unVisable" 
                class="eye-icon" 
                @click="showKey = !showKey"
              />
            </div>
            <div class="warning-tip">
              <img :src="warnIcon" class="warning-icon" />
              请妥善保管您的密钥，切勿轻易暴露。
            </div>
          </div>
        </div>

        <!-- 高级参数卡片 -->
        <div class="settings-card">
          <div class="card-header">
            <h3 class="card-title">高级参数</h3>
          </div>
          <div class="card-body">
            <div class="token-row">
              <label class="form-label">组织最大 Token 限制</label>
              <div class="token-input-wrapper">
                <img :src="tokenIcon" class="token-icon" />
                <input class="token-input" type="text" value="4096" />
              </div>
            </div>

            <div class="divider"></div>

            <div class="timeout-section">
              <label class="form-label">请求超时时间</label>
              <div class="timeout-row">
                <input class="timeout-input" type="text" value="60" />
                <span class="timeout-unit">秒</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="form-row switch-row">
              <div class="switch-btn" @click="contextMemory = !contextMemory">
                <div class="switch-bg" :class="{ active: contextMemory }"></div>
                <div class="switch-circle" :class="{ active: contextMemory }"></div>
              </div>
              <label class="form-label">启用上下文记忆</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import isVisable from '@/images/is-visable.png'
import unVisable from '@/images/un-visable.png'
import warnIcon from '@/images/warn.png'
import tokenIcon from '@/images/token-icon.png'

const apiKey = ref('')
const showKey = ref(false)
const contextMemory = ref(true)
</script>

<style scoped>
.system-settings {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: auto;
  padding: 0;
  gap: 0;
  width: 100%;
  background: #f2f4f8;
}

.settings-workspace {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px;
  gap: 30px;
  width: 100%;
  min-height: 100vh;
}

.settings-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  gap: 20px;
  width: 100%;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: 4px;
  min-width: 200px;
}

.heading-title {
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
  letter-spacing: -0.6px;
  color: #2e3339;
  white-space: nowrap;
}

.heading-desc {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #5a6066;
  white-space: nowrap;
}

.primary-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 24px;
  gap: 8px;
  min-width: 135px;
  height: 44px;
  background: linear-gradient(135deg, #314de2 0%, #6144d3 100%);
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  color: #faf8ff;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  white-space: nowrap;
}

.btn-icon {
  width: 15px;
  height: 15px;
  object-fit: contain;
}

.settings-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: 20px;
  width: 100%;
}

.settings-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 24px;
  gap: 24px;
  width: 100%;
  background: #ffffff;
  border: 1px solid rgba(173, 178, 185, 0.3);
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 12px;
  width: 100%;
}

.card-title {
  font-weight: 600;
  font-size: 18px;
  line-height: 28px;
  color: #2e3339;
}

.card-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #5a6066;
}

.form-tip {
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #767b82;
}

.model-input {
  box-sizing: border-box;
  padding: 8px 12px;
  max-width: 360px;
  min-width: 200px;
  width: 100%;
  height: 38px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #2e3339;
  outline: none;
}

.model-input::placeholder {
  color: #94a3b8;
}

.input-box {
  box-sizing: border-box;
  padding: 12px 16px;
  max-width: 645px;
  width: 100%;
  height: 38px;
  background: #f8f9fd;
  border: 1px solid rgba(173, 178, 185, 0.5);
  border-radius: 8px;
  font-size: 14px;
  color: #2e3339;
  outline: none;
}

.input-key {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  width: 100%;
}

.key-content {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  min-width: 0;
}

.key-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
}

.key-input {
  flex: 1;
  height: 26px;
  background: transparent;
  border: none;
  font-size: 14px;
  color: #2e3339;
  outline: none;
}

.eye-icon {
  width: 20px;
  height: 18px;
  object-fit: contain;
  cursor: pointer;
  flex-shrink: 0;
}

.warning-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  line-height: 16px;
  color: #d0435f;
  flex-wrap: wrap;
}

.warning-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
  flex-shrink: 0;
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 20px;
  flex-wrap: wrap;
}

.divider {
  width: 100%;
  height: 1px;
  background: rgba(173, 178, 185, 0.2);
  margin: 16px 0;
}

.switch-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1%;
  flex-wrap: wrap;
}

.switch-btn {
  width: 44px;
  height: 24px;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
}

.switch-bg {
  width: 44px;
  height: 24px;
  background: #d1d5db;
  border-radius: 9999px;
  position: absolute;
  transition: background 0.2s ease;
}

.switch-bg.active {
  background: #314de2;
}

.switch-circle {
  position: absolute;
  width: 16px;
  height: 16px;
  left: 4px;
  top: 4px;
  background: #ffffff;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 9999px;
  transition: left 0.2s ease;
}

.switch-circle.active {
  left: 24px;
}

.mt-20 {
  margin-top: 20px;
}

.token-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  gap: 5%;
}

.token-row .form-label {
  text-align: right;
}

.token-input-wrapper {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  max-width: 200px;
  height: 38px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  gap: 8px;
}

.token-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
}

.token-input {
  flex: 1;
  height: 22px;
  background: transparent;
  border: none;
  font-size: 14px;
  color: #314DE2;
  outline: none;
  text-align: right;
  min-width: 0;
  padding-right: 5%;
}

.timeout-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: fit-content;
}

.timeout-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeout-input {
  padding: 8px 12px;
  width: 100px;
  height: 38px;
  background: #f8f9fd;
  border: 1px solid rgba(173, 178, 185, 0.5);
  border-radius: 8px;
  font-size: 14px;
  color: #2e3339;
  outline: none;
  text-align: center;
}

.timeout-unit {
  font-size: 14px;
  color: #5a6066;
}
</style>
