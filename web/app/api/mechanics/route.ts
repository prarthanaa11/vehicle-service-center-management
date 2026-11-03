import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Fetch all mechanics
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        mechanic_id,
        full_name,
        phone,
        specialization,
        availability
      FROM mechanics
      ORDER BY mechanic_id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch mechanics error:", error);

    return NextResponse.json(
      { error: "Unable to fetch mechanics" },
      { status: 500 }
    );
  }
}

// POST: Add a new mechanic
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      full_name,
      phone,
      specialization,
      availability,
    } = body;

    if (!full_name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Mechanic name and phone are required" },
        { status: 400 }
      );
    }

    const allowedAvailability = [
      "Available",
      "Busy",
      "On Leave",
    ];

    const selectedAvailability = availability || "Available";

    if (!allowedAvailability.includes(selectedAvailability)) {
      return NextResponse.json(
        { error: "Invalid availability value" },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      `INSERT INTO mechanics
       (full_name, phone, specialization, availability)
       VALUES (?, ?, ?, ?)`,
      [
        full_name.trim(),
        phone.trim(),
        specialization?.trim() || null,
        selectedAvailability,
      ]
    );

    return NextResponse.json(
      {
        message: "Mechanic added successfully",
        mechanic_id: (result as any).insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add mechanic error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Unable to add mechanic",
      },
      { status: 500 }
    );
  }
}

// PATCH: Update mechanic availability
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { mechanic_id, availability } = body;

    const allowedAvailability = [
      "Available",
      "Busy",
      "On Leave",
    ];

    if (!mechanic_id || !allowedAvailability.includes(availability)) {
      return NextResponse.json(
        { error: "Invalid mechanic ID or availability" },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      `UPDATE mechanics
       SET availability = ?
       WHERE mechanic_id = ?`,
      [availability, Number(mechanic_id)]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: "Mechanic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Mechanic availability updated successfully",
    });
  } catch (error) {
    console.error("Update mechanic error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Unable to update mechanic",
      },
      { status: 500 }
    );
  }
}