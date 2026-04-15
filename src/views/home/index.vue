<template>
  <div class="min-h-screen">
    <!-- 导航栏 -->
    <nav class="bg-white" style="box-shadow: 0 12px 20px 0 #314DE20F;">
      <div class="w-full px-4 py-3 flex justify-between items-center">
        <div class="flex items-center space-x-2" style="margin-left: 20px;">
          <img src="/images/longqi-logo.png" alt="Logo" class="h-8 w-auto object-contain">
          <div class="flex flex-col">
            <span class="text-2xl font-bold tracking-wider bg-gradient-to-tl from-[#314DE2] to-[#6144D3] bg-clip-text text-transparent">龙启云</span>
            <span class="text-[12px] text-gray-500 tracking-wide">你的数字引航者</span>
          </div>
        </div>
        <div class="flex items-center space-x-6" style="margin-right: 20px;">
          <a href="/login" class="text-white px-5 py-2 rounded-[12px] bg-gradient-to-tl from-[#6144D3] to-[#314DE2] hover:opacity-90 transition-opacity ml-auto">登录</a>
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
              <a 
              href="/login" 
              class="inline-block text-white px-8 py-3 rounded-[12px] text-lg font-medium bg-gradient-to-tl from-[#6144D3] to-[#314DE2] hover:opacity-90 transition-opacity" 
              style="box-shadow: 0px 8px 10px -6px #314DE240;box-shadow: 0px 20px 25px -5px #314DE240;">
                立即体验
              </a>
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
              <img src="/images/book.png" alt="" class="w-full h-full object-contain" />
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
          <div class="col-span-1 row-span-1 rounded-[24px] p-8" style="background: #E6DEFF80;">
            <div class="mb-6">
              <div class="w-14 h-14 rounded-[16px] flex items-center justify-center" style="background: #E9E5FF;">
                <img src="/images/upload.png" alt="" class="w-6 h-6 object-contain" />
              </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">PPT 课件转换</h3>
            <p class="text-gray-600 text-sm mb-8">一键将教案转化为精美的课件。支持多种教育模板，自动配图与排版。</p>
            <div class="rounded-[16px] p-4 bg-white" style="margin-top: 80px;">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-[12px] flex items-center justify-center" style="background: #6144D3;">
                  <img src="/images/pen.png" alt="" style="width: 12.25px; height: 12.25px;" />
                </div>
                <div style="background: #6144D333; width: 96px; height: 8px; border-radius: 9999px;"></div>
              </div>
            </div>
          </div>

          <!-- AI 随堂练习 - 第二行第一列，占 1 列 -->
          <div class="col-span-1 row-span-1 rounded-[24px] p-8" style="background: #DEE5FD80;">
            <div class="flex items-start justify-between mb-6">
              <div class="w-14 h-14 rounded-[16px] flex items-center justify-center" style="background: #E9E5FF;">
                <img src="/images/papers.png" alt="" class="w-6 h-6 object-contain" />
              </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">AI 随堂练习</h3>
            <p class="text-gray-600 text-base mb-8">根据教学内容即时生成多维度练习题，包括选择题、简答题及思维导图式作业。</p>
            <div class="flex items-center space-x-3">
              <span class="px-3 py-1.5 rounded-full bg-white text-gray-700 text-sm">难易度调节</span>
              <span class="px-3 py-1.5 rounded-full bg-white text-gray-700 text-sm">自动批改</span>
            </div>
          </div>

          <!-- 学术资源库 - 第二行第二列，占 2 列 -->
          <div class="col-span-2 row-span-1 rounded-[24px] p-8 bg-white border border-gray-100">
            <div class="flex items-start justify-between mb-6">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-gray-900 mb-4">学术资源库</h3>
                <p class="text-gray-600 text-base mb-6">连接全球海量教育资源，实时更新。您可以随时调取权威教材、期刊论文与教学视频素材。</p>
                <a href="#" class="inline-flex items-center text-[#314DE2] font-medium hover:underline">
                  探索资源库
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
              <div class="w-48 h-48 ml-6">
                <img src="/images/database.png" alt="" class="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 客户案例 -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">客户案例</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            来自全国各地的学校和教育机构正在使用我们的平台，提升教学效率和学习体验。
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white p-8 rounded-lg shadow-md">
            <div class="flex items-center mb-4">
              <div class="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">北京市第一中学</h3>
                <p class="text-gray-600">公立中学</p>
              </div>
            </div>
            <p class="text-gray-600 mb-4">
              "使用龙启云平台后，我们的教师能够快速创建个性化的智能教学助手，大大提升了教学效率和学生的学习积极性。"
            </p>
            <div class="flex items-center">
              <div class="flex">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white p-8 rounded-lg shadow-md">
            <div class="flex items-center mb-4">
              <div class="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">上海市实验学校</h3>
                <p class="text-gray-600">私立学校</p>
              </div>
            </div>
            <p class="text-gray-600 mb-4">
              "龙启云的智能体平台为我们的教学提供了全新的可能性，学生可以获得个性化的学习体验，教师也能更高效地管理教学内容。"
            </p>
            <div class="flex items-center">
              <div class="flex">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系我们 -->
    <section class="py-20 bg-white">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="bg-indigo-50 rounded-xl p-12">
          <div class="text-center mb-10">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">联系我们</h2>
            <p class="text-gray-600 max-w-2xl mx-auto">
              无论您是学校、教师还是教育机构，我们都愿意为您提供专业的智能教育解决方案。
            </p>
          </div>
          <div class="max-w-3xl mx-auto">
            <form class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                  <input type="text" id="name" class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                  <input type="email" id="email" class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
              </div>
              <div>
                <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">主题</label>
                <input type="text" id="subject" class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-2">消息</label>
                <textarea id="message" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>
              <div class="text-center">
                <button type="submit" class="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium">
                  提交
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center space-x-2 mb-6">
              <img src="/favicon.svg" alt="Logo" class="h-8 w-8">
              <span class="text-xl font-bold">龙启云</span>
            </div>
            <p class="text-gray-400 mb-6">
              智能教育解决方案提供商，致力于为K12教育提供个性化、高效的智能体服务。
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-6">产品</h3>
            <ul class="space-y-4">
              <li><a href="#" class="text-gray-400 hover:text-white">智能体工厂</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">AI 代理引擎</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">资源分类系统</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">批量账户系统</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-6">解决方案</h3>
            <ul class="space-y-4">
              <li><a href="#" class="text-gray-400 hover:text-white">学校解决方案</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">教师解决方案</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">学生解决方案</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">教育机构解决方案</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-6">公司</h3>
            <ul class="space-y-4">
              <li><a href="#" class="text-gray-400 hover:text-white">关于我们</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">联系我们</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">加入我们</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">隐私政策</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-12 pt-8 text-center">
          <p class="text-gray-400">© 2026 龙启云. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 首页组件逻辑
</script>

<style scoped>
/* 首页样式 */
</style>