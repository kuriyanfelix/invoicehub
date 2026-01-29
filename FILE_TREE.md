# Complete File Tree - Invoice Extraction MVP

## Project Structure

```
invoice-extraction-mvp/
│
├── 📦 Configuration Files
│   ├── package.json                    # Dependencies and scripts
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── tailwind.config.ts              # Tailwind CSS configuration
│   ├── postcss.config.mjs              # PostCSS configuration
│   ├── next.config.ts                  # Next.js configuration
│   ├── .env.example                    # Environment variables template
│   ├── .gitignore                      # Git ignore rules
│   ├── README.md                       # Main documentation
│   ├── IMPLEMENTATION.md               # Implementation guide
│   └── middleware.ts                   # Auth & RBAC middleware
│
├── 📁 prisma/                          # Database
│   ├── schema.prisma                   # Database schema
│   └── seed.ts                         # Seed script (demo users)
│
├── 📁 lib/                             # Core Libraries
│   ├── prisma.ts                       # Prisma client singleton
│   ├── auth.ts                         # NextAuth configuration
│   ├── storage.ts                      # S3/local storage abstraction
│   ├── extraction.ts                   # Claude AI extraction logic
│   ├── pdf-parser.ts                   # PDF text extraction
│   └── utils.ts                        # Utility functions
│
├── 📁 types/                           # TypeScript Types
│   └── next-auth.d.ts                  # NextAuth type extensions
│
├── 📁 components/                      # React Components
│   ├── ui/                             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── toast.tsx
│   │   ├── use-toast.ts
│   │   └── toaster.tsx
│   │
│   └── dashboard/                      # Dashboard components
│       └── nav.tsx                     # Navigation bar
│
├── 📁 actions/                         # Server Actions
│   └── invoice.ts                      # Invoice CRUD operations
│
└── 📁 app/                             # Next.js App Router
    ├── globals.css                     # Global styles
    ├── layout.tsx                      # Root layout
    │
    ├── api/                            # API Routes
    │   ├── auth/
    │   │   └── [...nextauth]/
    │   │       └── route.ts            # NextAuth handler
    │   └── files/
    │       └── [key]/
    │           └── route.ts            # File serving (local storage)
    │
    ├── (auth)/                         # Auth route group
    │   └── login/
    │       └── page.tsx                # Login page
    │
    └── (dashboard)/                    # Dashboard route group
        ├── layout.tsx                  # Dashboard layout with nav
        ├── dashboard/
        │   └── page.tsx                # Dashboard with KPIs
        ├── upload/
        │   └── page.tsx                # Upload page
        ├── history/
        │   └── page.tsx                # Invoice history table
        └── invoices/
            └── [id]/
                └── page.tsx            # Invoice detail view
```

## File Status

✅ **All Core Files Created**:
- Configuration files (package.json, tsconfig, etc.)
- Database schema and seed
- Authentication and middleware
- Storage and extraction logic
- UI components (button, card, input, toast, etc.)
- Server actions
- All pages (login, dashboard, upload, history, invoice detail)

## Key Features Implemented

### 1. Authentication & Authorization
- NextAuth with credentials provider
- Bcrypt password hashing
- JWT session strategy
- RBAC middleware (Admin/User roles)
- Multi-tenant data isolation

### 2. Database
- PostgreSQL with Prisma ORM
- User, Vendor, Invoice, LineItem, ExtractionRun, AuditLog models
- Proper relations and indexes
- Seed script with demo users

### 3. File Storage
- S3-compatible storage (AWS, DigitalOcean Spaces, etc.)
- Local /tmp fallback for development
- File hash calculation
- Presigned URL generation

### 4. AI Extraction
- Claude Sonnet 4 API integration
- Structured JSON extraction with Zod validation
- Automatic repair of invalid JSON
- Extraction confidence scoring
- Vendor normalization

### 5. UI Pages
- **Login**: Beautiful auth page with demo credentials
- **Dashboard**: KPIs, recent invoices, status counts
- **Upload**: Single file upload with progress
- **History**: Searchable invoice table
- **Invoice Detail**: Full invoice view with line items and audit log

### 6. Components
- Apple-inspired futuristic design
- Glass morphism effects
- Subtle animations
- Responsive layouts
- Loading states
- Empty states

## Data Models

### User
- id, email (unique), name, passwordHash, role, createdAt

### Vendor
- id, name, normalizedName (unique), createdAt

### Invoice
- id, ownerId, vendorId, vendorNameRaw
- invoiceNumber, invoiceDate, dueDate, paymentTerms
- mobile, email
- subtotal, taxTotal, gst, hst, qst, pst, total
- status (PROCESSING, NEEDS_REVIEW, APPROVED, FAILED)
- fileKey, fileUrl, fileHash
- extractedJson, createdAt, updatedAt, processedAt

### LineItem
- id, invoiceId, description, quantity, rate, amount, sortOrder

### ExtractionRun
- id, invoiceId, model, promptVersion
- startedAt, completedAt, success, error
- rawResponse, tokensIn, tokensOut

### AuditLog
- id, entityType, entityId, actorUserId
- action, diffJson, createdAt

## Environment Variables Required

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
ANTHROPIC_API_KEY="sk-ant-api03-..."

# For production
USE_LOCAL_STORAGE="false"
S3_ENDPOINT="https://s3.amazonaws.com"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_BUCKET="invoice-pdfs"

# For development
USE_LOCAL_STORAGE="true"
```

## Setup Commands

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Demo Credentials

After running the seed script:

- **Admin**: admin@example.com / Password123!
- **User**: user@example.com / Password123!

## Tech Stack Summary

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js + bcrypt
- **UI**: TailwindCSS + shadcn/ui + Lucide Icons
- **AI**: Anthropic Claude API (Sonnet 4)
- **Storage**: S3-compatible + local fallback
- **Validation**: Zod
- **PDF**: pdf-parse

## Production Ready Features

✅ Type safety throughout
✅ Server-side authentication
✅ Role-based access control
✅ Multi-tenant data isolation
✅ Audit logging
✅ Error handling
✅ Loading states
✅ Responsive design
✅ File validation
✅ Database migrations
✅ Environment configuration
✅ Railway deployment ready

## Notes

- All files are production-quality with proper error handling
- Code is well-commented and follows best practices
- UI follows Apple-inspired design principles
- All queries include proper authorization checks
- File storage abstraction allows easy switching between S3 and local
- Extraction includes automatic retry with repair for invalid JSON
- Audit logging tracks all changes with timestamps and user info

