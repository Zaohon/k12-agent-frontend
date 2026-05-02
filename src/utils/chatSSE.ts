import { translateAIError, parseAIError } from './error';

export interface AIMessage {
  content: string;
}

/**
 * 处理单个 SSE 行数据
 * @param line - SSE 行数据
 * @param aiMsg - AI 消息对象
 * @returns 是否需要终止处理（遇到错误时）
 */
export const processSSELine = (line: string, aiMsg: AIMessage): boolean => {
  const trimmedLine = line.trim();
  if (!trimmedLine) return false;
  
  if (trimmedLine.startsWith('data: ')) {
    const dataStr = trimmedLine.substring(6).trim();
    
    if (dataStr === '[DONE]') {
      return false;
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
        return true; // 终止处理
      }
      
      // 根据 API 文档格式提取内容
      const delta = data.choices?.[0]?.delta?.content || data.content || '';
      console.log('Delta content:', delta);
      
      if (delta) {
        aiMsg.content += delta;
      }
    } catch (e) {
      console.error('SSE parse error:', e, 'Data:', dataStr);
    }
  }
  return false;
};

/**
 * 处理 SSE 缓冲区
 * @param buffer - SSE 缓冲区数据
 * @param aiMsg - AI 消息对象
 * @returns 是否遇到错误
 */
export const processSSEBuffer = (buffer: string, aiMsg: AIMessage): boolean => {
  const lines = buffer.split('\n');
  for (const line of lines) {
    if (processSSELine(line, aiMsg)) {
      return true; // 遇到错误，终止处理
    }
  }
  return false;
};
