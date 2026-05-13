<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="$emit('close')">
        <div class="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-[480px] p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-medium text-[#1E293B]">选择图标</h3>
            <button @click="$emit('close')" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F8F9FD] transition-colors">
              <img src="@/images/close.png" class="w-4 h-4" alt="close">
            </button>
          </div>
          <div class="flex flex-nowrap justify-center gap-6">
            <div
              v-for="icon in iconList"
              :key="icon.key"
              @click="handleSelect(icon.key)"
              class="cursor-pointer transition-all p-2 rounded-xl"
              :class="selectedKey === icon.key ? 'bg-[#EEF0FF]' : 'hover:bg-[#F8F9FD]'"
            >
              <img :src="icon.src" class="w-16 h-16 object-cover" :alt="icon.key">
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedKey: {
    type: String,
    default: ''
  },
  iconList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'select'])

const handleSelect = (key) => {
  emit('select', key)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
