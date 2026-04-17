<template>
  <div class="min-h-screen">
    <!-- 登录弹窗 -->
    <LoginModal 
      :visible="showLoginModal" 
      @close="closeLoginModal"
      @login="handleLogin"
    />

    <!-- 导航栏 -->
    <nav class="bg-white" style="box-shadow: 0 12px 20px 0 #314DE20F;">
      <div class="w-full px-4 py-3 flex justify-between items-center">
        <div class="flex items-center space-x-2" style="margin-left: 20px;">
          <img src="@/images/longqi-logo.png" alt="Logo" class="h-8 w-auto object-contain">
          <div class="flex flex-col">
            <span class="text-2xl font-bold tracking-wider bg-gradient-to-tl from-[#314DE2] to-[#6144D3] bg-clip-text text-transparent">龙启云</span>
            <span class="text-[12px] text-gray-500 tracking-wide">你的数字引航者</span>
          </div>
        </div>
        <div class="flex items-center space-x-6" style="margin-right: 20px;">
          <button @click="openLoginModal" class="text-white px-5 py-2 rounded-[12px] bg-gradient-to-tl from-[#6144D3] to-[#314DE2] hover:opacity-90 transition-opacity ml-auto">登录</button>
        </div>
      </div>
    </nav>

    <!-- 英雄区域 -->
    <section class="min-h-screen flex items-center py-20 px-10" style="background: radial-gradient(circle at center, #314DE233 10%, #314DE200 40%);">
      <div class="container mx-auto max-w-6xl">
            <div class="text-[96px] leading-[96px] font-bold text-gray-900 mb-6 text-center">
              <span>龙启云</span>
              <span class="bg-gradient-to-tl from-[#6144D3] to-[#314DE2] bg-clip-text text-transparent"> 轻松备课</span>
            </div>
            <div class="text-[25px] leading-[28px] font-normal text-[#5A6066] mb-6 text-center tracking-[0px] max-w-3xl mx-auto">
              专为教师打造的AI辅助教研平台，通过智能算法将繁琐的备课流程缩短至分钟级，让教学回归本质。
            </div>
            <div class="text-center mt-[50px]">
              <button 
              @click="openLoginModal"
              class="inline-block text-white px-8 py-3 rounded-[12px] text-lg font-medium bg-gradient-to-tl from-[#6144D3] to-[#314DE2] hover:opacity-90 transition-opacity" 
              style="box-shadow: 0px 8px 10px -6px #314DE240;box-shadow: 0px 20px 25px -5px #314DE240;">
                立即体验
              </button>
            </div>
      </div>
    </section>

    <!-- 特性区域 -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-7xl">
        <div class="grid grid-cols-3 grid-rows-2 gap-6">
          <!-- 智能教案生成 - 第一行第一列，占 2 列 -->
          <div class="col-span-2 row-span-1 relative rounded-[24px] overflow-hidden" style="background: linear-gradient(135deg, #314DE2 0%, #6144D3 100%); min-height: 400px;">
            <div class="absolute top-2/4 right-10 transform -translate-y-1/2 w-80 h-80 opacity-50">
              <img src="@/images/book.png" alt="" class="w-full h-full object-contain" />
            </div>
            <div class="relative z-10 p-10 h-full flex flex-col justify-end pb-16">
              <span class="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-xs mb-4 w-fit">热门推荐</span>
              <h3 class="text-2xl font-bold text-white mb-3">智能教案生成</h3>
              <p class="text-white/80 text-sm mb-6" style="max-width: 280px;">基于新课标深度学习，秒级生成符合学情、逻辑严密的教学方案。</p>
              <button class="hover:opacity-90 transition-opacity" style="width: 104px; height: 40px; padding: 10px 24px; border-radius: 12px; background: white; box-shadow: 0px 8px 10px -6px #0000001A, 0px 20px 25px -5px #0000001A; font-family: 'Noto Sans SC'; font-weight: 500; font-size: 14px; line-height: 20px; letter-spacing: 0px; text-align: center; color: #314DE2;">
                立即开始
              </button>
            </div>
          </div>

          <!-- PPT 课件转换 - 第一行第二列，占 1 列 -->
          <div class="col-span-1 row-span-1 rounded-[24px] p-8" style="background: #E6DEFF80; border: 1px solid #6144D31A;">
            <div class="mb-6">
              <div class="w-14 h-14 rounded-[16px] flex items-center justify-center" style="background: #E9E5FF;">
                <img src="@/images/upload.png" alt="" class="w-6 h-6 object-contain" />
              </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">PPT 课件转换</h3>
            <p class="text-gray-600 text-sm mb-8">一键将教案转化为精美的课件。支持多种教育模板，自动配图与排版。</p>
            <div class="rounded-[16px] p-4 bg-white" style="margin-top: 80px;">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-[12px] flex items-center justify-center" style="background: #6144D3;">
                  <img src="@/images/pen.png" alt="" style="width: 12.25px; height: 12.25px;" />
                </div>
                <div style="background: #6144D333; width: 96px; height: 8px; border-radius: 9999px;"></div>
              </div>
            </div>
          </div>

          <!-- AI 随堂练习 - 第二行第一列，占 1 列 -->
          <div class="col-span-1 row-span-1 rounded-[24px] p-8" style="background: #DEE5FD80; height: 300px; border: 1px solid #575F731A;">
            <div class="mb-6">
              <div class="w-14 h-14 rounded-[16px] flex items-center justify-center" style="background: #575F731A;">
                <img src="@/images/papers.png" alt="" class="w-6 h-6 object-contain" />
              </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">AI 随堂练习</h3>
            <p class="text-gray-600 text-sm mb-6" style="font-family: 'Noto Sans SC'; font-weight: 400; font-size: 16px; line-height: 24px; letter-spacing: 0px;">根据教学内容即时生成多维度练习题，包括选择题、简答题及思维导图式作业。</p>
            <div class="flex items-center space-x-3">
              <span class="px-3 py-1.5 rounded-full bg-white text-gray-700" style="font-family: 'Noto Sans SC'; font-weight: 600; font-size: 12px; line-height: 16px; letter-spacing: 0px; background-color: #FFFFFF66;">难易度调节</span>
              <span class="px-3 py-1.5 rounded-full bg-white text-gray-700" style="font-family: 'Noto Sans SC'; font-weight: 600; font-size: 12px; line-height: 16px; letter-spacing: 0px; background-color: #FFFFFF66;">自动批改</span>
            </div>
          </div>

          <!-- 学术资源库 - 第二行第二列，占 2 列 -->
          <div class="col-span-2 row-span-1 rounded-[24px] p-8 bg-white border border-gray-100" style="height: 300px; border: 1px solid #ADB2B91A;">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-gray-900 mb-3">学术资源库</h3>
                <p class="text-gray-600 text-sm mb-4" style="font-family: 'Noto Sans SC'; font-weight: 400; font-size: 18px; line-height: 28px; letter-spacing: 0px; max-width: 60%;padding-top: 10px;">连接全球海量教育资源，实时更新。您可以随时调取权威教材、期刊论文与教学视频素材。</p>
                <router-link to="#" class="inline-flex items-center hover:underline" style="font-family: 'Noto Sans SC'; font-weight: 700; font-size: 16px; line-height: 24px; letter-spacing: 0px; color: #314DE2;padding-top: 10px;">
                  探索资源库
                  <img src="@/images/arrow.png" alt="" style="width: 16px; height: 16px; margin-left: 4px;" />
                </router-link>
              </div>
              <div class="flex items-end" style="width: 240px; height: 220px; margin-right: 20px;">
                <img src="@/images/database.png" alt="" style="width: 240px; height: 220px; object-fit: contain;" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 教学支持系统 -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <!-- 标题区域 -->
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">全方位的教学支持系统</h2>
          <p class="text-gray-600 text-lg">不止于 AI，更是您最懂教学的数字化伙伴</p>
        </div>

        <!-- 三个特性 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- 极速响应 -->
          <div class="text-center" style="position: relative; padding-top: 60px;">
            <div class="text-6xl font-bold absolute left-1/2 transform -translate-x-1/2" style="color: #314DE21A; top: 25px;">01</div>
            <h3 class="text-xl font-bold text-gray-900 mb-3" style="color: #2E3339;">极速响应</h3>
            <p style="font-family: 'Noto Sans SC'; font-weight: 400; font-size: 15px; line-height: 24px; letter-spacing: 0px; text-align: center; color: #5A6066;">
              毫秒级内容生成，基于专为中文教学环境优化的 LLM 模型。
            </p>
          </div>

          <!-- 多端同步 -->
          <div class="text-center" style="position: relative; padding-top: 60px;">
            <div class="text-6xl font-bold absolute left-1/2 transform -translate-x-1/2" style="color: #314DE21A; top: 25px;">02</div>
            <h3 class="text-xl font-bold text-gray-900 mb-3" style="color: #2E3339;">多端同步</h3>
            <p style="font-family: 'Noto Sans SC'; font-weight: 400; font-size: 15px; line-height: 24px; letter-spacing: 0px; text-align: center; color: #5A6066;">
              网页端、平板端与手机端数据无缝互通，随时随地修改教案。
            </p>
          </div>

          <!-- 隐私保护 -->
          <div class="text-center" style="position: relative; padding-top: 60px;">
            <div class="text-6xl font-bold absolute left-1/2 transform -translate-x-1/2" style="color: #314DE21A; top: 25px;">03</div>
            <h3 class="text-xl font-bold text-gray-900 mb-3" style="color: #2E3339;">隐私保护</h3>
            <p style="font-family: 'Noto Sans SC'; font-weight: 400; font-size: 15px; line-height: 24px; letter-spacing: 0px; text-align: center; color: #5A6066;">
              企业级数据加密，确保您的原创教学课件与学生数据安全。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer style="background: #F5F7FA; padding-top: 140px; padding-bottom: 40px;">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="flex items-center justify-between">
          <!-- 左侧：Logo 和版权信息 -->
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-2" style="color: #2E3339;">龙启云</h3>
            <p class="text-gray-500 text-sm" style="color: #5A6066;">&copy; 2026 龙起未来. 版权所有.</p>
          </div>

          <!-- 中间：导航链接 -->
          <div class="flex items-center space-x-8">
            <router-link to="#" class="text-gray-600 hover:text-gray-900 text-sm" style="color: #5A6066">隐私政策</router-link>
            <router-link to="#" class="text-gray-600 hover:text-gray-900 text-sm" style="color: #5A6066">服务条款</router-link>
            <router-link to="#" class="text-gray-600 hover:text-gray-900 text-sm" style="color: #5A6066">联系我们</router-link>
            <router-link to="#" class="text-gray-600 hover:text-gray-900 text-sm" style="color: #5A6066">帮助中心</router-link>
          </div>

          <!-- 右侧：分享和语言切换 -->
          <div class="flex items-center space-x-3">
            <button class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
              <img src="@/images/share.png" alt="分享" class="w-5 h-5" />
            </button>
            <button class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
              <img src="@/images/internal.png" alt="全球" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginModal from '../login/index.vue'

// 登录弹窗控制
const showLoginModal = ref(false)

const openLoginModal = () => {
  showLoginModal.value = true
}

const closeLoginModal = () => {
  showLoginModal.value = false
}

const handleLogin = (data: { name: string; phone: string; code: string; education: string; subject: string }) => {
  console.log('登录信息:', data)
  // 这里添加登录逻辑
  closeLoginModal()
}
</script>

<style scoped>
/* 首页样式 */
</style>