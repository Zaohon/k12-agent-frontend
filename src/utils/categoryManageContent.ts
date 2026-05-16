import { ElMessage } from 'element-plus'
import { categoryApi, agentApi } from '@/api/api'

export interface Agent {
  id: string | number
  name: string
  desc: string
  title?: string
  description?: string
  iconUrl?: string
}

export const loadCategoryAgents = async (categoryId: string | number): Promise<Agent[]> => {
  try {
    const response = await categoryApi.getCategoryAgents(categoryId)
    if (response.success && response.data) {
      return response.data.map((agent: any) => ({
        id: agent.id,
        name: agent.title || agent.name || '',
        desc: agent.description || agent.desc || '',
        iconUrl: agent.iconUrl || ''
      }))
    }
    return []
  } catch (error) {
    console.error('加载分类智能体失败:', error)
    ElMessage.error('加载智能体列表失败')
    return []
  }
}

export const saveCategoryAgents = async (
  categoryId: string | number,
  agentIds: (string | number)[]
): Promise<boolean> => {
  try {
    const response = await categoryApi.setCategoryAgents(categoryId, agentIds)
    if (response.success) {
      ElMessage.success('保存成功')
      return true
    }
    ElMessage.error('保存失败')
    return false
  } catch (error) {
    console.error('保存分类智能体失败:', error)
    ElMessage.error('保存失败')
    return false
  }
}

export const loadAvailableAgents = async (): Promise<Agent[]> => {
  try {
    const response = await agentApi.getDiscoverAgents()
    if (response.success && response.data) {
      return response.data.map((agent: any) => ({
        id: agent.id,
        name: agent.title || agent.name || '',
        desc: agent.description || agent.desc || '',
        iconUrl: agent.iconUrl || ''
      }))
    }
    return []
  } catch (error) {
    console.error('加载可用智能体失败:', error)
    ElMessage.error('加载智能体列表失败')
    return []
  }
}

export const toggleAgentSelection = (
  agentId: string | number,
  selectedAgentIds: Set<string | number>
): Set<string | number> => {
  const newSet = new Set(selectedAgentIds)
  if (newSet.has(agentId)) {
    newSet.delete(agentId)
  } else {
    newSet.add(agentId)
  }
  return newSet
}

export const isAgentSelected = (
  agentId: string | number,
  selectedAgentIds: Set<string | number>
): boolean => {
  return selectedAgentIds.has(agentId)
}

export const deleteSelectedAgents = (
  agentIds: (string | number)[],
  allAgents: Agent[]
): Agent[] => {
  return allAgents.filter(a => !agentIds.includes(a.id))
}
