
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Fetch all customers
export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM customers ORDER BY customer_id DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Customers GET error:", error);

    return NextResponse.json(
      { error: "Unable to fetch customers" },
      { status: 500 }
    );
  }
}

// POST: Add a new customer
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { full_name, phone, email, address } = body;

    if (!full_name || !phone) {
      return NextResponse.json(
        { error: "Customer name and phone are required" },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      `INSERT INTO customers
       (full_name, phone, email, address)
       VALUES (?, ?, ?, ?)`,
      [full_name, phone, email || null, address || null]
    );

    return NextResponse.json(
      {
        message: "Customer added successfully",
        customerId: (result as any).insertId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customers POST error:", error);

    return NextResponse.json(
      { error: "Unable to add customer" },
      { status: 500 }
    );
  }
}
