#!/bin/bash
# 数据库迁移前备份

set -e

echo "💾 Creating database backup before migration..."

# 检查环境变量
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set, skipping backup"
  exit 0
fi

# 解析数据库类型
if [[ $DATABASE_URL == postgresql://* ]] || [[ $DATABASE_URL == postgres://* ]]; then
  DB_TYPE="postgresql"
elif [[ $DATABASE_URL == mysql://* ]]; then
  DB_TYPE="mysql"
elif [[ $DATABASE_URL == mongodb://* ]]; then
  DB_TYPE="mongodb"
else
  echo "⚠️  Unknown database type, skipping backup"
  exit 0
fi

# 创建备份目录
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Backing up $DB_TYPE database to $BACKUP_DIR..."

# 根据数据库类型执行备份
case $DB_TYPE in
  postgresql)
    pg_dump $DATABASE_URL > "$BACKUP_DIR/backup.sql"
    ;;
  mysql)
    mysqldump $DATABASE_URL > "$BACKUP_DIR/backup.sql"
    ;;
  mongodb)
    mongodump --uri="$DATABASE_URL" --out="$BACKUP_DIR"
    ;;
esac

# 压缩备份
cd "$BACKUP_DIR/.."
tar -czf "$(basename $BACKUP_DIR).tar.gz" "$(basename $BACKUP_DIR)"
rm -rf "$BACKUP_DIR"

echo "✅ Database backup created: $BACKUP_DIR.tar.gz"
echo "💡 To restore: tar -xzf backup.tar.gz && psql \$DATABASE_URL < backup.sql"
