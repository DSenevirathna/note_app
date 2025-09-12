# 🚀 Quick Deployment Guide

## Local Development
```bash
npm install
npx prisma generate
npx prisma db push  
npm run db:seed
npm run dev
```

## Test Accounts (password: "password")
- `admin@acme.test` - Acme Admin
- `user@acme.test` - Acme Member  
- `admin@globex.test` - Globex Admin
- `user@globex.test` - Globex Member

## Key URLs
- App: http://localhost:3000
- Health: http://localhost:3000/api/health
- Login: POST /api/auth/login
- Notes: GET/POST/PUT/DELETE /api/notes
- Upgrade: POST /api/tenants/:slug/upgrade

## Vercel Environment Variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
NEXTAUTH_SECRET=your-secret  
NEXTAUTH_URL=https://your-app.vercel.app
```

## Features Implemented ✅
- Multi-tenant architecture (shared schema + tenant ID)
- JWT authentication with role-based access
- Notes CRUD with tenant isolation
- Subscription limits (Free: 3 notes, Pro: unlimited)
- Admin upgrade functionality
- CORS-enabled API
- Responsive frontend
- Complete documentation
