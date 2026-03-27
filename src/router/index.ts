import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/workspace/square'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/workspace',
    name: 'Workspace',
    component: () => import('../views/workspace/index.vue'),
    redirect: '/workspace/square',
    children: [
      {
        path: 'square',
        name: 'Square',
        component: () => import('../views/workspace/Square.vue'),
        meta: { title: '教育智能体' }
      },
      {
        path: 'chat/:agentId?',
        name: 'ChatBox',
        component: () => import('../views/workspace/ChatBox.vue'),
        meta: { title: '智能问答' }
      },
      {
        path: 'studio',
        name: 'AgentStudio',
        component: () => import('../views/workspace/AgentStudio.vue'),
        meta: { title: '我的智能体' }
      },
      {
        path: 'org',
        name: 'OrgManage',
        component: () => import('../views/workspace/OrgManage.vue'),
        meta: { title: '组织管理' }
      },
      {
        path: 'approval',
        name: 'ApprovalCenter',
        component: () => import('../views/workspace/ApprovalCenter.vue'),
        meta: { title: '审批中心' }
      },
      {
        path: 'category',
        name: 'CategoryManage',
        component: () => import('../views/workspace/CategoryManage.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/workspace/Profile.vue'),
        meta: { title: '个人中心' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('k12_token');
  if (to.path !== '/login' && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/workspace');
  } else {
    next();
  }
});

export default router
