<template>
  <div class="category-manage-page">
    <CategoryManageList ref="categoryListRef" @select-category="handleSelectCategory" @category-updated="handleCategoryUpdated" />
    <component
      :is="currentContentComponent"
      :category="currentCategory"
      :key="currentCategory?.id"
      @delete-success="handleDeleteSuccess"
      @update-success="handleUpdateSuccess"
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
  weight?: number
}

const categoryListRef = ref<InstanceType<typeof CategoryManageList> | null>(null)
const currentCategory = ref<Category | undefined>(undefined)

const handleSelectCategory = (category: Category | undefined) => {
  currentCategory.value = category
}

const handleCategoryUpdated = (updatedCategory: Category) => {
  if (currentCategory.value && currentCategory.value.id === updatedCategory.id) {
    currentCategory.value = updatedCategory
  }
}

const handleDeleteSuccess = () => {
  currentCategory.value = undefined
  if (categoryListRef.value) {
    categoryListRef.value.loadCategories()
  }
}

const handleUpdateSuccess = (updatedCategory: Category) => {
  if (currentCategory.value && currentCategory.value.id === updatedCategory.id) {
    currentCategory.value = updatedCategory
  }
  if (categoryListRef.value) {
    categoryListRef.value.loadCategories()
  }
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

@media screen and (max-width: 768px) {
  .category-manage-page {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
}
</style>
