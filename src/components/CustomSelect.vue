<template>
  <div class="custom-select" :style="{ width: props.width, height: props.height }">
    <div 
      class="select-header" 
      @click="toggleDropdown"
      @focus="isFocused = true"
      @blur="handleBlur"
      tabindex="0"
      :class="{ 'open': isOpen, 'focused': isFocused }"
      style="background-color: #F2F4F8; border-radius: 12px; padding: 0 16px; height: 100%; display: flex; align-items: center; justify-content: space-between; cursor: pointer; outline: none; transition: box-shadow 0.3s ease;"
    >
      <span v-if="props.modelValue">
        {{ selectedLabel }}
      </span>
      <span v-else style="color: #9CA3AF;">{{ props.placeholder }}</span>
      <div class="select-arrow" :class="{ 'rotate': isOpen }">
        <img src="@/images/vector.png" alt="下拉箭头" style="width: 10px; height: auto; transition: transform 0.3s ease;" />
      </div>
    </div>
    <div 
      class="select-dropdown" 
      v-if="isOpen"
      style="position: absolute; top: 100%; left: 0; right: 0; margin-top: 8px; background-color: #ffffff; border-radius: 12px; box-shadow: 0px 4px 6px -4px #314DE233, 0px 10px 15px -3px #314DE233; z-index: 1000;"
    >
      <div 
        v-for="option in props.options" 
        :key="option.value"
        class="select-option"
        @click="selectOption(option.value)"
        :class="{ 'selected': props.modelValue === option.value }"
        style="padding: 8px 16px; font-family: 'Noto Sans SC', sans-serif; font-size: 14px; color: #000000; cursor: pointer; user-select: none;"
        @mousedown.prevent
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, computed } from 'vue'

// 定义 props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  width: {
    type: String,
    default: '184px'
  },
  height: {
    type: String,
    default: '48px'
  }
})

// 定义 emit
const emit = defineEmits(['update:modelValue'])

// 控制下拉菜单显示/隐藏
const isOpen = ref(false)

// 控制焦点状态
const isFocused = ref(false)

// 计算选中选项的标签
const selectedLabel = computed(() => {
  const option = props.options.find(opt => opt.value === props.modelValue)
  return option ? option.label : ''
})

// 切换下拉菜单
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    // 打开下拉菜单时，添加点击外部关闭的事件监听
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)
  } else {
    // 关闭下拉菜单时，移除点击外部关闭的事件监听
    document.removeEventListener('click', handleClickOutside)
  }
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const selectEl = event.target.closest('.custom-select')
  if (!selectEl) {
    isOpen.value = false
    isFocused.value = false
    document.removeEventListener('click', handleClickOutside)
  }
}

// 处理失焦事件
const handleBlur = () => {
  isFocused.value = false
  isOpen.value = false
  document.removeEventListener('click', handleClickOutside)
}

// 选择选项
const selectOption = (value) => {
  emit('update:modelValue', value)
  isOpen.value = false
  document.removeEventListener('click', handleClickOutside)
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  // 外部值变化时，不需要做什么，因为我们是双向绑定
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 自定义下拉菜单样式 */
.custom-select {
  position: relative;
}

/* 箭头旋转 */
.select-arrow.rotate img {
  transform: rotate(90deg);
}

/* 选项悬停样式 */
.select-option:hover {
  background-color: #B4BDFF66 !important;
}

/* 选项选中样式 */
.select-option.selected {
  background-color: #F2F4F8 !important;
}

/* 聚焦样式 */
.select-header.focused {
  box-shadow: 0 0 0 2px #314DE2;
}
</style>