# Invoice Extraction AI - Production MVP

An AI-powered invoice extraction web application built with Next.js, TypeScript, and Claude AI. Features include automated PDF invoice parsing, multi-tenant data isolation, role-based access control, and a beautiful Apple-inspired UI.

## 🚀 Features

- **AI-Powered Extraction**: Uses Anthropic's Claude API to extract structured data from PDF invoices
- **Authentication & Authorization**: NextAuth with bcrypt password hashing
- **Role-Based Access Control (RBAC)**: Admin and User roles with proper data isolation
- **Multi-Tenant Architecture**: Users only see their own invoices; Admins see everything
- **Dashboard**: KPIs, filters, charts, and recent invoices
- **Bulk Upload**: Process multiple invoices simultaneously
- **Review & Edit**: Manual review and editing of extracted data before approval
- **Invoice History**: Searchable, filterable table of all invoices
- **Detailed Invoice View**: Complete invoice details with line item editing
- **Audit Logging**: Track all changes with timestamps and user info
- **PDF Storage**: S3-compatible object storage with local fallback for development

## 📋 Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: TailwindCSS + shadcn/ui + Lucide Icons
- **AI**: Anthropic Claude API (Sonnet 4)
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Storage**: S3-compatible (AWS S3, DigitalOcean Spaces, etc.)
- **Validation**: Zod

## 🛠️ Local Development Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Anthropic API key
- (Optional) S3-compatible storage credentials

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/invoice_extraction"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
   ANTHROPIC_API_KEY="sk-ant-api03-..."
   
   # For local dev, use local storage:
   USE_LOCAL_STORAGE="true"
   
   # For production with S3:
   USE_LOCAL_STORAGE="false"
   S3_ENDPOINT="https://s3.amazonaws.com"
   S3_REGION="us-east-1"
   S3_ACCESS_KEY_ID="your-key"
   S3_SECRET_ACCESS_KEY="your-secret"
   S3_BUCKET="invoice-pdfs"
   ```

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

### Default Users

After seeding, you can log in with:

- **Admin**: `admin@example.com` / `Password123!`
- **User**: `user@example.com` / `Password123!`

## 🚢 Railway Deployment

### Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository

### Deployment Steps

1. **Create a new project on Railway**:
   - Go to [railway.app/new](https://railway.app/new)
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Add PostgreSQL database**:
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

3. **Set environment variables**:
   Go to your service → Variables and add:
   ```
   NEXTAUTH_URL=https://your-app.railway.app
   NEXTAUTH_SECRET=<generate-new-secret>
   ANTHROPIC_API_KEY=sk-ant-api03-...
   USE_LOCAL_STORAGE=false
   S3_ENDPOINT=<your-s3-endpoint>
   S3_REGION=<your-region>
   S3_ACCESS_KEY_ID=<your-key>
   S3_SECRET_ACCESS_KEY=<your-secret>
   S3_BUCKET=<your-bucket-name>
   ```

4. **Configure build settings**:
   Railway should auto-detect Next.js. If not, set:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

5. **Deploy**:
   - Push to your main branch
   - Railway will automatically build and deploy
   - Run migrations: `npx prisma migrate deploy`
   - Seed database: `npm run prisma:seed`

6. **Access your app**:
   Railway will provide a URL like `https://your-app.railway.app`

## 📁 Project Structure

```
invoice-extraction-mvp/
├── app/
│   ├── (auth)/
│   │   └── login/              # Login page
│   ├── (dashboard)/
│   │   ├── dashboard/          # Main dashboard with KPIs
│   │   ├── upload/             # Single & bulk upload
│   │   ├── history/            # Invoice history table
│   │   └── invoices/[id]/      # Invoice detail view
│   ├── api/
│   │   ├── auth/               # NextAuth API routes
│   │   └── files/              # File serving (local storage)
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── dashboard/              # Dashboard-specific components
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── prisma.ts               # Prisma client
│   ├── storage.ts              # S3/local storage abstraction
│   ├── extraction.ts           # Claude AI extraction logic
│   ├── pdf-parser.ts           # PDF text extraction
│   └── utils.ts                # Utility functions
├── actions/                    # Server actions
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script
├── middleware.ts               # Auth & RBAC middleware
└── package.json
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Sessions**: Secure session management
- **RBAC Middleware**: Route-level authorization
- **Data Isolation**: Row-level security in queries
- **Audit Logging**: All changes tracked
- **Input Validation**: Zod schemas throughout

## 📊 Data Flow

1. **Upload**: User uploads PDF invoice(s)
2. **Storage**: Files saved to S3 or local /tmp
3. **Extraction**: PDF text extracted using pdf-parse
4. **AI Processing**: Claude API extracts structured data
5. **Validation**: Zod validates against schema
6. **Review**: User reviews and edits extracted data
7. **Approval**: User approves and saves to database
8. **History**: Invoice appears in searchable history

## 🎨 UI Design Philosophy

Apple-inspired futuristic modern aesthetic:
- Clean typography with generous spacing
- Subtle gradients and glassy card effects
- Soft shadows and rounded corners
- Neutral color palette with minimal borders
- Smooth animations and transitions
- Consistent skeleton loaders
- Thoughtful empty states

## 📝 Invoice Schema

Extracted fields:
- Vendor name, invoice number
- Invoice date, due date
- Payment terms
- Contact info (mobile, email)
- Line items (description, quantity, rate, amount)
- Taxes (GST, HST, QST, PST)
- Subtotal, total amount
- Confidence score
- Extraction notes

## 🧪 Testing

To test the extraction:

1. Log in as a user
2. Go to Upload page
3. Upload a PDF invoice
4. Review extracted data
5. Edit if needed
6. Approve to save

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall rules

### S3 Upload Failures
- Verify S3 credentials
- Check bucket permissions
- Test with `USE_LOCAL_STORAGE=true`

### Claude API Errors
- Verify API key is valid
- Check API quotas
- Review extraction prompt

### Authentication Issues
- Regenerate `NEXTAUTH_SECRET`
- Clear cookies and try again
- Check session configuration

## 📄 License

MIT License - feel free to use for your projects

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ using Next.js and Claude AI**
