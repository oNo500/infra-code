## 全栈

1. better-auth(数据库使用drizzle吧，暂时先放在项目中)
2. 页面，最基本骨架
   1. 登录
   2. 注册
3. 异步数据 react-query 集成（或者swc？）
4. 登录之后显示个人信息
5. Suspense boundary
6. 接口错误处理封装
7. 我也不知道应该添加哪些用例

   ***

   components 中应该是纯组件，不应该包含副作用，比如请求
   架构模式: Bulletproof React - 特性驱动、类型安全、测试优先的生产级架构

   规则补充
   1. 文件名统一使用 `kebab-case`（包括 React 组件）
   2. TypeScript 严格模式，禁止使用 `any` 类型
   3. 禁止在代码中使用 emoji（除非用户明确要求）
   4. components/ 里的组件应该是业务无感知的纯组件

核心原则:

特性模块化：按功能组织代码，避免扁平结构
单向数据流：shared → features → app
类型安全：TypeScript 全覆盖，禁止 any
绝对导入：统一使用 @/\* 别名
最小化实现：遵循 MVP 原则，如非必要不进行拓展

---

项目方式
我觉得 components 还是慎用，就像现在 nav 始终不知道放在哪里，直接features，也是可以，还省心，不用考虑如何拆业务逻辑和纯组件，以后也这么处理吧，节省开发的思考时间，让实践证明
