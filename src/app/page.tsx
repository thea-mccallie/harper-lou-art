"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import ArtworkCard from "./components/ArtworkCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Artwork {
  dateCreated: string
  id: string
  title: string
  imageUrls: string[]
  description: string
  category: string
}

const HomePage = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const categories = [
    { value: "ceramics", label: "Ceramics" },
    { value: "painting", label: "Paintings" },
    { value: "sculpture", label: "Sculptures" }
  ]

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch("/api/artworks")
        if (!response.ok) {
          throw new Error("Failed to fetch artworks")
        }
        const data = await response.json()
        setArtworks(data)
        setFilteredArtworks(data) // Initialize filtered artworks
      } catch (error) {
        console.error("Error fetching artworks:", error)
        setError("Failed to fetch artworks")
      } finally {
        setLoading(false)
      }
    }

    fetchArtworks()
  }, [])

  // Filter artworks by category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = artworks.filter(artwork => 
        artwork.category.toLowerCase() === selectedCategory.toLowerCase()
      )
      setFilteredArtworks(filtered)
    } else {
      setFilteredArtworks(artworks)
    }
  }, [artworks, selectedCategory])

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category)
  }

  const handleTitleClick = () => {
    setSelectedCategory(null)
  }

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
        {/* Header */}
        <div className="mb-8">
          {/* Top Row with Title and Navigation */}
          <div className="flex justify-between items-center mb-6">
            <h1 
              className="text-5xl font-light text-gray-900 cursor-pointer hover:text-gray-700 transition-colors duration-300"
              onClick={handleTitleClick}
            >
              Harper Lou Art
            </h1>
            
            {/* Right Side Navigation */}
            <div className="flex items-center gap-4">
              <Link 
                href="/about"
                className="text-base font-light text-gray-700 hover:text-gray-900 transition-colors underline underline-offset-4 decoration-gray-300 hover:decoration-gray-600"
              >
                About Me
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => window.open('https://www.instagram.com/harperlouharperlou/', '_blank')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
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
                    ? 'text-gray-900 border-b border-gray-900' 
                    : 'text-gray-500 hover:text-gray-900'
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

        {/* Artwork Grid */}
        {filteredArtworks.length > 0 ? (
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
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-gray-500 text-lg font-medium">
                  No artworks found
                </div>
                <p className="text-gray-600">
                  {selectedCategory 
                    ? `No artworks in the "${categories.find(c => c.value === selectedCategory)?.label}" category.`
                    : "No artworks available at the moment."
                  }
                </p>
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