import { MAX_FILE_SIZE } from '@/costants/costant'
import { knowledgeLog, knowledgeLogError } from './logManage'
// @ts-ignore
import { knowledgeApi } from '@/api/api'

/**
 * 存储容量统计
 */
export interface StorageStats {
  usedBytes: number
  totalBytes: number
}

/**
 * 获取存储空间统计信息
 * @returns 存储统计信息
 */
export const getStorageStats = async (): Promise<StorageStats | null> => {
  try {
    const res = await knowledgeApi.getStorageStats()
    if (res?.success && res.data) {
      const { usedBytes, totalBytes } = res.data
      knowledgeLog('存储空间 - 已用:', usedBytes, '总计:', totalBytes, '剩余:', totalBytes - usedBytes)
      return { usedBytes, totalBytes }
    }
    return null
  } catch (err) {
    knowledgeLogError('获取存储空间信息失败', err)
    return null
  }
}

/**
 * 格式化文件大小
 * @param bytes - 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes: string[] = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化时间显示
 * @param dateString - 日期字符串
 * @returns 格式化后的时间描述
 */
export const formatTime = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`
  return date.toLocaleDateString('zh-CN')
}

/**
 * 生成唯一的文件夹名称
 * @param existingNames - 已存在的文件夹名称列表
 * @param baseName - 基础名称，默认为"新建文件夹"
 * @returns 唯一的文件夹名称
 */
export const generateUniqueFolderName = (
  existingNames: string[],
  baseName: string = '新建文件夹'
): string => {
  if (!existingNames.includes(baseName)) {
    return baseName
  }

  let counter = 1
  while (existingNames.includes(`${baseName}(${counter})`)) {
    counter++
  }
  return `${baseName}(${counter})`
}

/**
 * 验证文件大小和剩余空间
 * @param files - FileList 对象
 * @param remainingBytes - 剩余空间容量（字节），可选
 * @returns { validFiles: File[], tooLargeFiles: string[], insufficientSpaceFiles: string[] }
 */
export const validateFileSizes = (
  files: FileList,
  remainingBytes?: number | null
): { validFiles: File[], tooLargeFiles: string[], insufficientSpaceFiles: string[] } => {
  knowledgeLog('开始验证文件，文件数量:', files.length)
  knowledgeLog('单个文件大小限制:', MAX_FILE_SIZE !== null ? formatFileSize(MAX_FILE_SIZE) : '无限制')
  knowledgeLog('剩余空间:', remainingBytes !== null && remainingBytes !== undefined ? formatFileSize(remainingBytes) : '未知')

  const validFiles: File[] = []
  const tooLargeFiles: string[] = []
  const insufficientSpaceFiles: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    knowledgeLog(`验证文件 [${i + 1}/${files.length}]:`, file.name, '大小:', formatFileSize(file.size))

    if (MAX_FILE_SIZE !== null && file.size > MAX_FILE_SIZE) {
      knowledgeLog('文件过大，超出单个文件限制:', file.name)
      tooLargeFiles.push(file.name)
    } else if (remainingBytes !== null && remainingBytes !== undefined && file.size > remainingBytes) {
      knowledgeLog('空间不足，无法上传:', file.name, '需要:', formatFileSize(file.size), '剩余:', formatFileSize(remainingBytes))
      insufficientSpaceFiles.push(file.name)
    } else {
      knowledgeLog('文件验证通过:', file.name)
      validFiles.push(file)
    }
  }

  knowledgeLog('验证完成 - 有效文件:', validFiles.length, '过大文件:', tooLargeFiles.length, '空间不足:', insufficientSpaceFiles.length)

  return { validFiles, tooLargeFiles, insufficientSpaceFiles }
}


/**
 * 上传单个文件
 * @param file - 文件对象
 * @param folderId - 目标文件夹 ID（可选，null 表示根目录）
 * @returns 创建的文件对象或 null
 */
export const uploadFile = async (file: File, folderId: string | number | null = null): Promise<any> => {
  try {
    knowledgeLog('开始上传文件:', file.name)

    // 1. 获取上传凭证
    knowledgeLog('步骤1: 获取上传凭证')
    const policyRes = await knowledgeApi.getUploadPolicy({
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      folderId
    })

    if (!policyRes || !policyRes.success) {
      knowledgeLogError('获取上传凭证失败')
      return null
    }

    const { uploadUrl, key, publicUrl: policyPublicUrl } = policyRes.data
    knowledgeLog('获取上传凭证成功:', { uploadUrl, key, publicUrl: policyPublicUrl })
    
    // 检查必要字段，如果 fileKey 缺失，尝试从 uploadUrl 中提取
    if (!uploadUrl) {
      knowledgeLogError('上传凭证缺少必要字段 uploadUrl')
      return null
    }
    
    // 如果 fileKey 缺失，从 uploadUrl 中提取
    let finalFileKey = key
    let publicUrl = policyPublicUrl || ''
    if (!finalFileKey && uploadUrl) {
      knowledgeLog('fileKey 缺失，尝试从 uploadUrl 中提取')
      const url = new URL(uploadUrl)
      const keyParam = url.searchParams.get('key')
      if (keyParam) {
        finalFileKey = decodeURIComponent(keyParam)
        knowledgeLog('从 URL 参数中提取 fileKey:', finalFileKey)
      } else {
        // 提取完整路径作为 ossKey（去掉开头的 '/'）
        finalFileKey = url.pathname.substring(1)
        knowledgeLog('从 URL 路径中提取 fileKey:', finalFileKey)
      }
      // 构建公开访问 URL（去掉查询参数）
      publicUrl = url.origin + url.pathname
      knowledgeLog('构建公开访问 URL:', publicUrl)
    }
    
    if (!finalFileKey) {
      knowledgeLogError('无法获取 fileKey，上传失败')
      return null
    }

    // 2. 上传文件到存储服务
    knowledgeLog('步骤2: 上传文件到存储服务')
    knowledgeLog('上传URL:', uploadUrl)
    knowledgeLog('开始发送 OSS 上传请求...')
    knowledgeLog('文件大小:', file.size, '文件类型:', file.type)

    const uploadTimeout = 30000
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), uploadTimeout)

    try {
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        signal: controller.signal
      })

      clearTimeout(timer)
      knowledgeLog('OSS上传响应状态:', uploadRes.status, uploadRes.statusText)
      
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text()
        knowledgeLogError('文件上传OSS失败:', uploadRes.status, uploadRes.statusText, errorText)
        return null
      }
      knowledgeLog('文件上传到OSS成功')
    } catch (ossErr: any) {
      clearTimeout(timer)
      knowledgeLogError('OSS上传请求异常:', ossErr.message || ossErr)
      if (ossErr.name === 'TypeError') {
        knowledgeLogError('大概率跨域CORS异常，请配置OSS跨域规则')
      } else if (ossErr.name === 'AbortError') {
        knowledgeLogError('OSS上传请求超时')
      }
      return null
    }

    // 3. 创建文件记录
    knowledgeLog('步骤3: 创建文件记录')
    const fileData: any = {
      name: file.name,
      ossKey: finalFileKey,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      url: publicUrl,
      folderId
    }

    knowledgeLog('创建文件记录数据:', fileData)
    const createRes = await knowledgeApi.createFile(fileData)

    if (createRes && createRes.success) {
      knowledgeLog('文件记录创建成功:', file.name)
      return createRes.data
    } else {
      knowledgeLogError('文件记录创建失败:', createRes?.message || '未知错误')
      if (createRes) {
        knowledgeLogError('完整响应:', JSON.stringify(createRes))
      }
      return null
    }
  } catch (err: any) {
    knowledgeLogError('上传文件全局异常:', err.message || err)
    knowledgeLogError('异常类型:', err.name)
    return null
  }
}
/**
 * URL安全的Base64编码（支持Unicode）
 */
const base64Encode = (str: string): string => {
  const encoded = btoa(unescape(encodeURIComponent(str)))
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * URL安全的Base64解码
 */
const base64Decode = (str: string): string => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return decodeURIComponent(escape(atob(base64)))
}

/**
 * 面包屑项类型
 */
export interface BreadcrumbItem {
  id: number | string | null
  name: string
}

/**
 * 从路径字符串解析面包屑数组
 * @param pathStr - 路径字符串（URL安全的base64编码或原始格式）
 * @returns 面包屑数组
 */
export const parsePath = (pathStr: string): BreadcrumbItem[] => {
  if (!pathStr) return []
  try {
    const decoded = base64Decode(pathStr)
    const parts = decoded.split('/').filter(p => p.trim())
    return parts.map(part => {
      const colonIndex = part.indexOf(':')
      if (colonIndex > -1) {
        const id = Number(part.substring(0, colonIndex)) || part.substring(0, colonIndex)
        const name = part.substring(colonIndex + 1)
        return { id, name }
      }
      return { id: part, name: part }
    })
  } catch {
    const parts = pathStr.split('/').filter(p => p.trim())
    return parts.map(part => {
      const colonIndex = part.indexOf(':')
      if (colonIndex > -1) {
        const id = Number(part.substring(0, colonIndex)) || part.substring(0, colonIndex)
        const name = part.substring(colonIndex + 1)
        return { id, name }
      }
      return { id: part, name: part }
    })
  }
}

/**
 * 构建路径字符串
 * @param items - 面包屑数组
 * @returns 路径字符串（URL安全的base64编码）
 */
export const buildPath = (items: BreadcrumbItem[]): string => {
  const raw = items.map(item => `${item.id}:${item.name}`).join('/')
  return base64Encode(raw)
}

/**
 * 向当前路径追加文件夹
 * @param currentPath - 当前路径字符串
 * @param folderId - 文件夹ID
 * @param folderName - 文件夹名称
 * @returns 新的路径字符串（URL安全的base64编码）
 */
export const appendToPath = (
  currentPath: string,
  folderId: number | string,
  folderName: string
): string => {
  const part = `${folderId}:${folderName}`
  const raw = currentPath ? `${base64Decode(currentPath)}/${part}` : part
  return base64Encode(raw)
}

/**
 * 获取指定索引之前的路径
 * @param pathStr - 路径字符串（URL安全的base64编码）
 * @param targetIndex - 目标索引（面包屑数组中的索引，0是"知识库"）
 * @returns 截断后的路径字符串（URL安全的base64编码）
 */
export const getPathBeforeIndex = (
  pathStr: string,
  targetIndex: number
): string => {
  if (!pathStr) return ''
  try {
    const decoded = base64Decode(pathStr)
    const parts = decoded.split('/').filter(p => p.trim())
    const items: BreadcrumbItem[] = parts.map(part => {
      const colonIndex = part.indexOf(':')
      if (colonIndex > -1) {
        const id = Number(part.substring(0, colonIndex)) || part.substring(0, colonIndex)
        const name = decodeURIComponent(part.substring(colonIndex + 1))
        return { id, name }
      }
      return { id: part, name: part }
    })
    if (targetIndex < 1) return ''
    const pathItems = items.slice(0, targetIndex)
    const raw = pathItems.map(item => `${item.id}:${item.name}`).join('/')
    return base64Encode(raw)
  } catch {
    return ''
  }
}

/**
 * 文件接口 - 与 KnowledgeBase.vue 和 KnowledgeBaseFolder.vue 中的 File 接口保持一致
 */
export interface KbFile {
  id: number
  name: string
  size: number
  url?: string
  mimeType?: string
  ossKey?: string
  folderId?: number
  createdAt?: string
  updatedAt?: string
}

/**
 * 下载文件
 * @param file - 文件对象
 */
export const handleDownload = (file: KbFile) => {
  if (file.url) {
    knowledgeLog('下载文件:', file.name, file.url)
    window.open(file.url, '_blank')
  } else {
    knowledgeLogError('文件无下载链接:', file.name)
  }
}

/**
 * 删除文件
 * @param file - 文件对象
 * @param filesRef - 文件列表响应式引用
 * @returns 删除是否成功
 */
export const handleDelete = async (file: KbFile, filesRef: { value: KbFile[] }): Promise<boolean> => {
  if (!confirm(`确定要删除文件「${file.name}」吗？`)) return false
  try {
    const res = await knowledgeApi.deleteFile(file.id)
    if (res && res.success) {
      filesRef.value = filesRef.value.filter(f => f.id !== file.id)
      knowledgeLog('文件删除成功:', file.name)
      await getStorageStats()
      return true
    }
    return false
  } catch (err) {
    knowledgeLogError('删除文件失败', err)
    return false
  }
}

export { MAX_FILE_SIZE }
