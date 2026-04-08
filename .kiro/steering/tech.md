# Tech Stack & Build System

## Monorepo Structure
- Yarn workspaces with three packages: `frontend`, `backend`, `infrastructure`
- Root `package.json` orchestrates cross-package scripts

## Frontend
- React 18 with TypeScript (strict mode)
- Vite 4 for dev server and bundling
- react-router-dom v6 for client-side routing
- Custom i18n system (no library — see `src/i18n/translations.ts`)
- Context API for state management (AuthContext, LanguageContext)
- Playwright for E2E testing
- ESLint with TypeScript and React plugins
- API URL configured via `VITE_API_URL` env var

## Backend
- AWS Lambda functions (Node.js 22, CommonJS)
- Written in JavaScript (`.js`), not TypeScript (despite tsconfig presence)
- AWS SDK v3 for DynamoDB and Cognito
- `uuid` for ID generation
- Custom auth middleware (`withAuth` wrapper) for JWT validation
- Jest available for testing (no test scripts defined yet)

## Infrastructure
- AWS CDK v2 (TypeScript)
- Resources: Cognito User Pool, DynamoDB tables (Users, Posts, Likes, Comments, Follows), API Gateway REST API, S3 + CloudFront for frontend hosting
- Lambda functions bundled via `NodejsFunction` (esbuild)
- All DynamoDB tables use PAY_PER_REQUEST billing
- Stack name: `MicroBloggingAppStack`

## Common Commands
```bash
# Frontend
yarn start:frontend          # Dev server (Vite)
yarn build:frontend          # TypeScript check + Vite build
yarn workspace frontend lint # ESLint
yarn workspace frontend test:e2e # Playwright E2E tests

# Infrastructure
yarn deploy:infra            # CDK deploy
yarn workspace infrastructure diff  # CDK diff

# Full deploy (build + deploy infra + deploy frontend + invalidate CDN)
yarn deploy

# Backend deploy (PowerShell script)
yarn deploy:backend
```
