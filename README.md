# FPS 射击游戏（React + Vite + 腾讯云开发）

## 项目简介
本项目是一个基于 React + Vite 构建的第一人称射击（FPS）网页小游戏，结合腾讯云 CloudBase 云开发能力，实现了用户登录、实时排行榜、分数存储等功能。适合前端学习、云开发实践和休闲娱乐。

- **前端框架**：React 18 + Vite 4 + Tailwind CSS
- **云开发能力**：腾讯云 CloudBase 静态托管、云数据库
- **主要功能**：
  - 用户名登录（本地持久化）
  - 第一人称射击体验，音效与模型资源丰富
  - 实时排行榜，分数自动上传云端
  - 云数据库存储分数，排行榜全员可见
  - 响应式设计，支持 PC 和移动端

## 启动与开发

### 本地开发
1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发环境：
   ```bash
   npm run dev
   ```
   访问 http://localhost:5173 体验游戏。

### 构建与部署
1. 构建生产包：
   ```bash
   npm run build
   ```
2. 部署到腾讯云静态托管（根目录）：
   - 通过云开发控制台或 CLI 上传 `dist/` 目录内容到静态托管根目录。
   - 已部署访问地址：[https://xiaoyu-0g6ev0ep0c5bbcbf-1302107156.tcloudbaseapp.com/](https://xiaoyu-0g6ev0ep0c5bbcbf-1302107156.tcloudbaseapp.com/)

## 云开发架构说明
- **静态托管**：所有前端页面、资源、音效、模型等均部署于腾讯云静态托管。
- **云数据库**：
  - 集合名：`user_score`
  - 字段：`username`（用户名）、`score`（分数）
  - 权限建议：所有用户可读，所有用户可写（便于排行榜展示）
- **云函数**：如需扩展后端逻辑，可在 `cloudfunctions/` 目录自定义。

## 玩法介绍
1. 进入页面后，右上角点击"👤 登录"输入用户名，或点击"开始游戏"时按提示登录。
2. 点击"开始游戏"进入 FPS 射击场景，使用鼠标/触屏操作射击敌人。
3. 每击败一个敌人获得分数，分数实时上传云端。
4. 点击右上角"🏆 排行榜"可查看所有玩家分数排名。
5. 支持音效开关、背景音乐等操作。

## 特色亮点
- 高保真 FPS 体验，模型与音效丰富
- 云端排行榜，数据实时同步
- 现代前端工程体系，易于二次开发
- 支持移动端与 PC

---

如需自定义玩法、扩展云函数或数据库结构，请参考源码及腾讯云开发文档。

> 访问正式环境：[https://xiaoyu-0g6ev0ep0c5bbcbf-1302107156.tcloudbaseapp.com/](https://xiaoyu-0g6ev0ep0c5bbcbf-1302107156.tcloudbaseapp.com/)

[![Powered by CloudBase](https://7463-tcb-advanced-a656fc-1257967285.tcb.qcloud.la/mcp/powered-by-cloudbase-badge.svg)](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit)  

> 本项目基于 [**CloudBase AI ToolKit**](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit) 开发，通过AI提示词和 MCP 协议+云开发，让开发更智能、更高效，支持AI生成全栈代码、一键部署至腾讯云开发（免服务器）、智能日志修复
