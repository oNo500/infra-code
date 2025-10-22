---
description: 部署全栈应用到各种平台
tags: [fullstack, deploy, devops]
---

# 部署全栈应用

将全栈应用部署到生产环境，支持多种部署平台和策略。

## 使用方式

```bash
/deploy [platform] [options]
```

## 支持的平台

- `vercel` - Vercel（前端 + Serverless API）
- `railway` - Railway（全栈应用）
- `aws` - AWS（EC2/ECS/Lambda）
- `docker` - Docker 容器化
- `kubernetes` - Kubernetes 集群
- `netlify` - Netlify（前端 + Functions）

## 选项

- `--env <environment>`: 部署环境 (staging/production，默认: production)
- `--domain <domain>`: 自定义域名
- `--ssl`: 启用 SSL/TLS
- `--ci`: 生成 CI/CD 配置

## 示例

```bash
# 部署到 Vercel
/deploy vercel

# 部署到 Railway（自定义域名）
/deploy railway --domain myapp.com --ssl

# Docker 部署
/deploy docker --env production

# 生成 CI/CD 配置
/deploy --ci
```

## 平台详解

### 1. Vercel 部署

适合：Next.js 应用、Serverless 架构

#### 配置文件
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "apps/api/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/api/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

#### 部署步骤
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod

# 设置环境变量
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
```

### 2. Railway 部署

适合：全栈应用、需要数据库的项目

#### 配置文件
```toml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "pnpm install && pnpm build"

[deploy]
startCommand = "pnpm start"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "on-failure"

[[services]]
name = "web"
source = "apps/web"

[[services]]
name = "api"
source = "apps/api"

[[services]]
name = "postgres"
image = "postgres:15"
```

#### 部署步骤
```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 添加数据库
railway add postgres

# 部署
railway up

# 查看日志
railway logs
```

### 3. AWS 部署

适合：企业级应用、需要完全控制

#### 架构选择

**选项 A: EC2 + RDS**
- 前端：S3 + CloudFront
- 后端：EC2 + Load Balancer
- 数据库：RDS（PostgreSQL/MySQL）

**选项 B: ECS + Fargate**
- 容器化部署
- 自动扩缩容
- 无需管理服务器

**选项 C: Lambda + API Gateway**
- Serverless 架构
- 按使用量付费
- 自动扩展

#### CloudFormation 模板
```yaml
# cloudformation.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Full Stack Application'

Resources:
  # VPC
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16

  # RDS Database
  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      Engine: postgres
      DBInstanceClass: db.t3.micro
      AllocatedStorage: 20
      MasterUsername: !Ref DBUser
      MasterUserPassword: !Ref DBPassword

  # ECS Cluster
  ECSCluster:
    Type: AWS::ECS::Cluster

  # Application Load Balancer
  LoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: application
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  # CloudFront Distribution
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt S3Bucket.DomainName
```

#### 部署脚本
```bash
#!/bin/bash
# deploy-aws.sh

# 构建前端
cd apps/web
npm run build
aws s3 sync dist/ s3://my-app-frontend

# 构建并推送 Docker 镜像
cd ../api
docker build -t my-app-api .
docker tag my-app-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/my-app-api:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/my-app-api:latest

# 更新 ECS 服务
aws ecs update-service --cluster my-cluster --service my-service --force-new-deployment

# 创建 CloudFront invalidation
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
```

### 4. Docker 部署

适合：任何支持 Docker 的平台

#### Docker Compose 生产配置
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - API_URL=https://api.myapp.com
    restart: always

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.prod
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis
    restart: always

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api
    restart: always

volumes:
  postgres_data:
  redis_data:
```

#### 前端 Dockerfile
```dockerfile
# apps/web/Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 后端 Dockerfile
```dockerfile
# apps/api/Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 4000
CMD ["node", "dist/index.js"]
```

#### 部署命令
```bash
# 构建镜像
docker-compose -f docker-compose.prod.yml build

# 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 扩展服务
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

### 5. Kubernetes 部署

适合：大规模应用、微服务架构

#### Kubernetes 配置
```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: myapp/api:latest
        ports:
        - containerPort: 4000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 4000
  type: LoadBalancer

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - myapp.com
    secretName: myapp-tls
  rules:
  - host: myapp.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
```

#### 部署命令
```bash
# 创建命名空间
kubectl create namespace myapp

# 应用配置
kubectl apply -f k8s/ -n myapp

# 查看状态
kubectl get pods -n myapp
kubectl get services -n myapp

# 扩缩容
kubectl scale deployment api-deployment --replicas=5 -n myapp

# 滚动更新
kubectl set image deployment/api-deployment api=myapp/api:v2 -n myapp
```

## CI/CD 配置

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # 前端部署到 Vercel
      - name: Deploy Frontend
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./apps/web

      # 后端部署到 Railway
      - name: Deploy Backend
        uses: berviantoleo/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: api

      # 运行数据库迁移
      - name: Run Migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          cd apps/api
          npm run db:migrate
```

### GitLab CI
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm test

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - kubectl set image deployment/api api=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - main
```

## 环境变量管理

### .env 文件结构
```bash
# .env.production
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# API
API_URL=https://api.myapp.com
API_PORT=4000

# Frontend
VITE_API_URL=https://api.myapp.com

# Authentication
JWT_SECRET=your-production-secret
JWT_EXPIRES_IN=7d

# Third-party services
STRIPE_SECRET_KEY=sk_live_xxx
SENDGRID_API_KEY=SG.xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## 健康检查

```typescript
// apps/api/src/routes/health.ts
import { Router } from 'express';
import { db } from '../lib/db';
import { redis } from '../lib/redis';

const router = Router();

router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok',
    checks: {
      database: 'ok',
      redis: 'ok'
    }
  };

  try {
    await db.raw('SELECT 1');
  } catch (error) {
    health.status = 'error';
    health.checks.database = 'error';
  }

  try {
    await redis.ping();
  } catch (error) {
    health.status = 'error';
    health.checks.redis = 'error';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
```

## 监控和日志

### 日志聚合
```typescript
// apps/api/src/lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 性能监控
```typescript
// apps/api/src/middleware/metrics.ts
import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });

  next();
};
```

## 回滚策略

```bash
# Docker 回滚
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --scale api=0
docker tag myapp/api:previous myapp/api:latest
docker-compose -f docker-compose.prod.yml up -d

# Kubernetes 回滚
kubectl rollout undo deployment/api-deployment -n myapp

# Vercel 回滚
vercel rollback
```

## 安全检查清单

- ✅ 所有敏感信息使用环境变量
- ✅ 启用 HTTPS/SSL
- ✅ 配置 CORS 正确的源
- ✅ 启用 Rate limiting
- ✅ 使用安全 headers（Helmet.js）
- ✅ 数据库使用强密码
- ✅ API 密钥定期轮换
- ✅ 启用日志记录
- ✅ 配置防火墙规则
- ✅ 定期备份数据库
