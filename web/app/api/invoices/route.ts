
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const validStatuses = ["Unpaid", "Partial Paid", "Paid"];

// GET: Fetch all invoices
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        i.invoice_id,
        i.booking_id,
        i.invoice_date,
        i.total_amount,
        i.status,
        b.complaint,
        b.status AS booking_status,
        v.registration_number,
        v.brand,
        v.model,
        c.full_name AS customer_name
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.booking_id
      JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      JOIN customers c ON v.customer_id = c.customer_id
      ORDER BY i.invoice_id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Invoices GET error:", error);

    return NextResponse.json(
      { error: "Unable to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST: Create a new invoice
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { booking_id, invoice_date, total_amount, status } = body;

    if (
      !Number.isInteger(Number(booking_id)) ||
      Number(booking_id) <= 0 ||
      !invoice_date ||
      total_amount === undefined ||
      total_amount === null ||
      !Number.isFinite(Number(total_amount)) ||
      Number(total_amount) < 0
    ) {
      return NextResponse.json(
        { error: "Enter valid booking ID, invoice date and amount" },
        { status: 400 }
      );
    }

    const dateMatch = String(invoice_date).match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (!dateMatch) {
      return NextResponse.json(
        { error: "Invoice date must be in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    const invoiceStatus = status || "Unpaid";

    if (!validStatuses.includes(invoiceStatus)) {
      return NextResponse.json(
        { error: "Invalid invoice status" },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      `INSERT INTO invoices
       (booking_id, invoice_date, total_amount, status)
       VALUES (?, ?, ?, ?)`,
      [
        Number(booking_id),
        invoice_date,
        Number(total_amount),
        invoiceStatus
      ]
    );

    return NextResponse.json(
      {
        message: "Invoice created successfully",
        invoice_id: result.insertId
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Invoices POST error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "An invoice already exists for this booking" },
        { status: 409 }
      );
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return NextResponse.json(
        { error: "Booking does not exist" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create invoice" },
      { status: 500 }
    );
  }
}

// PATCH: Update invoice
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { invoice_id, total_amount, status } = body;

    if (!invoice_id || (!status && total_amount === undefined)) {
      return NextResponse.json(
        { error: "Invoice ID and at least one field to update are required" },
        { status: 400 }
      );
    }

    if (status !== undefined && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid invoice status" },
        { status: 400 }
      );
    }

    if (
      total_amount !== undefined &&
      (!Number.isFinite(Number(total_amount)) ||
        Number(total_amount) < 0)
    ) {
      return NextResponse.json(
        { error: "Invoice amount must be non-negative" },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (total_amount !== undefined) {
      updates.push("total_amount = ?");
      values.push(Number(total_amount));
    }

    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }

    values.push(invoice_id);

    const [result]: any = await db.execute(
      `UPDATE invoices SET ${updates.join(", ")} WHERE invoice_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      const [existing]: any = await db.execute(
        "SELECT invoice_id FROM invoices WHERE invoice_id = ?",
        [invoice_id]
      );

      if (existing.length === 0) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      message: "Invoice updated successfully"
    });
  } catch (error) {
    console.error("Invoices PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to update invoice" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an invoice
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoice_id = searchParams.get("invoice_id");

    if (!invoice_id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      "DELETE FROM invoices WHERE invoice_id = ?",
      [invoice_id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Invoice deleted successfully"
    });
  } catch (error: any) {
    console.error("Invoices DELETE error:", error);

    return NextResponse.json(
      {
        error: "Unable to delete invoice. It may have associated payments."
      },
      { status: 500 }
    );
  }
}
