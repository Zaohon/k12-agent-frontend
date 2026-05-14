<template>
  <div class="category-manage-page">
    <CategoryManageList @select-category="handleSelectCategory" />
    <CategoryManageContent :selected-category="selectedCategory" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CategoryManageList from './CategoryManageList.vue'
import CategoryManageContent from './CategoryManageContent.vue'

const selectedCategory = ref('精选页')

const handleSelectCategory = (category: string) => {
  selectedCategory.value = category
}
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
