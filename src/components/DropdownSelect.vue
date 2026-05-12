<template>
  <div class="relative">
    <div 
      @click.stop="isOpen = !isOpen"
      class="w-full px-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg cursor-pointer flex items-center justify-between hover:border-[#CBD5E1] transition-colors"
    >
      <span class="flex items-center gap-4">
        <img v-if="selectedItem?.icon" :src="selectedItem.icon" class="w-3 h-auto flex-shrink-0" :alt="selectedItem.label" style="margin-right: 8px;">
        <span class="text-left" :class="{ 'text-[#6B7280]': !selectedItem, 'text-[#1E293B]': selectedItem }">{{ selectedItem?.label || '请选择分类' }}</span>
      </span>
      <!-- 下拉箭头 -->
      <img 
        src="@/images/arrow-grey.png" 
        class="w-3 h-auto transition-transform duration-200" 
        :class="{ 'rotate-90': isOpen }"
        alt="arrow"
      />
    </div>
    
    <Transition :name="direction === 'up' ? 'dropdown-up' : 'dropdown-down'">
      <div v-if="isOpen" class="dropdown-wrapper" :style="dropdownWrapperStyle">
        <!-- 向上弹出时的三角形（在底部，朝下） -->
        <svg v-if="direction === 'up'" class="triangle-up" viewBox="0 0 20 12" fill="none">
          <path d="M0 0L10 12L20 0" fill="white" stroke="#E2E8F0" stroke-width="1"/>
        </svg>
        <!-- 向下弹出时的三角形（在顶部，朝上） -->
        <svg v-if="direction === 'down'" class="triangle-down" viewBox="0 0 20 12" fill="none">
          <path d="M0 12L10 0L20 12" fill="white" stroke="#E2E8F0" stroke-width="1"/>
        </svg>
        
        <div 
          class="left-0 right-0 bg-white rounded-lg shadow-lg border border-[#E2E8F0]"
          @mouseleave="isOpen = false"
        >
          <div class="py-1 menu-content">
            <div 
              v-for="item in options" 
              :key="item.value"
              @click="selectItem(item)"
              class="flex items-center gap-4 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <img v-if="item.icon" :src="item.icon" class="w-3 h-auto flex-shrink-0" alt="icon">
              <span class="text-sm text-[#1E293B]">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  direction: {
    type: String,
    default: 'down',
    validator: (value) => {
      return ['up', 'down'].includes(value)
    }
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)

const selectedItem = computed(() => {
  return props.options.find(item => item.value === props.modelValue)
})

const dropdownWrapperStyle = computed(() => {
  const baseStyle = {
    position: 'absolute',
    left: '0',
    right: '0',
    zIndex: '50'
  }
  if (props.direction === 'down') {
    baseStyle.top = 'calc(100% + 15px)'
    baseStyle.bottom = 'auto'
  } else {
    baseStyle.bottom = 'calc(100% + 15px)'
    baseStyle.top = 'auto'
  }
  return baseStyle
})

const selectItem = (item) => {
  emit('update:modelValue', item.value)
  emit('change', item)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  const el = document.querySelector('.relative')
  if (el && !el.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => props.modelValue, () => {
  isOpen.value = false
})
</script>

<style scoped>
.dropdown-down-enter-active,
.dropdown-down-leave-active,
.dropdown-up-enter-active,
.dropdown-up-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-down-enter-from,
.dropdown-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-up-enter-from,
.dropdown-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.dropdown-wrapper {
}

.triangle-up {
  position: absolute;
  left: 50%;
  bottom: -11px;
  width: 20px;
  height: 12px;
  transform: translateX(-50%);
  z-index: 51;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.06));
}

.triangle-down {
  position: absolute;
  left: 50%;
  top: -11px;
  width: 20px;
  height: 12px;
  transform: translateX(-50%);
  z-index: 51;
  filter: drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.06));
}
</style>
