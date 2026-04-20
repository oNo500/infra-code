# RFC 002: tsconfig.json Field Behavior Across Toolchain

- **Status**: Stable
- **Author**: xiu
- **Date**: 2026-04-20
- **Scope**: Informs profile defaults and atom design in `@infra-x/tsconfig`

## Lint 工具与 tsconfig

`@typescript-eslint`（typed rules）和 oxlint（`typeAware: true`）都会读取 tsconfig，但目的只有一个：获取类型信息用于 lint 规则判断，不执行完整类型检查，不参与任何 emit 流程。

两者读取的字段范围与 tsc 的类型相关字段一致——`strict`、`module`、`moduleResolution`、`lib`、`types`、`paths`、`include`/`exclude` 等。`noEmit`、`outDir`、`declaration`、`isolatedDeclarations` 等 emit 控制字段完全忽略。

因此本文档后续的工具标注中，`tsc / lint` 表示 tsc + @typescript-eslint + oxlint 三者行为一致，不再单独列出。

---

## Field consumption by toolchain

```
compilerOptions
│
├── 类型检查行为
│   ├── strict, alwaysStrict                        tsc / lint
│   │   └── 所有严格检查的总开关
│   ├── noUncheckedIndexedAccess                    tsc / lint
│   │   └── 数组/对象索引返回 T | undefined，捕获真实越界 bug
│   ├── noImplicitOverride                          tsc / lint
│   │   └── 要求显式 override 关键字，防止意外覆盖父类方法
│   ├── noUnusedLocals, noUnusedParameters          tsc / lint
│   │   └── 死代码信号
│   ├── noFallthroughCasesInSwitch                  tsc / lint
│   │   └── switch case 缺少 break 时报错
│   ├── noImplicitReturns                           tsc / lint
│   │   └── 函数存在缺少 return 的分支时报错
│   ├── verbatimModuleSyntax                        tsc / lint
│   │   └── 强制 import type，防止类型导入在 bundler 转译后变成空 require
│   ├── isolatedModules                             tsc / lint
│   │   └── 每文件必须独立可转译，esbuild / oxc / SWC 的硬性前提
│   └── exactOptionalPropertyTypes, ...             tsc / lint
│
├── 模块解析
│   ├── module, moduleResolution                    tsc / lint
│   │   └── bundler 使用自己的解析器（oxc-resolver / Vite），完全忽略此字段
│   ├── paths                                       tsc / lint / tsdown(oxc-resolver) / Vite(需 vite-tsconfig-paths)
│   │   └── 唯一被多数 bundler 实际读取的字段
│   └── baseUrl                                     tsc / lint
│
├── 运行环境
│   ├── target                                      tsc
│   │   └── tsdown 优先读 package.json engines，缺省时 fallback 到此
│   ├── lib                                         tsc / lint
│   │   └── 声明全局 API 的可用范围（DOM、esnext 等）
│   └── types                                       tsc / lint
│       └── 限定哪些 @types/* 包参与全局类型注入
│
├── JSX
│   └── jsx                                         tsc / lint
│       └── Vite 通过 @vitejs/plugin-react fallback 到此；tsdown 忽略
│
├── emit 控制
│   ├── noEmit                                      tsc only
│   │   └── tsdown 忽略，自己决定是否 emit
│   ├── outDir, rootDir                             tsc only
│   │   └── tsdown 从 entry 推导输出路径，忽略此字段
│   ├── declaration                                 tsc only
│   │   └── tsdown 通过自己的 dts 选项控制，不读此字段
│   ├── declarationMap                              tsc + tsdown
│   │   └── 为 .d.ts 生成 sourcemap，两者均读取
│   └── isolatedDeclarations                        tsc + tsdown
│       └── tsdown 据此切换 .d.ts 策略：true → oxc-transform（快），false → tsc（准）
│
├── 文件范围
│   └── include, exclude, files                     tsc / lint
│       └── tsdown 使用自己的 entry 选项，忽略此字段
│
├── 互操作 / 兼容性
│   ├── esModuleInterop                             tsc / lint
│   │   └── 允许 import fs from 'fs' 等 CJS default import
│   ├── skipLibCheck                                tsc only
│   │   └── 跳过第三方 .d.ts 的类型检查，屏蔽不受控的上游错误
│   ├── resolveJsonModule                           tsc / lint
│   │   └── 允许 import data from './data.json'
│   ├── moduleDetection                             tsc / lint
│   │   └── force 模式下每文件视为模块，防止意外全局变量污染
│   └── forceConsistentCasingInFileNames            tsc only
│       └── 防止 macOS 不区分大小写导致 CI（Linux）路径错误
│
└── 构建缓存
    ├── incremental                                 tsc only
    │   └── 启用增量编译，加速重复 tsc --noEmit
    └── tsBuildInfoFile                             tsc only
        └── 指定缓存文件路径，推荐放入 node_modules/.cache 避免污染项目根目录
```

