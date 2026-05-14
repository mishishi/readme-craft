# State Architecture

## 三层 Context

所有三层共享同一个 `AppAction` discriminated union（26 种 action type）。

```
RepoProvider (RepoContext)
  → 管理: repoUrl, repoInfo, repoLoading, repoError
  → 无 undo/redo
  → 提供: state.repo*, dispatch

EditorProvider (EditorContext)
  → 管理: selectedTemplate, sections, title, preamble, undo/redo, 生成状态
  → 通过 pushHistory() 快照栈实现 undo/redo (MAX_HISTORY=50)
  → 提供: state.editor*, dispatch

UIProvider (UIContext)
  → 管理: toasts
  → 提供: state.toasts, dispatch

CombinedProvider
  → 通过 useMemo 合并状态: { ...repoState, ...editorState, ...uiState }
  → 透传 dispatch（所有三层同一 dispatch reference）
```

## 持久化

| 存储 | 内容 | 触发时机 |
|------|------|---------|
| sessionStorage | 当前会话完整状态 | 每次状态变更后 requestAnimationFrame debounce |
| localStorage | 历史记录（saveEntry 保存完整快照） | AI 生成完成时 |

**恢复时机**：`AppContext` mount 时从 sessionStorage 恢复，用户可从历史记录加载任意快照。

## Undo/Redo 机制

- `pushHistory()` 在 dispatch 前创建当前状态快照
- `history[historyIndex]` 指向当前状态
- 快照上限 `MAX_HISTORY=50`
- `historyIndex` **MUST** always point to `history.length - 1` after latest state

## Actions

AppAction discriminated union 包含以下 action 类型：

状态类: `SET_REPO_URL`, `FETCH_REPO_START`, `FETCH_REPO_SUCCESS`, `FETCH_REPO_ERROR`,
`SELECT_TEMPLATE`, `GENERATE_START`, `GENERATE_SUCCESS`, `GENERATE_ERROR`,
`SET_STRICT_MODE`, `CLEAR_CONTENT`, `RESET`

编辑类: `SET_TITLE`, `UPDATE_SECTION`, `UPDATE_SECTION_HEADING`,
`ADD_SECTION`, `DELETE_SECTION`, `MOVE_SECTION`, `MOVE_SECTION_TO`,
`SET_COLLAPSED`, `SET_ACTIVE_SECTION`, `SHOW_RESULT_CARD`, `HIDE_RESULT_CARD`

历史类: `UNDO`, `REDO`, `RESTORE_FROM_HISTORY`

UI类: `SHOW_TOAST`, `DISMISS_TOAST`
