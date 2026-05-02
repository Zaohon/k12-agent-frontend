import { ElMessage } from 'element-plus';
import { translateAIError } from '../utils/error';

const API_BASE = 'http://localhost:3000';

const getToken = () => {
  const token = localStorage.getItem('k12_token');
  return token ? token.trim() : null;
};

const request = async (url, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE}${url}`, config);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      if (response.status === 401) {
        ElMessage.error('未授权，请重新登录');
      } else if (response.status === 404) {
        ElMessage.error('资源不存在');
      } else if (response.status === 500) {
        ElMessage.error('服务器内部错误');
      } else {
        ElMessage.error('请求失败');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    ElMessage.error('网络错误，请检查后端服务是否启动');
    throw error;
  }
};

export const authApi = {
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
  }
};

export const agentApi = {
  getMyAgents: async () => {
    return request('/agent/my');
  },

  getAgentById: async (agentId) => {
    return request(`/agent/${agentId}`);
  },

  createAgent: async (agentData) => {
    return request('/agent/create', {
      method: 'POST',
      body: JSON.stringify(agentData)
    });
  },

  updateAgent: async (agentId, agentData) => {
    return request('/agent/update/${agentId}', {
      method: 'POST',
      body: JSON.stringify(agentData)
    });
  },

  deleteAgent: async (agentId) => {
    ElMessage.warning('删除功能暂未实现')
  },

  getDiscoverAgents: async (categoryId) => {
    const url = categoryId ? `/agent/discover?categoryId=${categoryId}` : '/agent/discover';
    return request(url);
  },

  getFeaturedAgents: async () => {
    return request('/agent/featured');
  }
};

export const sessionApi = {
  getSessionList: async () => {
    return request('/session/list');
  },

  createSession: async () => {
    return request('/session/create', {
      method: 'POST'
    });
  },

  getSessionHistory: async (sessionId) => {
    return request(`/session/history/${sessionId}`);
  },

  sendMessage: async (sessionId, prompt, attachments = []) => {
    const token = getToken();
    
    console.log('=== sendMessage Debug ===');
    console.log('Token from localStorage:', token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录');
      throw new Error('Token is null');
    }

    try {
      console.log('Sending request to:', `${API_BASE}/session/chat/${sessionId}`);
      console.log('Authorization header:', `Bearer ${token}`);
      
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

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      if (response.ok) {
        return response;
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
          console.log('Error response body:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            console.log('Parsed error JSON:', errorJson);
            
            if (errorJson.error && errorJson.error.code) {
              console.error('AI API Error:', errorJson.error.code, errorJson.error.message);
              ElMessage.error(translateAIError(errorJson.error.code, errorJson.error.message));
            } else if (errorJson.code && errorJson.message) {
              console.error('API Error:', errorJson.code, errorJson.message);
              ElMessage.error(translateAIError(errorJson.code, errorJson.message));
            }
          } catch (parseError) {
            console.log('Error response is not JSON:', errorText);
          }
        } catch (e) {
          console.error('Failed to read error response:', e);
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

  updateSessionTopic: async (sessionId, topic) => {
    return request(`/session/update-topic/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ topic })
    });
  },

  deleteSession: async (sessionId) => {
    return request(`/session/${sessionId}`, {
      method: 'DELETE'
    });
  }
};

export const categoryApi = {
  getCategoryList: async () => {
    return request('/category/list');
  },

  createCategory: async (categoryData) => {
    return request('/category/create', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },

  updateCategory: async (categoryId, categoryData) => {
    return request(`/category/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData)
    });
  },

  deleteCategory: async (categoryId) => {
    return request(`/category/${categoryId}`, {
      method: 'DELETE'
    });
  }
};
