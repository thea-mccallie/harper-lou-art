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
      // If category filter is applied, show:
      // 1. Artworks with showOnHomepage=true AND matching category
      // 2. Artworks without showOnHomepage field but matching category (backward compatibility)
      filteredArtworks = allArtworks.filter(artwork => 
        artwork.category.toLowerCase() === category.toLowerCase() &&
        (artwork.showOnHomepage === true || artwork.showOnHomepage === undefined)
      )
    } else {
      // No category filter - only show artworks marked for homepage
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
