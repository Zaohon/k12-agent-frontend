import { ElMessage } from 'element-plus';
import { translateAIError } from '../utils/error';
import { API_BASE } from '../costants/costant';
import { apiLog } from '../utils/logManage';

/**
 * 从 localStorage 获取认证 token
 * @returns {string|null} token
 */
const getToken = () => {
  const token = localStorage.getItem('k12_token');
  return token ? token.trim() : null;
};

/**
 * 统一的请求封装函数
 * @param {string} url - 请求路径
 * @param {Object} options - 请求配置选项
 * @returns {Promise<any>} 请求响应数据
 */
const request = async (url, options = {}) => {
  const token = getToken();
  const fullUrl = `${API_BASE}${url}`;
  
  apiLog('请求 URL:', fullUrl);
  apiLog('请求方法:', options.method || 'GET');
  if (options.body) {
    apiLog('请求体:', options.body);
  }
  apiLog('是否有 token:', !!token);

  const config = {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(fullUrl, config);
    
    apiLog('响应状态:', response.status);
    apiLog('响应状态文本:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      apiLog('响应数据:', data);
      return data;
    } else {
      // 尝试解析错误响应
      let errorData = null;
      try {
        errorData = await response.json();
        apiLog('错误响应数据:', errorData);
      } catch (e) {
        apiLog('无法解析错误响应');
      }
      
      if (response.status === 401) {
        ElMessage.error('未授权，请重新登录');
        localStorage.removeItem('k12_token');
        localStorage.removeItem('k12_user');
        window.dispatchEvent(new CustomEvent('unauthorized'));
      } else if (response.status === 404) {
        ElMessage.error('资源不存在');
      } else if (response.status === 500) {
        ElMessage.error('服务器内部错误');
      } else {
        // 显示后端返回的错误信息
        if (errorData && errorData.message) {
          ElMessage.error(errorData.message);
        } else {
          ElMessage.error('请求失败');
        }
      }
      // 返回错误数据，让调用方可以处理
      return errorData || { success: false };
    }
  } catch (error) {
    ENABLE_LOG && console.error('[API] 请求异常:', error);
    ElMessage.error('网络错误，请检查后端服务是否启动');
    throw error;
  }
};

/**
 * 认证相关 API 接口
 */
