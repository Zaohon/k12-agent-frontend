import { translateAIError, parseAIError } from './error';

export interface AIMessage {
  content: string;
}

export interface ProcessSSEResult {
  shouldStop: boolean;
  hasNewContent: boolean;
}

/**
 * 处理单个 SSE 行数据
 * @param line - SSE 行数据
 * @param aiMsg - AI 消息对象
 * @returns 是否需要终止处理和是否有新内容
 */
export const processSSELine = (line: string, aiMsg: AIMessage): ProcessSSEResult => {
  const trimmedLine = line.trim();
  if (!trimmedLine) return { shouldStop: false, hasNewContent: false };
  
  if (trimmedLine.startsWith('data: ')) {
    const dataStr = trimmedLine.substring(6).trim();
    
    if (dataStr === '[DONE]') {
      return { shouldStop: false, hasNewContent: false };
    }
    
    try {
      const data = JSON.parse(dataStr);
      console.log('Received SSE data:', data);
      
      // 检查是否为 AI 服务错误
      const errorInfo = parseAIError(data);
      if (errorInfo) {
        const translatedMsg = translateAIError(errorInfo.code, errorInfo.message);
        aiMsg.content = '错误：' + translatedMsg;
        console.error('AI Service Error:', errorInfo.code, errorInfo.message);
        return { shouldStop: true, hasNewContent: true }; // 终止处理
      }
      
      // 根据 API 文档格式提取内容
      const delta = data.choices?.[0]?.delta?.content || data.content || '';
      console.log('Delta content:', delta);
      
      if (delta) {
        aiMsg.content += delta;
        return { shouldStop: false, hasNewContent: true };
      }
    } catch (e) {
      console.error('SSE parse error:', e, 'Data:', dataStr);
    }
  }
  return { shouldStop: false, hasNewContent: false };
};

/**
 * 处理 SSE 缓冲区
 * @param buffer - SSE 缓冲区数据
 * @param aiMsg - AI 消息对象
 * @returns 是否遇到错误和是否有新内容
 */
export const processSSEBuffer = (buffer: string, aiMsg: AIMessage): ProcessSSEResult => {
  const lines = buffer.split('\n');
  let hasNewContent = false;
  for (const line of lines) {
    const result = processSSELine(line, aiMsg);
    if (result.hasNewContent) {
      hasNewContent = true;
    }
    if (result.shouldStop) {
      return { shouldStop: true, hasNewContent: true }; // 遇到错误，终止处理
    }
  }
  return { shouldStop: false, hasNewContent };
};
