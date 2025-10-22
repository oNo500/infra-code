---
description: 创建页面组件并配置路由
---

# 创建页面

创建完整的页面组件，包括路由配置、布局选择、SEO 元数据和数据获取逻辑。

## 功能
- 自动配置路由（React Router/Vue Router）
- 选择布局模板（Full/Dashboard/Minimal）
- 生成 SEO 元数据
- 配置数据获取（getServerSideProps/useQuery）
- 创建页面级状态管理

## 示例用法
```bash
/page UserProfile
/page Dashboard --layout dashboard
/page ProductDetail --with-seo --with-data-fetching
```
