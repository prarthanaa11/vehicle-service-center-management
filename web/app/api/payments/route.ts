
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const validMethods = ["Cash", "Card", "UPI", "Bank Transfer"];

// Update invoice status based on total payments
async function updateInvoiceStatus(connection: any, invoiceId: number) {
  const [rows]: any = await connection.execute(
    `SELECT
       i.total_amount,
       COALESCE(SUM(p.amount), 0) AS paid_amount
     FROM invoices i
     LEFT JOIN payments p ON i.invoice_id = p.invoice_id
     WHERE i.invoice_id = ?
     GROUP BY i.invoice_id`,
    [invoiceId]
  );

  if (rows.length === 0) return;

  const total = Number(rows[0].total_amount);
  const paid = Number(rows[0].paid_amount);

  let status = "Unpaid";

  if (paid >= total) {
    status = "Paid";
  } else if (paid > 0) {
    status = "Partial Paid";
  }

  await connection.execute(
    "UPDATE invoices SET status = ? WHERE invoice_id = ?",
    [status, invoiceId]
  );
}

// GET: Fetch all payments
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        p.payment_id,
        p.invoice_id,
        p.payment_date,
        p.amount,
        p.payment_method,
        i.total_amount AS invoice_total,
        i.status AS invoice_status,
        c.full_name AS customer_name
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.invoice_id
      JOIN bookings b ON i.booking_id = b.booking_id
      JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      JOIN customers c ON v.customer_id = c.customer_id
      ORDER BY p.payment_id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Payments GET error:", error);

    return NextResponse.json(
      { error: "Unable to fetch payments" },
      { status: 500 }
    );
  }
}

// POST: Record a payment
export async function POST(request: Request) {
  const connection = await db.getConnection();

  try {
    const body = await request.json();

    const { invoice_id, amount, payment_method } = body;

    if (
      !Number.isInteger(Number(invoice_id)) ||
      Number(invoice_id) <= 0 ||
      amount === undefined ||
      amount === null ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !validMethods.includes(payment_method)
    ) {
      return NextResponse.json(
        { error: "Enter a valid invoice ID, positive amount and payment method" },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    const [invoiceRows]: any = await connection.execute(
      "SELECT total_amount FROM invoices WHERE invoice_id = ? FOR UPDATE",
      [Number(invoice_id)]
    );

    if (invoiceRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const [paymentRows]: any = await connection.execute(
      "SELECT COALESCE(SUM(amount), 0) AS paid_amount FROM payments WHERE invoice_id = ?",
      [Number(invoice_id)]
    );

    const invoiceTotal = Number(invoiceRows[0].total_amount);
    const alreadyPaid = Number(paymentRows[0].paid_amount);
    const newAmount = Number(amount);

    if (alreadyPaid + newAmount > invoiceTotal) {
      await connection.rollback();

      return NextResponse.json(
        {
          error: `Payment exceeds the remaining balance of ${(
            invoiceTotal - alreadyPaid
          ).toFixed(2)}`
        },
        { status: 400 }
      );
    }

    const [result]: any = await connection.execute(
      `INSERT INTO payments (invoice_id, amount, payment_method)
       VALUES (?, ?, ?)`,
      [Number(invoice_id), newAmount, payment_method]
    );

    await updateInvoiceStatus(connection, Number(invoice_id));

    await connection.commit();

    return NextResponse.json(
      {
        message: "Payment recorded successfully",
        payment_id: result.insertId
      },
      { status: 201 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("Payments POST error:", error);

    return NextResponse.json(
      { error: "Unable to record payment" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// PATCH: Update payment details
export async function PATCH(request: Request) {
  const connection = await db.getConnection();

  try {
    const body = await request.json();

    const { payment_id, amount, payment_method } = body;

    if (
      !payment_id ||
      (amount === undefined && payment_method === undefined)
    ) {
      return NextResponse.json(
        { error: "Payment ID and at least one field to update are required" },
        { status: 400 }
      );
    }

    if (
      amount !== undefined &&
      (!Number.isFinite(Number(amount)) || Number(amount) <= 0)
    ) {
      return NextResponse.json(
        { error: "Payment amount must be greater than zero" },
        { status: 400 }
      );
    }

    if (
      payment_method !== undefined &&
      !validMethods.includes(payment_method)
    ) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    const [rows]: any = await connection.execute(
      "SELECT invoice_id FROM payments WHERE payment_id = ?",
      [payment_id]
    );

    if (rows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const invoiceId = rows[0].invoice_id;

    const [invoiceRows]: any = await connection.execute(
      "SELECT total_amount FROM invoices WHERE invoice_id = ? FOR UPDATE",
      [invoiceId]
    );

    if (amount !== undefined) {
      const [sumRows]: any = await connection.execute(
        `SELECT COALESCE(SUM(amount), 0) AS paid_amount
         FROM payments
         WHERE invoice_id = ? AND payment_id <> ?`,
        [invoiceId, payment_id]
      );

      if (
        Number(sumRows[0].paid_amount) + Number(amount) >
        Number(invoiceRows[0].total_amount)
      ) {
        await connection.rollback();

        return NextResponse.json(
          { error: "Updated payment exceeds the invoice balance" },
          { status: 400 }
        );
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (amount !== undefined) {
      updates.push("amount = ?");
      values.push(Number(amount));
    }

    if (payment_method !== undefined) {
      updates.push("payment_method = ?");
      values.push(payment_method);
    }

    values.push(payment_id);

    await connection.execute(
      `UPDATE payments SET ${updates.join(", ")} WHERE payment_id = ?`,
      values
    );

    await updateInvoiceStatus(connection, invoiceId);

    await connection.commit();

    return NextResponse.json({
      message: "Payment updated successfully"
    });
  } catch (error) {
    await connection.rollback();
    console.error("Payments PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to update payment" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// DELETE: Delete a payment
export async function DELETE(request: Request) {
  const connection = await db.getConnection();

  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("payment_id");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    const [rows]: any = await connection.execute(
      "SELECT invoice_id FROM payments WHERE payment_id = ?",
      [paymentId]
    );

    if (rows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const invoiceId = rows[0].invoice_id;

    await connection.execute(
      "DELETE FROM payments WHERE payment_id = ?",
      [paymentId]
    );

    await updateInvoiceStatus(connection, invoiceId);

    await connection.commit();

    return NextResponse.json({
      message: "Payment deleted successfully"
    });
  } catch (error) {
    await connection.rollback();
    console.error("Payments DELETE error:", error);

    return NextResponse.json(
      { error: "Unable to delete payment" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