export const authApi = {
  /**
   * 发送短信验证码
   * @param {string} phone - 手机号
   * @returns {Promise<{success: boolean, message: string}>} 发送结果
   */
  sendSmsCode: async (phone) => {
    try {
      const response = await fetch(`${API_BASE}/auth/sms_send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, message: data.message || '验证码已发送' };
      } else {
        return { success: false, message: data.message || '发送验证码失败' };
      }
    } catch (error) {
      throw new Error('无法连接到服务器，请确保后端服务和数据库已启动');
    }
  },

  /**
   * 短信验证码登录
   * @param {string} phone - 手机号
   * @param {string} code - 验证码
   * @returns {Promise<{success: boolean, data?: any, message?: string}>} 登录结果
   */
  login: async (phone, code) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        localStorage.setItem('k12_token', data.access_token);
        if (data.user) {
          localStorage.setItem('k12_user', JSON.stringify(data.user));
        }
        return { success: true, data };
      } else {
        return { success: false, message: data.message || '登录失败，请检查信息' };
      }
    } catch (error) {
      throw new Error('无法连接到服务器，请确保后端服务和数据库已启动');
    }
  },

  /**
   * 密码登录
   * @param {string} account - 账号（用户名/手机号）
   * @param {string} password - 密码
   * @returns {Promise<{success: boolean, data?: any, message?: string}>} 登录结果
   */
  passwordLogin: async (account, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/password-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, password })
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        localStorage.setItem('k12_token', data.access_token);
        if (data.user) {
          localStorage.setItem('k12_user', JSON.stringify(data.user));
        }
        return { success: true, data };
      } else {
        return { success: false, message: data.message || '登录失败，请检查信息' };
      }
    } catch (error) {
      throw new Error('无法连接到服务器，请确保后端服务和数据库已启动');
    }
  },

  /**
   * 获取当前用户信息
   * @returns {Promise<any>} 用户信息
   */
  getProfile: async () => {
    return request('/auth/profile');
  },

  /**
   * 更新密码
   * @param {Object} passwordData - 密码数据 {oldPassword, newPassword}
   * @returns {Promise<any>} 更新结果
   */
  updatePassword: async (passwordData) => {
    return request('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
  },

  /**
   * 注册新用户
   * @param {Object} registerData - 注册数据
   * @returns {Promise<any>} 注册结果
   */
  register: async (registerData) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData)
    });
  }
};

/**
 * 智能体相关 API 接口
 */
export const agentApi = {
  /**
   * 获取当前用户创建的智能体列表
   * @returns {Promise<any>} 智能体列表
   */
  getMyAgents: async () => {
    return request('/agent/my');
  },

  /**
   * 根据 ID 获取智能体详情
   * @param {number|string} agentId - 智能体 ID
   * @returns {Promise<any>} 智能体详情
   */
  getAgentById: async (agentId) => {
    return request(`/agent/${agentId}`);
  },

  /**
   * 创建新智能体
   * @param {Object} agentData - 智能体数据
   * @returns {Promise<any>} 创建结果
   */
  createAgent: async (agentData) => {
    return request('/agent/create', {
      method: 'POST',
      body: JSON.stringify(agentData)
    });
  },

  /**
   * 更新智能体信息
   * @param {number|string} agentId - 智能体 ID
   * @param {Object} agentData - 智能体数据
   * @returns {Promise<any>} 更新结果
   */
  updateAgent: async (agentId, agentData) => {
    return request(`/agent/update/${agentId}`, {
      method: 'POST',
      body: JSON.stringify(agentData)
    });
  },

  /**
   * 删除智能体
   * @param {number|string} agentId - 智能体 ID
   * @returns {Promise<any>} 删除结果
   */
  deleteAgent: async (agentId) => {
    return request(`/agent/${agentId}`, {
      method: 'DELETE'
    });
  },

  /**
   * 获取发现页面的智能体列表
   * @param {number|string} [categoryId] - 分类 ID（可选）
   * @returns {Promise<any>} 智能体列表
   */
  getDiscoverAgents: async (categoryId) => {
    const url = categoryId ? `/agent/discover?categoryId=${categoryId}` : '/agent/discover';
    return request(url);
  },

  /**
   * 获取精选智能体列表
   * @returns {Promise<any>} 精选智能体列表
   */
  getFeaturedAgents: async () => {
    return request('/agent/featured');
  },

  /**
   * 获取待审批的智能体列表
   * @param {Object} [params] - 筛选参数
   * @returns {Promise<any>} 待审批列表
   */
  getPendingApprovals: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/approval/pending?${query}` : '/approval/pending';
    return request(url);
  },

  /**
   * 审批智能体（通过/拒绝）
   * @param {number|string} id - 审批 ID
   * @param {Object} data - 审批数据 {status, categoryId, isFeatured}
   * @returns {Promise<any>} 审批结果
   */
  reviewApproval: async (id, data) => {
    return request(`/approval/review/${id}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * 一键优化提示词
   * @param {string} text - 原始提示词文本
   * @returns {Promise<any>} 优化后的提示词 {success, data: {optimizedText}}
   */
  optimizePrompt: async (text) => {
    return request('/agent/optimize', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  },

  /**
   * 调试智能体系统提示词
   * @param {Object} debugData - 调试数据 {systemPrompt, userMessage}
   * @returns {Promise<Response>} SSE 流响应
   */
  debugAgent: async (debugData) => {
    const token = localStorage.getItem('k12_token')?.trim();
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录');
      throw new Error('Token is null');
    }

    return fetch(`${API_BASE}/agent/debug`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(debugData)
    });
  }
};

/**
 * 会话相关 API 接口
 */
export const sessionApi = {
  /**
   * 获取会话列表
   * @returns {Promise<any>} 会话列表
   */
  getSessionList: async () => {
    return request('/session/list');
  },

  /**
   * 创建新会话
   * @param {number} [agentId] - 智能体 ID
   * @returns {Promise<any>} 创建结果
   */
  createSession: async (agentId) => {
    const body = agentId !== undefined ? JSON.stringify({ agentId }) : undefined;
    return request('/session/create', {
      method: 'POST',
      body
    });
  },

  /**
   * 获取会话历史记录
   * @param {number|string} sessionId - 会话 ID
   * @returns {Promise<any>} 会话历史
   */
  getSessionHistory: async (sessionId) => {
    return request(`/session/history/${sessionId}`);
  },

  /**
   * 发送消息
   * @param {number|string} sessionId - 会话 ID
   * @param {string} prompt - 提示词/消息内容
   * @param {Array} [attachments] - 附件列表
   * @returns {Promise<Response>} 响应流
   */
  sendMessage: async (sessionId, prompt, attachments = []) => {
    const token = getToken();
    
    apiLog('=== sendMessage Debug ===');
    apiLog('Token from localStorage:', token);
    apiLog('Token length:', token ? token.length : 0);
    apiLog('Token preview:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录');
      throw new Error('Token is null');
    }

    try {
      apiLog('Sending request to:', `${API_BASE}/session/chat/${sessionId}`);
      apiLog('Authorization header:', `Bearer ${token}`);
      
      const response = await fetch(`${API_BASE}/session/chat/${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt,
          attachments
        })
      });

      apiLog('Response status:', response.status);
      apiLog('Response headers:', [...response.headers.entries()]);

      if (response.ok) {
        return response;
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
          apiLog('Error response body:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            apiLog('Parsed error JSON:', errorJson);
            
            if (errorJson.error && errorJson.error.code) {
              apiLog('AI API Error:', errorJson.error.code, errorJson.error.message);
              ElMessage.error(translateAIError(errorJson.error.code, errorJson.error.message));
            } else if (errorJson.code && errorJson.message) {
              apiLog('API Error:', errorJson.code, errorJson.message);
              ElMessage.error(translateAIError(errorJson.code, errorJson.message));
            }
          } catch (parseError) {
            apiLog('Error response is not JSON:', errorText);
          }
        } catch (e) {
          apiLog('Failed to read error response:', e);
        }
        
        if (response.status === 401) {
          ElMessage.error('未授权，请重新登录');
        } else if (response.status === 404) {
          ElMessage.error('会话不存在');
        } else if (response.status === 500) {
          ElMessage.error('服务器内部错误');
        } else {
          ElMessage.error('发送消息失败');
        }
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
    } catch (error) {
      ElMessage.error('网络错误，请检查后端服务是否启动');
      throw error;
    }
  },

  /**
   * 更新会话主题
   * @param {number|string} sessionId - 会话 ID
   * @param {string} topic - 新主题
   * @returns {Promise<any>} 更新结果
   */
  updateSessionTopic: async (sessionId, topic) => {
    return request(`/session/update-topic/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ topic })
    });
  },

  /**
   * 删除会话
   * @param {number|string} sessionId - 会话 ID
   * @returns {Promise<any>} 删除结果
   */
  deleteSession: async (sessionId) => {
    return request(`/session/${sessionId}`, {
      method: 'DELETE'
    });
  }
};

/**
 * 分类相关 API 接口
 */
export const categoryApi = {
  /**
   * 获取分类列表
   * @returns {Promise<any>} 分类列表
   */
  getCategoryList: async () => {
    return request('/category/list');
  },

  /**
   * 获取指定分类下的智能体列表
   * @param {number|string} categoryId - 分类 ID
   * @returns {Promise<any>} 智能体列表
   */
  getCategoryAgents: async (categoryId) => {
    return request(`/category/${categoryId}/agents`);
  },

  /**
   * 创建新分类
   * @param {Object} categoryData - 分类数据
   * @returns {Promise<any>} 创建结果
   */
  createCategory: async (categoryData) => {
    return request('/category/create', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },

  /**
   * 更新分类信息
   * @param {number|string} categoryId - 分类 ID
   * @param {Object} categoryData - 分类数据
   * @returns {Promise<any>} 更新结果
   */
  updateCategory: async (categoryId, categoryData) => {
    return request(`/category/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData)
    });
  },

  /**
   * 删除分类
   * @param {number|string} categoryId - 分类 ID
   * @returns {Promise<any>} 删除结果
   */
  deleteCategory: async (categoryId) => {
    return request(`/category/${categoryId}`, {
      method: 'DELETE'
    });
  },

  /**
   * 从分类中删除智能体
   * @param {number|string} categoryId - 分类 ID
   * @param {number|string} agentId - 智能体 ID
   * @returns {Promise<any>} 删除结果
   */
  deleteAgentFromCategory: async (categoryId, agentId) => {
    return request(`/category/${categoryId}/agents/${agentId}`, {
      method: 'DELETE'
    });
  },

  /**
   * 更新分类中的智能体（如移动到其他分类、修改状态等）
   * @param {number|string} categoryId - 分类 ID
   * @param {number|string} agentId - 智能体 ID
   * @param {Object} agentData - 更新数据 {targetCategoryId?, status?}
   * @returns {Promise<any>} 更新结果
   */
  updateAgentInCategory: async (categoryId, agentId, agentData) => {
    return request(`/category/${categoryId}/agents/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(agentData)
    });
  },

  /**
   * 设置分类的智能体（完全替换）
   * @param {number|string} categoryId - 分类 ID
   * @param {Array<number|string>} agentIds - 智能体 ID 数组
   * @returns {Promise<any>} 设置结果
   */
  setCategoryAgents: async (categoryId, agentIds) => {
    return request(`/category/${categoryId}/agents`, {
      method: 'PUT',
      body: JSON.stringify({ agentIds })
    });
  }
};

/**
 * 聊天相关 API 接口
 */
export const chatApi = {
  /**
   * 语音转文字
   * @param {File|Blob} audioBlob - 音频文件或 blob
   * @param {string} [language='zh'] - 语言（可选，默认中文）
   * @returns {Promise<any>} 转写结果 {success, data: {text, fileName, ...}}
   */
  voiceToText: async (audioBlob, language = 'zh') => {
    const token = getToken();
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录');
      throw new Error('Token is null');
    }

    const formData = new FormData();
    const fileName = audioBlob instanceof File ? audioBlob.name : 'voice.webm';
    formData.append('file', audioBlob, fileName);
    formData.append('language', language);

    const response = await fetch(`${API_BASE}/chat/voice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      apiLog('语音转文字响应:', data);
      return data;
    } else {
      let errorText = '';
      try {
        errorText = await response.text();
        apiLog('语音转文字错误响应:', errorText);
      } catch (e) {
        apiLog('无法读取语音转文字错误响应');
      }
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
  }
};

