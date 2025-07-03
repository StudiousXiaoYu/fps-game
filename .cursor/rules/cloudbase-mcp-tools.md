# 云开发 MCP 工具使用指南

## 可用工具列表

### 环境管理工具
- `login` - 登录云开发
- `logout` - 退出云开发
- `envQuery` - 查询环境信息
- `domainQuery` - 查询域名信息

### 数据库工具
- `collectionQuery` - 查询集合信息
- `createCollection` - 创建集合
- `deleteCollection` - 删除集合
- `addDocument` - 添加文档
- `updateDocument` - 更新文档
- `deleteDocument` - 删除文档
- `queryDocument` - 查询文档
- `createIndex` - 创建索引
- `deleteIndex` - 删除索引
- `createDataModel` - 创建数据模型
- `updateDataModel` - 更新数据模型

### 云函数工具
- `createFunction` - 创建云函数
- `updateFunction` - 更新云函数
- `deleteFunction` - 删除云函数
- `invokeFunction` - 调用云函数
- `getFunctionLogs` - 获取函数日志
- `createTrigger` - 创建触发器
- `deleteTrigger` - 删除触发器
- `updateFunctionConfig` - 更新函数配置
- `getFunctionDetail` - 获取函数详情

### 静态托管工具
- `uploadFiles` - 上传文件
- `deleteFile` - 删除文件
- `listFiles` - 列出文件
- `getFileInfo` - 获取文件信息
- `updateDomain` - 更新域名配置

### 文件操作工具
- `downloadFile` - 下载文件
- `uploadToStorage` - 上传到云存储

### 工具支持
- `getProjectTemplate` - 获取项目模板
- `searchKnowledgeBase` - 搜索知识库
- `interactiveDialog` - 交互对话

### HTTP 访问
- `httpAccess` - HTTP 函数访问配置

## 使用示例

### 1. 登录云开发
```
登录云开发
```

### 2. 查询环境信息
```
查询当前云开发环境信息
```

### 3. 创建数据库集合
```
创建一个名为 users 的集合，用于存储用户信息
```

### 4. 创建云函数
```
创建一个名为 user_login 的云函数，用于处理用户登录
```

### 5. 部署静态文件
```
将当前项目的构建文件部署到云开发静态托管
```

## 最佳实践

1. **环境管理**: 始终先登录云开发环境
2. **数据库操作**: 合理设计数据模型和索引
3. **云函数开发**: 遵循函数命名规范
4. **文件管理**: 合理组织静态资源
5. **错误处理**: 查看日志进行问题排查

## 注意事项

1. 确保网络连接正常
2. 检查云开发环境配置
3. 注意资源使用限制
4. 遵循安全最佳实践
5. 定期备份重要数据