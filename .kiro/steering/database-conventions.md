# 数据库字段命名规范

## PostgreSQL + Sequelize 字段命名

本项目使用 **Sequelize ORM** 连接 PostgreSQL 数据库。

### 时间戳字段命名

**重要**: Sequelize 默认使用 **驼峰命名法 (camelCase)**，不是下划线命名法 (snake_case)。

```javascript
// ✅ 正确 - 使用驼峰命名
"createdAt"
"updatedAt"

// ❌ 错误 - 不要使用下划线
"created_at"
"updated_at"
```

### SQL 查询中的字段名

在原始 SQL 查询中，必须使用**双引号**包裹驼峰命名的字段：

```sql
-- ✅ 正确
SELECT id, name, "createdAt", "updatedAt" FROM users;
ORDER BY "createdAt" ASC;

-- ❌ 错误 - 会报错 "column does not exist"
SELECT id, name, createdAt FROM users;
SELECT id, name, created_at FROM users;
```

### 常见字段名

```javascript
// 时间戳
"createdAt"    // 创建时间
"updatedAt"    // 更新时间

// 其他常见字段
"whatsapp_account_id"  // 下划线命名（自定义字段）
"phone_number_id"      // 下划线命名（自定义字段）
"access_token"         // 下划线命名（自定义字段）
```

### Sequelize Model 定义

```typescript
User.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING },
    // 自定义字段使用下划线
    whatsapp_account_id: { type: DataTypes.STRING },
    phone_number_id: { type: DataTypes.STRING },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,  // 自动添加 createdAt 和 updatedAt
  }
);
```

### 脚本中的查询示例

```javascript
// ✅ 正确的查询
const [users] = await sequelize.query(`
  SELECT 
    id,
    name,
    email,
    "createdAt",
    "updatedAt"
  FROM users
  ORDER BY "createdAt" ASC;
`);

// 访问结果
users.forEach(user => {
  console.log(user.createdAt);  // 驼峰命名
});
```

## 为什么使用驼峰命名？

1. **Sequelize 默认行为**: Sequelize ORM 默认使用驼峰命名
2. **JavaScript 风格**: 与 JavaScript/TypeScript 代码风格一致
3. **自动时间戳**: `timestamps: true` 自动创建 `createdAt` 和 `updatedAt`

## 常见错误

### 错误 1: 字段不存在
```
❌ Error: column "created_at" does not exist
```
**原因**: 使用了下划线命名而不是驼峰命名  
**解决**: 使用 `"createdAt"` 而不是 `created_at`

### 错误 2: 忘记双引号
```
❌ Error: column "createdat" does not exist
```
**原因**: PostgreSQL 会将未加引号的字段名转为小写  
**解决**: 使用双引号 `"createdAt"`

## 相关文件

- `server/src/models/User.ts` - 用户模型定义
- `server/merge-duplicate-users.js` - 使用正确字段名的脚本示例
- `server/check-user-whatsapp-config.js` - 查询用户配置的脚本

## 参考

- [Sequelize Naming Strategy](https://sequelize.org/docs/v6/other-topics/naming-strategies/)
- [PostgreSQL Identifiers](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS)
