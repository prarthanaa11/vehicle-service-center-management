
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Fetch all services
export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM services ORDER BY service_id DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Services GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST: Add a new service
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { service_name, description, base_price } = body;

    if (
      !service_name?.trim() ||
      base_price === undefined ||
      !Number.isFinite(Number(base_price)) ||
      Number(base_price) < 0
    ) {
      return NextResponse.json(
        { error: "Valid service name and price are required" },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      `INSERT INTO services
       (service_name, description, base_price)
       VALUES (?, ?, ?)`,
      [service_name.trim(), description || null, Number(base_price)]
    );

    return NextResponse.json(
      {
        message: "Service added successfully",
        service_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Services POST error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "This service name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add service" },
      { status: 500 }
    );
  }
}

// PATCH: Update a service
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { service_id, service_name, description, base_price } = body;

    if (
      !Number.isInteger(Number(service_id)) ||
      Number(service_id) <= 0 ||
      !service_name?.trim() ||
      !Number.isFinite(Number(base_price)) ||
      Number(base_price) < 0
    ) {
      return NextResponse.json(
        { error: "Valid service ID, name and price are required" },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      `UPDATE services
       SET service_name = ?, description = ?, base_price = ?
       WHERE service_id = ?`,
      [
        service_name.trim(),
        description || null,
        Number(base_price),
        Number(service_id),
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Service updated successfully" });
  } catch (error: any) {
    console.error("Services PATCH error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "This service name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a service
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const service_id = Number(searchParams.get("id"));

    if (!Number.isInteger(service_id) || service_id <= 0) {
      return NextResponse.json(
        { error: "Valid service ID is required" },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      "DELETE FROM services WHERE service_id = ?",
      [service_id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error: any) {
    console.error("Services DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete service. It may be used in an existing booking." },
      { status: 500 }
    );
  }
}
