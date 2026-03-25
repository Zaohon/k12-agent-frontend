<template>
  <div class="flex-1 flex overflow-hidden w-full h-full">
    <!-- Main Chat Flow (Left side) -->
    <main class="flex-1 bg-white flex flex-col relative border-r border-gray-200">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h2 class="font-bold text-lg text-gray-800"> {{ agentInfo?.title || '参数生成工作坊' }} </h2>
        <el-tag v-if="agentInfo" type="success" effect="plain">{{ agentInfo.visibility === 'PUBLIC' ? '公开可用' : '私有可见' }}</el-tag>
      </div>

      <div class="flex-1 overflow-y-auto p-8 space-y-6" id="chat-stream-container" v-loading="loadingData">
        <!-- System Welcome Message -->
        <div class="flex justify-start">
          <div class="flex items-start max-w-2xl">
            <el-avatar class="mr-3 mt-1 bg-gradient-to-br from-blue-500 to-indigo-500 text-white shrink-0">
              <el-icon><component :is="agentInfo?.iconUrl || 'Document'" /></el-icon>
            </el-avatar>
            <div class="bg-blueLight p-4 rounded-2xl rounded-tl-sm text-gray-800 text-sm shadow-sm leading-relaxed whitespace-pre-line">
              {{ agentInfo?.welcomeMsg || '🎉 欢迎！请在右侧面板填写我所需要的专业背景参数，然后点击底部的【开始生成】，剩下的所有繁重工作就交给我吧！' }}
            </div>
          </div>
        </div>

        <!-- Generated Output Messages -->
        <div class="flex justify-start" v-if="outputMessage || generating">
          <div class="flex items-start max-w-full w-full">
            <el-avatar class="mr-3 mt-1 bg-primary text-white shrink-0">AI</el-avatar>
            <div 
              class="w-full max-w-3xl bg-white border border-gray-100 p-6 rounded-2xl rounded-tl-sm text-gray-800 shadow-sm leading-relaxed overflow-x-auto"
            >
              <div class="markdown-body" v-html="formattedOutput" v-if="outputMessage"></div>
              <div v-else class="flex items-center text-gray-400 space-x-2">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>AI 正在飞速思考并撰写中...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Right Configuration Form (Right side) -->
    <aside class="w-80 bg-gray-50 flex flex-col overflow-y-auto shrink-0 border-l border-gray-200">
      <div class="p-6 flex flex-col">
        <span class="font-bold text-gray-700 text-lg mb-1 flex items-center">
          <el-icon class="mr-1"><Setting /></el-icon> 向导表单设定
        </span>
        <span class="text-xs text-gray-400 mb-6 border-b border-gray-200 pb-4">准确填写可以极大提升模型的输出质量</span>

        <el-form label-position="top" @submit.prevent>
          <div v-if="formSchema.length === 0 && !loadingData" class="text-sm text-gray-400 text-center py-10">
            该应用未配置特定的向导参数
          </div>
          <div v-for="field in formSchema" :key="field.key" class="mb-4">
            <el-form-item :label="field.label">
              <template #label>
                <span class="font-medium text-gray-700">{{ field.label }}</span>
                <span v-if="field.required" class="text-red-500 ml-1">*</span>
              </template>
              <el-input 
                v-if="field.type === 'input'"
                v-model="formData[field.key]"
                :placeholder="field.placeholder"
                size="large"
              />
              <el-input 
                v-else-if="field.type === 'textarea'"
                type="textarea"
                :rows="4"
                v-model="formData[field.key]"
                :placeholder="field.placeholder"
                size="large"
              />
            </el-form-item>
          </div>
          
          <div class="mt-8 sticky bottom-0 bg-gray-50 pt-4 pb-4">
            <el-button 
              type="primary" 
              class="w-full text-lg shadow-md h-12 bg-gradient-to-r from-blue-600 to-indigo-600 border-none hover:opacity-90 transition-opacity" 
              round
              @click="startGeneration"
              :loading="generating"
              :disabled="!agentInfo || generating"
            >
              <el-icon class="mr-2"><MagicStick /></el-icon> 开始执行生成
            </el-button>
          </div>
        </el-form>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../store/user'
import { ElMessage } from 'element-plus'
import { Document, DataAnalysis, ChatDotRound, Loading, Setting, MagicStick } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()
const route = useRoute()
const userStore = useUserStore()

const agentId = route.params.agentId
const agentInfo = ref<any>(null)
const formSchema = ref<any[]>([])
const formData = ref<Record<string, string>>({})

const loadingData = ref(false)
const generating = ref(false)
const outputMessage = ref('')

const formattedOutput = computed(() => {
  return md.render(outputMessage.value)
})

const fetchAgentInfo = async () => {
  if (!agentId) return
  loadingData.value = true
  try {
    const res = await fetch(`http://localhost:3000/agent/${agentId}`, {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    const json = await res.json()
    if (res.ok && json.success) {
      agentInfo.value = json.data
      if (agentInfo.value.formConfig) {
        try {
          formSchema.value = JSON.parse(agentInfo.value.formConfig)
          formSchema.value.forEach(field => {
             formData.value[field.key] = ''
          })
        } catch (e) {
          console.error('Failed to parse form schema:', e)
        }
      }
    }
  } catch (error) {
    ElMessage.error('无法加载智能体配置')
  } finally {
    loadingData.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.getElementById('chat-stream-container')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

const startGeneration = async () => {
  // Validate Required
  for (const field of formSchema.value) {
    if (field.required && !formData.value[field.key]) {
       ElMessage.warning(`请填写必填项: ${field.label}`)
       return
    }
  }

  outputMessage.value = ''
  generating.value = true
  
  try {
    const response = await fetch(`http://localhost:3000/chat/stream/${agentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify(formData.value)
    })

    if (!response.body) throw new Error('No response body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      
      const chunkStr = decoder.decode(value, { stream: true })
      
      // Parse SSE Data blocks from Aliyun Qwen
      const lines = chunkStr.split('\n')
      for (const line of lines) {
         if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
            try {
               const parsed = JSON.parse(line.slice(6))
               const token = parsed.choices[0]?.delta?.content || ''
               outputMessage.value += token
               scrollToBottom()
            } catch(e) {}
         }
      }
    }
  } catch (err) {
    ElMessage.error('调用模型失败或流式读取中断')
    console.error(err)
  } finally {
    generating.value = false
  }
}

onMounted(() => {
  fetchAgentInfo()
})
</script>

<style scoped>
/* Inherit standard markdown styles */
.markdown-body {
  font-family: inherit;
  font-size: 15px;
  line-height: 1.8;
}
.markdown-body :deep(h1), .markdown-body :deep(h2), .markdown-body :deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: bold;
}
.markdown-body :deep(p) {
  margin-bottom: 1em;
}
.markdown-body :deep(ul), .markdown-body :deep(ol) {
  padding-left: 2em;
  margin-bottom: 1em;
  list-style-type: decimal;
}
.markdown-body :deep(code) {
  background: #f4f4f5;
  padding: 0.2em 0.4em;
  border-radius: 4px;
}
</style>
