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
        <div className="text-center mb-8">
          <h1 
            className="text-5xl font-light text-gray-900 mb-6 cursor-pointer hover:text-gray-700 transition-colors duration-300"
            onClick={handleTitleClick}
          >
            Harper Lou Art
          </h1>
          
          {/* Navigation Link */}
          <div className="mb-6">
            <Link 
              href="/about"
              className="text-lg font-light text-gray-700 hover:text-gray-900 transition-colors underline underline-offset-4 decoration-gray-300 hover:decoration-gray-600"
            >
              About Me
            </Link>
          </div>
          
          {/* Category Filter Menu */}
          <div className="flex justify-center gap-3 mb-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="lg"
                onClick={() => handleCategoryFilter(category.value)}
                className="font-medium"
              >
                {category.label}
              </Button>
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