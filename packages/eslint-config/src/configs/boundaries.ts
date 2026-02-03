import { defineConfig } from 'eslint/config'
import boundariesPlugin from 'eslint-plugin-boundaries'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

/**
 * 预设类型
 */
type BoundaryPreset = 'modules' | 'layers'

/**
 * 元素类型定义
 */
interface ElementType {
  /**
   * 元素类型名称
   */
  type: string
  /**
   * 匹配模式（支持 minimatch glob）
   */
  pattern: string | string[]
  /**
   * 捕获组配置，用于提取变量
   */
  capture?: string[]
  /**
   * 是否为主要入口点
   */
  mode?: 'file' | 'folder' | 'full'
}

/**
 * 规则配置
 */
interface BoundaryRule {
  /**
   * 来源元素
   */
  from: string | string[]
  /**
   * 允许的目标元素
   * 支持字符串或 [elementType, { captureGroup: 'value' }] 格式
   */
  allow?: (string | [string, Record<string, string>])[]
  /**
   * 禁止的目标元素
   */
  disallow?: string[]
  /**
   * 规则消息
   */
  message?: string
}

export interface BoundariesOptions extends OptionsOverrides {
  /**
   * 使用预设配置
   * - 'modules': VSA/DDD 模块边界（模块间禁止互相导入）
   * - 'layers': 分层架构（控制层级依赖方向）
   */
  preset?: BoundaryPreset
  /**
   * 自定义元素类型定义
   * 使用预设时会自动生成，也可以完全自定义
   */
  elements?: ElementType[]
  /**
   * 自定义边界规则
   * 使用预设时会自动生成，也可以完全自定义
   */
  rules?: BoundaryRule[]
  /**
   * 文件匹配模式
   */
  files?: string[]
  /**
   * 基础路径（用于 resolver）
   * @default process.cwd()
   */
  baseDirectory?: string
}

/**
 * 获取 modules 预设配置
 * VSA/DDD 风格：模块间禁止互相导入，只能导入 shared-kernel 和 app
 */
function getModulesPreset(): {
  elements: ElementType[]
  rules: BoundaryRule[]
} {
  return {
    elements: [
      {
        type: 'module',
        pattern: 'src/modules/*/**',
        capture: ['moduleName'],
        mode: 'folder',
      },
      {
        type: 'shared-kernel',
        pattern: 'src/shared-kernel/**',
        mode: 'folder',
      },
      {
        type: 'app',
        pattern: 'src/app/**',
        mode: 'folder',
      },
      {
        type: 'main',
        pattern: ['src/main.ts', 'src/*.module.ts', 'src/*.d.ts'],
        mode: 'file',
      },
    ],
    rules: [
      {
        // 模块只能导入：同模块内部、shared-kernel、app
        from: ['module'],
        allow: [
          // 允许同模块内部导入（通过 ${moduleName} 捕获组匹配）
          ['module', { moduleName: '${moduleName}' }],
          'shared-kernel',
          'app',
          'main',
        ],
        message: '模块间禁止互相导入，请使用 shared-kernel 共享代码或通过事件解耦',
      },
      {
        // shared-kernel 可以导入自身和 app（基础设施可能需要 app 配置）
        from: ['shared-kernel'],
        allow: ['shared-kernel', 'app'],
        message: 'shared-kernel 不能导入业务模块',
      },
      {
        // app 可以导入 shared-kernel，不能导入业务模块
        from: ['app'],
        allow: ['app', 'shared-kernel'],
        message: 'app 层不应直接依赖业务模块',
      },
      {
        // main 可以导入任何内容
        from: ['main'],
        allow: ['module', 'shared-kernel', 'app', 'main'],
      },
    ],
  }
}

/**
 * 获取 layers 预设配置
 * 分层架构：presentation → application → domain，infrastructure → application
 */
