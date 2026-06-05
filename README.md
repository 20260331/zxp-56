# 值班交接系统

一个基于 React + TypeScript 的值班交接事项管理系统，用于管理值班过程中的交接事项，支持事项的创建、编辑、完成、删除以及统计筛选等功能。

## 功能特性

- 📋 **交接事项管理**：创建、编辑、删除、完成交接事项
- 🏷️ **多维度标签**：支持状态（待处理/处理中/已完成/已取消）和优先级（低/中/高/紧急）标记
- 📊 **班报统计面板**：实时展示事项总数、今日新增、已逾期、待处理、已完成等统计指标
- 🔍 **历史筛选功能**：按全部、今日新增、已逾期、待处理、已完成等条件筛选查看
- ⚠️ **逾期提醒**：自动标记逾期事项并高亮显示
- 🎨 **响应式设计**：支持桌面端和移动端自适应展示
- 💾 **本地持久化**：数据自动保存到浏览器 localStorage，刷新不丢失

## 技术栈

- **前端框架**：React 18
- **开发语言**：TypeScript 5
- **构建工具**：Vite 5
- **样式方案**：Tailwind CSS 3
- **存储方案**：浏览器 localStorage

## 项目结构

```
generate-1/
├── src/
│   ├── components/          # React 组件
│   │   ├── FilterBar.tsx    # 筛选栏组件
│   │   ├── Header.tsx       # 顶部导航栏
│   │   ├── ItemCard.tsx     # 事项详情卡片
│   │   ├── ItemForm.tsx     # 新增/编辑表单
│   │   └── StatsPanel.tsx   # 统计面板
│   ├── types/
│   │   └── index.ts         # TypeScript 类型定义
│   ├── utils/
│   │   ├── dateUtils.ts     # 日期工具函数
│   │   └── storage.ts       # localStorage 操作工具
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── index.html               # HTML 模板
├── package.json             # 项目依赖配置
├── tailwind.config.js       # Tailwind CSS 配置
├── tsconfig.json            # TypeScript 配置
└── vite.config.ts           # Vite 配置
```

## 快速开始

### 环境要求

- Node.js >= 16
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

启动后访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 核心数据模型

### HandoverItem（交接事项）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识（时间戳生成） |
| title | string | 事项标题 |
| description | string | 详细描述 |
| status | HandoverStatus | 状态：pending/in_progress/completed/cancelled |
| priority | Priority | 优先级：low/medium/high/urgent |
| assignee | string | 责任人 |
| reporter | string | 报告人 |
| deadline | string | 截止时间（ISO 格式） |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |
| completedAt | string? | 完成时间 |
| remarks | string? | 备注信息 |

## 使用说明

### 创建交接事项

1. 点击页面右上角"新增交接事项"按钮
2. 填写事项标题、详细描述、责任人、报告人、截止时间等必填项
3. 选择状态和优先级
4. 可选填备注信息
5. 点击"创建事项"完成提交

### 班报统计

页面顶部的统计面板实时展示：
- **事项总数**：所有交接事项的数量
- **今日新增**：当天创建的事项数量
- **已逾期**：超过截止时间且未完成的事项数量
- **待处理**：状态为"待处理"或"处理中"的事项数量
- **已完成**：状态为"已完成"的事项数量

### 筛选历史记录

使用筛选栏可以按不同条件查看事项：
- **全部**：显示所有事项
- **今日新增**：仅显示当天创建的事项
- **已逾期**：仅显示已逾期的事项
- **待处理**：仅显示未完成的事项
- **已完成**：仅显示已完成的事项

### 详情操作

每个事项卡片都提供以下操作：
- **完成**：将事项标记为已完成，可填写完成备注
- **编辑**：修改事项的所有信息
- **删除**：永久删除该事项（需确认）

## 排序规则

事项列表默认按以下优先级排序：

1. 逾期事项优先显示
2. 按优先级从高到低排列（紧急 > 高 > 中 > 低）
3. 同优先级按创建时间从新到旧排列

## 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge），需要启用 JavaScript 和 localStorage。

## License

MIT
