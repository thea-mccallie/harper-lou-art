"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import ArtworkCard from "../components/ArtworkCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FaInstagram } from "react-icons/fa"

// Interface for artwork data structure
interface Artwork {
  dateCreated: string   // ISO date string when artwork was created
  id: string           // Unique identifier for the artwork
  title: string        // Artwork title
  imageUrls: string[]  // Array of S3 image URLs (first is main image)
  description: string  // Artwork description/details
  category: string     // Category classification (ceramics, painting, prints)
  showOnHomepage?: boolean  // Whether to show on homepage
}

/**
 * HomePage Component
 * 
 * Main landing page showcasing artist's portfolio with the following features:
 * - Responsive grid layout displaying artwork cards
 * - Category-based filtering system
 * - Integration with Instagram and About page
 * - Loading and error states for better UX
 * - Click-to-filter and clear filter functionality
 * 
 * Data Flow:
 * 1. Fetches all artworks from API on component mount
 * 2. Maintains both original and filtered artwork arrays
 * 3. Updates filtered array when category selection changes
 * 4. Renders artwork cards with hover effects and navigation
 * 
 * Features:
 * - Category filtering (Ceramics, Paintings, Prints)
 * - Responsive design with mobile-first approach
 * - Instagram integration via React Icons
 * - Loading states and error handling
 * - "Coming soon" state for empty categories
 */

const HomePage = () => {
  // State management for artwork display and filtering
  const [artworks, setArtworks] = useState<Artwork[]>([])                    // All artworks from API
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([])    // Filtered artworks for display
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)  // Currently selected filter category
  const [loading, setLoading] = useState(true)                              // Loading state for API calls
  const [error, setError] = useState("")                                     // Error message display

  // Available artwork categories for filtering
  const categories = [
    { value: "ceramics", label: "Ceramics" },
    { value: "painting", label: "Paintings" },
    { value: "prints", label: "Prints" },
    { value: "multimedia", label: "Multimedia" },
    { value: "miscellaneous", label: "Miscellaneous" }
  ]

  // Fetch all artworks from API on component mount
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch("/api/artworks/homepage")
        if (!response.ok) {
          throw new Error("Failed to fetch artworks")
        }
        const data = await response.json()
        setArtworks(data)
        setFilteredArtworks(data) // Initialize filtered artworks with all data
      } catch (error) {
        console.error("Error fetching artworks:", error)
        setError("Failed to fetch artworks")
      } finally {
        setLoading(false)
      }
    }

    fetchArtworks()
  }, [])

  // Filter artworks by selected category
  // Runs whenever selectedCategory changes
  useEffect(() => {
    const fetchFilteredArtworks = async () => {
      try {
        let url = "/api/artworks/homepage"
        if (selectedCategory) {
          url += `?category=${selectedCategory}`
        }
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Failed to fetch filtered artworks")
        }
        const data = await response.json()
        setFilteredArtworks(data)
      } catch (error) {
        console.error("Error fetching filtered artworks:", error)
        setError("Failed to fetch filtered artworks")
      }
    }

    fetchFilteredArtworks()
  }, [selectedCategory])

  /**
   * Handle category filter button clicks
   * Toggles category selection - clicking same category clears filter
   */
  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category)
  }

  /**
   * Handle title click to clear all filters
   * Returns to showing all artworks
   */
  const handleTitleClick = () => {
    setSelectedCategory(null)
  }

  // Loading State - Show spinner while fetching artworks
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Loading artworks...</p>
        </div>
      </div>
    )
  }

  // Error State - Show error message with retry option
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-lg font-medium">Error</div>
              <p className="text-gray-600">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Page Header Section */}
        <div className="mb-8">
          {/* Top Navigation Row */}
          <div className="flex justify-between items-center mb-6">
            {/* Main Title - clickable to clear filters */}
            <h1 
              className="text-5xl font-light text-gray-900 cursor-pointer hover:text-gray-700 transition-colors duration-300"
              onClick={handleTitleClick}
            >
              harper lou
            </h1>
            
            {/* Right Side Navigation Links */}
            <div className="flex items-center gap-4">
              {/* About Page Link */}
              <Link 
                href="/about"
                className="text-base font-light text-gray-700 hover:text-gray-900 transition-colors underline underline-offset-4 decoration-gray-300 hover:decoration-gray-600"
              >
                About Me
              </Link>
              
              {/* Instagram Link Button */}
              <Button
                variant="ghost" 
                size="sm"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => window.open('https://www.instagram.com/harperlouharperlou/', '_blank')}
              >
                <FaInstagram className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Category Filter Menu */}
          <div className="flex gap-8 mb-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryFilter(category.value)}
                className={`font-light text-lg transition-colors duration-300 ${
                  selectedCategory === category.value 
                    ? 'text-gray-900 border-b border-gray-900'  // Active state styling
                    : 'text-gray-500 hover:text-gray-900'       // Default and hover state
                } bg-transparent border-none cursor-pointer`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          {/* Active Filter Indicator */}
          {selectedCategory && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-sm">
                Showing: {categories.find(c => c.value === selectedCategory)?.label}
                {/* Clear filter button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0 text-gray-500 hover:text-gray-700"
                  onClick={handleTitleClick}
                >
                  ×
                </Button>
              </Badge>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {filteredArtworks.length > 0 ? (
          /* Artwork Grid - Responsive layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
            {filteredArtworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                id={artwork.id}
                title={artwork.title}
                imageUrls={artwork.imageUrls}
              />
            ))}
          </div>
        ) : (
          /* Empty State - No artworks found */
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-gray-500 text-lg font-medium">
                  Coming soon...
                </div>
                {/* Show "View All" button when filtering returns no results */}
                {selectedCategory && (
                  <Button variant="outline" onClick={handleTitleClick}>
                    View All Artworks
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default HomePage