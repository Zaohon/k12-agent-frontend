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
            <!-- 根据页面名称显示不同图标 -->
            <img
              v-if="item.name === '精选页'"
              src="@/images/category-star.png"
              class="item-icon"
            />
            <img
              v-else-if="item.name === '推荐页'"
              src="@/images/category-content-curated.png"
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
          
          <!-- 操作按钮（精选页和推荐页禁用） -->
          <template v-if="item.name !== '精选页' && item.name !== '推荐页'">
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
import { ElMessage } from 'element-plus'
import { categoryApi } from '@/api/api'

const emit = defineEmits(['select-category'])

interface Category {
  id: number
  name: string
}

// 日志输出开关，设置为 false 可关闭所有日志
const ENABLE_LOG = true

const searchQuery = ref('')
const editingId = ref<number | null>(null)
const editName = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)
const loading = ref(false)

const categories = ref<Array<{ id: number; name: string }>>([])

const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    return categories.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return categories.value.filter(item =>
    item.name.toLowerCase().includes(query)
  )
})

const activeCategory = ref('')

watch(activeCategory, (newVal) => {
  const category = categories.value.find(c => c.name === newVal)
  emit('select-category', category)
})

const selectCategory = (name: string) => {
  if (editingId.value !== null) {
    confirmEdit()
  }
  activeCategory.value = name
}

const startEdit = (item: { id: number; name: string }) => {
  if (item.name === '精选页' || item.name === '推荐页') {
    return
  }
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

const confirmEdit = async () => {
  if (editingId.value && editName.value.trim()) {
    const index = categories.value.findIndex(c => c.id === editingId.value!)
    if (index !== -1) {
      const oldName = categories.value[index].name
      const newName = editName.value.trim()
      
      try {
        loading.value = true
        ENABLE_LOG && console.log('=== 开始更新分类 ===')
        ENABLE_LOG && console.log('请求参数: categoryId=', editingId.value, ', name=', newName)
        const response = await categoryApi.updateCategory(editingId.value!, { name: newName })
        ENABLE_LOG && console.log('=== 更新分类成功 ===')
        ENABLE_LOG && console.log('返回数据:', JSON.stringify(response, null, 2))
        const data = response && response.data ? response.data : {}
        categories.value = categories.value.map((cat, i) => 
          i === index ? { ...cat, name: data.name || newName } : cat
        )
        if (activeCategory.value === oldName) {
          activeCategory.value = data.name || newName
        }
        ElMessage.success('修改成功')
      } catch (error) {
        ENABLE_LOG && console.error('=== 更新分类失败 ===')
        ENABLE_LOG && console.error('错误信息:', error)
        ElMessage.error('修改失败')
      } finally {
        loading.value = false
      }
    }
  }
  editingId.value = null
  editName.value = ''
}

const deleteItem = async (item: { id: number; name: string }) => {
  try {
    loading.value = true
    ENABLE_LOG && console.log('=== 开始删除分类 ===')
    ENABLE_LOG && console.log('请求参数: categoryId=', item.id, ', name=', item.name)
    const response = await categoryApi.deleteCategory(item.id)
    ENABLE_LOG && console.log('=== 删除分类成功 ===')
    ENABLE_LOG && console.log('返回数据:', JSON.stringify(response, null, 2))
    const index = categories.value.findIndex(c => c.id === item.id)
    if (index !== -1) {
      categories.value = categories.value.filter(c => c.id !== item.id)
      if (activeCategory.value === item.name) {
        activeCategory.value = categories.value[0]?.name || ''
      }
    }
    ElMessage.success('删除成功')
  } catch (error) {
    ENABLE_LOG && console.error('=== 删除分类失败 ===')
    ENABLE_LOG && console.error('错误信息:', error)
    ElMessage.error('删除失败')
  } finally {
    loading.value = false
  }
}

const createCategory = async () => {
  try {
    loading.value = true
    const newName = `分类文件${categories.value.length + 1}`
    ENABLE_LOG && console.log('=== 开始创建分类 ===')
    ENABLE_LOG && console.log('请求参数: name=', newName)
    const response = await categoryApi.createCategory({ name: newName })
    ENABLE_LOG && console.log('=== 创建分类成功 ===')
    ENABLE_LOG && console.log('返回数据:', JSON.stringify(response, null, 2))

    const data = response && response.data ? response.data : {}
    const newCategory = { id: data.id, name: data.name || newName }
    categories.value.push(newCategory)
    editingId.value = newCategory.id
    editName.value = newCategory.name
    ElMessage.success('创建成功')
    nextTick(() => {
      setTimeout(() => {
        if (editInputRef.value) {
          editInputRef.value.focus()
        }
      }, 100)
    })
  } catch (error) {
    ENABLE_LOG && console.error('=== 创建分类失败 ===')
    ENABLE_LOG && console.error('错误信息:', error)
    ElMessage.error('创建失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    loading.value = true
    ENABLE_LOG && console.log('=== 开始请求分类列表 ===')
    const response = await categoryApi.getCategoryList()
    ENABLE_LOG && console.log('=== 分类列表请求成功 ===')
    ENABLE_LOG && console.log('返回数据:', JSON.stringify(response, null, 2))
    const data = response && response.data ? response.data : []
    const seenNames = new Set<string>()
    const uniqueCategories = data.filter((item: { name: string }) => {
      if (item.name === '精选页' || item.name === '推荐页') {
        if (seenNames.has(item.name)) {
          return false
        }
        seenNames.add(item.name)
        return true
      }
      return true
    })
    categories.value = uniqueCategories.sort((a: { weight: number }, b: { weight: number }) => {
      return (b.weight || 0) - (a.weight || 0)
    })
  } catch (error) {
    ElMessage.error('加载分类列表失败')
  } finally {
    loading.value = false
  }
}

const handleGlobalClick = (e: MouseEvent) => {
  if (editingId.value !== null) {
    confirmEdit()
  }
}

onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
  loadCategories()
})
onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
})
</script>

