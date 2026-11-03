
import { NextResponse } from "next/server";

const CHROMA_API = "http://localhost:8001";

// POST: Search for similar historical repairs
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { complaint, results = 3 } = body;

    if (!complaint?.trim()) {
      return NextResponse.json(
        { error: "Please enter a repair complaint" },
        { status: 400 }
      );
    }

    const response = await fetch(`${CHROMA_API}/repair-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        complaint: complaint.trim(),
        results: Number(results)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, {
        status: response.status
      });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("Repair Search API error:", error);

    return NextResponse.json(
      { error: "Unable to search repair history" },
      { status: 500 }
    );
  }
}
