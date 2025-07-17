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
    const bioUpdates = await request.json()

    if (typeof bioUpdates !== "object" || !bioUpdates.text) {
      return NextResponse.json({ error: "Invalid bio data" }, { status: 400 })
    }

    await updateBio(bioUpdates)
    return NextResponse.json({ message: "Bio updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating bio:", error)
    return NextResponse.json({ error: "Failed to update bio" }, { status: 500 })
  }
}