<style scoped>
/* 关键修改：自适应布局，不再固定高度 */
.category-aside {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  width: 100%;
  max-width: 345px;
  min-width: 260px;
  height: 100%;       /* 改为 100% 自适应 */
  max-height: 100vh;  /* 最大不超过窗口 */
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
  flex-shrink: 0;
}

.title-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 10px;
  gap: 10px;
  width: 100%;
  max-width: 312px;
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
  flex-shrink: 0;
}

.search-input {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 10px 36px 8px 40px;
  width: 100%;
  max-width: 312px;
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

/* 菜单列表 - 核心自适应区域 */
.menu-list {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 8px;
  flex: 1;               /* 自动占满剩余空间 */
  overflow-y: auto;      /* 内容多了自动滚动 */
  overflow-x: hidden;
  min-height: 0;         /* 解决 flex 嵌套滚动失效 */
}

.menu-item {
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 16px;
  width: 100%;
  max-width: 312px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.5s ease;
  flex-shrink: 0;
}

.menu-item:hover {
  background: rgba(49, 77, 226, 0.03);
}

.menu-item.active {
  background: rgba(49, 77, 226, 0.1);
  border: 1px solid rgba(49, 77, 226, 0.1);
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

/* 底部按钮 - 固定在底部，永远可见 */
.button-section {
  padding: 10px 16px;
  border-top: 1px solid rgba(173, 178, 185, 0.05);
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(6px);
  flex-shrink: 0;
}

.create-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
  width: 100%;
  max-width: 312px;
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

/* 响应式 */
@media screen and (max-width: 768px) {
  .category-aside {
    max-width: 100%;
    min-width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(173, 178, 185, 0.1);
  }
}
</style>

<style>
@import '../../styles/common-actions.css';
</style>