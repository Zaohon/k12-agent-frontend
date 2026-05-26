export const DEFAULT_AGENT_ID = '59'

export const API_BASE = '/api'

export const OSS_LOGO_BASE = 'https://lqwlcloud.oss-cn-shanghai.aliyuncs.com/system/agent-logo/'

//文件大小上传限制 (无限制写null)
export const MAX_FILE_SIZE = null

// 是否启用全局文件类型限制（true: 限制为指定类型，false: 支持所有文件类型）
export const GOBAL_FILE_TYPE = true

// 允许上传的文件类型数组（当 GOBAL_FILE_TYPE 为 true 时生效）
export const ALLOWED_FILE_TYPES = ['txt', 'md']

// 日志总开关 - 设置为 false 可关闭所有日志
export const ENABLE_ALL_LOG = true
