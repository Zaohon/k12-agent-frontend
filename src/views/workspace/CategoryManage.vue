<template>
  <div class="category-manage-page">
    <CategoryManageList @select-category="handleSelectCategory" />
    <component :is="currentContentComponent" :selected-category="selectedCategory" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CategoryManageList from './CategoryManageList.vue'
import CategoryManageStarContent from './CategoryManageStarContent.vue'
import CategoryManageRecommendContent from './CategoryManageRecommendContent.vue'
import CategoryManageNormalContent from './CategoryManageNormalContent.vue'

const selectedCategory = ref('精选页')

const handleSelectCategory = (category: string) => {
  selectedCategory.value = category
}

const currentContentComponent = computed(() => {
  switch (selectedCategory.value) {
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
