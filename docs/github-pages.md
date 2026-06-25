# GitHub Pages 配置指南

> 将项目教程文档部署为静态网站

## 概述

GitHub Pages 是 GitHub 提供的免费静态网站托管服务。本项目使用 VitePress 构建文档，通过 GitHub Actions 自动部署。

**最终效果**：`https://<用户名>.github.io/<仓库名>/`

---

## 第 1 步：准备仓库

仓库必须是**公开的**（私有仓库需要 GitHub Pro）。

```bash
# 查看仓库可见性
gh repo view <用户名>/<仓库名> --json visibility

# 如果是私有仓库，改为公开
gh repo edit <用户名>/<仓库名> --visibility public --accept-visibility-change-consequences
```

## 第 2 步：安装 VitePress

```bash
npm install -D vitepress
```

## 第 3 步：创建文档目录结构

```
项目根目录/
├── docs/                       ← 文档源码
│   ├── .vitepress/
│   │   └── config.mts          ← VitePress 配置
│   ├── index.md                ← 首页
│   └── notex/                  ← 教程内容
│       ├── V0.1.md
│       ├── V0.2.md
│       └── ...
├── .github/
│   └── workflows/
│       └── deploy-docs.yml     ← GitHub Actions 部署脚本
└── package.json
```

## 第 4 步：配置 VitePress

**docs/.vitepress/config.mts**：

```ts
import { defineConfig } from "vitepress";

export default defineConfig({
  title: "NoteX",
  description: "从零开始的 Tauri + Rust 应用开发教程",
  base: "/<仓库名>/",  // 必须与仓库名一致
  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "GitHub", link: "https://github.com/<用户名>/<仓库名>" },
    ],
    sidebar: {
      "/": [
        {
          text: "教程",
          items: [
            { text: "概述", link: "/" },
            { text: "V0.1 脚手架", link: "/notex/V0.1" },
            // ... 更多章节
          ],
        },
      ],
    },
  },
});
```

**关键配置**：
- `base`：必须是 `"/<仓库名>/"`，否则资源路径错误
- `sidebar`：左侧导航菜单

## 第 5 步：添加构建脚本

**package.json**：

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs"
  },
  "devDependencies": {
    "vitepress": "^1.6.4"
  }
}
```

本地预览：
```bash
npm run docs:dev
```

本地构建验证：
```bash
npm run docs:build
```

产物输出到 `docs/.vitepress/dist/`。

## 第 6 步：配置 GitHub Actions

**.github/workflows/deploy-docs.yml**：

```yaml
name: Deploy Docs

on:
  push:
    branches: [master]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run docs:build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**工作流程**：
1. 推送到 master → 触发 Actions
2. `npm ci` 安装依赖
3. `npm run docs:build` 构建文档
4. 上传构建产物
5. 部署到 GitHub Pages

## 第 7 步：启用 GitHub Pages

```bash
# 通过 gh CLI 启用
gh api repos/<用户名>/<仓库名>/pages -X POST -f build_type=workflow
```

或在 GitHub 网页操作：
1. 仓库 → Settings → Pages
2. Source 选择 **GitHub Actions**

## 第 8 步：验证

```bash
# 推送触发部署
git push

# 查看部署状态
gh run list --limit 1

# 访问
# https://<用户名>.github.io/<仓库名>/
```

---

## 常见问题

**Q: 部署失败 `Cannot find package 'vitepress'`**
确保 `package.json` 中 vitepress 在 `devDependencies`，且 workflow 使用 `npm ci`（不是 `npx`）。

**Q: 页面 404**
检查 `config.mts` 中的 `base` 是否与仓库名一致。

**Q: 样式/资源加载失败**
检查 `base` 配置。本地预览时 `base` 可以是 `"/"`，部署时必须是 `"/<仓库名>/"`。

**Q: 私有仓库无法启用 Pages**
GitHub Pages 对私有仓库需要 GitHub Pro。改为公开仓库或升级方案。

---

## 文档分支管理

文档修改使用独立分支 `docs`，通过 PR 合并到 `master` 触发部署：

```bash
# 创建 docs 分支
git checkout -b docs

# 修改文档
# ...

# 提交
git add docs/
git commit -m "更新文档"
git push -u origin docs

# 创建 PR 合并到 master
gh pr create --title "更新文档" --body "文档变更"
```

合并到 master 后，GitHub Actions 自动部署。