/**
 * 组织相关 API 接口
 */
export const orgApi = {
  /**
   * 获取组织列表
   * @returns {Promise<any>} 组织列表
   */
  getOrgList: async () => {
    return request('/org/list');
  },

  /**
   * 创建新组织
   * @param {Object} orgData - 组织数据
   * @returns {Promise<any>} 创建结果
   */
  createOrg: async (orgData) => {
    return request('/org/create', {
      method: 'POST',
      body: JSON.stringify(orgData)
    });
  },

  /**
   * 替换/移交指定组织管理员
   * @param {Object} adminData - 管理员数据 { orgId, userId }
   * @returns {Promise<any>} 替换结果
   */
  replaceOrgAdmin: async (adminData) => {
    return request('/org/admin', {
      method: 'POST',
      body: JSON.stringify(adminData)
    });
  },

  /**
   * 获取组织用户列表
   * @param {number|string} orgId - 组织 ID
   * @returns {Promise<any>} 用户列表
   */
  getOrgUsers: async (orgId) => {
    return request(`/org/${orgId}/users`);
  },

  /**
   * 批量创建组织用户
   * @param {number|string} orgId - 组织 ID
   * @param {Object} usersData - 用户数据
   * @returns {Promise<any>} 创建结果
   */
  batchCreateOrgUsers: async (orgId, usersData) => {
    return request(`/org/${orgId}/users/batch`, {
      method: 'POST',
      body: JSON.stringify(usersData)
    });
  },

  /**
   * 删除组织成员
   * @param {number|string} orgId - 组织 ID
   * @param {number|string} userId - 用户 ID
   * @returns {Promise<any>} 删除结果
   */
  deleteOrgUser: async (orgId, userId) => {
    return request(`/org/${orgId}/users/${userId}`, {
      method: 'DELETE'
    });
  }
};

