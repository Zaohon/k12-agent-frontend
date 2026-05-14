<template>
  <div class="category-aside">
    <!-- 标题区域 -->
    <div class="aside-header">
      <div class="title-row">
        <img src="@/images/category-title.png" class="title-icon" />
        <div class="title-text">分类目录管理</div>
      </div>
      <div class="subtitle-text">
        定义智能体集市的导航分类，支持层级配置与排序。
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <div class="search-input">
        <img src="@/images/search.png" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索菜单节点"
        />
        <img
          v-if="searchQuery"
          src="@/images/close.png"
          class="clear-icon"
          @click="searchQuery = ''"
        />
      </div>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-list">
      <template v-if="filteredCategories.length > 0">
        <div
          v-for="(item, index) in filteredCategories"
          :key="item.id"
          class="menu-item item-container"
          :class="{ active: activeCategory === item.name }"
        >
          <div class="item-main" @click="selectCategory(item.name)">
            <!-- 第0项显示星星图标，其他项不显示图标 -->
            <img
              v-if="index === 0"
              src="@/images/category-star.png"
              class="item-icon"
            />
            <div v-else class="item-icon-placeholder"></div>
            
            <!-- 内联编辑输入框 -->
            <input
              v-if="editingId === item.id"
              v-model="editName"
              class="common-edit-input"
              @blur="confirmEdit"
              @keydown.enter.prevent="confirmEdit"
              @click.stop
              ref="editInputRef"
            />
            <div v-else class="item-text">{{ item.name }}</div>
          </div>
          
          <!-- 操作按钮（第0项禁用） -->
          <template v-if="index !== 0">
            <div
              class="common-edit-btn"
              @click.stop="startEdit(item)"
              title="改名"
            >
              <el-icon><Edit /></el-icon>
            </div>
            <div
              class="common-delete-btn"
              @click.stop="deleteItem(item)"
              title="删除"
            >
              <el-icon><Delete /></el-icon>
            </div>
          </template>
        </div>
      </template>
      <div v-else class="no-results">
        未找到匹配结果
      </div>
    </div>

    <!-- 新建分组按钮 -->
    <div class="button-section">
      <button class="create-btn" @click="createCategory">
        <el-icon class="btn-icon"><Plus /></el-icon>
        <span>新建分组</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'

const emit = defineEmits(['select-category'])

const searchQuery = ref('')
const editingId = ref<number | null>(null)
const editName = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

const categories = ref([
  { id: 1, name: '精选页' },
  { id: 2, name: '教学助手' },
  { id: 3, name: '学科助教' },
  { id: 4, name: '行政工具' }
])

const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    return categories.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return categories.value.filter(item =>
    item.name.toLowerCase().includes(query)
  )
})

const activeCategory = ref('精选页')

watch(activeCategory, (newVal) => {
  emit('select-category', newVal)
})

const selectCategory = (name: string) => {
  if (editingId.value !== null) {
    confirmEdit()
  }
  activeCategory.value = name
}

const startEdit = (item: { id: number; name: string }) => {
  editingId.value = item.id
  editName.value = item.name
  nextTick(() => {
    setTimeout(() => {
      if (editInputRef.value) {
        editInputRef.value.focus()
      }
    }, 100)
  })
}

const confirmEdit = () => {
  if (editingId.value && editName.value.trim()) {
    const index = categories.value.findIndex(c => c.id === editingId.value!)
    if (index !== -1) {
      const oldName = categories.value[index].name
      const newName = editName.value.trim()
      categories.value = categories.value.map((cat, i) => 
        i === index ? { ...cat, name: newName } : cat
      )
      if (activeCategory.value === oldName) {
        activeCategory.value = newName
      }
    }
  }
  editingId.value = null
  editName.value = ''
}

