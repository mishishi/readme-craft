# ReadMeCraft 改进提案 v2 — Prompt 重构 + 扫描器配合方案

日期: 2026-05-13
基于: v2 MVP 范围压缩审计、v1 产品审计

---

## 一、动机

v1 审计指出 AI 输出存在「语义质量没有保证」「内容空洞」的问题。v2 审计在范围压缩的压力下重新审视了根因：**不是扫描器数据不够，是 prompt 的思维模型错了**。

当前 prompt 的核心缺陷：
1. **填空题思维**——给骨架让 AI 填内容，AI 不思考「这个项目需要什么样的 README」
2. **负向指令堆砌**——15+ 条「禁止/不要」，AI 为求安全输出空洞内容
3. **章节一刀切**——固定 10 项内容要求，CLI 工具和前端组件库用同一套模板

---

## 二、Prompt 重构方案

### 2.1 新结构（五段式）

```
第一部分：角色定义 + 核心写作原则（3条）
  → 具体胜过通用、理解项目再动笔、可验证

第二部分：项目分析指引（新增）
  → 判断项目类型（库/CLI/Web应用/框架）
  → 决定目标读者和内容侧重点

第三部分：章节生成指南（按类型推荐）
  → 从候选章节中选择，非强制全部包含
  → 每个章节给写作方向而非格式要求

第四部分：模板风格约束（精简到 3-4 条/模板）
  → 只保留真正定义视觉差异的规则
  → 技术细节交给骨架和 validate-retry

第五部分：参考骨架（改为参考，非强制）
  → 可调整章节顺序和内容深度
```

### 2.2 新版 system prompt 全文（以 minimal 模板为例）

```
你是一个专业的 README 文档工程师。

## 核心写作原则

1. **具体胜过通用** —— 每个特性、每个步骤必须包含具体技术事实（框架名称、命令、API 端点）。禁止出现 "该项目拥有出色的性能" 这类无信息量的表述。

2. **理解项目再动笔** —— 先判断项目类型和目标读者，再决定 README 的结构和侧重点。一个 CLI 工具和一个前端组件库的 README 应该不一样。

3. **可验证** —— 所有技术名称、依赖、命令必须从项目信息中提取。不确定的内容用 [需补充] 标记，不要编造。

---

## 第一步：分析项目类型

<项目信息>
name: {name}
description: {description}
language: {language}
tags: {topics}
关键文件: {检测到的 package.json / Dockerfile 等}
</项目信息>

请先判断：
- 这是什么类型的项目？(库/CLI工具/Web应用/框架)
- 目标读者最想从 README 中获得什么？
- 这个 README 应该侧重什么？

---

## 第二步：生成 README

根据项目类型，从以下章节中选择并组织内容：

【安装】—— 前置条件 + 安装命令 + 验证命令
【快速开始】—— 最常用的 2-3 个操作，每个配代码示例
【特性介绍】—— 4-6 项，每项：功能名 + 一句话 + 适用场景
【API 参考】(库/工具必选) —— 核心函数签名、参数、返回值
【命令参考】(CLI 必选) —— 子命令、常用选项、示例
【技术架构】(Web应用/框架推荐) —— 分层说明，核心模块
【项目结构】(大型项目推荐) —— 目录树 + 说明
【配置说明】(需要配置的项目) —— 配置项、默认值
【贡献指南】(必选) —— 环境搭建、运行测试、提PR流程
【许可证】(必选)

不要逐章照抄这个列表。根据项目类型选择最重要的章节，组织成自然的阅读顺序。

---

## 模板风格约束

模板「极简清风」：
- 纯 Markdown，不使用任何 HTML 标签
- 不使用表格、引用块、emoji
- 使用标题 + 列表 + 代码块排版
- 段落 2-3 句话，空行分隔

---

## 参考骨架

以下是本模板的参考结构。可以在此基础上调整章节顺序或内容深度：

{skeleton}
```

### 2.3 其他模板的风格约束（精简版）

**Badge 大满贯：**
- 保留头部 `<p align="center">` HTML 结构和 badge 墙
- 特性使用表格或 emoji 列表
- 视觉丰富度优先：badge + emoji + 表格

**企业蓝图：**
- 不使用 emoji（包括标题）
- 保留 mermaid 图表（仅限 flowchart / pie / sequenceDiagram）
- 表格和正式语气，前后端分明

### 2.4 与当前 prompt 的差异汇总

