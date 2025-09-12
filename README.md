# Multi-Tenant SaaS Notes Application

A full-stack multi-tenant SaaS application built with Next.js, featuring secure tenant isolation, role-based access control, and subscription-based feature gating.

## 🏗️ Multi-Tenancy Architecture

This application uses a **Shared Schema with Tenant ID** approach for multi-tenancy:

- **Single Database**: All tenants share the same database instance
- **Tenant Isolation**: Every data-containing table includes a `tenantId` column
- **Row-Level Security**: All queries are automatically filtered by tenant ID
- **Cost Effective**: Optimal resource usage and easier maintenance
- **Scalable**: Supports unlimited tenants with proper indexing

### Why Shared Schema?
- **Lower operational overhead** compared to database-per-tenant
- **Better resource utilization** than schema-per-tenant  
- **Easier backups and migrations**
- **Built-in isolation** through application-level filtering

## 🚀 Features

### Core Functionality
- ✅ **Multi-tenant Architecture** with strict data isolation
- ✅ **JWT-based Authentication** with secure token management
- ✅ **Role-based Access Control** (Admin/Member)
- ✅ **Complete Notes CRUD** operations
- ✅ **Subscription Feature Gating** (Free: 3 notes, Pro: unlimited)
- ✅ **Admin Upgrade Capability** with immediate effect

### Security
- ✅ **Tenant Isolation**: Data belonging to one tenant is never accessible to another
- ✅ **JWT Authentication**: Secure stateless authentication
- ✅ **Role-based Permissions**: Different capabilities for Admin vs Member
- ✅ **CORS Enabled**: API accessible from external applications

## 🔧 Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: JWT with bcryptjs
- **Deployment**: Vercel

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd assignment
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   - Navigate to `http://localhost:3000`
   - Use the predefined test accounts to login

## 👤 Test Accounts

All test accounts use password: **`password`**

| Email | Role | Tenant | Capabilities |
|-------|------|--------|-------------|
| `admin@acme.test` | Admin | Acme | Full access + upgrade subscriptions |
| `user@acme.test` | Member | Acme | Notes CRUD only |
| `admin@globex.test` | Admin | Globex | Full access + upgrade subscriptions |
| `user@globex.test` | Member | Globex | Notes CRUD only |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login with email/password

### Notes CRUD
- `GET /api/notes` - List all notes for current tenant
- `POST /api/notes` - Create a new note (respects plan limits)
- `GET /api/notes/:id` - Get specific note (tenant-isolated)
- `PUT /api/notes/:id` - Update note (tenant-isolated)
- `DELETE /api/notes/:id` - Delete note (tenant-isolated)

### Tenant Management  
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro (Admin only)

### System
- `GET /api/health` - Health check endpoint

### Example API Usage

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@acme.test","password":"password"}'

# Create Note (with Bearer token)
curl -X POST http://localhost:3000/api/notes \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{"title":"My Note","content":"Note content"}'

# Upgrade Tenant (Admin only)
curl -X POST http://localhost:3000/api/tenants/acme/upgrade \\
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## 💳 Subscription Plans

### Free Plan
- **Limit**: Maximum 3 notes per tenant
- **Features**: Basic notes CRUD
- **Upgrade**: Available to tenant Admins

### Pro Plan  
- **Limit**: Unlimited notes
- **Features**: Full access to all functionality
- **Billing**: Simulated (upgrade is immediate)

## 🌐 Deployment

### Vercel Deployment

1. **Connect Repository**
   - Push code to GitHub/GitLab
   - Connect repository to Vercel

2. **Environment Variables**
   Set these in Vercel dashboard:
   ```
   DATABASE_URL=postgresql://user:pass@host:port/db
   JWT_SECRET=your-production-jwt-secret
   NEXTAUTH_SECRET=your-production-nextauth-secret
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

3. **Database Setup**
   ```bash
   # In Vercel, run these commands or set up auto-deploy
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Deploy**
   - Vercel will auto-deploy on push
   - Check deployment logs for any issues

### Production Considerations
- Switch from SQLite to PostgreSQL for production
- Use connection pooling for database connections
- Set strong JWT secrets
- Enable database backups
- Monitor application performance

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   ├── notes/     # Notes CRUD endpoints
│   │   │   ├── tenants/   # Tenant management
│   │   │   └── health/    # Health check
│   │   └── page.tsx       # Main application page
│   ├── components/        # React components
│   │   ├── LoginForm.tsx  # Authentication form
│   │   └── NotesApp.tsx   # Main notes interface
│   └── lib/              # Utility functions
│       ├── auth.ts       # Authentication helpers
│       └── prisma.ts     # Database client
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts          # Database seeding
├── middleware.ts         # Next.js middleware for auth
├── vercel.json          # Vercel deployment config
└── .env.example         # Environment variables template
```

## 🔐 Security Features

### Tenant Isolation
- All database queries filtered by `tenantId`
- JWT tokens contain tenant information
- Middleware enforces tenant boundaries
- No cross-tenant data leakage possible

### Authentication
- Passwords hashed with bcryptjs (12 rounds)
- JWT tokens with 24-hour expiration
- Secure token validation on all protected routes
- Session persistence with localStorage

### Authorization
- Role-based access control (RBAC)
- Admin-only operations clearly separated
- Subscription limits enforced at API level
- CORS enabled for external API access

## 🧪 Testing the Application

1. **Login Test**
   - Use any of the 4 test accounts
   - Verify tenant isolation (Acme users can't see Globex data)

2. **Notes CRUD Test**
   - Create, read, update, delete notes
   - Verify tenant isolation between accounts

3. **Subscription Limits**
   - As a free user, try creating 4+ notes
   - Should see upgrade prompt after 3 notes

4. **Admin Features**
   - Login as admin account
   - Upgrade tenant from Free to Pro
   - Verify unlimited note creation

5. **API Testing**
   - Test `/api/health` endpoint
   - Use curl/Postman to test all endpoints
   - Verify CORS headers present

## 🐛 Troubleshooting

### Common Issues

**Database Connection**
- Ensure Prisma client is generated: `npx prisma generate`
- Reset database if needed: `npx prisma db push --force-reset`

**Authentication Issues**
- Check JWT_SECRET is set in .env
- Verify token format in API requests
- Clear localStorage if login persists incorrectly

**CORS Issues**
- Middleware handles CORS automatically
- Check network tab for preflight requests
- Ensure Authorization header is properly set

### Development Scripts
```bash
npm run dev          # Start development server  
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with test data
```

## 🎯 Assignment Requirements Compliance

✅ **Multi-Tenancy**: Shared schema with tenant ID isolation  
✅ **Authentication**: JWT-based with role-based access  
✅ **Test Accounts**: All 4 mandatory accounts with "password"  
✅ **Subscription Gating**: Free (3 notes) vs Pro (unlimited)  
✅ **Notes CRUD**: Complete API with tenant isolation  
✅ **Admin Upgrade**: POST /tenants/:slug/upgrade endpoint  
✅ **Frontend**: Login, notes management, upgrade prompts  
✅ **Health Check**: GET /api/health returns {"status":"ok"}  
✅ **CORS**: Enabled for external API access  
✅ **Vercel Ready**: Configured for seamless deployment  

## 📞 Support

For questions or issues, please check:
1. Application logs in browser console
2. Vercel function logs (if deployed)
3. Database connection status
4. Environment variable configuration

---

**Built with ❤️ using Next.js and modern web technologies**
