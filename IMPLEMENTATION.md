# Complete Implementation Guide

This document provides the complete code for all remaining files needed to complete the Invoice Extraction MVP.

## File Tree

```
invoice-extraction-mvp/
├── package.json ✓
├── tsconfig.json ✓
├── tailwind.config.ts ✓
├── postcss.config.mjs ✓
├── next.config.ts ✓
├── .env.example ✓
├── .gitignore ✓
├── README.md ✓
├── middleware.ts ✓
│
├── prisma/
│   ├── schema.prisma ✓
│   └── seed.ts ✓
│
├── lib/
│   ├── prisma.ts ✓
│   ├── auth.ts ✓
│   ├── storage.ts ✓
│   ├── extraction.ts ✓
│   ├── pdf-parser.ts ✓
│   └── utils.ts ✓
│
├── types/
│   └── next-auth.d.ts ✓
│
├── components/
│   ├── ui/
│   │   ├── button.tsx ✓
│   │   ├── card.tsx ✓
│   │   ├── input.tsx ✓
│   │   ├── label.tsx ✓
│   │   ├── toast.tsx ✓
│   │   ├── use-toast.ts ✓
│   │   └── toaster.tsx ✓
│   │
│   └── dashboard/
│       └── nav.tsx ✓
│
├── actions/
│   └── invoice.ts ✓
│
├── app/
│   ├── globals.css ✓
│   ├── layout.tsx ✓
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts ✓
│   │   └── files/
│   │       └── [key]/
│   │           └── route.ts (NEEDS IMPLEMENTATION)
│   │
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx ✓
│   │
│   └── (dashboard)/
│       ├── layout.tsx ✓
│       ├── dashboard/
│       │   └── page.tsx ✓
│       ├── upload/
│       │   └── page.tsx ✓
│       ├── history/
│       │   └── page.tsx (NEEDS IMPLEMENTATION)
│       └── invoices/
│           └── [id]/
│               └── page.tsx (NEEDS IMPLEMENTATION)
```

## Files Needing Implementation

### 1. File Serving API Route (for local storage)

**File**: `app/api/files/[key]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const LOCAL_STORAGE_PATH = '/tmp/invoice-pdfs';

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;
    const filePath = join(LOCAL_STORAGE_PATH, key);
    
    const fileBuffer = await readFile(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${key}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}
```

### 2. History Page

**File**: `app/(dashboard)/history/page.tsx`

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";
  const whereClause = isAdmin ? {} : { ownerId: session.user.id };

  const invoices = await prisma.invoice.findMany({
    where: whereClause,
    include: {
      vendor: true,
      owner: isAdmin ? { select: { name: true, email: true } } : false,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoice History</h1>
        <p className="text-muted-foreground">View and manage all invoices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No invoices found</p>
              <Button asChild className="mt-4">
                <Link href="/upload">Upload Invoice</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Invoice #</th>
                    <th className="pb-3 font-medium">Vendor</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Due Date</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    {isAdmin && <th className="pb-3 font-medium">Owner</th>}
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/50">
                      <td className="py-4">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-medium hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-4">{invoice.vendorNameRaw}</td>
                      <td className="py-4">{formatDate(invoice.invoiceDate)}</td>
                      <td className="py-4">{formatDate(invoice.dueDate)}</td>
                      <td className="py-4 font-medium">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "NEEDS_REVIEW"
                              ? "bg-amber-100 text-amber-800"
                              : invoice.status === "PROCESSING"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-4 text-sm">
                          {invoice.owner?.name || invoice.owner?.email}
                        </td>
                      )}
                      <td className="py-4">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/invoices/${invoice.id}`}>
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. Invoice Detail Page

**File**: `app/(dashboard)/invoices/[id]/page.tsx`

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Download, Edit } from "lucide-react";
import Link from "next/link";

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      vendor: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
      auditLogs: {
        include: { actor: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
      owner: { select: { name: true, email: true } },
    },
  });

  if (!invoice) {
    notFound();
  }

  // Check authorization
  if (!isAdmin && invoice.ownerId !== session.user.id) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Invoice {invoice.invoiceNumber}
          </h1>
          <p className="text-muted-foreground">{invoice.vendorNameRaw}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={invoice.fileUrl} target="_blank">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Link>
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Invoice Number</p>
              <p className="font-medium">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vendor</p>
              <p className="font-medium">{invoice.vendorNameRaw}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Date</p>
                <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>
            {invoice.paymentTerms && (
              <div>
                <p className="text-sm text-muted-foreground">Payment Terms</p>
                <p className="font-medium">{invoice.paymentTerms}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {invoice.mobile && (
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-medium">{invoice.mobile}</p>
                </div>
              )}
              {invoice.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{invoice.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.gst > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST</span>
                <span>{formatCurrency(invoice.gst)}</span>
              </div>
            )}
            {invoice.hst > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">HST</span>
                <span>{formatCurrency(invoice.hst)}</span>
              </div>
            )}
            {invoice.qst > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">QST</span>
                <span>{formatCurrency(invoice.qst)}</span>
              </div>
            )}
            {invoice.pst > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PST</span>
                <span>{formatCurrency(invoice.pst)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax Total</span>
              <span>{formatCurrency(invoice.taxTotal)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="font-semibold">Total</span>
              <span className="font-semibold text-lg">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium text-right">Quantity</th>
                  <th className="pb-3 font-medium text-right">Rate</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(item.rate)}</td>
                    <td className="py-3 text-right font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoice.auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-muted-foreground">
                    by {log.actor.name || log.actor.email} •{" "}
                    {formatDateTime(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Additional UI Components Needed

Create these additional shadcn/ui components as needed:
- `select.tsx`
- `dialog.tsx`
- `dropdown-menu.tsx`
- `separator.tsx`
- `table.tsx`
- `badge.tsx`

You can generate these using the shadcn CLI:
```bash
npx shadcn-ui@latest add select dialog dropdown-menu separator table badge
```

## Setup Instructions

1. Install all dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`

3. Initialize database:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Test with demo credentials from README

## Notes

- All files marked with ✓ are already created
- Files marked as "NEEDS IMPLEMENTATION" have their complete code provided above
- The application uses Server Components by default with Client Components where needed
- All database queries include proper authorization checks
- File storage works with both S3 and local fallback

