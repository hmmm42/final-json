# 环境配置与部署指南

## 本地开发
```bash
pnpm install
pnpm dev
# 打开 http://localhost:5174/
```

## 构建
```bash
pnpm build
# 产物位于 dist/
```

## 测试
```bash
pnpm test
pnpm test:coverage
```

## 依赖说明
- Node.js >= 18
- pnpm >= 8
- 主要依赖见 `package.json`
