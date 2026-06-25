import { defineConfig } from "vitepress";

export default defineConfig({
  title: "NoteX",
  description: "从零开始的 Tauri + Rust 应用开发教程",
  base: "/notex/",
  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "教程", link: "/notex/" },
      { text: "GitHub", link: "https://github.com/Hyelleto/notex" },
    ],
    sidebar: {
      "/notex/": [
        {
          text: "NoteX 教程",
          items: [
            { text: "概述", link: "/notex/" },
            { text: "V0.1 脚手架搭建", link: "/notex/V0.1" },
            { text: "V0.2 笔记列表 UI", link: "/notex/V0.2" },
            { text: "V0.3 前后端打通 ⭐TDD", link: "/notex/V0.3" },
            { text: "V0.4 文件持久化 ⭐TDD", link: "/notex/V0.4" },
            { text: "V0.5 用户偏好 ⭐TDD", link: "/notex/V0.5" },
            { text: "V0.6 分类标签 ⭐TDD", link: "/notex/V0.6" },
            { text: "V0.7 自定义窗口", link: "/notex/V0.7" },
            { text: "V0.8 快捷键托盘", link: "/notex/V0.8" },
            { text: "V0.9 权限安全", link: "/notex/V0.9" },
            { text: "V1.0 发布更新", link: "/notex/V1.0" },
            { text: "V1.1 加密插件 ⭐TDD", link: "/notex/V1.1" },
            { text: "V1.2 全文搜索 ⭐TDD", link: "/notex/V1.2" },
            { text: "V1.3 多语言", link: "/notex/V1.3" },
          ],
        },
      ],
    },
  },
});
