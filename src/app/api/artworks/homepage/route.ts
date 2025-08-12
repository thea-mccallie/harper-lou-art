import { NextRequest, NextResponse } from "next/server"
import { getArtworks } from "@/lib/db"

// GET /api/artworks/homepage - Retrieve artworks for homepage display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    // Get all artworks from database
    const allArtworks = await getArtworks()
    
    let filteredArtworks = allArtworks
    
    if (category) {
      // Route 1: Category filtering - show ALL artworks matching category (ignore showOnHomepage)
      filteredArtworks = allArtworks.filter(artwork => 
        artwork.category.toLowerCase() === category.toLowerCase()
      )
    } else {
      // Route 2: Main homepage - only show artworks explicitly marked for homepage
      filteredArtworks = allArtworks.filter(artwork => 
        artwork.showOnHomepage === true
      )
    }
    
    return NextResponse.json(filteredArtworks, { status: 200 })
  } catch (error) {
    console.error("Error fetching homepage artworks:", error)
    return NextResponse.json({ error: "Failed to fetch homepage artworks" }, { status: 500 })
  }
}
