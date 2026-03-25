<template>
  <div class="h-full w-full bg-gray-50 flex overflow-hidden">
    <!-- Left: Organization List -->
    <aside class="w-80 bg-white border-r border-gray-200 h-full flex flex-col pt-6 shrink-0 relative">
      <div class="px-6 mb-4 flex justify-between items-center">
        <span class="font-bold text-lg text-gray-800">组织架构管理</span>
      </div>
      
      <div class="flex-1 overflow-y-auto px-4 space-y-2 pb-24" v-loading="loading">
        <div 
          v-for="org in orgList" :key="org.id"
          @click="selectOrg(org)"
          class="p-4 rounded-xl border border-gray-100 hover:border-primary hover:shadow-sm cursor-pointer transition-all bg-gray-50 bg-opacity-50"
          :class="selectedOrg?.id === org.id ? 'border-primary shadow-sm bg-blue-50' : ''"
        >
          <div class="flex items-center space-x-3 mb-2">
            <el-icon class="text-primary text-xl"><OfficeBuilding /></el-icon>
            <h4 class="font-bold text-sm text-gray-800 line-clamp-1">{{ org.orgName }}</h4>
            <el-tag size="small" type="success" effect="plain" v-if="org.id === 1">系统默认</el-tag>
          </div>
          <div class="text-xs text-gray-400 mt-1 flex items-center justify-between">
            <span>用户数: {{ org._count?.users || 0 }}</span>
            <span>自研代理: {{ org._count?.agents || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="absolute bottom-6 px-6 w-full">
         <el-button type="primary" size="large" class="w-full shadow-md" round :icon="Plus" @click="showCreateDialog = true">
           新增二级组织
         </el-button>
      </div>
    </aside>

    <!-- Right: Organization Details & Management -->
    <main class="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div v-if="selectedOrg" class="max-w-5xl mx-auto space-y-6">
        <!-- Stats Header -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl shadow-md shrink-0">
               <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div>
               <h2 class="text-2xl font-bold text-gray-800">{{ selectedOrg.orgName }}</h2>
               <p class="text-sm text-gray-500 mt-1">组织序列号: ORG-00{{ selectedOrg.id }}</p>
            </div>
          </div>
          <el-radio-group v-model="activeTab" size="large">
            <el-radio-button label="profile">组织概况</el-radio-button>
            <el-radio-button label="accounts">账户管理</el-radio-button>
          </el-radio-group>
        </div>

        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-lg text-gray-800 flex items-center">
              <el-icon class="mr-2 text-indigo-500"><UserFilled /></el-icon>
              组织专员 (SCHOOL_ADMIN)
            </h3>
            <el-button type="primary" plain size="small" :icon="Plus" @click="showAdminDialog = true">添加管理员</el-button>
          </div>
          
          <div class="space-y-3">
             <div v-if="!selectedOrg.users || selectedOrg.users.length === 0" class="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-lg">
                该组织暂无专属管理员，将由系统超管代管
             </div>
             <div v-for="u in selectedOrg.users" :key="u.username" class="flex items-center justify-between bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl">
                <div class="flex items-center">
                   <el-avatar :size="32" class="bg-indigo-500 text-white font-bold mr-3">{{ u.username.charAt(0).toUpperCase() }}</el-avatar>
                   <div>
                     <div class="font-bold text-gray-800 text-sm">{{ u.username }}</div>
                     <div class="text-xs text-indigo-500 mt-0.5">学校管理员 (全权管理内部AI大厅)</div>
                   </div>
                </div>
                <el-button type="danger" text size="small">移除权限</el-button>
             </div>
          </div>
        </div>

        <!-- Accounts Tab -->
        <div v-if="activeTab === 'accounts'" class="space-y-6">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-bold text-lg text-gray-800">所有成员</h3>
              <div class="flex items-center space-x-3">
                <el-button :icon="Download" @click="downloadTemplate">下载导入模版</el-button>
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleUpload"
                  accept=".xlsx, .xls"
                >
                  <el-button type="primary" :icon="Upload" :loading="batchProcessing">批量上传账号</el-button>
                </el-upload>
              </div>
            </div>

            <el-table :data="orgUsers" style="width: 100%" v-loading="loadingUsers">
              <el-table-column prop="username" label="账号名" />
              <el-table-column label="身份" width="120">
                <template #default="scope">
                  <el-tag :type="getRoleTag(scope.row.role)">{{ getRoleText(scope.row.role) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="加入时间">
                <template #default="scope">
                  {{ new Date(scope.row.createdAt).toLocaleDateString() }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button type="danger" text size="small">注销</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      <div v-else class="h-full flex items-center justify-center">
         <el-empty description="在左侧选择一个组织节点" />
      </div>
    </main>

    <!-- Dialogs -->
    <el-dialog v-model="showCreateDialog" title="新增组织单位" width="400px" center>
      <el-form label-position="top">
        <el-form-item label="组织名称">
          <el-input v-model="newOrgName" placeholder="如：北京实验第二小学" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createOrganization" :loading="saving">确认登记</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="showAdminDialog" title="绑定单位管理员" width="400px" center>
      <el-form label-position="top">
        <el-form-item label="管理员账号名">
          <el-input v-model="adminForm.username" placeholder="建议使用姓名或教工号" />
        </el-form-item>
        <el-form-item label="初始密码">
          <el-input v-model="adminForm.password" placeholder="请输入临时密码" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAdminDialog = false">取消</el-button>
          <el-button type="primary" @click="createAdmin" :loading="saving">立即赋予</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Plus, OfficeBuilding, UserFilled, Download, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'
import { ElMessage, ElNotification } from 'element-plus'
import { API_BASE } from '../../utils/api'
import * as XLSX from 'xlsx'

const userStore = useUserStore()
const orgList = ref<any[]>([])
const orgUsers = ref<any[]>([])
const loading = ref(false)
const loadingUsers = ref(false)
const saving = ref(false)
const batchProcessing = ref(false)

const selectedOrg = ref<any>(null)
const activeTab = ref('profile')
const showCreateDialog = ref(false)
const showAdminDialog = ref(false)
const newOrgName = ref('')
const adminForm = ref({ username: '', password: '' })

const fetchOrgs = async () => {
  loading.value = true
  try {
    const res = await fetch('http://localhost:3000/org/list', {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    const data = await res.json()
    if (res.ok && data.success) {
      orgList.value = data.data
      if (selectedOrg.value) {
         selectedOrg.value = orgList.value.find(o => o.id === selectedOrg.value.id)
      }
    }
  } catch (err) {
    ElMessage.error('无法读取组织架构网络')
  } finally {
    loading.value = false
  }
}

const fetchOrgUsers = async (orgId: number) => {
  loadingUsers.value = true
  try {
    const res = await fetch(`http://localhost:3000/org/${orgId}/users`, {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    const data = await res.json()
    if (res.ok && data.success) {
      orgUsers.value = data.data
    }
  } catch (err) {
    ElMessage.error('无法同步账户列表')
  } finally {
    loadingUsers.value = false
  }
}

const selectOrg = (org: any) => {
  selectedOrg.value = org
  if (activeTab.value === 'accounts') {
    fetchOrgUsers(org.id)
  }
}

watch(activeTab, (val) => {
  if (val === 'accounts' && selectedOrg.value) {
    fetchOrgUsers(selectedOrg.value.id)
  }
})

const getRoleText = (role: string) => {
  const map: Record<string, string> = {
    'SUPER_ADMIN': '超级管理',
    'SCHOOL_ADMIN': '管理员',
    'TEACHER': '老师',
    'STUDENT': '学生',
    'PARENT': '家长'
  }
  return map[role] || role
}

const getRoleTag = (role: string) => {
  if (role === 'SUPER_ADMIN') return 'danger'
  if (role === 'SCHOOL_ADMIN') return 'warning'
  if (role === 'TEACHER') return 'success'
  if (role === 'PARENT') return 'info'
  return ''
}

const createOrganization = async () => {
  if (!newOrgName.value) return ElMessage.warning('组织名称不能为空')
  saving.value = true
  try {
    const res = await fetch('http://localhost:3000/org/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify({ name: newOrgName.value })
    })
    const data = await res.json()
    if (res.ok && data.success) {
      ElMessage.success('组织创建成功')
      showCreateDialog.value = false
      newOrgName.value = ''
      fetchOrgs()
    } else {
      ElMessage.error(data.message || '操作失败')
    }
  } catch(e) {
    ElMessage.error('网络错误')
  } finally {
    saving.value = false
  }
}

const createAdmin = async () => {
  if (!adminForm.value.username || !adminForm.value.password) return ElMessage.warning('账号与密码必填')
  saving.value = true
  try {
    const res = await fetch('http://localhost:3000/org/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify({ 
         orgId: selectedOrg.value.id,
         username: adminForm.value.username,
         password: adminForm.value.password
      })
    })
    const data = await res.json()
    if (res.ok && data.success) {
      ElMessage.success('成功派遣专属管理员')
      showAdminDialog.value = false
      adminForm.value = { username: '', password: '' }
      fetchOrgs()
    } else {
      ElMessage.error(data.message || '创建失败')
    }
  } catch(e) {
    ElMessage.error('网络异常')
  } finally {
    saving.value = false
  }
}

const downloadTemplate = () => {
  const data = [
    ['账号名', '密码', '身份'],
    ['student001', '123456', '学生'],
    ['teacher001', '123456', '老师'],
    ['parent001', '123456', '家长'],
    ['admin001', '123456', '管理员'],
  ]
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '批量导入账户')
  XLSX.writeFile(wb, `账户导入模板_${selectedOrg.value.orgName}.xlsx`)
}

const handleUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = async (e) => {
    const data = e.target?.result
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)
    
    // Convert Chinese keys to English for backend
    const users = jsonData.map((item: any) => ({
      username: item['账号名'],
      password: item['密码'],
      role: item['身份']
    })).filter(u => u.username && u.password)

    if (users.length === 0) {
      return ElMessage.warning('未检测到有效的账户数据')
    }

    batchProcessing.value = true
    try {
      const res = await fetch(`http://localhost:3000/org/${selectedOrg.value.id}/users/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userStore.token}`
        },
        body: JSON.stringify({ users })
      })
      const result = await res.json()
      if (res.ok && result.success) {
        ElNotification({
          title: '批量导入成功',
          message: `成功新增 ${result.data.count} 个账户节点`,
          type: 'success'
        })
        fetchOrgUsers(selectedOrg.value.id)
        fetchOrgs() // Refresh counts
      } else {
        ElMessage.error('上传处理失败')
      }
    } catch (err) {
      ElMessage.error('网络通讯异常')
    } finally {
      batchProcessing.value = false
    }
  }
  reader.readAsArrayBuffer(file.raw)
}

onMounted(() => {
  fetchOrgs()
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