---

## Two independent pipelines

tsdown 项目中，同一份 tsconfig.json 被两条独立流程读取：

```
tsconfig.json
├── tsc --noEmit     读取全部字段，执行类型检查
└── tsdown build     仅读取 paths / isolatedDeclarations / declarationMap
                     其余字段从 tsdown.config.ts 取
```

Profile 预设必须同时满足两条流程。`noEmit: true` 放在 app profile 是正确的——tsc 读到后不产出 JS，tsdown 忽略它并自行 emit。

---

## Atom design — base() philosophy

`base()` 的选取标准：**对任何项目都安全、都有意义，且 bundler 不会误读**。

**在 base() 中：**

```
base()
│
├── 类型检查行为          对所有项目有益，无副作用
│   ├── strict: true
│   │   └── 所有严格检查的总开关，行业基准
│   ├── noUncheckedIndexedAccess: true
│   │   └── 数组/对象索引返回 T | undefined，捕获真实越界 bug
│   ├── noImplicitOverride: true
│   │   └── 要求显式 override，防止意外覆盖父类方法
│   ├── noUnusedLocals: true
│   ├── noUnusedParameters: true
│   │   └── 死代码信号
│   ├── noFallthroughCasesInSwitch: true
│   ├── noImplicitReturns: true
│   ├── forceConsistentCasingInFileNames: true
│   │   └── macOS/Linux CI 路径大小写差异
│   ├── verbatimModuleSyntax: true
│   │   └── 强制 import type，防止类型导入泄漏到运行时
│   └── isolatedModules: true
│       └── 每文件独立可转译，所有 bundler 的硬性前提
│
├── 互操作 / 兼容性       普遍安全，大多数生态需要
│   ├── esModuleInterop: true
│   │   └── CJS default import（import fs from 'fs'）
│   ├── skipLibCheck: true
│   │   └── 屏蔽不受控的第三方 .d.ts 错误
│   ├── resolveJsonModule: true
│   │   └── JSON import 普遍使用，无副作用
│   └── moduleDetection: 'force'
│       └── 每文件视为模块，防止意外全局污染
│
├── 运行环境
│   └── target: 'esnext'
│       └── 保留现代语法交给 bundler 降级，避免 tsc 重复转译
│
└── 构建缓存
    ├── incremental: true
    └── tsBuildInfoFile: './node_modules/.cache/tsconfig.tsbuildinfo'
        └── 缓存不进项目根目录
```

**不在 base() 中：**

```
排除在 base() 外
│
├── 模块解析
│   └── module, moduleResolution
│       └── 依赖运行时和构建方式 → buildBundler() / buildTscEmit()
│
├── 运行环境
│   ├── lib
│   │   └── 依赖运行时（DOM / esnext / bun）→ runtime*()
│   └── types
│       └── 依赖运行时（node / bun / 无）→ runtime*()
│
├── JSX
│   └── jsx
│       └── 仅 React 项目需要 → frameworkReact() / frameworkNextjs()
│
└── emit 控制
    ├── noEmit
    │   └── 取决于谁负责 emit → buildBundler() 设 true，buildTscEmit() 设 false
    ├── outDir, rootDir
    │   └── 仅 tsc emit 时有意义 → buildTscEmit()
    └── declaration, isolatedDeclarations
        └── 仅库项目需要 → projectLib()
```

---

## 互操作字段详解

这组字段是 CJS/ESM 历史割裂的产物，理解它们需要先理解问题的根源。

### 背景：CJS 与 ESM 的默认导出不兼容

CommonJS 的导出模型是 `module.exports = value`——整个模块就是一个值，没有"默认导出"的概念。ES Module 引入了 `export default`，语义上是模块的主导出。

当 ESM 代码 `import fs from 'fs'` 遇到一个 CJS 模块时，运行时需要决定：`module.exports` 整体算不算 `default`？Node.js 的答案是"算"，但 tsc 早期不这么认为，它要求写 `import * as fs from 'fs'`。

这是 `esModuleInterop` 存在的根本原因。

### esModuleInterop

**改变了什么：**

