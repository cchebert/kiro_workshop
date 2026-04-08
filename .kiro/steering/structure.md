# Project Structure

```
/
├── frontend/                    # React SPA
│   └── src/
│       ├── components/          # Reusable UI components (ErrorBoundary, ApiUrlDisplay)
│       ├── contexts/            # React Context providers (Auth, Language)
│       ├── i18n/                # Translation strings (en/fr)
│       ├── pages/               # Route-level page components (Feed, Login, Register, Profile, CreatePost)
│       ├── services/            # API client layer (api.ts — fetch-based, grouped by domain)
│       ├── types/               # TypeScript interfaces (User, Post)
│       ├── App.tsx              # Router setup, layout, protected routes
│       └── main.tsx             # Entry point with ErrorBoundary
│
├── backend/                     # AWS Lambda functions
│   └── src/
│       ├── common/              # Shared middleware (auth/JWT validation)
│       └── functions/           # Lambda handlers organized by domain
│           ├── auth/            # login, register
│           ├── posts/           # createPost, getPosts, likePost
│           ├── users/           # getProfile, updateProfile, followUser, unfollowUser, checkFollowing
│           └── monitoring/      # emitCustomMetrics
│
├── infrastructure/              # AWS CDK IaC
│   ├── bin/                     # CDK app entry point
│   └── lib/                     # Stack definitions (app-stack.ts)
│
├── DESIGN_LANGUAGE.md           # UI design system (colors, typography, spacing, components)
└── deploy-backend.ps1           # PowerShell backend deploy script
```

## Conventions
- Frontend pages map 1:1 to routes in App.tsx
- Backend Lambda handlers: one file per function, grouped by domain folder
- Protected endpoints use `withAuth(handler)` middleware wrapper
- API service layer groups calls by domain: `authApi`, `usersApi`, `postsApi`
- All API responses include CORS headers (`Access-Control-Allow-Origin: *`)
- DynamoDB tables use GSIs for secondary access patterns (e.g., `username-index`, `userId-index`, `postId-index`)
- Frontend env vars prefixed with `VITE_`
- UI follows design system in `DESIGN_LANGUAGE.md` — purple accent (#8b5cf6), system fonts, rounded buttons