/**
 * 审批相关 API 接口
 */
export const approvalApi = {
  /**
   * 获取待审批列表
   * @returns {Promise<any>} 待审批列表
   */
  getPendingApprovals: async () => {
    return request('/approval/pending');
  },

  /**
   * 审批智能体
   * @param {number|string} id - 审批 ID
   * @param {Object} reviewData - 审批数据 {status, categoryId, isFeatured}
   * @returns {Promise<any>} 审批结果
   */
  reviewApproval: async (id, reviewData) => {
    return request(`/approval/review/${id}`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }
};

/**
 * 知识库相关 API 接口
 */
export const knowledgeApi = {
  /**
   * 获取文件夹列表
   * @param {Object} [params] - 筛选参数
   * @returns {Promise<any>} 文件夹列表
   */
  getFolders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/knowledge/folders${query ? `?${query}` : ''}`);
  },

  /**
   * 根据 ID 获取文件夹详情
   * @param {number|string} folderId - 文件夹 ID
   * @returns {Promise<any>} 文件夹详情
   */
  getFolderById: async (folderId) => {
    return request(`/knowledge/folders/${folderId}`);
  },

  /**
   * 创建文件夹
   * @param {Object} folderData - 文件夹数据
   * @returns {Promise<any>} 创建结果
   */
  createFolder: async (folderData) => {
    return request('/knowledge/folders', {
      method: 'POST',
      body: JSON.stringify(folderData)
    });
  },

  /**
   * 更新文件夹
   * @param {number|string} folderId - 文件夹 ID
   * @param {Object} folderData - 文件夹数据
   * @returns {Promise<any>} 更新结果
   */
  updateFolder: async (folderId, folderData) => {
    return request(`/knowledge/folders/${folderId}`, {
      method: 'PATCH',
      body: JSON.stringify(folderData)
    });
  },

  /**
   * 删除文件夹
   * @param {number|string} folderId - 文件夹 ID
   * @returns {Promise<any>} 删除结果
   */
  deleteFolder: async (folderId) => {
    return request(`/knowledge/folders/${folderId}`, {
      method: 'DELETE'
    });
  },

  /**
   * 获取文件夹和文件列表（合并接口）
   * @param {Object} [params] - 筛选参数 { parentId }
   * @returns {Promise<any>} { folders: [], files: [] }
   */
  getEntries: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/knowledge/entries${query ? `?${query}` : ''}`);
  },

  /**
   * 获取文件列表
   * @param {Object} [params] - 筛选参数
   * @returns {Promise<any>} 文件列表
   */
  getFiles: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/knowledge/files${query ? `?${query}` : ''}`);
  },

  /**
   * 获取最近使用的文件列表
   * @param {Object} [params] - 筛选参数
   * @returns {Promise<any>} 文件列表
   */
  getRecentFiles: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/knowledge/files/recent${query ? `?${query}` : ''}`);
  },

  /**
   * 根据 ID 获取文件详情
   * @param {number|string} fileId - 文件 ID
   * @returns {Promise<any>} 文件详情
   */
  getFileById: async (fileId) => {
    return request(`/knowledge/files/${fileId}`);
  },

  /**
   * 更新文件信息（重命名/移动）
   * @param {number|string} fileId - 文件 ID
   * @param {Object} fileData - 文件数据 {name, folderId}
   * @returns {Promise<any>} 更新结果
   */
  updateFile: async (fileId, fileData) => {
    return request(`/knowledge/files/${fileId}`, {
      method: 'PATCH',
      body: JSON.stringify(fileData)
    });
  },

  /**
   * 获取文件上传凭证
   * @param {Object} policyData - 策略数据
   * @returns {Promise<any>} 上传凭证
   */
  getUploadPolicy: async (policyData) => {
    return request('/knowledge/files/upload-policy', {
      method: 'POST',
      body: JSON.stringify(policyData)
    });
  },

  /**
   * 创建文件记录
   * @param {Object} fileData - 文件数据
   * @returns {Promise<any>} 创建结果
   */
  createFile: async (fileData) => {
    return request('/knowledge/files', {
      method: 'POST',
      body: JSON.stringify(fileData)
    });
  },

  /**
   * 删除文件
   * @param {number|string} fileId - 文件 ID
   * @returns {Promise<any>} 删除结果
   */
  deleteFile: async (fileId) => {
    return request(`/knowledge/files/${fileId}`, {
      method: 'DELETE'
    });
  },

  /**
   * 批量移动文件
   * @param {number[]} fileIds - 文件 ID 数组
   * @param {number|string|null} targetFolderId - 目标文件夹 ID（null 表示根目录）
   * @returns {Promise<any>} 移动结果
   */
  batchMoveFiles: async (fileIds, targetFolderId) => {
    return request('/knowledge/files/batch-move', {
      method: 'POST',
      body: JSON.stringify({ fileIds, targetFolderId })
    });
  },

  /**
   * 批量删除文件
   * @param {number[]} fileIds - 文件 ID 数组
   * @returns {Promise<any>} 删除结果
   */
  batchDeleteFiles: async (fileIds) => {
    return request('/knowledge/files/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ fileIds })
    });
  },

  /**
   * 获取存储空间统计信息
   * @returns {Promise<any>} 统计信息
   */
  getStorageStats: async () => {
    return request('/knowledge/storage/stats');
  },

  /**
   * 获取智能体 Logo 列表
   * @returns {Promise<any>} Logo 列表
   */
  getAgentLogos: async () => {
    return request('/knowledge/system/agent-logos');
  }
};

/**
 * 模型配置相关 API 接口
 */
export const modelConfigApi = {
  /**
   * 获取模型配置
   * @returns {Promise<any>} 模型配置信息
   */
  getModelConfig: async () => {
    return request('/model-config');
  },

  /**
   * 保存模型配置
   * @param {Object} configData - 模型配置数据
   * @returns {Promise<any>} 保存结果
   */
  saveModelConfig: async (configData) => {
    return request('/model-config', {
      method: 'POST',
      body: JSON.stringify(configData)
    });
  }
};
