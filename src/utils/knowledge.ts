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
 * @returns 创建的文件对象或 null
 */
export const uploadFile = async (file: File, folderId: string | number | null = null): Promise<any> => {
  try {
    log('开始上传文件:', file.name)

    // 动态导入 API
    const { knowledgeApi } = await import('@/api/api')

    // 1. 获取上传凭证
    log('步骤1: 获取上传凭证')
    const policyRes = await knowledgeApi.getUploadPolicy({
      fileName: file.name,
      fileSize: file.size
    })

    if (!policyRes || !policyRes.success) {
      logError('获取上传凭证失败')
      return null
    }

    const { uploadUrl, fileKey } = policyRes.data
    log('获取上传凭证成功:', { uploadUrl, fileKey })
    
    // 检查必要字段，如果 fileKey 缺失，尝试从 uploadUrl 中提取
    if (!uploadUrl) {
      logError('上传凭证缺少必要字段 uploadUrl')
      return null
    }
    
    // 如果 fileKey 缺失，从 uploadUrl 中提取
    let finalFileKey = fileKey
    let publicUrl = ''
    if (!finalFileKey && uploadUrl) {
      log('fileKey 缺失，尝试从 uploadUrl 中提取')
      const url = new URL(uploadUrl)
      const keyParam = url.searchParams.get('key')
      if (keyParam) {
        finalFileKey = decodeURIComponent(keyParam)
        log('从 URL 参数中提取 fileKey:', finalFileKey)
      } else {
        // 提取完整路径作为 ossKey（去掉开头的 '/'）
        finalFileKey = url.pathname.substring(1)
        log('从 URL 路径中提取 fileKey:', finalFileKey)
      }
      // 构建公开访问 URL（去掉查询参数）
      publicUrl = url.origin + url.pathname
      log('构建公开访问 URL:', publicUrl)
    }
    
    if (!finalFileKey) {
      logError('无法获取 fileKey，上传失败')
      return null
    }

    // 2. 上传文件到存储服务
    log('步骤2: 上传文件到存储服务')
    log('上传URL:', uploadUrl)
    log('开始发送 OSS 上传请求...')
    log('文件大小:', file.size, '文件类型:', file.type)

    const uploadTimeout = 30000
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), uploadTimeout)

    try {
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        },
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        signal: controller.signal
      })

      clearTimeout(timer)
      log('OSS上传响应状态:', uploadRes.status, uploadRes.statusText)
      
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text()
        logError('文件上传OSS失败:', uploadRes.status, uploadRes.statusText, errorText)
        return null
      }
      log('文件上传到OSS成功')
    } catch (ossErr: any) {
      clearTimeout(timer)
      logError('OSS上传请求异常:', ossErr.message || ossErr)
      if (ossErr.name === 'TypeError') {
        logError('大概率跨域CORS异常，请配置OSS跨域规则')
      } else if (ossErr.name === 'AbortError') {
        logError('OSS上传请求超时')
      }
      return null
    }

    // 3. 创建文件记录
    log('步骤3: 创建文件记录')
    const fileData: any = {
      name: file.name,
      ossKey: finalFileKey,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      url: publicUrl
    }
    // 只有当 folderId 有值时才添加，避免传递 null
    if (folderId !== null && folderId !== undefined) {
      fileData.folderId = folderId
    }

    log('创建文件记录数据:', fileData)
    const createRes = await knowledgeApi.createFile(fileData)

    if (createRes && createRes.success) {
      log('文件记录创建成功:', file.name)
      return createRes.data
    } else {
      logError('文件记录创建失败:', createRes?.message || '未知错误')
      if (createRes) {
        logError('完整响应:', JSON.stringify(createRes))
      }
      return null
    }
  } catch (err: any) {
    logError('上传文件全局异常:', err.message || err)
    logError('异常类型:', err.name)
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

export { MAX_FILE_SIZE }