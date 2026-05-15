<template>
  <div class="category-manage-page">
    <CategoryManageList @select-category="handleSelectCategory" />
    <component
      :is="currentContentComponent"
      :selected-category="currentCategory?.name || ''"
      :category-id="currentCategory?.id"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CategoryManageList from './CategoryManageList.vue'
import CategoryManageStarContent from './CategoryManageStarContent.vue'
import CategoryManageRecommendContent from './CategoryManageRecommendContent.vue'
import CategoryManageNormalContent from './CategoryManageNormalContent.vue'

interface Category {
  id: number
  name: string
}

const currentCategory = ref<Category | undefined>(undefined)

const handleSelectCategory = (category: Category | undefined) => {
  currentCategory.value = category
}

const currentContentComponent = computed(() => {
  if (!currentCategory.value) {
    return null
  }
  switch (currentCategory.value.name) {
    case '精选页':
      return CategoryManageStarContent
    case '推荐页':
      return CategoryManageRecommendContent
    default:
      return CategoryManageNormalContent
  }
})
</script>

<style scoped>
.category-manage-page {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
