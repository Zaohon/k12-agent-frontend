import { ref, h } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 附件项类型
 * - link: 文件/链接类型
 * - video: 视频类型
 * - image: 图片类型
 * - audio: 音频类型
 */
export interface AttachmentItem {
  type: 'link' | 'video' | 'image' | 'audio'
  url: string
  name?: string
  size?: number // 文件大小（字节）
}

/**
 * 媒体录制器实例（全局单例）
 */
let mediaRecorder: MediaRecorder | null = null

/**
 * 音频数据块数组
 */
let audioChunks: Blob[] = []

/**
 * 格式化文件大小
 * @param bytes - 文件大小（字节）
 * @returns 格式化后的文件大小字符串（如 1.2MB）
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0 || !bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 根据附件类型获取图标
 */
const getAttachmentIcon = (type: string): string => {
  switch (type) {
    case 'image': return ''
    case 'video': return ''
    case 'audio': return ''
    default: return ''
  }
}

/**
 * 渲染附件卡片的方法
 * 返回一个包含附件卡片的渲染函数，可在模板中使用
 */
export const renderAttachmentCards = (
  attachments: { value: AttachmentItem[] },
  onRemove: (index: number) => void
) => {
  return attachments.value.map((item, index) => {
    return h('div', {
      class: 'attachment-card',
      key: index
    }, [
      h('span', { class: 'attachment-icon' }, getAttachmentIcon(item.type)),
      h('span', { class: 'attachment-name' }, item.name || '附件'),
      h('span', {
        class: 'attachment-remove',
        onClick: () => onRemove(index)
      }, '×')
    ])
  })
}

/**
 * 附件管理 Hook
 * 提供文件上传、录音、附件管理等功能
 */
export function useAttachment() {
  /** 附件列表 */
  const attachments = ref<AttachmentItem[]>([])

  /** 是否正在录音 */
  const isRecording = ref(false)

  /**
   * 处理文件选择事件
   * @param event - 文件选择事件
   * @param type - 附件类型
   */
  const handleFileSelect = (event: Event, type: 'video' | 'image' | 'audio') => {
    const input = event.target as HTMLInputElement
    if (!input.files) return

    Array.from(input.files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        addAttachment({
          type,
          url: result,
          name: file.name,
          size: file.size
        })
      }
      reader.readAsDataURL(file)
    })

    input.value = ''
  }

  /**
   * 上传图片
   * 打开文件选择器，支持多选图片
   */
  const uploadImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e) => handleFileSelect(e, 'image')
    input.click()
  }

  /**
   * 上传视频
   * 打开文件选择器，支持多选视频
   */
  const uploadVideo = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.multiple = true
    input.onchange = (e) => handleFileSelect(e, 'video')
    input.click()
  }

  /**
   * 上传音频文件
   * 打开文件选择器，选择音频文件
   */
  const uploadAudioFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*'
    input.onchange = (e) => handleFileSelect(e as Event, 'audio')
    input.click()
  }

  /**
   * 上传通用文件
   * 打开文件选择器，不限制文件类型
   */
  const uploadFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (!target.files) return

      Array.from(target.files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const result = event.target?.result as string
          addAttachment({
            type: 'link',
            url: result,
            name: file.name,
            size: file.size
          })
        }
        reader.readAsDataURL(file)
      })
      target.value = ''
    }
    input.click()
  }

  /**
   * 添加链接附件
   * 弹出提示框让用户输入链接地址
   */
  const addLink = () => {
    const url = prompt('请输入链接地址：')
    if (url) {
      addAttachment({
        type: 'link',
        url: url,
        name: url
      })
    }
  }

  /**
   * 开始录音
   * 请求麦克风权限并开始录制音频
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)
      audioChunks = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' })
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          addAttachment({
            type: 'audio',
            url: result,
            name: `录音_${new Date().toLocaleString()}.mp3`,
            size: audioBlob.size
          })
        }
        reader.readAsDataURL(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      isRecording.value = true
      ElMessage.success('开始录音')
    } catch (error) {
      ElMessage.error('无法访问麦克风，请检查权限设置')
    }
  }

  /**
   * 停止录音
   * 停止当前录音并保存录音文件
   */
  const stopRecording = () => {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
      isRecording.value = false
      ElMessage.success('录音已停止')
    }
  }

  /**
   * 添加附件到列表
   * @param item - 附件项
   */
  const addAttachment = (item: AttachmentItem) => {
    attachments.value.push(item)
  }

  /**
   * 从列表中移除附件
   * @param index - 附件索引
   */
  const removeAttachment = (index: number) => {
    attachments.value.splice(index, 1)
  }

  /**
   * 清空所有附件
   */
  const clearAttachments = () => {
    attachments.value = []
  }

  /**
   * 获取附件摘要信息
   * @returns 附件信息字符串，每行一个
   */
  const getAttachmentSummary = () => {
    return attachments.value.map(item => {
      if (item.type === 'link') {
        return `[文件] ${item.name || item.url}`
      } else if (item.type === 'image') {
        return `[图片] ${item.name || 'image'}`
      } else if (item.type === 'video') {
        return `[视频] ${item.name || 'video'}`
      } else if (item.type === 'audio') {
        return `[音频] ${item.name || 'audio'}`
      }
      return ''
    }).join('\n')
  }

  return {
    attachments,
    isRecording,
    uploadImage,
    uploadVideo,
    uploadAudioFile,
    uploadFile,
    addLink,
    startRecording,
    stopRecording,
    addAttachment,
    removeAttachment,
    clearAttachments,
    getAttachmentSummary,
    getAttachmentIcon,
    formatFileSize
  }
}
