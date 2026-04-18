import { ElMessage } from 'element-plus';

const API_BASE = 'http://localhost:3000';

const getToken = () => {
  return localStorage.getItem('k12_token');
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

  sendMessage: async (sessionId, prompt) => {
    const token = getToken();

    try {
      const response = await fetch(`${API_BASE}/session/chat/${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        return response;
      } else {
        if (response.status === 401) {
          ElMessage.error('未授权，请重新登录');
        } else if (response.status === 404) {
          ElMessage.error('会话不存在');
        } else if (response.status === 500) {
          ElMessage.error('服务器内部错误');
        } else {
          ElMessage.error('发送消息失败');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
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