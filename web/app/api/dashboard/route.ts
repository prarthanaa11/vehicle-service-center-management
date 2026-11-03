
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM customers) AS totalCustomers,
        (SELECT COUNT(*) FROM vehicles) AS totalVehicles,
        (SELECT COUNT(*) FROM bookings) AS totalBookings,
        (
          SELECT COUNT(*)
          FROM invoices
          WHERE status <> 'Paid'
        ) AS pendingInvoices
    `);

    return NextResponse.json((rows as any[])[0]);

  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { error: "Unable to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
