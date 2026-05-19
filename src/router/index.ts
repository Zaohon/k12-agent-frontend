import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/workspace',
    name: 'Workspace',
    component: () => import('@/views/workspace/index.vue'),
    redirect: '/workspace/chat',
    children: [
      {
        path: 'square',
        name: 'Square',
        component: () => import('@/views/workspace/Square.vue'),
        meta: { title: '教育智能体' }
      },
      {
        path: 'chat/:agentId?',
        name: 'ChatBox',
        component: () => import('@/views/workspace/ChatBox.vue'),
        meta: { title: '智能问答' }
      },
      {
        path: 'studio',
        name: 'AgentStudio',
        component: () => import('@/views/workspace/AgentStudio.vue'),
        meta: { title: '我的智能体' }
      },
      {
        path: 'agent/edit',
        name: 'AgentEdit',
        component: () => import('@/views/workspace/AgentEdit.vue'),
        meta: { title: '编辑智能体' }
      },
      {
        path: 'knowledge',
        name: 'KnowledgeBase',
        component: () => import('@/views/workspace/KnowledgeBase.vue'),
        meta: { title: '知识库' }
      },
      {
        path: 'knowledge/folder/:folderId',
        name: 'KnowledgeBaseFolder',
        component: () => import('@/views/workspace/KnowledgeBaseFolder.vue'),
        meta: { title: '知识库文件夹' }
      },
      {
        path: 'org',
        name: 'OrgManage',
        component: () => import('@/views/workspace/OrgManage.vue'),
        meta: { title: '组织管理' }
      },
      {
        path: 'approval',
        name: 'ApprovalCenter',
        component: () => import('@/views/workspace/ApprovalCenter.vue'),
        meta: { title: '审批中心' }
      },
      {
        path: 'category',
        name: 'CategoryManage',
        component: () => import('@/views/workspace/CategoryManage.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/workspace/Profile.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'model-config',
        name: 'ModelConfig',
        component: () => import('@/views/workspace/ModelConfig.vue'),
        meta: { title: '模型与接口配置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from) => {
  const token = localStorage.getItem('k12_token');
  
  if (to.path !== '/login' && to.path !== '/' && !token) {
    return '/login';
  }
  
  if (to.path === '/login' && token) {
    return '/workspace';
  }
});

router.onError((error) => {
  const isNavigationDuplicated = error.message.includes('Avoided redundant navigation to native location');
  if (!isNavigationDuplicated) {
    console.error('路由错误:', error);
  }
});

const handleUnauthorized = () => {
  localStorage.removeItem('k12_token');
  localStorage.removeItem('k12_user');
  router.push('/');
};

window.addEventListener('unauthorized', handleUnauthorized);

export default router
