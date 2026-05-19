import { MAX_FILE_SIZE } from '@/costants/costant'

/**
 * 日志开关
 */
export const ENABLE_LOG = true

/**
 * 带[知识库]前缀的日志输出
 */
const log = (...args: any[]) => {
  ENABLE_LOG && console.log('[知识库]', ...args)
}

const logError = (...args: any[]) => {
  ENABLE_LOG && console.error('[知识库]', ...args)
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
 * 验证文件大小
 * @param files - FileList 对象
 * @returns { validFiles: File[], tooLargeFiles: string[] }
 */
export const validateFileSizes = (files: FileList): { validFiles: File[], tooLargeFiles: string[] } => {
  const validFiles: File[] = []
  const tooLargeFiles: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    if (MAX_FILE_SIZE !== null && file.size > MAX_FILE_SIZE) {
      tooLargeFiles.push(file.name)
    } else {
      validFiles.push(file)
    }
  }

  return { validFiles, tooLargeFiles }
}

/**
 * 上传单个文件
 * @param file - 文件对象
 * @param folderId - 目标文件夹 ID（可选，null 表示根目录）
 * @returns 是否上传成功
 */
export const uploadFile = async (file: File, folderId: string | number | null = null): Promise<boolean> => {
  try {
    log('开始上传文件:', file.name)

    // 动态导入 API
    const { knowledgeApi } = await import('@/api/api')

    // 1. 获取上传凭证
    const policyRes = await knowledgeApi.getUploadPolicy({
      fileName: file.name,
      fileSize: file.size
    })

    if (!policyRes || !policyRes.success) {
      logError('获取上传凭证失败')
      return false
    }

    const { uploadUrl, fileKey } = policyRes.data

    // 2. 上传文件到存储服务
    const formData = new FormData()
    formData.append('file', file)

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    })

    if (!uploadRes.ok) {
      logError('文件上传失败')
      return false
    }

    // 3. 创建文件记录
    const fileData = {
      name: file.name,
      key: fileKey,
      size: file.size,
      folderId
    }

    const createRes = await knowledgeApi.createFile(fileData)

    if (createRes && createRes.success) {
      log('文件记录创建成功:', file.name)
      return true
    } else {
      logError('文件记录创建失败:', createRes?.message)
      return false
    }
  } catch (err) {
    logError('上传文件异常:', err)
    return false
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

export { MAX_FILE_SIZE }