```
// 关闭时（tsc 原始行为）
import fs from 'fs'   // 报错：fs 没有 default export
import * as fs from 'fs'  // 正确写法

// 开启后
import fs from 'fs'   // 合法，tsc 将 module.exports 视为 default
```

开启后 tsc 会在 emit 时注入 `__importDefault` helper，确保运行时行为与类型一致。

**为什么放在 base()：** 现代生态（React、Node.js 标准库、大量 npm 包）默认以 CJS 发布。不开启会导致大量合法的 `import x from 'y'` 报类型错误，或者运行时拿到 `{ default: ... }` 包裹对象而非值本身。

**注意：** `verbatimModuleSyntax: true` 开启后，tsc 不再 emit helper，interop 完全交给 bundler 处理。两者并不冲突——`esModuleInterop` 管类型层面的合法性，`verbatimModuleSyntax` 管 emit 行为。

### verbatimModuleSyntax 与 isolatedModules

这两个字段解决同一个问题的不同层面：**bundler 按文件单独转译时，tsc 的 import 消除可能产生运行时错误**。

**问题根源：**

```typescript
import { SomeType } from './types'  // 纯类型导入
export { SomeType }                 // re-export
```

tsc 知道 `SomeType` 是类型，emit 时会整行删掉。但 esbuild / oxc 按文件处理，不做跨文件类型分析，不知道这行可以删——结果保留了一个运行时不存在的导入，导致报错。

**两者的关系：**

```
isolatedModules: true
└── 要求每文件独立可转译，禁止依赖跨文件类型推断
    └── 检测上述危险模式并在 tsc 阶段报错
    └── 不改变 emit 行为，只做检查

verbatimModuleSyntax: true
└── 强制所有类型导入必须写 import type
    └── 从根本上消除问题：类型导入语法上就可见，bundler 直接识别并删除
    └── 是 isolatedModules 的升级版，覆盖了它的所有场景
```

两者都放在 `base()` 是因为：`isolatedModules` 是 bundler 兼容的最低要求，`verbatimModuleSyntax` 是更强的约束，让意图显式化。开启后代码风格更清晰，IDE 也能更准确地提示哪些导入是纯类型的。

### moduleDetection

tsc 默认通过文件内是否有 `import`/`export` 来判断它是模块还是 script。script 文件的顶层变量是全局的，模块文件的顶层变量是局部的。

`moduleDetection: 'force'` 强制所有文件视为模块，理由：

- 现代项目几乎不存在 script 文件，默认行为只是历史兼容
- `auto` 模式下，一个没有任何 import/export 的工具文件会意外成为 script，其顶层变量污染全局类型空间，产生难以定位的类型冲突

### resolveJsonModule

允许 `import data from './config.json'`，tsc 自动推断 JSON 结构为类型。无运行时副作用，bundler 均支持。唯一注意点：在 `moduleResolution: 'nodenext'` 模式下，JSON import 需要显式加 `.json` 扩展名（这是 Node.js ESM 的规范要求，不是 tsc 的限制）。

### skipLibCheck

跳过所有 `.d.ts` 文件的类型检查，包括 `node_modules` 下的第三方类型定义。

这是一个明确的取舍：**牺牲对上游类型错误的感知，换取编译速度和稳定性**。放在 `base()` 的理由是：第三方 `.d.ts` 的错误通常不可修复（版本不匹配、上游 bug），报出来只会产生噪音。真正需要关注的类型错误应该来自自己的代码。

---

## Deviation policy

Profile 覆盖 `base()` 字段需要框架**结构性要求**，目前仅一处：

- `frameworkNestjs()` 设 `strictPropertyInitialization: false` — NestJS DI 在运行时注入属性，tsc 无法感知注入行为，对每个 service class 都会报假阳性错误。

以"减少噪音"为由降低 correctness flag 不可接受，应通过修正类型定义解决。

---

## VS Code intellisense source

VS Code 内置的 `tsconfig.schema.json` 近乎空壳（仅含 `title` 和 `default`）。补全和校验来自 `typescript` 包内部的 `tsserver`，其 `optionDeclarations` 数组（TS 6.0 共 129 条）描述了每个选项的名称、类型、枚举值和默认值。VS Code 优先使用项目本地的 `typescript` 包。

`@infra-x/tsconfig` 的 `validateCompilerOptions()` 读取相同的 `optionDeclarations`（optional peer dependency），校验结果随用户的 TS 版本自动对齐。SchemaStore（`https://json.schemastore.org/tsconfig`）供 neovim / IntelliJ 等其他编辑器使用，与此无关。
