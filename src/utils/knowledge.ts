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
