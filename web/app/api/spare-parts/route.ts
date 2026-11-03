
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Fetch all spare parts
export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM spare_parts ORDER BY part_id DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Spare parts GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch spare parts" },
      { status: 500 }
    );
  }
}

// POST: Add a spare part
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { part_name, part_number, stock_quantity, unit_price } = body;

    if (
      !part_name?.trim() ||
      !part_number?.trim() ||
      !Number.isInteger(Number(stock_quantity)) ||
      Number(stock_quantity) < 0 ||
      !Number.isFinite(Number(unit_price)) ||
      Number(unit_price) < 0
    ) {
      return NextResponse.json(
        { error: "Enter valid spare part details" },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      `INSERT INTO spare_parts
       (part_name, part_number, stock_quantity, unit_price)
       VALUES (?, ?, ?, ?)`,
      [
        part_name.trim(),
        part_number.trim(),
        Number(stock_quantity),
        Number(unit_price),
      ]
    );

    return NextResponse.json(
      {
        message: "Spare part added successfully",
        part_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Spare parts POST error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "This part number already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add spare part" },
      { status: 500 }
    );
  }
}

// PATCH: Update a spare part
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { part_id, part_name, part_number, stock_quantity, unit_price } = body;

    if (
      !Number.isInteger(Number(part_id)) ||
      Number(part_id) <= 0 ||
      !part_name?.trim() ||
      !part_number?.trim() ||
      !Number.isInteger(Number(stock_quantity)) ||
      Number(stock_quantity) < 0 ||
      !Number.isFinite(Number(unit_price)) ||
      Number(unit_price) < 0
    ) {
      return NextResponse.json(
        { error: "Enter valid spare part details" },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      `UPDATE spare_parts
       SET part_name = ?, part_number = ?,
           stock_quantity = ?, unit_price = ?
       WHERE part_id = ?`,
      [
        part_name.trim(),
        part_number.trim(),
        Number(stock_quantity),
        Number(unit_price),
        Number(part_id),
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Spare part not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Spare part updated successfully",
    });
  } catch (error: any) {
    console.error("Spare parts PATCH error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "This part number already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update spare part" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a spare part
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const part_id = Number(searchParams.get("id"));

    if (!Number.isInteger(part_id) || part_id <= 0) {
      return NextResponse.json(
        { error: "Valid spare part ID is required" },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      "DELETE FROM spare_parts WHERE part_id = ?",
      [part_id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Spare part not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Spare part deleted successfully",
    });
  } catch (error: any) {
    console.error("Spare parts DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete spare part. It may be used in an existing booking." },
      { status: 500 }
    );
  }
}
