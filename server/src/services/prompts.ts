interface RepoInfo {
  name: string;
  description: string;
  language: string;
  stars: number;
  topics: string[];
  owner: string;
  license: string | null;
}

export function buildUserPrompt(repo: RepoInfo, projectContext?: string, feedback?: string): string {
  const base = `## 项目信息

请根据以下 GitHub 项目信息来填充 README。

| 项目 | 值 |
|------|------|
| 名称 | ${repo.name} |
| 描述 | ${repo.description || '（暂无描述）'} |
| 主要语言 | ${repo.language || '未指定'} |
| Star 数 | ${repo.stars} |
| 标签 | ${repo.topics?.join(', ') || '无'} |
| 作者 | ${repo.owner} |
| 许可证 | ${repo.license || '未指定'}`;

  let result = base;

  if (projectContext) {
    result += `

## 项目源码分析

${projectContext}

---

**重要**: 使用上述项目信息生成内容。内容要有实际依据（从源码分析的依赖、脚本、目录结构中提取），不要编造。`;
  }

  if (feedback) {
    result += `

## 用户改进要求

用户对上一次生成的内容不满意，提出了以下改进要求。请根据这些要求调整 README 内容：

${feedback}

注意：
- 基于之前的生成结果进行修改，保留符合要求的部分
- 只修改用户提到的部分，不需要重写整个 README
- 保持模板结构和风格不变`;
  }

  return result;
}

/** 构建扫描修正 prompt：基于源码扫描结果对已生成的 README 做技术准确性修正 */
export function buildScanRefinePrompt(projectContext: string): string {
  return `## 源码扫描修正

以下是项目源码扫描结果。请仔细核对 README 中的技术细节，修正与源码不匹配的部分。

${projectContext}

### 修正要求
1. 修正所有不准确的技术名称（框架、工具、语言版本）
2. 修正安装命令（从扫描结果中提取准确的包管理器和命令）
3. 如果扫描结果中检测到项目类型（CLI/库/Web 应用），调整 README 侧重方向
4. 补充从扫描结果中发现的重要特性/配置
5. 保持 README 的章节结构和原有风格不变
6. 输出修正后的完整 README
7. 不要用 \`\`\`markdown 包裹输出`;
}
