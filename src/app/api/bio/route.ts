import { NextRequest, NextResponse } from "next/server"
import { getBio, updateBio } from "@/lib/db"

export async function GET(request: NextRequest) {
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

export async function PUT(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""
    if (contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "File uploads are not supported in app directory API routes. Use pages/api/bio.ts instead." },
        { status: 400 }
      )
    }

    // For JSON requests (no file upload)
    const bioUpdates = await request.json()
    await updateBio(bioUpdates)
    return NextResponse.json({ message: "Bio updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating bio:", error)
    return NextResponse.json({ error: "Failed to update bio" }, { status: 500 })
  }
}