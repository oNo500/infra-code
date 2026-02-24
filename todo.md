整理丰富 eslint 配置
规范化、合理化
当做一个正式的工具包
虽然可以要求没那么多，但是认真对待，探索快速落地的可行性，而不是被各种最佳实践束缚。



写一个 skills吧


发布需要ci
需要制定版本计划d


熟读 only esm


react-library.json 不适合加 isolatedDeclarations —— shadcn 组件是 React 应用层代码，设计上不需要并行生成 dts

增加本地调试，不能每次都发布

还要区分只做类型检查和类型输入和builder的关系

*.config.ts 怎么处理，是否使用tsconfig检查，这是一个维护成本问题，要不使用远程配置检查？放在ci里，会不会就可以减少维护成本了
如果出了config.ts 的配置检查，还有其他的可以考虑 references 吧
还要考虑 monorepo 中的类型，是否需要类型输入，或者我也不太清楚



依赖问题

tailwindcss 的规则检查怎么还需要 tailwindcss依赖


---

skills 等文档移动到 infra-ai 随着拓展庞大，再迁移到 anything llm 吧


规则怎么写


---
这个项目叫 setup eslint