import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Fetch all vehicles
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        v.vehicle_id,
        v.customer_id,
        v.registration_number,
        v.brand,
        v.model,
        v.manufacture_year,
        v.fuel_type,
        c.full_name AS customer_name
      FROM vehicles v
      INNER JOIN customers c
        ON v.customer_id = c.customer_id
      ORDER BY v.vehicle_id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch vehicles error:", error);

    return NextResponse.json(
      { error: "Unable to fetch vehicles" },
      { status: 500 }
    );
  }
}

// POST: Register a new vehicle
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customer_id,
      registration_number,
      brand,
      model,
      manufacture_year,
      fuel_type,
    } = body;

    if (!customer_id || !registration_number || !brand || !model) {
      return NextResponse.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      `INSERT INTO vehicles
       (customer_id, registration_number, brand, model, manufacture_year, fuel_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        customer_id,
        registration_number,
        brand,
        model,
        manufacture_year || null,
        fuel_type || null,
      ]
    );

    return NextResponse.json(
      {
        message: "Vehicle registered successfully",
        vehicle_id: (result as any).insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register vehicle error:", error);

    return NextResponse.json(
      { error: "Unable to register vehicle. Check the registration number and database." },
      { status: 500 }
    );
  }
}