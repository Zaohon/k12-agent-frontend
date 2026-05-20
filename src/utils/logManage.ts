/**
 * 日志管理模块
 * 统一管理所有模块的日志输出，支持按模块开关和总开关控制
 */

import { ENABLE_ALL_LOG } from '../costants/costant'

/**
 * 各模块开关
 */
export const LOG_MODULES = {
  knowledge: true,      // 知识库
  chat: true,           // 对话
  category: true,       // 分类目录管理
  api: true             // API
}

/**
 * 知识库日志
 */
export const knowledgeLog = (...args: any[]) => {
  if (!ENABLE_ALL_LOG || !LOG_MODULES.knowledge) return
  console.log('[知识库]', ...args)
}

export const knowledgeLogError = (...args: any[]) => {
  if (!ENABLE_ALL_LOG || !LOG_MODULES.knowledge) return
  console.error('[知识库]', ...args)
}

/**
 * 对话日志
 */
export const chatLog = (...args: any[]) => {
  if (!ENABLE_ALL_LOG || !LOG_MODULES.chat) return
  console.log('[对话]', ...args)
}

export const chatLogError = (...args: any[]) => {
  if (!ENABLE_ALL_LOG || !LOG_MODULES.chat) return
  console.error('[对话]', ...args)
}

/**
 * 分类目录管理日志
 */
export const categoryLog = (...args: any[]) => {
  if (!ENABLE_ALL_LOG || !LOG_MODULES.category) return
  console.log('[分类目录管理]', ...args)
}

export const categoryLogError = (...args: any[]) => {
  if (!ENABLE_ALL_LOG || !LOG_MODULES.category) return
  console.error('[分类目录管理]', ...args)
}

/**
 * API日志
 */
export const apiLog = (...args: any[]) => {
  if (!ENABLE_ALL_LOG || !LOG_MODULES.api) return
  console.log('[API]', ...args)
}

export const apiLogError = (...args: any[]) => {
  if (!ENABLE_ALL_LOG || !LOG_MODULES.api) return
  console.error('[API]', ...args)
}