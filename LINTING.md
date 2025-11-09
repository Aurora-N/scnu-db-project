# ESLint 和 Prettier 配置说明

本项目已配置全局的 ESLint 和 Prettier，用于统一代码风格和质量检查。

## 配置文件

- **ESLint**: `eslint.config.js` (根目录)
- **Prettier**: `.prettierrc` (根目录)
- **Prettier Ignore**: `.prettierignore` (根目录)

## 可用命令

在项目根目录运行以下命令：

### ESLint

```bash
# 检查代码问题
npm run lint

# 自动修复可修复的问题
npm run lint:fix
```

### Prettier

```bash
# 格式化所有代码
npm run format

# 检查代码格式（不修改文件）
npm run format:check
```

## 配置说明

### ESLint 配置

- **后端 (Express/JavaScript)**:
  - 适用于 `server/**/*.js` 文件
  - 使用 Node.js 环境配置
  - 启用 ES2022 语法支持

- **前端 (React/TypeScript)**:
  - 适用于 `web-app/**/*.{ts,tsx}` 文件
  - 使用 TypeScript ESLint 解析器
  - 启用 React Hooks 和 React Refresh 规则
  - 集成 Prettier 格式化规则

### Prettier 配置

- 使用单引号
- 每行最大 80 字符
- 使用分号
- 2 空格缩进
- 使用 LF 换行符

## IDE 集成

### VS Code

推荐安装以下扩展：

1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier - Code formatter** (`esbenp.prettier-vscode`)

在 `.vscode/settings.json` 中添加：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## 注意事项

1. 已移除 `web-app/eslint.config.js`，统一使用根目录配置
2. 如需自定义规则，请修改根目录的 `eslint.config.js`
3. Prettier 和 ESLint 已集成，避免冲突
