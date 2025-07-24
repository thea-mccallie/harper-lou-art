import { NextRequest, NextResponse } from "next/server"
import { getBio, updateBio } from "@/lib/db"

// GET /api/bio - Retrieve artist bio information
export async function GET() {
  try {
    const bio = await getBio()
    if (!bio) {
      return NextResponse.json({ error: "Bio not found" }, { status: 404 })
    }
    return NextResponse.json(bio, { status: 200 })
  } catch (error) {
    console.error("Error fetching bio:", error)
    return NextResponse.json({ error: "Failed to fetch bio" }, { status: 500 })
  }
}

// PUT /api/bio - Update artist bio information
export async function PUT(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""
    
    // Check for unsupported multipart/form-data uploads
    if (contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "File uploads are not supported in app directory API routes. Use pages/api/bio.ts instead." },
        { status: 400 }
      )
    }

    // Handle JSON requests (no file upload)
    const bioUpdates = await request.json()
    await updateBio(bioUpdates)
    
    // Fetch and return the updated bio data
    const updatedBio = await getBio()
    return NextResponse.json(updatedBio, { status: 200 })
  } catch (error) {
    console.error("Error updating bio:", error)
    return NextResponse.json({ error: "Failed to update bio" }, { status: 500 })
  }
}