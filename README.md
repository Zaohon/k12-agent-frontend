# K12 Agent Integrated Platform - Frontend

> 本项目为 K12 教育智能体集成平台的前端工作台，采用 Vue 3 + Vite 构建，提供极简、高效、模块化的教育 AI 体验。

## 🎨 视觉风格与交互

*   **设计语言**：Element Plus (UI 组件库) + Tailwind CSS (原子化设计)。
*   **设计美学**：现代教育简约风格，蓝紫渐变、玻璃拟态卡片、流畅微交互。
*   **资源大厅**：美观的智能体广场，配备精选推荐 Banner 与多层分类搜索。

## ✨ 核心模块

*   **创作中心 (Agent Studio)**：参数化智能体编辑器，支持从 System Prompt 到动态表单的可视化配置。
*   **智能体广场 (Agent Square)**：全平台 AI 辅教资源的一站式探索，支持所属网点隔离。
*   **审批中心 (Approval Center)**：管理员一键处理上架申请，支持分类指定与推荐推送。
*   **网点组织管理 (Org Manage)**：超级管理员掌控二级组织节点，并支持师生账户的 **Excel 批量导入**。
*   **实时对话引擎 (ChatBox)**：流式渲染、分段加载，提供与 ChatGPT 一致的疾速对话体验。

## 🛠️ 技术栈

*   **框架**：[Vue 3](https://v3.vuejs.org/) (Composition API)
*   **构建工具**：[Vite](https://vitejs.dev/)
*   **状态管理**：[Pinia](https://pinia.vuejs.org/) (User Auth, Token, Role persistence)
*   **路由**：Vue Router 4
*   **样式**：Tailwind CSS + SCSS
*   **组件库**：Element Plus

## 🚀 快速启动

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发环境
```bash
npm run dev
```
项目默认运行在 `http://localhost:5173`。

## 🔧 后端配置
系统已预设连接 `http://localhost:3000` 作为 API 生产端。

## 🤝 参与开发
*   `src/views/workspace`：包含主要业务逻辑页面（大厅、工作室、管理）。
*   `src/components`：精美的高性能复用组件。

## 📜 开源协议
MIT License
