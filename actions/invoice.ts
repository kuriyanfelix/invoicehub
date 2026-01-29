"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { extractTextFromPDF, isValidPDF } from "@/lib/pdf-parser";
import { extractInvoiceData, normalizeVendorName } from "@/lib/extraction";
import { revalidatePath } from "next/cache";

export async function processInvoice(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  try {
    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Validate PDF
    if (!isValidPDF(buffer)) {
      throw new Error("Invalid PDF file");
    }

    // Upload to storage
    const { key, url, hash } = await uploadFile(buffer, file.name);

    // Create invoice record
    const invoice = await prisma.invoice.create({
      data: {
        ownerId: session.user.id,
        vendorNameRaw: "Processing...",
        invoiceNumber: "TBD",
        invoiceDate: new Date(),
        dueDate: new Date(),
        subtotal: 0,
        taxTotal: 0,
        total: 0,
        status: "PROCESSING",
        fileKey: key,
        fileUrl: url,
        fileHash: hash,
      },
    });

    // Extract text from PDF
    const pdfText = await extractTextFromPDF(buffer);

    // Extract data using Claude
    const extractionRun = await prisma.extractionRun.create({
      data: {
        invoiceId: invoice.id,
        model: "claude-sonnet-4-20250514",
        startedAt: new Date(),
      },
    });

    try {
      const { data, rawResponse, usage } = await extractInvoiceData(pdfText);

      // Find or create vendor
      const normalizedName = normalizeVendorName(data.vendor_name);
      let vendor = await prisma.vendor.findUnique({
        where: { normalizedName },
      });

      if (!vendor) {
        vendor = await prisma.vendor.create({
          data: {
            name: data.vendor_name,
            normalizedName,
          },
        });
      }

      // Update invoice with extracted data
      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          vendorId: vendor.id,
          vendorNameRaw: data.vendor_name,
          invoiceNumber: data.invoice_number,
          invoiceDate: new Date(data.invoice_date),
          dueDate: new Date(data.due_date),
          paymentTerms: data.payment_terms,
          mobile: data.mobile,
          email: data.email,
          subtotal: data.subtotal,
          taxTotal: data.taxes.total,
          gst: data.taxes.gst,
          hst: data.taxes.hst,
          qst: data.taxes.qst,
          pst: data.taxes.pst,
          total: data.total_amount,
          status: "NEEDS_REVIEW",
          extractedJson: data as any,
          processedAt: new Date(),
        },
      });

      // Create line items
      await prisma.lineItem.createMany({
        data: data.line_items.map((item, index) => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          sortOrder: index,
        })),
      });

      // Update extraction run
      await prisma.extractionRun.update({
        where: { id: extractionRun.id },
        data: {
          completedAt: new Date(),
          success: true,
          rawResponse,
          tokensIn: usage.input_tokens,
          tokensOut: usage.output_tokens,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          entityType: "INVOICE",
          entityId: invoice.id,
          actorUserId: session.user.id,
          action: "EXTRACTED",
          diffJson: { data } as any,
        },
      });

      revalidatePath("/dashboard");
      revalidatePath("/history");

      return { success: true, invoiceId: updatedInvoice.id };
    } catch (error: any) {
      // Mark as failed
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "FAILED",
        },
      });

      await prisma.extractionRun.update({
        where: { id: extractionRun.id },
        data: {
          completedAt: new Date(),
          success: false,
          error: error.message,
        },
      });

      throw error;
    }
  } catch (error: any) {
    console.error("Invoice processing error:", error);
    throw new Error(error.message || "Failed to process invoice");
  }
}

export async function updateInvoice(invoiceId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) throw new Error("Invoice not found");

  // Check authorization
  if (session.user.role !== "ADMIN" && invoice.ownerId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      vendorNameRaw: data.vendorNameRaw,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: new Date(data.invoiceDate),
      dueDate: new Date(data.dueDate),
      paymentTerms: data.paymentTerms,
      mobile: data.mobile,
      email: data.email,
      subtotal: data.subtotal,
      taxTotal: data.taxTotal,
      gst: data.gst,
      hst: data.hst,
      qst: data.qst,
      pst: data.pst,
      total: data.total,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: "INVOICE",
      entityId: invoiceId,
      actorUserId: session.user.id,
      action: "UPDATED",
      diffJson: { before: invoice, after: data } as any,
    },
  });

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/history");
  revalidatePath("/dashboard");

  return { success: true, invoice: updated };
}

export async function approveInvoice(invoiceId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) throw new Error("Invoice not found");

  if (session.user.role !== "ADMIN" && invoice.ownerId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "APPROVED" },
  });

  await prisma.auditLog.create({
    data: {
      entityType: "INVOICE",
      entityId: invoiceId,
      actorUserId: session.user.id,
      action: "APPROVED",
    },
  });

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/history");
  revalidatePath("/dashboard");

  return { success: true, invoice: updated };
}
