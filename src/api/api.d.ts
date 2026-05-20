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
 * 认证相关 API 接口
 */
export const authApi: {
  login: (username: string, password: string) => Promise<ApiResponse<{ token: string }>>
  logout: () => Promise<ApiResponse>
}

/**
 * 智能体相关 API 接口
 */
export const agentApi: {
  getAgents: (params?: Record<string, any>) => Promise<ApiResponse<any[]>>
  getAgentById: (agentId: number) => Promise<ApiResponse<any>>
  createAgent: (data: any) => Promise<ApiResponse<any>>
  updateAgent: (agentId: number, data: any) => Promise<ApiResponse<any>>
  deleteAgent: (agentId: number) => Promise<ApiResponse>
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
export const chatApi: {
  sendMessage: (sessionId: number, content: string) => Promise<ApiResponse>
  streamMessage: (sessionId: number, content: string) => Promise<Response>
}

/**
 * 组织相关 API 接口
 */
export const orgApi: {
  getOrgs: () => Promise<ApiResponse<any[]>>
  getOrgById: (orgId: number) => Promise<ApiResponse<any>>
}

/**
 * 审批相关 API 接口
 */
export const approvalApi: {
  getApprovals: (params?: Record<string, any>) => Promise<ApiResponse<any[]>>
  approve: (id: number) => Promise<ApiResponse>
  reject: (id: number) => Promise<ApiResponse>
}

/**
 * 知识库相关 API 接口
 */
export interface StorageStats {
  usedBytes: number
  totalBytes: number
}

export const knowledgeApi: {
  getFolders: (params?: Record<string, any>) => Promise<ApiResponse<Folder[]>>
  getFolderById: (folderId: number | string) => Promise<ApiResponse<Folder>>
  createFolder: (folderData: { name: string; parentId?: number | null }) => Promise<ApiResponse<Folder>>
  updateFolder: (folderId: number | string, folderData: { name?: string }) => Promise<ApiResponse<Folder>>
  deleteFolder: (folderId: number | string) => Promise<ApiResponse>
  getEntries: (params?: { parentId?: number }) => Promise<ApiResponse<{ folders: Folder[]; files: File[] }>>
  getFiles: (params?: Record<string, any>) => Promise<ApiResponse<File[]>>
  deleteFile: (fileId: number | string) => Promise<ApiResponse>
  getUploadPolicy: (params: { fileName: string; contentType: string; folderId?: number | null }) => Promise<ApiResponse>
  getStorageStats: () => Promise<ApiResponse<StorageStats>>
}

/**
 * 模型配置相关 API 接口
 */
export const modelConfigApi: {
  getConfigs: () => Promise<ApiResponse<any[]>>
  updateConfig: (id: number, data: any) => Promise<ApiResponse<any>>
}