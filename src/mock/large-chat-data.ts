// 模拟大量对话数据
export interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const topics = [
  '数学教学',
  '语文教学',
  '英语教学',
  '物理教学',
  '化学教学',
  '生物教学',
  '历史教学',
  '地理教学',
  '政治教学',
  '体育教学',
  '美术教学',
  '音乐教学',
  '信息技术教学',
  '心理健康教育',
  '班主任工作',
  '教学管理',
  '课堂管理',
  '学生评价',
  '教学设计',
  '教学反思',
]

const userTemplates = [
  '请帮我设计一节关于{topic}的教案',
  '如何提高学生在{topic}方面的学习兴趣？',
  '我想了解{topic}的教学方法',
  '请给我一些{topic}的教学建议',
  '在{topic}教学中，如何因材施教？',
  '能帮我出一套{topic}的测试题吗？',
  '如何进行{topic}的教学设计？',
  '在{topic}教学中，如何创设情境？',
  '请分享{topic}的教学策略',
  '如何在{topic}教学中培养学生的核心素养？',
]

const assistantTemplates = [
  '关于{topic}的教学设计，我为您提供以下建议：\n\n1. 教学目标：明确知识、能力和情感态度价值观三个维度的目标\n2. 教学重难点：重点放在核心概念的理解上，难点是实际应用\n3. 教学方法：采用启发式教学、小组合作学习等方法\n4. 教学过程：\n   - 导入：通过生活实例或问题情境引出课题\n   - 新授：逐步讲解核心概念，配合实例演示\n   - 练习：设计分层练习，巩固知识\n   - 小结：师生共同总结本节课内容\n   - 作业：布置开放性作业，拓展思维\n5. 板书设计：突出重点，条理清晰\n\n希望这个设计对您有所帮助！',
  '提高学生在{topic}方面的学习兴趣，可以从以下几个方面入手：\n\n1. 联系生活实际：将教学内容与学生的生活经验相结合\n2. 创设问题情境：通过有趣的问题引发学生的好奇心\n3. 采用多样化的教学手段：使用多媒体、实验、游戏等方式\n4. 给予及时的正面反馈：肯定学生的努力和进步\n5. 组织小组合作学习：培养学生的合作意识和竞争意识\n6. 引入学科史话：讲述相关的历史故事，增加趣味性\n\n通过这些方法，可以有效激发学生的学习兴趣。',
  '在{topic}教学中，我建议采用以下教学方法：\n\n1. 讲授法：系统讲解基础知识\n2. 讨论法：组织学生进行小组讨论和全班交流\n3. 演示法：通过实验、演示等方式直观展示\n4. 练习法：设计有针对性的练习巩固知识\n5. 探究法：引导学生自主探究发现\n6. 情境教学法：创设具体的教学情境\n\n根据教学内容的特点，可以灵活组合使用这些方法。',
  '关于{topic}的教学建议：\n\n1. 深入理解课程标准：准确把握教学要求\n2. 认真分析学情：了解学生的知识基础和学习特点\n3. 精心设计教学活动：活动要有明确的目标和可操作性\n4. 注重思维训练：培养学生的分析和解决问题能力\n5. 关注全体学生：因材施教，满足不同层次学生的需求\n6. 及时进行教学反思：总结经验，持续改进教学\n\n希望这些建议对您的教学有所帮助！',
]

// 生成200条对话（100个用户消息 + 100个助手消息）
export function generateLargeChatData(): Message[] {
  const messages: Message[] = []

  for (let i = 1; i <= 100; i++) {
    const topicIndex = (i - 1) % topics.length
    const userTemplateIndex = (i - 1) % userTemplates.length
    const assistantTemplateIndex = (i - 1) % assistantTemplates.length

    const topic = topics[topicIndex]
    const userContent = userTemplates[userTemplateIndex].replace('{topic}', topic)
    const assistantContent = assistantTemplates[assistantTemplateIndex].replace('{topic}', topic)

    // 用户消息
    messages.push({
      id: i * 2 - 1,
      role: 'user',
      content: userContent,
    })

    // 助手消息
    messages.push({
      id: i * 2,
      role: 'assistant',
      content: assistantContent,
    })
  }

  return messages
}

export const largeChatData = generateLargeChatData()
