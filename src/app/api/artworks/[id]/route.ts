import { NextRequest, NextResponse } from "next/server"
import { getArtwork, updateArtwork, deleteArtwork } from "@/lib/db"


// GET /api/artworks/[id] - Retrieve a single artwork by ID

export async function GET(
  request: NextRequest, 
  { params }: any
) {
  try {
    const { id } = params as { id: string }
    const artwork = await getArtwork(id)
    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }
    return NextResponse.json(artwork)
  } catch (error) {
    console.error("Error fetching artwork:", error)
    return NextResponse.json({ error: "Failed to fetch artwork" }, { status: 500 })
  }
}


// PUT /api/artworks/[id] - Update an existing artwork
export async function PUT(
  request: NextRequest, 
  { params }: any
) {
  try {
    const { id } = params as { id: string }
    const updates = await request.json()

    // Validate that updates are provided
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    const updatedArtwork = await updateArtwork(id, updates)
    if (!updatedArtwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Artwork updated successfully",
      artwork: updatedArtwork,
    })
  } catch (error) {
    console.error("Error updating artwork:", error)
    return NextResponse.json({ error: "Failed to update artwork" }, { status: 500 })
  }
}


// DELETE /api/artworks/[id] - Delete an artwork by ID

export async function DELETE(
  request: NextRequest, 
  { params }: any
) {
  try {
    const { id } = params as { id: string }
    await deleteArtwork(id)
    return NextResponse.json({ message: "Artwork deleted successfully" })
  } catch (error) {
    console.error("Error deleting artwork:", error)
    return NextResponse.json({ error: "Failed to delete artwork" }, { status: 500 })
  }
}