const deleteItem = (item: { id: number; name: string }) => {
  const index = categories.value.findIndex(c => c.id === item.id)
  if (index !== -1) {
    categories.value = categories.value.filter(c => c.id !== item.id)
    if (activeCategory.value === item.name) {
      activeCategory.value = categories.value[0]?.name || ''
    }
  }
}

const createCategory = () => {
  const newId = Math.max(0, ...categories.value.map(c => c.id)) + 1
  const newCategory = { id: newId, name: `分类文件${newId}` }
  categories.value.push(newCategory)
  editingId.value = newId
  editName.value = `分类文件${newId}`
  nextTick(() => {
    setTimeout(() => {
      if (editInputRef.value) {
        editInputRef.value.focus()
      }
    }, 100)
  })
}

const handleGlobalClick = (e: MouseEvent) => {
  if (editingId.value !== null) {
    confirmEdit()
  }
}

onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
})
</script>

<style scoped>
/* Aside - Collapsible Secondary Sidebar */
.category-aside {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  width: 345px;
  height: 1108px;
  background: rgba(255, 255, 255, 0.4);
  border-right: 1px solid rgba(173, 178, 185, 0.1);
  backdrop-filter: blur(6px);
  flex-shrink: 0;
  position: relative;
}

/* 标题区域 */
.aside-header {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

.title-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 10px;
  gap: 10px;
  width: 312px;
  height: 20px;
}

.title-icon {
  width: 22px;
  height: 12px;
  object-fit: contain;
}

.title-text {
  width: 120px;
  height: 20px;
  font-family: "Noto Sans SC";
  font-weight: 700;
  font-size: 20px;
  line-height: 20px;
  color: #2e3339;
}

.subtitle-text {
  padding: 0 10px;
  font-family: "Noto Sans SC";
  font-weight: 400;
  font-size: 13px;
  line-height: 20px;
  color: #5a6066;
}

/* 搜索 */
.search-section {
  padding: 16px;
  border-bottom: 1px solid rgba(173, 178, 185, 0.05);
}

.search-input {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 10px 36px 8px 40px;
  width: 312px;
  height: 39px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(173, 178, 185, 0.2);
  border-radius: 8px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.clear-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  object-fit: contain;
  cursor: pointer;
  opacity: 0.6;
}

.clear-icon:hover {
  opacity: 1;
}

.search-input input {
  width: 100%;
  border: none;
  outline: none;
  font-family: "Noto Sans SC";
  font-weight: 500;
  font-size: 14px;
  color: #6b7280;
  background: transparent;
}

/* 菜单列表 */
.menu-list {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 2px;
  flex-grow: 1;
}

.menu-item {
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 16px;
  width: 312px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.5s ease;
  transform: scale(1);
}

.menu-item:hover {
  background: rgba(49, 77, 226, 0.03);
  transform: scale(1.02);
}

.menu-item.active {
  background: rgba(49, 77, 226, 0.1);
  border: 1px solid rgba(49, 77, 226, 0.1);
  transform: scale(1.02);
}

.item-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.item-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.item-icon-placeholder {
  width: 16px;
  height: 16px;
}

.item-text {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: "Noto Sans SC";
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #2e3339;
}

.menu-item.active .item-text {
  font-weight: 700;
  color: #314de2;
}

.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: "Noto Sans SC";
  font-size: 14px;
  color: #767b82;
}

/* 新建按钮 */
.button-section {
  padding: 10px 16px;
  border-top: 1px solid rgba(173, 178, 185, 0.05);
}

.create-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
  width: 312px;
  height: 41px;
  background: linear-gradient(135deg, #314de2 0%, #6144d3 100%);
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

.btn-icon {
  width: 16px;
  height: 16px;
  color: #fff;
  font-weight: bold;
}

.create-btn span {
  font-family: "Noto Sans SC";
  font-weight: 500;
  font-size: 16px;
  color: #fff;
}
</style>

<style>
/* 导入通用操作按钮样式 */
@import '../../styles/common-actions.css';
</style>
