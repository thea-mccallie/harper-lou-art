import { NextRequest, NextResponse } from "next/server"
import { updateArtwork } from "@/lib/db"

// PUT /api/artworks/reorder - Update sort order for multiple artworks
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    if (!Array.isArray(body.artworks)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    // Update each artwork with its new sort order
    const updatePromises = body.artworks.map(async (item: { id: string; sortOrder: number }) => {
      await updateArtwork(item.id, { sortOrder: item.sortOrder })
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ message: "Artwork order updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating artwork order:", error)
    return NextResponse.json({ error: "Failed to update artwork order" }, { status: 500 })
  }
}
