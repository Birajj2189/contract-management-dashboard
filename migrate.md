# ContractHub — Migration Guide: Render + Vercel → AWS

## First: A Critical Clarification on Your Docker Setup

Your `docker-compose.yml` defines **three separate containers**, not one:

```
postgres   → port 5432
backend    → port 5000  (./backend Dockerfile)
frontend   → port 5173  (./frontend Dockerfile)
```

This is actually the **correct** architecture and makes the AWS migration cleaner. Don't try to colocate frontend and backend into one container — keep them separate.

---

## Recommended AWS Architecture

```
GitHub Repo
    │
    ├─── frontend/   ──────────► AWS Amplify (Static Host + CDN via CloudFront)
    │                                   │ VITE_API_URL env var points to App Runner
    │
    ├─── backend/    ──────────► AWS App Runner (Containerized Node/Express)
    │                                   │ DATABASE_URL points to RDS
    │                                   │ Runs: prisma migrate deploy + npm start
    │
    └─── (postgres removed)  ──► AWS RDS PostgreSQL (Managed, in VPC)
```

### Why these services?

| Service | Reason |
|---|---|
| **AWS Amplify** | Zero-config for Vite/React static apps. Auto-detects build output, serves via CloudFront, free SSL, branch previews. Better than Vercel parity. |
| **AWS App Runner** | Simplest containerized Node.js deployment on AWS. No ECS cluster/task-definition overhead. Auto-scales, zero cold starts (unlike Render free tier), pulls directly from ECR or GitHub. |
| **AWS RDS PostgreSQL** | Managed Postgres with automated backups, Multi-AZ option. Runs in a VPC; App Runner connects via VPC connector — DB never exposed to public internet. |

> **Why not ECS Fargate?** Valid choice but adds significant overhead: clusters, task definitions, ALB setup, service discovery. App Runner abstracts all of that and is perfect for a single-service backend like this.
> 
> **Why not Amplify for the backend?** Amplify SSR/Lambda works for Next.js, but this is Express — it needs a persistent server, not a serverless function host.

---

## Step 1 — AWS RDS PostgreSQL (Database)

### 1.1 Create the RDS Instance

```bash
# Via AWS Console: RDS → Create database
Engine: PostgreSQL 15
Template: Free tier (or Production for real use)
DB instance identifier: contracthub-db
Master username: contract_user
Master password: <strong-password>
Instance: db.t3.micro (free tier eligible)
Storage: 20 GB gp2
VPC: Default (or create a dedicated one)
Public access: NO  ← important
```

### 1.2 Security Group Rules

Create a security group `contracthub-rds-sg`:
- **Inbound:** PostgreSQL (5432) from the App Runner VPC connector security group only
- **Outbound:** All traffic

### 1.3 Get the Connection String

```
postgresql://contract_user:<password>@<rds-endpoint>:5432/contract_db
```

---

## Step 2 — Backend on AWS App Runner

### 2.1 Verify your backend Dockerfile

Your `backend/Dockerfile` should look like this (create/update if needed):

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 5000

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
```

> The `prisma migrate deploy` in CMD is critical — it ensures schema is applied before the server accepts traffic, exactly like your current Render setup.

### 2.2 Push image to Amazon ECR

```bash
# Authenticate
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  <your-account-id>.dkr.ecr.ap-south-1.amazonaws.com

# Create repo
aws ecr create-repository --repository-name contracthub-backend --region ap-south-1

# Build, tag, push
docker build -t contracthub-backend ./backend
docker tag contracthub-backend:latest \
  <account-id>.dkr.ecr.ap-south-1.amazonaws.com/contracthub-backend:latest
docker push \
  <account-id>.dkr.ecr.ap-south-1.amazonaws.com/contracthub-backend:latest
```

### 2.3 Create App Runner Service

```bash
# AWS Console → App Runner → Create service
Source: Container registry → Amazon ECR
ECR image URI: <account-id>.dkr.ecr.ap-south-1.amazonaws.com/contracthub-backend:latest

Port: 5000
CPU: 0.25 vCPU  (or 0.5 for better cold start)
Memory: 0.5 GB

# Environment Variables (set all secrets here):
DATABASE_URL=postgresql://contract_user:<pass>@<rds-endpoint>:5432/contract_db
JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-refresh-secret>
NODE_ENV=production
FRONTEND_URL=https://<your-amplify-domain>.amplifyapp.com
COOKIE_SECURE=true
```

### 2.4 Connect App Runner to RDS (VPC Connector)

```
App Runner → your service → Configuration → Networking
→ Enable VPC → Create VPC connector
→ Select the VPC and subnets where RDS lives
→ Attach the security group that RDS allows inbound from
```

This keeps your DB off the public internet while App Runner can reach it.

### 2.5 Note your App Runner URL

```
https://xxxxxxxxxx.ap-south-1.awsapprunner.com
```

This replaces `https://contract-management-dashboard.onrender.com`.

