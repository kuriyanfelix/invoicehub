# 🚀 Quick Start Guide - Invoice Extraction AI MVP

## What You're Getting

A complete, production-ready Next.js application for AI-powered invoice extraction with:
- ✅ Full authentication & authorization (Admin/User roles)
- ✅ Multi-tenant data isolation
- ✅ Claude AI integration for invoice data extraction
- ✅ Beautiful Apple-inspired UI
- ✅ PDF upload & storage (S3 + local fallback)
- ✅ Dashboard with KPIs and analytics
- ✅ Invoice history with search & filters
- ✅ Detailed invoice view with line items
- ✅ Complete audit logging
- ✅ Railway deployment ready

## 📁 What's Included

This package contains 40+ files including:
- Full Next.js 15 application with App Router
- Complete Prisma database schema
- Server actions for invoice processing
- shadcn/ui components
- Claude AI extraction logic
- S3 storage abstraction
- Authentication with NextAuth
- All pages: Login, Dashboard, Upload, History, Invoice Detail

## 🏃 Get Started in 5 Minutes

### 1. Extract & Install

```bash
cd invoice-extraction-mvp
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/invoice_extraction"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
ANTHROPIC_API_KEY="sk-ant-api03-YOUR-KEY-HERE"
USE_LOCAL_STORAGE="true"  # Use local storage for dev
```

### 3. Initialize Database

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Login & Test

Open http://localhost:3000 and login with:
- **Admin**: admin@example.com / Password123!
- **User**: user@example.com / Password123!

## 📋 Test the Application

1. **Login** - Use the demo credentials above
2. **Dashboard** - View KPIs and recent invoices
3. **Upload** - Upload a sample PDF invoice
4. **Review** - AI will extract all data automatically
5. **History** - View all processed invoices
6. **Detail** - Click any invoice to see full details

## 🚢 Deploy to Railway (5 minutes)

### Prerequisites
- Railway account (free tier available)
- GitHub repository

### Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

2. **Create Railway Project**:
   - Go to railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL**:
   - In your project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway automatically sets DATABASE_URL

4. **Add Environment Variables**:
   Go to your service → Variables → Add:
   ```
   NEXTAUTH_URL=https://your-app.railway.app
   NEXTAUTH_SECRET=<generate-new-secret>
   ANTHROPIC_API_KEY=sk-ant-api03-...
   USE_LOCAL_STORAGE=false
   S3_ENDPOINT=<your-s3-endpoint>
   S3_REGION=<your-region>
   S3_ACCESS_KEY_ID=<your-key>
   S3_SECRET_ACCESS_KEY=<your-secret>
   S3_BUCKET=<your-bucket>
   ```

5. **Deploy**:
   - Railway automatically builds and deploys
   - After deployment, run in Railway console:
     ```bash
     npx prisma migrate deploy
     npm run prisma:seed
     ```

6. **Access Your App**:
   Railway provides a URL like `https://your-app.railway.app`

## 🏗️ Project Structure

```
invoice-extraction-mvp/
├── app/                    # Next.js pages
│   ├── (auth)/login       # Login page
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── upload/        # Upload page
│   │   ├── history/       # Invoice history
│   │   └── invoices/[id]/ # Invoice detail
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Core logic
├── actions/               # Server actions
├── prisma/                # Database schema
└── middleware.ts          # Auth middleware
```

## 🔑 Key Features

### Authentication
- Secure bcrypt password hashing
- JWT sessions
- Role-based access (Admin/User)
- Protected routes with middleware

### Invoice Processing
1. Upload PDF invoice
2. Extract text from PDF
3. Send to Claude AI for structured extraction
4. Validate with Zod schemas
5. Auto-repair invalid JSON
6. Store in database with audit log

### Multi-Tenant
- Users see only their invoices
- Admins see all invoices
- Row-level security in queries
- Owner field on every invoice

### Storage
- S3-compatible (AWS, DigitalOcean, MinIO)
- Local /tmp fallback for development
- File hash calculation
- Secure presigned URLs

## 📊 Database Schema

### Key Models
- **User**: Authentication & roles
- **Vendor**: Normalized vendor records
- **Invoice**: Complete invoice data
- **LineItem**: Invoice line items
- **ExtractionRun**: AI extraction metadata
- **AuditLog**: Change tracking

## 🎨 UI Design

Apple-inspired futuristic aesthetic:
- Clean typography with generous spacing
- Subtle gradients and glass effects
- Soft shadows and rounded corners
- Responsive layouts
- Loading states and animations
- Empty states

## 🔧 Customization

### Change AI Model
Edit `lib/extraction.ts`:
```typescript
model: 'claude-sonnet-4-20250514'  // Change to other Claude models
```

### Add More Fields
1. Update `lib/extraction.ts` schema
2. Update Prisma schema
3. Run migration: `npx prisma migrate dev`
4. Update UI components

### Customize UI Theme
Edit `app/globals.css` CSS variables

## 📚 Documentation

- **README.md** - Main documentation
- **IMPLEMENTATION.md** - Detailed implementation guide
- **FILE_TREE.md** - Complete file structure
- **This file** - Quick start guide

## 🐛 Troubleshooting

### Database Connection Failed
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Verify firewall allows connection

### Claude API Errors
- Verify ANTHROPIC_API_KEY is valid
- Check API quota/rate limits
- Review extraction prompts

### File Upload Fails
- Check USE_LOCAL_STORAGE setting
- Verify S3 credentials if using S3
- Ensure /tmp directory has write permissions

### Build Errors
- Run `npm install` again
- Delete node_modules and package-lock.json, reinstall
- Ensure all environment variables are set

## 💡 Tips

1. **Start with local storage** (USE_LOCAL_STORAGE=true) for development
2. **Test with sample invoices** before production use
3. **Monitor Claude API usage** to control costs
4. **Set up proper S3 bucket** for production
5. **Use strong NEXTAUTH_SECRET** in production
6. **Enable SSL** for production deployments
7. **Set up database backups** on Railway

## 📞 Support

- Check README.md for detailed documentation
- Review IMPLEMENTATION.md for code details
- All code includes inline comments
- Database schema is well-documented

## 🎯 Next Steps

1. ✅ Get the app running locally
2. ✅ Test invoice upload and extraction
3. ✅ Customize for your needs
4. ✅ Deploy to Railway
5. ✅ Set up production S3 bucket
6. ✅ Configure custom domain
7. ✅ Monitor and iterate

## 🎉 You're Ready!

This is a complete, production-quality MVP. Everything you need is included. Just follow the steps above and you'll have a working invoice extraction system in minutes.

**Questions?** All the code is well-commented and documented. Check the README.md and IMPLEMENTATION.md for details.

**Happy coding! 🚀**
