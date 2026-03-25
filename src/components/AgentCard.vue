<template>
  <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-48 group relative overflow-hidden">
    <div v-if="isFeatured" class="absolute top-0 right-0">
      <div class="bg-orange-500 text-white text-[10px] px-3 py-1 font-bold rotate-45 translate-x-3 -translate-y-1 shadow-sm">
        精选
      </div>
    </div>
    <div>
      <div class="flex items-center space-x-3 mb-3">
        <div class="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary text-2xl group-hover:scale-105 transition-transform">
          <el-icon><component :is="icon" /></el-icon>
        </div>
        <div>
          <h3 class="font-bold text-gray-800 text-lg line-clamp-1">{{ title }}</h3>
          <p class="text-xs text-gray-400 mt-1">{{ author }}</p>
        </div>
      </div>
      <p class="text-sm text-gray-600 line-clamp-2 leading-relaxed">
        {{ description }}
      </p>
    </div>
    <div class="w-full flex justify-end mt-4">
      <el-button type="primary" plain round size="small" class="opacity-0 group-hover:opacity-100 transition-opacity">
        去使用 <el-icon class="ml-1"><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'

defineProps({
  id: Number,
  title: String,
  description: String,
  author: String,
  icon: String,
  isFeatured: Boolean
})
</script>
