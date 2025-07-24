import { NextRequest, NextResponse } from "next/server"
import { getArtworks, createArtwork } from "@/lib/db"

// GET /api/artworks - Retrieve all artworks
export async function GET() {
  try {
    const artworks = await getArtworks()
    return NextResponse.json(artworks, { status: 200 })
  } catch (error) {
    console.error("Error fetching artworks:", error)
    return NextResponse.json({ error: "Failed to fetch artworks" }, { status: 500 })
  }
}

// POST /api/artworks - Create a new artwork
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.id || !body.title || !body.imageUrls || !Array.isArray(body.imageUrls)) {
      return NextResponse.json({ error: "Invalid artwork data" }, { status: 400 })
    }

    await createArtwork(body)
    return NextResponse.json({ message: "Artwork created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error creating artwork:", error)
    return NextResponse.json({ error: "Failed to create artwork" }, { status: 500 })
  }
}