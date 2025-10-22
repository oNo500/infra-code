#!/bin/bash
# 检查 Dockerfile 最佳实践

set -e

echo "🔍 Checking Dockerfile best practices..."

# 查找所有 Dockerfile
dockerfiles=$(find . -name "Dockerfile*" -not -path "*/node_modules/*")

if [ -z "$dockerfiles" ]; then
  echo "⚠️  No Dockerfile found"
  exit 0
fi

warnings=0

for dockerfile in $dockerfiles; do
  echo "Checking $dockerfile..."

  # 检查是否使用多阶段构建
  if ! grep -q "FROM.*AS" "$dockerfile"; then
    echo "⚠️  Consider using multi-stage builds in $dockerfile"
    ((warnings++))
  fi

  # 检查是否固定基础镜像版本
  if grep -q "FROM.*:latest" "$dockerfile"; then
    echo "⚠️  Avoid using 'latest' tag in $dockerfile"
    ((warnings++))
  fi

  # 检查是否使用非 root 用户
  if ! grep -q "USER" "$dockerfile"; then
    echo "⚠️  Consider running as non-root user in $dockerfile"
    ((warnings++))
  fi

  # 检查是否有 HEALTHCHECK
  if ! grep -q "HEALTHCHECK" "$dockerfile"; then
    echo "⚠️  Consider adding HEALTHCHECK in $dockerfile"
    ((warnings++))
  fi
done

if [ $warnings -gt 0 ]; then
  echo ""
  echo "⚠️  Found $warnings warnings. Consider addressing them."
fi

echo "✅ Dockerfile check completed"
exit 0
