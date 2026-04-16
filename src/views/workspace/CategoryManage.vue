<template>
  <div class="h-full w-full bg-gray-50 flex overflow-hidden p-12">
    <div class="max-w-4xl mx-auto w-full">
      <div class="mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center">
            <el-icon class="mr-3 text-primary"><Collection /></el-icon>
            分类目录管理
          </h1>
          <p class="text-gray-500 mt-2 text-sm">定义智能体广场的导航分类，支持层级配置与排序。</p>
        </div>
        <el-button type="primary" :icon="Plus" size="large" @click="openAdd">新增根分类</el-button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <el-table :data="tableData" style="width: 100%" v-loading="loading">
          <el-table-column prop="name" label="分类名称">
            <template #default="scope">
              <span class="font-bold text-gray-700">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="weight" label="排序权重" width="120" />
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="scope">
              {{ new Date(scope.row.createdAt).toLocaleDateString() }}
            </template>
          </el-table-column>
          <el-table-column label="管理操作" width="180" align="right">
            <template #default="scope">
              <el-button type="primary" link @click="openEdit(scope.row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Edit Dialog -->
    <el-dialog v-model="showDialog" :title="form.id ? '编辑分类' : '新增分类'" width="400px">
      <el-form :model="form" label-position="top">
        <el-form-item label="分类名称" required>
          <el-input v-model="form.name" placeholder="如：学科助手" />
        </el-form-item>
        <el-form-item label="显示权重 (数字越大越靠前)">
          <el-input-number v-model="form.weight" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submit" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Collection } from '@element-plus/icons-vue'
import { API_BASE } from '../../utils/api'
import { useUserStore } from '../../store/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const showDialog = ref(false)

const form = ref({
  id: null,
  name: '',
  weight: 0
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/category/list`)
    const data = await res.json()
    if (res.ok && data.success) {
      tableData.value = data.data
    }
  } catch (e) {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const openAdd = () => {
  form.value = { id: null, name: '', weight: 0 }
  showDialog.value = true
}

const openEdit = (row: any) => {
  form.value = { ...row }
  showDialog.value = true
}

const submit = async () => {
  if (!form.value.name) return ElMessage.warning('请输入名称')
  submitting.value = true
  try {
    const isEdit = !!form.value.id
    const url = isEdit ? `${API_BASE}/category/${form.value.id}` : `${API_BASE}/category/create`
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify(form.value)
    })
    const data = await res.json()
    if (res.ok && data.success) {
      ElMessage.success('保存成功')
      showDialog.value = false
      fetchList()
    }
  } catch (e) {
    ElMessage.error('通信失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除该分类吗？关联的智能体会失去该分类归属。', '警告').then(async () => {
    try {
      const res = await fetch(`${API_BASE}/category/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userStore.token}` }
      })
      if (res.ok) {
        ElMessage.success('已删除')
        fetchList()
      }
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(fetchList)
</script>
