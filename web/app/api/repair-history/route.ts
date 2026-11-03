
import { NextResponse } from "next/server";

const CHROMA_API = "http://localhost:8001";

// POST: Save repair history in ChromaDB
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      repair_id,
      description,
      vehicle_number,
      repair_type
    } = body;

    if (
      !repair_id ||
      !description?.trim() ||
      !vehicle_number?.trim() ||
      !repair_type?.trim()
    ) {
      return NextResponse.json(
        { error: "All repair details are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${CHROMA_API}/repair-history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        repair_id: String(repair_id),
        description: description.trim(),
        vehicle_number: vehicle_number.trim(),
        repair_type: repair_type.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, {
        status: response.status
      });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error("Repair History API error:", error);

    return NextResponse.json(
      { error: "Unable to connect to ChromaDB service" },
      { status: 500 }
    );
  }
}