function getLayersPreset(): {
  elements: ElementType[]
  rules: BoundaryRule[]
} {
  return {
    elements: [
      {
        type: 'domain',
        pattern: 'src/**/domain/**',
        mode: 'folder',
      },
      {
        type: 'application',
        pattern: 'src/**/application/**',
        mode: 'folder',
      },
      {
        type: 'infrastructure',
        pattern: 'src/**/infrastructure/**',
        mode: 'folder',
      },
      {
        type: 'presentation',
        pattern: 'src/**/presentation/**',
        mode: 'folder',
      },
    ],
    rules: [
      {
        // domain 层零依赖
        from: ['domain'],
        allow: ['domain'],
        disallow: ['application', 'infrastructure', 'presentation'],
        message: 'domain 层必须保持零依赖，不能导入其他层',
      },
      {
        // application 层可以导入 domain
        from: ['application'],
        allow: ['domain', 'application'],
        disallow: ['infrastructure', 'presentation'],
        message: 'application 层只能导入 domain 层',
      },
      {
        // infrastructure 实现 application 的接口
        from: ['infrastructure'],
        allow: ['domain', 'application', 'infrastructure'],
        disallow: ['presentation'],
        message: 'infrastructure 层不能导入 presentation 层',
      },
      {
        // presentation 依赖 application
        from: ['presentation'],
        allow: ['domain', 'application', 'presentation'],
        disallow: ['infrastructure'],
        message: 'presentation 层不能直接导入 infrastructure 层',
      },
    ],
  }
}

/**
 * eslint-plugin-boundaries 配置
 *
 * 用于强制执行模块边界和分层架构规则
 * 支持 VSA/DDD 风格的模块隔离
 *
 * @example
 * ```typescript
 * // 使用 modules 预设
 * export default composeConfig({
 *   boundaries: {
 *     preset: 'modules'
 *   }
 * })
 *
 * // 自定义规则
 * export default composeConfig({
 *   boundaries: {
 *     elements: [...],
 *     rules: [...]
 *   }
 * })
 * ```
 *
 * @param options - 配置选项
 * @returns ESLint 配置数组
 */
export function boundaries(options: BoundariesOptions = {}): Linter.Config[] {
  const {
    preset,
    elements: customElements,
    rules: customRules,
    files = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    overrides = {},
    baseDirectory,
  } = options

  // 获取预设配置
  let elements: ElementType[] = []
  let rules: BoundaryRule[] = []

  if (preset === 'modules') {
    const presetConfig = getModulesPreset()
    elements = presetConfig.elements
    rules = presetConfig.rules
  } else if (preset === 'layers') {
    const presetConfig = getLayersPreset()
    elements = presetConfig.elements
    rules = presetConfig.rules
  }

  // 自定义配置覆盖预设
  if (customElements) {
    elements = customElements
  }
  if (customRules) {
    rules = customRules
  }

  // 如果没有配置，返回空数组
  if (elements.length === 0) {
    return []
  }

  return defineConfig([
    {
      name: 'boundaries/rules',
      files,
      plugins: {
        boundaries: boundariesPlugin,
      },
      settings: {
        'boundaries/elements': elements,
        'boundaries/dependency-nodes': ['import', 'dynamic-import'],
        // 忽略测试文件
        'boundaries/ignore': ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e-spec.ts'],
        // 配置 TypeScript 路径解析器
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
            ...(baseDirectory && { project: baseDirectory }),
          },
        },
      },
      rules: {
        // 核心规则：元素边界检查
        'boundaries/element-types': [
          'error',
          {
            default: 'disallow',
            rules: rules.map((rule) => ({
              from: Array.isArray(rule.from) ? rule.from : [rule.from],
              allow: rule.allow
                ? (Array.isArray(rule.allow) ? rule.allow : [rule.allow])
                : undefined,
              message: rule.message,
            })),
          },
        ],

        // 禁止外部模块导入私有元素
        'boundaries/no-private': 'error',

        // 禁止未知文件（不匹配任何元素定义）
        // 注意：关闭此规则，因为 .d.ts 和配置文件可能不匹配元素定义
        'boundaries/no-unknown-files': 'off',

        // 禁止未知导入（导入不匹配任何元素的文件）
        // 注意：关闭此规则，因为外部依赖（node_modules）会触发误报
        'boundaries/no-unknown': 'off',

        ...overrides,
      },
    },
  ])
}
