import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Fetch all bookings
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        b.booking_id,
        b.vehicle_id,
        b.mechanic_id,
        b.booking_date,
        b.complaint,
        b.status,
        v.registration_number,
        v.brand,
        v.model,
        c.full_name AS customer_name,
        m.full_name AS mechanic_name
      FROM bookings b
      INNER JOIN vehicles v
        ON b.vehicle_id = v.vehicle_id
      INNER JOIN customers c
        ON v.customer_id = c.customer_id
      LEFT JOIN mechanics m
        ON b.mechanic_id = m.mechanic_id
      ORDER BY b.booking_id DESC
    `);

    return NextResponse.json(rows);

  } catch (error) {
    console.error("Fetch bookings error:", error);

    return NextResponse.json(
      { error: "Unable to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST: Create a new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      vehicle_id,
      mechanic_id,
      booking_date,
      complaint,
    } = body;

    if (!vehicle_id || !booking_date || !complaint?.trim()) {
      return NextResponse.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    // Validate and convert datetime-local format
    const match = String(booking_date).match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
    );

    if (!match) {
      return NextResponse.json(
        { error: `Invalid date format: ${booking_date}` },
        { status: 400 }
      );
    }

    const [, year, month, day, hours, minutes] = match;

    const mysqlDateTime =
      `${year}-${month}-${day} ${hours}:${minutes}:00`;

    console.log("Received booking date:", booking_date);
    console.log("MySQL booking date:", mysqlDateTime);

    const [result] = await db.execute(
      `INSERT INTO bookings
       (vehicle_id, mechanic_id, booking_date, complaint, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        Number(vehicle_id),
        mechanic_id ? Number(mechanic_id) : null,
        mysqlDateTime,
        complaint.trim(),
        "Booked",
      ]
    );

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking_id: (result as any).insertId,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create booking error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Unknown database error",
      },
      { status: 500 }
    );
  }
}
