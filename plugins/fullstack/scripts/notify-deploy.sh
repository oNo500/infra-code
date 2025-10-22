#!/bin/bash
# 部署成功后发送通知

set -e

echo "📢 Sending deployment notification..."

# 获取部署信息
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
AUTHOR=$(git log -1 --pretty=format:'%an' 2>/dev/null || echo "unknown")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Slack 通知（如果配置了 SLACK_WEBHOOK）
if [ -n "$SLACK_WEBHOOK" ]; then
  curl -X POST "$SLACK_WEBHOOK" \
    -H 'Content-Type: application/json' \
    -d "{
      \"text\": \"🚀 Deployment Successful\",
      \"blocks\": [
        {
          \"type\": \"section\",
          \"text\": {
            \"type\": \"mrkdwn\",
            \"text\": \"*Deployment Successful* :rocket:\"
          }
        },
        {
          \"type\": \"section\",
          \"fields\": [
            {
              \"type\": \"mrkdwn\",
              \"text\": \"*Branch:*\n$BRANCH\"
            },
            {
              \"type\": \"mrkdwn\",
              \"text\": \"*Commit:*\n$COMMIT\"
            },
            {
              \"type\": \"mrkdwn\",
              \"text\": \"*Author:*\n$AUTHOR\"
            },
            {
              \"type\": \"mrkdwn\",
              \"text\": \"*Time:*\n$TIMESTAMP\"
            }
          ]
        }
      ]
    }"
  echo "✅ Slack notification sent"
fi

# Discord 通知（如果配置了 DISCORD_WEBHOOK）
if [ -n "$DISCORD_WEBHOOK" ]; then
  curl -X POST "$DISCORD_WEBHOOK" \
    -H 'Content-Type: application/json' \
    -d "{
      \"embeds\": [{
        \"title\": \"🚀 Deployment Successful\",
        \"color\": 3066993,
        \"fields\": [
          {\"name\": \"Branch\", \"value\": \"$BRANCH\", \"inline\": true},
          {\"name\": \"Commit\", \"value\": \"$COMMIT\", \"inline\": true},
          {\"name\": \"Author\", \"value\": \"$AUTHOR\", \"inline\": true},
          {\"name\": \"Time\", \"value\": \"$TIMESTAMP\", \"inline\": true}
        ]
      }]
    }"
  echo "✅ Discord notification sent"
fi

# 如果没有配置 webhook，只输出消息
if [ -z "$SLACK_WEBHOOK" ] && [ -z "$DISCORD_WEBHOOK" ]; then
  echo "💡 Configure SLACK_WEBHOOK or DISCORD_WEBHOOK for notifications"
fi

echo "✅ Notification process completed"
