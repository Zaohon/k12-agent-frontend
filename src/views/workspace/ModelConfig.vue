<template>
  <div class="h-full w-full bg-gray-50 flex overflow-hidden p-12">
    <div class="max-w-4xl mx-auto w-full">
      <div class="mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center">
            <el-icon class="mr-3 text-primary"><Setting /></el-icon>
            模型与接口配置
          </h1>
          <p class="text-gray-500 mt-2 text-sm">配置 AI 模型的接口地址、密钥及相关参数。</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <el-form :model="form" label-width="120px" label-position="left">
          <el-form-item label="模型类型">
            <el-select v-model="form.modelType" placeholder="请选择模型类型" style="width: 100%">
              <el-option label="GPT-4" value="gpt-4" />
              <el-option label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
              <el-option label="Claude 3" value="claude-3" />
              <el-option label="智谱 GLM-4" value="glm-4" />
              <el-option label="百度 ERNIE-4" value="ernie-4" />
            </el-select>
          </el-form-item>

          <el-form-item label="接口地址">
            <el-input v-model="form.apiBase" placeholder="https://api.openai.com/v1" />
          </el-form-item>

          <el-form-item label="API Key">
            <el-input v-model="form.apiKey" type="password" placeholder="sk-xxxxxxxxxxxxxxxx" show-password />
          </el-form-item>

          <el-form-item label="默认模型">
            <el-input v-model="form.defaultModel" placeholder="gpt-4" />
          </el-form-item>

          <el-form-item label="最大 Token">
            <el-input-number v-model="form.maxTokens" :min="100" :max="100000" style="width: 100%" />
          </el-form-item>

          <el-form-item label="温度参数">
            <el-slider v-model="form.temperature" :min="0" :max="2" :step="0.1" show-input />
          </el-form-item>

          <el-form-item label="超时设置(秒)">
            <el-input-number v-model="form.timeout" :min="10" :max="300" style="width: 100%" />
          </el-form-item>

          <el-form-item label="启用状态">
            <el-switch v-model="form.enabled" />
          </el-form-item>
        </el-form>

        <div class="mt-6 flex justify-end gap-4">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const saving = ref(false)

const form = ref({
  modelType: 'gpt-4',
  apiBase: 'https://api.openai.com/v1',
  apiKey: '',
  defaultModel: 'gpt-4',
  maxTokens: 50000,
  temperature: 0.7,
  timeout: 120,
  enabled: true
})

const resetForm = () => {
  form.value = {
    modelType: 'gpt-4',
    apiBase: 'https://api.openai.com/v1',
    apiKey: '',
    defaultModel: 'gpt-4',
    maxTokens: 50000,
    temperature: 0.7,
    timeout: 120,
    enabled: true
  }
  ElMessage.info('已重置表单')
}

const handleSave = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('配置保存成功')
  } catch {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}
</script>
