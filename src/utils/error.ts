export const AI_ERROR_MAP = {
  invalid_api_key: 'AI服务配置错误：API Key无效或未配置',
  'invalid access token or token expired': 'AI服务认证失败：访问令牌无效或已过期',
  invalid_request_error: '请求参数错误',
  rate_limit_exceeded: '请求频率过高，请稍后重试',
  insufficient_quota: 'API调用额度不足，请联系管理员',
  model_not_found: '模型未找到',
  service_unavailable: 'AI服务暂时不可用，请稍后重试'
};

export const translateAIError = (code: string, message?: string): string => {
  if (AI_ERROR_MAP[code as keyof typeof AI_ERROR_MAP]) {
    return AI_ERROR_MAP[code as keyof typeof AI_ERROR_MAP];
  }

  if (message) {
    const lowerMessage = message.toLowerCase();
    for (const [key, value] of Object.entries(AI_ERROR_MAP)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return value;
      }
    }
  }

  return message || 'AI服务错误';
};

export interface AIErrorInfo {
  code: string;
  message: string;
}

export const parseAIError = (data: any): AIErrorInfo | null => {
  if (data.error && data.error.code) {
    return { code: data.error.code, message: data.error.message };
  }
  if (data.code && data.message) {
    return { code: data.code, message: data.message };
  }
  if (data.choices?.[0]?.finish_reason === 'error') {
    return { code: 'api_error', message: 'API调用失败' };
  }
  return null;
};
