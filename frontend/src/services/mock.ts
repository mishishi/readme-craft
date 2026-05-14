export const MOCK_README: Record<string, string> = {
  minimal: `# awesome-tool

> 一个简洁高效的命令行工具，帮助开发者快速处理数据

## 安装

\`\`\`bash
npm install awesome-tool
\`\`\`

## 使用

\`\`\`bash
# 处理 CSV 文件
awesome-tool process --input data.csv --output result.json

# 实时监控模式
awesome-tool watch --interval 5s
\`\`\`

## 配置

在项目根目录创建 \`awesome-tool.config.json\`：

\`\`\`json
{
  "input": "./data",
  "output": "./dist",
  "format": "json"
}
\`\`\`

## 许可证

MIT © zhurenbao`,

  badges: `# awesome-tool

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="version" />
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="build" />
  <img src="https://img.shields.io/badge/coverage-95%25-green" alt="coverage" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-339933" alt="node" />
  <img src="https://img.shields.io/badge/license-MIT-orange" alt="license" />
  <img src="https://img.shields.io/github/stars/zhurenbao/awesome-tool" alt="stars" />
</p>

## 特性

- **高性能** — 基于流式处理，内存占用极低
- **插件系统** — 支持自定义插件扩展功能
- **多种输出** — 支持 JSON、CSV、YAML 格式
- **类型安全** — 完整的 TypeScript 类型定义

## 安装

\`\`\`bash
npm install awesome-tool
\`\`\`

## 快速开始

\`\`\`bash
awesome-tool init
awesome-tool build
\`\`\`

## 技术栈

- **运行时**: Node.js 18+
- **语言**: TypeScript
- **测试**: Vitest

## 许可证

MIT © zhurenbao`,

  enterprise: `# awesome-tool

<div align="center">

## 企业级数据处理引擎

[![version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/zhurenbao/awesome-tool)
[![build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![coverage](https://img.shields.io/badge/coverage-95%25-green)]()

</div>

---

## 项目简介

awesome-tool 是一款面向企业的数据处理工具，提供高性能的数据转换、清洗和分析能力。支持多种数据源接入，具备完善的监控和日志体系。

## 核心功能

| 功能 | 说明 |
|------|------|
| 数据导入 | 支持 CSV、JSON、Excel、数据库等多种数据源 |
| 数据清洗 | 去重、格式化、校验规则引擎 |
| 数据导出 | 自定义模板导出，支持批量处理 |
| 监控告警 | 内置 Prometheus 指标，对接企业监控体系 |

## 技术架构

- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Node.js + Fastify
- **存储**: PostgreSQL + Redis
- **基础设施**: Docker + Kubernetes

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装步骤

\`\`\`bash
git clone https://github.com/zhurenbao/awesome-tool
cd awesome-tool
pnpm install
pnpm dev
\`\`\`

## 许可证

MIT © zhurenbao`,

  cards: `# awesome-tool

<div align="center">

[![version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![license](https://img.shields.io/badge/license-MIT-orange)]()

</div>

> 下一代数据处理工具，让数据工作更高效

## 亮点

> **极致性能**
> 采用流式处理架构，百万级数据秒级处理

> **可视化编排**
> 拖拽式数据处理流程编排，无需编写代码

> **丰富的生态**
> 50+ 内置插件，覆盖常见数据处理场景

## 快速上手

\`\`\`bash
npx awesome-tool create my-project
cd my-project
awesome-tool start
\`\`\`

## 生态

- [awesome-tool-core](https://github.com/zhurenbao/awesome-tool-core) - 核心库
- [awesome-tool-ui](https://github.com/zhurenbao/awesome-tool-ui) - 可视化界面
- [awesome-tool-plugins](https://github.com/zhurenbao/awesome-tool-plugins) - 插件市场

## 许可证

MIT © zhurenbao`,

  showcase: `# awesome-tool

<p align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 280" width="100%" style="max-width:900px; border-radius:12px;">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a2332" />
        <stop offset="100%" stop-color="#0d1520" />
      </linearGradient>
      <linearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#00e5ff" stop-opacity="0" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="nodeGlow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="900" height="280" fill="url(#bg)" />
    <rect x="0" y="0" width="900" height="3" fill="#00e5ff" opacity="0.4" />
    <path d="M 40 60 L 120 60 L 120 100 L 200 100" fill="none" stroke="#00e5ff" stroke-width="1.5" opacity="0.5" />
    <path d="M 60 120 L 140 120 L 140 80 L 220 80" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.35" />
    <path d="M 30 180 L 100 180 L 100 140 L 180 140" fill="none" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <path d="M 80 220 L 160 220 L 160 200 L 240 200" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.3" />
    <path d="M 700 60 L 780 60 L 780 100 L 860 100" fill="none" stroke="#00e5ff" stroke-width="1.5" opacity="0.5" />
    <path d="M 680 120 L 760 120 L 760 80 L 840 80" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.35" />
    <path d="M 720 180 L 800 180 L 800 140 L 870 140" fill="none" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <path d="M 660 220 L 740 220 L 740 200 L 820 200" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.3" />
    <path d="M 200 100 L 260 100 L 260 130 L 320 130" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.25" />
    <path d="M 580 130 L 640 130 L 640 100 L 700 100" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.25" />
    <path d="M 240 200 L 300 200 L 300 170 L 350 170" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.25" />
    <path d="M 550 170 L 600 170 L 600 200 L 660 200" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.25" />
    <circle cx="40" cy="60" r="3" fill="#00e5ff" opacity="0.6" />
    <circle cx="200" cy="100" r="3" fill="#00e5ff" opacity="0.6" />
    <circle cx="60" cy="120" r="2.5" fill="#00e5ff" opacity="0.45" />
    <circle cx="220" cy="80" r="2.5" fill="#00e5ff" opacity="0.45" />
    <circle cx="30" cy="180" r="3" fill="#00e5ff" opacity="0.6" />
    <circle cx="180" cy="140" r="3" fill="#00e5ff" opacity="0.6" />
    <circle cx="80" cy="220" r="2.5" fill="#00e5ff" opacity="0.45" />
    <circle cx="240" cy="200" r="2.5" fill="#00e5ff" opacity="0.45" />
    <circle cx="700" cy="60" r="3" fill="#00e5ff" opacity="0.6" />
    <circle cx="860" cy="100" r="3" fill="#00e5ff" opacity="0.6" />
    <circle cx="680" cy="120" r="2.5" fill="#00e5ff" opacity="0.45" />
    <circle cx="840" cy="80" r="2.5" fill="#00e5ff" opacity="0.45" />
    <circle cx="720" cy="180" r="3" fill="#00e5ff" opacity="0.6" />
    <circle cx="870" cy="140" r="3" fill="#00e5ff" opacity="0.6" />
    <circle cx="660" cy="220" r="2.5" fill="#00e5ff" opacity="0.45" />
    <circle cx="820" cy="200" r="2.5" fill="#00e5ff" opacity="0.45" />
    <circle cx="320" cy="130" r="5" fill="#00e5ff" filter="url(#nodeGlow)" opacity="0.8" />
    <circle cx="550" cy="170" r="5" fill="#00e5ff" filter="url(#nodeGlow)" opacity="0.8" />
    <rect x="370" y="90" width="160" height="100" rx="6" fill="none" stroke="#00e5ff" stroke-width="1.5" opacity="0.3" />
    <rect x="380" y="100" width="140" height="80" rx="4" fill="#00e5ff" opacity="0.06" />
    <line x1="400" y1="90" x2="400" y2="80" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="420" y1="90" x2="420" y2="78" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="440" y1="90" x2="440" y2="82" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="460" y1="90" x2="460" y2="78" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="480" y1="90" x2="480" y2="80" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="500" y1="90" x2="500" y2="82" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="400" y1="190" x2="400" y2="200" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="420" y1="190" x2="420" y2="202" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="440" y1="190" x2="440" y2="198" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="460" y1="190" x2="460" y2="202" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="480" y1="190" x2="480" y2="200" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="500" y1="190" x2="500" y2="198" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="370" y1="120" x2="360" y2="120" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="370" y1="140" x2="358" y2="140" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="370" y1="160" x2="360" y2="160" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="530" y1="120" x2="540" y2="120" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="530" y1="140" x2="542" y2="140" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <line x1="530" y1="160" x2="540" y2="160" stroke="#00e5ff" stroke-width="1.5" opacity="0.4" />
    <rect x="395" y="115" width="110" height="50" rx="2" fill="none" stroke="#00e5ff" stroke-width="0.8" opacity="0.25" />
    <circle cx="450" cy="140" r="12" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.2" />
    <circle cx="450" cy="140" r="4" fill="#00e5ff" opacity="0.15" />
    <rect x="300" y="50" width="300" height="190" fill="url(#glowGrad)" />
    <text x="450" y="152" text-anchor="middle" font-family="'Inter','Segoe UI',sans-serif" font-size="34" font-weight="700" fill="#ffffff" letter-spacing="2">awesome-tool</text>
    <text x="450" y="178" text-anchor="middle" font-family="'Inter','Segoe UI',sans-serif" font-size="12" font-weight="400" fill="#00e5ff" letter-spacing="3" opacity="0.8">A POWERFUL DATA TOOLKIT</text>
    <rect x="355" y="200" width="80" height="22" rx="11" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.25" />
    <text x="395" y="214" text-anchor="middle" font-family="'Inter','Segoe UI',sans-serif" font-size="10" font-weight="500" fill="#00e5ff" letter-spacing="1" opacity="0.8">TypeScript</text>
    <rect x="465" y="200" width="70" height="22" rx="11" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.2" />
    <text x="500" y="214" text-anchor="middle" font-family="'Inter','Segoe UI',sans-serif" font-size="10" font-weight="500" fill="#00e5ff" letter-spacing="1" opacity="0.6">v1.0.0</text>
    <rect x="0" y="277" width="900" height="3" fill="#00e5ff" opacity="0.4" />
  </svg>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-6366f1" alt="version" />
  <img src="https://img.shields.io/badge/downloads-10k%2B-06b6d4" alt="downloads" />
  <img src="https://img.shields.io/badge/license-MIT-6366f1" alt="license" />
</p>

## 关于本项目

在数据处理领域摸爬滚打多年后，我们决定打造一款真正好用的工具。awesome-tool 不仅仅是一个库，更是一套完整的数据处理解决方案。

## 📸 预览

![Dashboard](https://placehold.co/600x350/f0f0f0/333?text=Dashboard+Preview)
![Editor](https://placehold.co/600x350/f0f0f0/333?text=Editor+Preview)

## 特性

- 现代化的交互界面
- 零配置即可上手
- 内置 50+ 数据处理插件
- 支持云端和本地部署

## 技术栈

**前端**: React · TypeScript · Tailwind CSS · D3.js
**后端**: Rust · Node.js · Fastify
**存储**: PostgreSQL · Redis · S3

## ⚡ 快速开始

\`\`\`bash
# 一键安装
curl -fsSL https://get.awesome-tool.dev | bash

# 启动项目
awesome-tool dev
\`\`\`

## 许可证

MIT © zhurenbao`,
};