---

## Step 3 — Frontend on AWS Amplify

### 3.1 Connect GitHub Repo

```
AWS Console → Amplify → New app → Host web app
→ GitHub → select repo: Birajj2189/contract-management-dashboard
→ Branch: main
```

### 3.2 Build Settings

Amplify needs to know the root is `frontend/`. Set this in `amplify.yml` (create at repo root):

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - cd frontend
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: frontend/dist
        files:
          - '**/*'
      cache:
        paths:
          - frontend/node_modules/**/*
    appRoot: frontend
```

### 3.3 Environment Variables in Amplify

```
VITE_API_URL=https://xxxxxxxxxx.ap-south-1.awsapprunner.com
```

> In Vite, only variables prefixed with `VITE_` are exposed to the browser. Make sure your frontend uses `import.meta.env.VITE_API_URL` (it almost certainly already does since it was working on Vercel).

### 3.4 SPA Redirect Rule

Since this is a React Router SPA, add a rewrite rule in Amplify:

```
Rewrites and redirects → Add rule:
Source:  </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>
Target:  /index.html
Type:    200 (Rewrite)
```

---

## Step 4 — CORS & Cookie Configuration (Backend)

Since frontend and backend are now on different domains, update your Express CORS config:

```javascript
// backend/src/app.js or wherever cors is configured
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL,   // e.g. https://main.xxxx.amplifyapp.com
  credentials: true,                   // required for HttpOnly cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

And ensure your refresh token cookie uses the right flags in production:

```javascript
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  // true on App Runner
  sameSite: 'none',   // required for cross-origin cookies
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

> `sameSite: 'none'` + `secure: true` is required when frontend and backend are on different domains. Without this, the browser will block the HttpOnly refresh token cookie.

---

## Step 5 — CI/CD with GitHub Actions

Replace or augment the existing `.github/workflows` to auto-deploy on push:

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend to App Runner

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1

      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image
        run: |
          docker build -t contracthub-backend ./backend
          docker tag contracthub-backend:latest \
            ${{ secrets.ECR_REGISTRY }}/contracthub-backend:latest
          docker push ${{ secrets.ECR_REGISTRY }}/contracthub-backend:latest

      - name: Deploy to App Runner
        run: |
          aws apprunner start-deployment \
            --service-arn ${{ secrets.APP_RUNNER_SERVICE_ARN }}
```

> Amplify auto-deploys the frontend on every push to `main` without any GitHub Actions needed — it has its own build pipeline.

---

## Step 6 — Database Migration from Render

Before cutting over, migrate your existing data:

```bash
# 1. Dump from Render Postgres
pg_dump \
  "postgresql://user:pass@render-host:5432/contract_db" \
  --no-owner --no-privileges \
  -f contracthub_backup.sql

# 2. Restore to RDS
psql \
  "postgresql://contract_user:<pass>@<rds-endpoint>:5432/contract_db" \
  -f contracthub_backup.sql
```

Prisma migrations are handled automatically by `prisma migrate deploy` in the App Runner container startup command — no manual schema setup needed.

---

## Summary Checklist

```
[ ] RDS PostgreSQL instance created (private, in VPC)
[ ] RDS security group allows inbound only from App Runner VPC connector
[ ] backend/Dockerfile updated with migrate + start CMD
[ ] Backend image pushed to ECR
[ ] App Runner service created pointing to ECR image
[ ] App Runner VPC connector set up (to reach RDS)
[ ] All backend env vars set in App Runner (DATABASE_URL, JWT secrets, FRONTEND_URL)
[ ] CORS updated with FRONTEND_URL and sameSite: 'none'
[ ] amplify.yml committed to repo root with correct appRoot: frontend
[ ] VITE_API_URL set in Amplify environment variables
[ ] SPA rewrite rule added in Amplify
[ ] GitHub Actions secrets set: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, ECR_REGISTRY, APP_RUNNER_SERVICE_ARN
[ ] Data migrated from Render Postgres to RDS
[ ] Smoke test: login, create contract, refresh token cookie works cross-origin
```

---

## Cost Estimate (ap-south-1, light traffic)

| Service | Approx Monthly Cost |
|---|---|
| AWS Amplify (hosting) | ~$0 (free tier: 1000 min build, 15 GB served) |
| AWS App Runner (0.25 vCPU / 0.5 GB) | ~$5–10 |
| AWS RDS db.t3.micro | ~$15 (or $0 for 12 months on free tier) |
| ECR storage | ~$0.10/GB |
| **Total** | **~$15–25/month** |

This is comparable to Render paid plans and significantly more reliable (no sleep on inactivity, real SLAs).