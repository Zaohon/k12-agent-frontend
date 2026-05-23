<template>
  <div class="h-full w-full bg-[#F8F9FD] flex overflow-hidden">
    <!-- Left: Organization List -->
    <aside class="w-[400px] border-r border-gray-200 h-full flex flex-col pt-6 shrink-0 relative">
      <div class="px-6 mb-4 flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <img src="@/images/network.png" class="w-5 h-5" alt="network" />
          <span class="font-bold text-lg text-gray-800">网点组织管理</span>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto px-4 space-y-2 pb-24" v-loading="loading">
        <div 
          v-for="org in orgList" :key="org.id"
          @click="selectOrg(org)"
          class="org-card"
          :class="selectedOrg?.id === org.id ? 'org-card-selected' : ''"
        >
          <div class="flex items-start space-x-3 mb-2">
            <div class="org-icon-wrapper">
              <img v-if="org.id === 1" src="@/images/organization_icon.png" alt="organization" />
              <img v-else src="@/images/organization_icon_no_public.png" alt="organization" />
            </div>
            <div class="min-w-0">
              <h4 class="font-bold text-sm text-gray-800 line-clamp-1">{{ org.orgName }}</h4>
              <p class="text-xs text-gray-400 mt-0.5">ID: ORG-{{ org.id }}</p>
            </div>
            <el-tag size="small" type="success" effect="plain" v-if="org.id === 1" class="self-start">系统默认</el-tag>
          </div>
          <div class="text-xs text-gray-400 mt-1 flex items-center justify-between">
            <span>用户数: {{ org._count?.users || 0 }}</span>
            <span>自研代理: {{ org._count?.agents || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="absolute bottom-6 px-6 w-full flex justify-center">
         <el-button type="primary" size="large" class="create-org-btn" @click="showCreateDialog = true">
           <img src="@/images/add.png" class="w-2 h-auto mr-[10px]" alt="add" />
           新建组织
         </el-button>
      </div>
    </aside>

    <!-- Right: Organization Details & Management -->
    <main class="flex-1 overflow-y-auto p-8 bg-[#F2F4F8]">
      <div v-if="selectedOrg" class="main-content-wrapper">
        <!-- Stats Header -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="org-icon-wrapper-large">
              <img v-if="selectedOrg?.id === 1" src="@/images/organization_icon.png" alt="organization" />
              <img v-else src="@/images/organization_icon_no_public.png" alt="organization" />
            </div>
            <div>
               <h2 class="text-2xl font-bold text-gray-800">{{ selectedOrg.orgName }}</h2>
               <p class="text-sm text-gray-500 mt-1">组织序列号: ORG-{{ selectedOrg.id }}</p>
            </div>
          </div>
          <div class="admin-switch-wrapper">
            <div class="admin-info">
              <div class="admin-label">专属管理员</div>
              <div class="admin-username">
                <template v-if="selectedOrgAdmin">{{ selectedOrgAdmin.username }}</template>
                <template v-else>
                  <span class="inline-flex items-center">
                    <img src="@/images/error.png" class="h-3.5 w-auto mr-1" alt="error" />
                    未指定
                  </span>
                </template>
              </div>
            </div>
            <div class="switch-divider"></div>
            <div class="replace-btn-wrapper">
              <el-button type="primary" size="small" class="replace-btn" @click="showReplaceAdminDialog = true">
                <img v-if="selectedOrgAdmin" src="@/images/switch.png" class="w-3 h-auto mr-1" alt="switch" />
                <img v-else src="@/images/add-admin-icon.png" class="w-4 h-auto mr-1" alt="add" />
                {{ selectedOrgAdmin ? '替换' : '添加' }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- Account Management -->
        <div class="account-management-wrapper">
          <div class="flex justify-between items-center" style="padding: 20px; background: #F8F9FD;">
            <h3 class="font-bold text-lg text-gray-800 flex items-center gap-2">
              <img src="@/images/change_admin_icon.png" class="w-5 h-atuo" alt="change_admin" />
              账号管理
            </h3>
            <div class="flex items-center gap-3">
              <el-button size="small" class="download-template-btn" @click="downloadTemplate">
                <img src="@/images/download-black.png" class="w-3 h-auto mr-[10px]" alt="download" />
                下载导入模板
              </el-button>
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleUpload"
                accept=".xlsx, .xls"
              >
                <el-button type="primary" size="small" class="batch-upload-btn" :loading="batchProcessing">
                  <img src="@/images/upload-white.png" class="w-3 h-auto mr-[10px]" alt="upload" />
                  批量上传账号
                </el-button>
              </el-upload>
            </div>
          </div>
          <el-table :data="pagedOrgUsers" style="width: 100%" v-loading="loadingUsers" class="account-table">
            <el-table-column prop="id" label="账号ID" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column label="角色">
              <template #default="scope">
                <el-tag :type="getRoleTag(scope.row.role)" size="small">{{ getRoleText(scope.row.role) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="加入时间">
              <template #default="scope">
                {{ formatTime(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <!-- <el-table-column label="注销时间">
              <template #default="scope">
                {{ scope.row.deletedAt ? formatTime(scope.row.deletedAt) : '-' }}
              </template>
            </el-table-column> -->
            <el-table-column label="状态">
              <template #default="scope">
                <span class="status-indicator" :class="scope.row.deletedAt ? 'status-disabled' : 'status-active'">
                  <span class="status-dot"></span>
                  {{ scope.row.deletedAt ? '已注销' : '正常' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button
                  v-if="!scope.row.deletedAt"
                  class="delete-user-btn"
                  size="small"
                  @click="handleDeleteUser(scope.row)"
                >注销</el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="flex items-center justify-between p-4 bg-[#F8F9FD]" v-if="orgUsers.length > 0">
            <span class="text-sm text-gray-500">第 {{ userPage }} 页，共 {{ Math.ceil(orgUsers.length / userPageSize) }} 页</span>
            <el-pagination
              :current-page="userPage"
              :page-size="userPageSize"
              :total="orgUsers.length"
              layout="prev, pager, next"
              small
              @current-change="(page: number) => userPage = page"
            />
          </div>
        </div>
      </div>

    </main>

    <!-- Dialogs -->
    <el-dialog v-model="showReplaceAdminDialog" width="480px">
      <template #header>
        <div class="dialog-header">
          <img src="@/images/change_admin_icon.png" class="w-5 h-auto" alt="change_admin" />
          <span class="dialog-header-title">指定机构管理员</span>
        </div>
      </template>
      <div class="replace-admin-body">
        <el-input
          v-model="replaceAdminSearch"
          placeholder="搜索用户名或者ID"
          clearable
          class="replace-admin-search"
        >
          <template #prefix>
            <img src="@/images/search.png" class="w-3 h-auto" alt="search" />
          </template>
        </el-input>
        <div class="user-list-wrapper" v-loading="replaceAdminLoading">
          <div
            v-for="user in filteredReplaceAdminUsers"
            :key="user.id"
            class="user-item"
            :class="{
              'user-item-selected': selectedReplaceAdmin?.id === user.id,
              'user-item-admin': user.role === 'SCHOOL_ADMIN'
            }"
            @click="selectedReplaceAdmin = user"
          >
            <div class="user-item-left">
              <el-avatar :size="32" :style="getAvatarStyle(user.role)" class="font-bold shrink-0">
                {{ user.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-item-info">
                <div class="user-item-name-row">
                  <span class="user-item-name">{{ user.username }}</span>
                  <el-tag v-if="user.role === 'SCHOOL_ADMIN'" size="small" type="warning" class="ml-1">当前</el-tag>
                </div>
                <span class="user-item-meta">ID: {{ user.id }} | {{ getRoleText(user.role) }}</span>
              </div>
            </div>
            <span class="user-item-dot" :class="{ 'user-item-dot-active': selectedReplaceAdmin?.id === user.id }"></span>
          </div>
          <div v-if="!replaceAdminLoading && filteredReplaceAdminUsers.length === 0" class="empty-tip">
            无匹配用户
          </div>
        </div>
      </div>
      <template #footer>
        <el-button class="cancel-admin-btn" @click="showReplaceAdminDialog = false">取消</el-button>
        <el-button type="primary" class="confirm-admin-btn" @click="confirmReplaceAdmin" :disabled="!selectedReplaceAdmin" :loading="saving">确认指定</el-button>
      </template>
    </el-dialog>

    <!-- Create Organization Dialog -->
    <el-dialog v-model="showCreateDialog" width="420px" :close-on-click-modal="false">
      <template #header>
        <div class="dialog-header">
          <img src="@/images/change_admin_icon.png" class="w-5 h-auto" alt="add" />
          <span class="dialog-header-title">新建组织</span>
        </div>
      </template>
      <div class="px-2">
        <label class="block text-sm font-medium text-gray-700 mb-2">组织名称</label>
        <el-input
          v-model="newOrgName"
          placeholder="请输入组织名称"
          clearable
          class="create-org-input"
        />
      </div>
      <template #footer>
        <el-button class="cancel-admin-btn" @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" class="confirm-admin-btn" @click="createOrganization" :loading="saving">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- Delete User Confirm Dialog -->
    <el-dialog v-model="showDeleteDialog" width="420px" :close-on-click-modal="false">
      <template #header>
        <div class="dialog-header">
          <img src="@/images/change_admin_icon.png" class="w-5 h-auto" alt="delete" />
          <span class="dialog-header-title">确认注销</span>
        </div>
      </template>
      <div class="px-2 py-4">
        <p class="text-sm text-gray-600">确定要注销用户 <strong>{{ deletingUser?.username }}</strong> 吗？此操作不可恢复。</p>
      </div>
      <template #footer>
        <el-button class="cancel-admin-btn" @click="showDeleteDialog = false">取消</el-button>
        <el-button type="primary" class="confirm-admin-btn" @click="confirmDeleteUser" :loading="deleting" style="background: #DC2626; border-color: #DC2626;">确定注销</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../../store/user'
import { ElMessage, ElNotification } from 'element-plus'
import { orgApi } from '../../api/api'
import * as XLSX from 'xlsx'

const userStore = useUserStore()
const orgList = ref<any[]>([])
const orgUsers = ref<any[]>([])
const loading = ref(false)
const loadingUsers = ref(false)
const saving = ref(false)
const batchProcessing = ref(false)

const selectedOrg = ref<any>(null)
const showCreateDialog = ref(false)
const showReplaceAdminDialog = ref(false)
const showDeleteDialog = ref(false)
const newOrgName = ref('')
const deletingUser = ref<any>(null)
const deleting = ref(false)

const selectedOrgAdmin = computed(() => {
  return orgUsers.value.find((u: any) => u.role === 'SCHOOL_ADMIN') || orgUsers.value[0] || null
})

const userPage = ref(1)
const userPageSize = ref(10)

const pagedOrgUsers = computed(() => {
  const start = (userPage.value - 1) * userPageSize.value
  return orgUsers.value.slice(start, start + userPageSize.value)
})

const replaceAdminUsers = ref<any[]>([])
const replaceAdminSearch = ref('')
const replaceAdminLoading = ref(false)
const selectedReplaceAdmin = ref<any>(null)

const roleOrder: Record<string, number> = {
  SUPER_ADMIN: 1,
  SCHOOL_ADMIN: 2,
  TEACHER: 3,
  STUDENT: 4,
  PARENT: 5
}

const sortByRole = (users: any[]) => {
  return [...users].sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99))
}

const filteredReplaceAdminUsers = computed(() => {
  const keyword = replaceAdminSearch.value.toLowerCase()
  const filtered = keyword
    ? replaceAdminUsers.value.filter(u => u.username.toLowerCase().includes(keyword))
    : replaceAdminUsers.value
  return sortByRole(filtered)
})

const fetchReplaceAdminUsers = async () => {
  if (!selectedOrg.value) return
  replaceAdminLoading.value = true
  replaceAdminSearch.value = ''
  selectedReplaceAdmin.value = null
  try {
    const res = await orgApi.getOrgUsers(selectedOrg.value.id)
    if (res.success) {
      replaceAdminUsers.value = (res.data || []).filter((u: any) => u.role !== 'SUPER_ADMIN')
      selectedReplaceAdmin.value = replaceAdminUsers.value.find((u: any) => u.role === 'SCHOOL_ADMIN') || null
    }
  } catch {
    ElMessage.error('获取用户列表失败')
  } finally {
    replaceAdminLoading.value = false
  }
}

const confirmReplaceAdmin = async () => {
  if (!selectedReplaceAdmin.value || !selectedOrg.value) return
  saving.value = true
  try {
    const res = await orgApi.replaceOrgAdmin({
      orgId: selectedOrg.value.id,
      userId: selectedReplaceAdmin.value.id
    })
    if (res.success) {
      ElMessage.success('管理员替换成功')
      showReplaceAdminDialog.value = false
      fetchOrgs()
      fetchOrgUsers(selectedOrg.value.id)
    } else {
      ElMessage.error(res.message || '替换失败')
    }
  } catch {
    ElMessage.error('网络异常')
  } finally {
    saving.value = false
  }
}

const fetchOrgs = async () => {
  loading.value = true
  try {
    const res = await orgApi.getOrgList()
    if (res.success) {
      console.log(res.data)
      orgList.value = (res.data || []).map((item: any) => ({
        ...item,
        orgName: item.orgName || item.name || ''
      }))
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
    const res = await orgApi.getOrgUsers(orgId)
    if (res.success) {
      orgUsers.value = (res.data || []).sort((a: any, b: any) => a.id - b.id)
    }
  } catch (err) {
    ElMessage.error('无法同步账户列表')
  } finally {
    loadingUsers.value = false
  }
}

const selectOrg = (org: any) => {
  selectedOrg.value = org
  userPage.value = 1
  fetchOrgUsers(org.id)
}

watch(showReplaceAdminDialog, (val) => {
  if (val) {
    fetchReplaceAdminUsers()
  }
})

watch(showCreateDialog, (val) => {
  if (val) {
    newOrgName.value = ''
  }
})

const getRoleText = (role: string) => {
  const map: Record<string, string> = {
    'SUPER_ADMIN': '超级管理员',
    'SCHOOL_ADMIN': '组织管理员',
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
  if (role === 'PARENT' || role === 'STUDENT') return 'info'
  return undefined
}

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const getAvatarStyle = (role: string) => {
  const colorMap: Record<string, string> = {
    SUPER_ADMIN: '#7C3AED',
    SCHOOL_ADMIN: '#DC2626',
    TEACHER: '#16A34A',
    STUDENT: '#2563EB',
    PARENT: '#6B7280'
  }
  const color = colorMap[role] || '#6366F1'
  return {
    background: hexToRgba(color, 0.2),
    border: `2px solid ${hexToRgba(color, 0.5)}`,
    color
  }
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleDateString()
}

const handleDeleteUser = async (user: any) => {
  deletingUser.value = user
  showDeleteDialog.value = true
}

const confirmDeleteUser = async () => {
  if (!deletingUser.value) return
  deleting.value = true
  try {
    const res = await orgApi.deleteOrgUser(selectedOrg.value.id, deletingUser.value.id)
    if (res.success) {
      ElMessage.success('用户已注销')
      showDeleteDialog.value = false
      deletingUser.value = null
      fetchOrgUsers(selectedOrg.value.id)
    } else {
      ElMessage.error(res.message || '注销失败')
    }
  } catch {
    ElMessage.error('网络异常')
  } finally {
    deleting.value = false
  }
}

const createOrganization = async () => {
  if (!newOrgName.value) return ElMessage.warning('组织名称不能为空')
  saving.value = true
  try {
    const res = await orgApi.createOrg({ name: newOrgName.value })
    if (res.success) {
      ElMessage.success('组织创建成功')
      showCreateDialog.value = false
      newOrgName.value = ''
      fetchOrgs()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch(e) {
    ElMessage.error('网络错误')
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
      const res = await orgApi.batchCreateOrgUsers(selectedOrg.value.id, { users })
      if (res.success) {
        ElNotification({
          title: '批量导入成功',
          message: `成功新增 ${res.data?.count || users.length} 个账户节点`,
          type: 'success'
        })
        fetchOrgUsers(selectedOrg.value.id)
        fetchOrgs()
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

.create-org-btn {
  width: 100%;
  height: 41px;
  border-radius: 12px;
  gap: 8px;
  padding-top: 12px;
  padding-bottom: 12px;
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  border: none;
}

.org-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  box-shadow: 0px 3px 5px -6px #C7D2FE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.org-icon-wrapper img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.org-card {
  width: 98%;
  margin: 0 auto;
  height: 100px;
  border-radius: 12px;
  padding: 16px;
  border: 2px solid #314DE21A;
  background: #F8F9FD;
  box-shadow: 0px 1px 2px 0px #0000000D;
  cursor: pointer;
  transition: all 0.2s ease;
}

.org-card:hover {
  background: #7aa9d50d;
  box-shadow: 0px 1px 2px 0px #0000000D;
}

.org-card-selected {
  border-color: #314DE2;
  background: #314DE20D;
  box-shadow: 0px 1px 2px 0px #0000000D;
}

.org-icon-wrapper-large {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  box-shadow: 0px 3px 5px -6px #C7D2FE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.org-icon-wrapper-large img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.main-content-wrapper {
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.admin-switch-wrapper {
  display: flex;
  align-items: center;
  background: #f8f9fd;
  border-radius: 12px;
  padding: 12px 16px;
  gap: 16px;
}

.admin-info {
  width: 100px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-label {
  width: 100%;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.admin-username {
  width: 100%;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.switch-divider {
  width: 1px;
  height: 32px;
  background: #e0e0e0;
}

.replace-btn-wrapper {
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.replace-btn {
  border-radius: 8px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #314DE2;
  font-size: 16px;
}

.replace-admin-body {
  min-height: 300px;
}

:deep(.el-overlay-dialog) {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-header-title {
  font-weight: 700;
  font-size: 16px;
}

.replace-admin-dialog :deep(.el-dialog__footer) {
  width: 448px;
  height: 71px;
  border-top: 1px solid #e5e7eb;
  padding: 16px 24px;
  gap: 12px;
}

.replace-admin-search {
  width: 94%;
  margin-left: 2%;
  margin-bottom: 12px;
}

.replace-admin-search :deep(.el-input__wrapper) {
  width: 100%;
  height: 37px;
  border-radius: 8px;
  padding: 10px 12px;
  background: #EBEEF4;
  box-shadow: none;
}

.replace-admin-search :deep(.el-input__inner) {
  background: transparent;
}

.user-list-wrapper {
  height: 300px;
  overflow-y: auto;
  border-radius: 8px;
  padding: 4px;
}

.account-management-wrapper {
  width: 1280px;
  border-radius: 12px;
  background: #FFFFFF;
  border: 1px solid #ADB2B94D;
  overflow: hidden;
}

.account-table {
  width: 100%;
  table-layout: auto;
  height: 572px;
}

.account-table :deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

.account-table :deep(.el-table__cell) {
  white-space: nowrap;
  height: 52px;
  text-align: center;
}

.account-table :deep(.el-table__header-wrapper .el-table__cell) {
  background: #F2F4F8;
  text-align: center;
}

.account-table :deep(.el-table__body .el-table__row) {
  background: #FFFFFF;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-active .status-dot {
  background: #22C55E;
}

.status-disabled .status-dot {
  background: #5A6066;
}

.delete-user-btn {
  width: 68px;
  height: 27px;
  gap: 10px;
  border-radius: 15px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
}

.delete-user-btn:hover {
  background: #FEE2E2;
  border-color: #FCA5A5;
}

/* Pagination styles */
:deep(.el-pagination) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 0 8px;
  min-width: 28px;
  height: 28px;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  color: #314DE2;
}

:deep(.el-pagination .el-pager li) {
  background: transparent;
  border: none;
  color: #64748b;
  min-width: 28px;
  height: 28px;
  line-height: 28px;
  margin: 0 2px;
  border-radius: 4px;
  font-size: 14px;
}

:deep(.el-pagination .el-pager li:hover) {
  color: #314DE2;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: #314DE2;
  color: #ffffff;
  font-weight: 500;
}

:deep(.el-pagination .el-pager li.is-active:hover) {
  background: #1e40af;
  color: #ffffff;
}

.create-org-input :deep(.el-input__wrapper) {
  height: 40px;
  border-radius: 8px;
  padding: 8px 12px;
  background: #F8F9FD;
  box-shadow: none;
  border: 1px solid #ADB2B9;
}

.create-org-input :deep(.el-input__wrapper:hover) {
  border-color: #314DE2;
}

.create-org-input :deep(.el-input__wrapper.is-focus) {
  border-color: #314DE2;
  box-shadow: 0 0 0 1px #314DE2;
}

.user-item {
  display: flex;
  align-items: center;
  width: 98%;
  height: 66px;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ADB2B9;
  cursor: pointer;
  transition: background 0.15s;
  margin: 10px auto 0 auto;
}

.user-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.user-item:hover {
  background: #f3f4f6;
}

.user-item-selected {
  background: #314de20d;
  border: 1px solid #314de240;
}

.user-item-admin {
  width: 98%;
  height: 68px;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  border: 2px dashed #314DE266;
  background: #B4BDFF1A;
  margin: 10px auto 0 auto;
}

.user-item-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.user-item-name {
  font-size: 16px;
  font-weight: 700;
  color: #2E3339;
  line-height: 1.3;
}

.user-item-name-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-item-meta {
  font-size: 12px;
  color: #5A6066;
  line-height: 1.3;
}

.empty-tip {
  text-align: center;
  padding: 32px 0;
  color: #9ca3af;
  font-size: 14px;
}

.user-item-dot {
  width: 20px;
  height: 20px;
  border-radius: 20px;
  background: #FFFFFF;
  border: 1px solid #ADB2B9;
  flex-shrink: 0;
  transition: all 0.15s;
}

.user-item-dot-active {
  width: 22px;
  height: 22px;
  background: #314DE2;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-item-dot-active::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FFFFFF;
}

.confirm-admin-btn {
  width: 104px;
  height: 38px;
  padding: 9px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  box-shadow: 0px 1px 2px 0px #0000000D;
  border: none;
}

.cancel-admin-btn {
  width: 62px;
  height: 38px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ADB2B9;
}

.download-template-btn {
  width: 138px;
  height: 38px;
  padding: 8px 16px;
  gap: 8px;
  border-radius: 8px;
  background: #F8F9FD;
  border: 1px solid #ADB2B9;
}

.batch-upload-btn {
  width: 136px;
  height: 38px;
  padding: 9px 16px;
  gap: 8px;
  border-radius: 8px;
  background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%);
  box-shadow: 0px 1px 2px 0px #0000000D;
  border: none;
}
</style>
