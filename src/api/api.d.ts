/**
 * API 响应数据通用接口
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

/**
 * 会话接口
 */
export interface Session {
  id: number
  topic: string
  agentId?: number
  createdAt?: string
  updatedAt?: string
  userId?: number
  isDeleted?: boolean
}

/**
 * 文件夹接口
 */
export interface Folder {
  id: number
  name: string
  folderCount: number
  fileCount: number
  createdAt?: string
  updatedAt?: string
  parentId?: number | null
}

/**
 * 文件接口
 */
export interface File {
  id: number
  name: string
  size: number
  url?: string
  createdAt: string
  updatedAt?: string
  folderId?: number
}

/**
 * 存储统计接口
 */
export interface StorageStats {
  usedBytes: number
  totalBytes: number
  folderCount: number
  fileCount: number
  usageRate: number
}

/**
 * 认证相关 API 接口
 */
export const authApi: {
  sendSmsCode: (phone: string) => Promise<{ success: boolean; message: string }>
  login: (phone: string, code: string) => Promise<{ success: boolean; data?: any; message?: string }>
  passwordLogin: (account: string, password: string) => Promise<{ success: boolean; data?: any; message?: string }>
  getProfile: () => Promise<ApiResponse>
  updatePassword: (passwordData: { oldPassword: string; newPassword: string }) => Promise<ApiResponse>
  register: (registerData: any) => Promise<ApiResponse>
}

/**
 * 智能体相关 API 接口
 */
export const agentApi: {
  getMyAgents: () => Promise<ApiResponse<any[]>>
  getAgentById: (agentId: number | string) => Promise<ApiResponse<any>>
  createAgent: (agentData: any) => Promise<ApiResponse<any>>
  updateAgent: (agentId: number | string, agentData: any) => Promise<ApiResponse<any>>
  deleteAgent: (agentId: number | string) => Promise<ApiResponse>
  getDiscoverAgents: (categoryId?: number | string) => Promise<ApiResponse<any[]>>
  getOrgAgents: (orgId?: number | string) => Promise<ApiResponse<any[]>>
  getFeaturedAgents: () => Promise<ApiResponse<any[]>>
  getPendingApprovals: (params?: Record<string, any>) => Promise<ApiResponse<any[]>>
  reviewApproval: (id: number | string, data: { status: string; categoryId?: number | null; isFeatured?: boolean }) => Promise<ApiResponse>
  optimizePrompt: (text: string) => Promise<ApiResponse<{ optimizedText: string }>>
  debugAgent: (debugData: { systemPrompt: string; userMessage: string }) => Promise<Response>
}

/**
 * 会话相关 API 接口
 */
export const sessionApi: {
  getSessionList: () => Promise<ApiResponse<Session[]>>
  createSession: (agentId?: number) => Promise<ApiResponse<{ id: number; name: string; topic: string }>>
  getSessionHistory: (sessionId: number | string) => Promise<ApiResponse<any[]>>
  sendMessage: (sessionId: number | string, prompt: string, attachments?: any[]) => Promise<Response>
  updateSessionTopic: (sessionId: number | string, topic: string) => Promise<ApiResponse>
  deleteSession: (sessionId: number | string) => Promise<ApiResponse>
}

/**
 * 分类相关 API 接口
 */
export const categoryApi: {
  getCategoryList: () => Promise<ApiResponse<any[]>>
  getCategoryAgents: (categoryId: number | string) => Promise<ApiResponse<any[]>>
  createCategory: (categoryData: { name: string }) => Promise<ApiResponse<any>>
  updateCategory: (categoryId: number | string, categoryData: { name?: string }) => Promise<ApiResponse<any>>
  deleteCategory: (categoryId: number | string) => Promise<ApiResponse<any>>
  deleteAgentFromCategory: (categoryId: number | string, agentId: number | string) => Promise<ApiResponse<any>>
  updateAgentInCategory: (categoryId: number | string, agentId: number | string, agentData: { targetCategoryId?: number; status?: string }) => Promise<ApiResponse<any>>
  setCategoryAgents: (categoryId: number | string, agentIds: (number | string)[]) => Promise<ApiResponse<any>>
}

/**
 * 聊天相关 API 接口
 */
export const chatApi = {
  voiceToText: (audioBlob: File | Blob, language?: string) => Promise<ApiResponse<any>>
};

/**
 * 组织相关 API 接口
 */
export const orgApi: {
  getOrgList: () => Promise<ApiResponse<any[]>>
  createOrg: (orgData: any) => Promise<ApiResponse<any>>
  replaceOrgAdmin: (adminData: { orgId: number; userId: number }) => Promise<ApiResponse>
  getOrgUsers: (orgId: number | string) => Promise<ApiResponse<any[]>>
  batchCreateOrgUsers: (orgId: number | string, usersData: any) => Promise<ApiResponse>
  deleteOrgUser: (orgId: number | string, userId: number | string) => Promise<ApiResponse>
}

/**
 * 审批相关 API 接口
 */
export const approvalApi: {
  getPendingApprovals: () => Promise<ApiResponse<any[]>>
  reviewApproval: (id: number | string, reviewData: { status: string; categoryId?: number | null; isFeatured?: boolean }) => Promise<ApiResponse>
}

/**
 * 知识库相关 API 接口
 */
export const knowledgeApi: {
  getFolders: (params?: Record<string, any>) => Promise<ApiResponse<Folder[]>>
  getFolderById: (folderId: number | string) => Promise<ApiResponse<Folder>>
  createFolder: (folderData: { name: string; parentId?: number | null }) => Promise<ApiResponse<Folder>>
  updateFolder: (folderId: number | string, folderData: { name?: string }) => Promise<ApiResponse<Folder>>
  deleteFolder: (folderId: number | string) => Promise<ApiResponse>
  getEntries: (params?: { parentId?: number }) => Promise<ApiResponse<{ folders: Folder[]; files: File[] }>>
  getFiles: (params?: Record<string, any>) => Promise<ApiResponse<File[]>>
  getRecentFiles: (params?: Record<string, any>) => Promise<ApiResponse<File[]>>
  getFileById: (fileId: number | string) => Promise<ApiResponse<File>>
  updateFile: (fileId: number | string, fileData: { name?: string; folderId?: number | null }) => Promise<ApiResponse<File>>
  createFile: (fileData: { folderId?: number; name: string; mimeType: string; size: number; ossKey: string; url: string }) => Promise<ApiResponse<File>>
  deleteFile: (fileId: number | string) => Promise<ApiResponse>
  batchMoveFiles: (fileIds: number[], targetFolderId: number | string | null) => Promise<ApiResponse>
  batchDeleteFiles: (fileIds: number[]) => Promise<ApiResponse>
  getUploadPolicy: (params: { fileName: string; contentType: string; folderId?: number | null }) => Promise<ApiResponse>
  getStorageStats: () => Promise<ApiResponse<StorageStats>>
  getAgentLogos: () => Promise<ApiResponse<any[]>>
}

/**
 * 模型配置相关 API 接口
 */
export const modelConfigApi: {
  getModelConfig: () => Promise<ApiResponse<any>>
  saveModelConfig: (configData: any) => Promise<ApiResponse>
}