| 维度 | 当前 | 新版 |
|------|------|------|
| 指令方向 | "不要做 X" × 15+ | "该怎么做" × 正向引导 |
| 分析步骤 | 无，直接填空 | 先理解项目再落笔（新增） |
| 章节选择 | 固定 10 项，全部强制 | AI 按类型选择，引导而非命令 |
| 风格约束 | 8-10 条/模板 | 3-4 条/模板 |
| 骨架角色 | 必须严格遵循 | 参考结构，可调整 |
| token 预算 | ~1200 tokens，大量用于禁令 | ~800 tokens，更多留给内容 |

---

## 三、扫描器配合方案（L1）

### 3.1 设计原则

扫描器的职责从「喂更多数据给 AI」转变为 **「验证 AI 有没有漏掉重要信息」**。

```
新版 prompt 的职责：                     扫描器的职责：
告诉 AI 写什么、怎么写                 检查 AI 有没有漏写、写错

依赖的输入：                            产生的输出：
repoInfo + 关键文件列表                  依赖清单、项目结构、框架列表
（轻量）                                （验证素材，不进初版 prompt）
```

### 3.2 流程

```
用户请求生成 README
     │
     ├── 立即（0s）
     │   └── 新版 prompt + repoInfo → MiniMax → 初版 README
     │
     └── 后台启动扫描（0s）
         └── scanProject（2-10s，缓存命中则瞬时）
                    │
                    ▼
          validate-retry 阶段：
          扫描结果 vs README 内容 逐项对比

          验证项：
          ├─ package.json 有 jest/vitest → README 提了测试吗？
          ├─ 有 Dockerfile → README 有部署章节吗？
          ├─ 依赖含 react/vue → 技术栈写了 React/Vue 吗？
          ├─ 有 LICENSE 文件 → 许可证信息对不对？
          ├─ scripts 有 build → 安装/构建命令写了没？
          ├─ topic 含 cli → README 有命令参考吗？
          └─ 文件树有 src/api/ → 架构图提到 API 层了吗？

          发现问题 → buildRefinePrompt（已有机制）
          无问题 → 跳过
```

### 3.3 验证逻辑设计

每条验证项的输出格式：

```typescript
interface CoverageCheck {
  item: string;           // 验证项描述
  source: string;         // 扫描来源（如 "package.json → devDependencies → vitest"）
  severity: 'critical' | 'normal' | 'suggestion';
  present: boolean;       // README 中是否已覆盖
  refineHint?: string;    // 触发修正时的提示
}
```

触发阈值：
- 有任意 `critical` 项未覆盖 → 触发修正
- 有 2+ 条 `normal` 项未覆盖 → 触发修正
- 仅 `suggestion` 未覆盖 → 跳过（避免过度修正）

### 3.4 改动范围

**后端改动：**
| 文件 | 改动 |
|------|------|
| `server/src/services/prompts.ts` | 替换为五段式新 prompt |
| `server/src/routes/generate.ts` | validate-retry 阶段传入扫描结果 |
| `server/src/services/template-skeletons/validation.ts` | 新增内容覆盖度检查规则 |

**前端改动：** 无

**删除：**
| 文件 | 理由 |
|------|------|
| `server/src/routes/pre-scan.ts` | 扫描不再提前 fire-and-forget，改为 generate 内部按需触发 |
| `frontend/src/components/GitHubTokenWarning.tsx` | MVP 范围已移至 Won't Have |

### 3.5 与当前 validate-retry 的关系

当前 validate-retry 做的是**结构验证**：
- 表格行数对不对
- mermaid 类型是否合法
- 有没有残留方括号

L1 方案在此基础上加**内容覆盖度验证**：
- 项目用到了某技术，README 提了没
- 项目有 CI 配置，README 有贡献指南没

两者共用 `buildRefinePrompt` 机制，互不冲突。

---

## 四、预留 L2 升级路径

如果上线后 validate-retry 触发率超过 30%，说明 prompt 初版质量不足以覆盖常用场景。届时可升级到 L2：

```
请求 → scanProject + 新版 prompt 并行启动
         │                    │
 扫描完成 ────────────── 合并到 user prompt
         │              重新生成（非修正，是重做）
         ▼
      返回增强版 README
```

L2 的代价是每次生成消耗 2 次 MiniMax API 调用。是否升级取决于 L1 上线后的实际数据。

---

## 五、实施建议顺序

1. 替换 `prompts.ts` 中的 system prompt（五段式结构）
2. 精简各模板的风格约束规则（每个模板 3-4 条）
3. generate route 中扫描结果传入 validate-retry 阶段
4. 新增内容覆盖度检查规则
5. 删除 pre-scan 路由和 GitHubTokenWarning 组件
6. 上线观察 validate-retry 触发率，决定是否升级 L2

步骤 1-2 可以独立实施并验证效果（只改 prompt，不动逻辑）。步骤 3-4 依赖扫描器结果。
