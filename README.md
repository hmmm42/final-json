# JSON 全能工匠

一个在浏览器中进行 JSON 编辑、字符串转义、结构可视化与智能修复的工具，基于 React + TypeScript + Vite + Tailwind。

## 功能特性
- 输入同步：标准 JSON 与转义字符串双向同步
- 可视化树：对象/数组层级展开、删除、序列化/反序列化节点
- 智能修复：
  - JSON 修复：修复缺失括号、未加引号键、尾随逗号、单引号等常见问题
  - 字符串修复：从带前/后缀的字符串中提取核心 JSON 片段并解析
- 历史记录：本地持久化，支持点击恢复、删除单条、清空全部
- 版本栈：自动识别“大改动”（整份粘贴覆盖、删除节点、根结构变化），可撤回、删除单个版本、清空全部
- 分割拖拽：支持左右与上下分割比例调整并持久化
- 主题与可读性：明暗主题、语法着色、行级 hover 与选中高亮

## 快速开始
```bash
pnpm install
pnpm dev
# http://localhost:5174/
```

## 构建与预览
```bash
pnpm build
pnpm preview
```

## 测试
```bash
pnpm test           # 一次性运行并退出
pnpm test:watch     # 监听模式
pnpm test:coverage  # 生成覆盖率报告
```

## GitHub Pages 部署
- 推送到 `main` 分支后自动部署（见 `.github/workflows/deploy.yml`）
- 本地验证：`pnpm build:pages`，`pnpm preview`，访问 `http://localhost:4173/<repo-name>/`
- 详情见 `docs/deployment-github-pages.md`

## 项目结构
```text
src/
  components/
    JsonNode.tsx
  lib/
    json.ts        # 解析与类型工具
    mutate.ts      # 路径变更算法
    stringFix.ts   # 字符串核心 JSON 提取
    versions.ts    # 版本栈与撤回逻辑
  types/
    json.ts        # JSON 类型模型
  App.tsx          # 页面编排与状态
  main.tsx
```

## 文档索引
- 架构与技术栈：`docs/architecture.md`
- 函数 API：`docs/api.md`
- 设计与决策：`docs/design.md`
- 部署指南：`docs/deployment.md`、`docs/deployment-github-pages.md`

## 运行环境
- Node.js ≥ 18
- pnpm ≥ 8

## 脚本
```bash
pnpm dev            # 开发
pnpm build          # 生产构建
pnpm preview        # 本地预览
pnpm test           # 单测一次性
pnpm test:watch     # 单测监听
pnpm test:coverage  # 覆盖率
pnpm build:pages    # 以 GitHub Pages 基础路径构建
```
