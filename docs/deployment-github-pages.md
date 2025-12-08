# GitHub Pages 部署

## 准备工作
- 仓库默认分支为 `main`
- 在仓库 Settings → Pages 中，Source 选择 “GitHub Actions”

## 一键部署
- 推送到 `main` 分支后，CI 会自动：
  - 安装依赖
  - 以 `BASE_PATH=/<repo-name>/` 构建产物
  - 发布到 GitHub Pages 环境

## 本地验证
```bash
pnpm build:pages
pnpm preview
# 打开 http://localhost:4173/${npm_package_name}/ 验证资源路径
```

## 基础路径说明
- Vite 配置读取环境变量 `BASE_PATH` 作为 `base`
- 在 GitHub Pages 上，`base` 为 `/<repo-name>/`
- 本地或其他部署场景可不设置，默认为 `/`

## 工作流文件
- `.github/workflows/deploy.yml`：使用官方 `actions/deploy-pages` 与 `upload-pages-artifact`
- 如需更改触发分支，将 `branches: [ main ]` 修改为你的默认分支
