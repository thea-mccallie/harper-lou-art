"use client"
import React, { useState, useEffect } from "react"
import ArtworkCard from "./components/ArtworkCard"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch("/api/artworks")
        if (!response.ok) {
          throw new Error("Failed to fetch artworks")
        }
        const data = await response.json()
        setArtworks(data)
      } catch (error) {
        console.error("Error fetching artworks:", error)
        setError("Failed to fetch artworks")
      } finally {
        setLoading(false)
      }
    }

    fetchArtworks()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-center text-red-600 mt-10">{error}</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with hover effect */}
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold font-montserrat hover:text-light-blue transition-colors duration-300 cursor-default">
          Harper Lou Art
        </h1>
      </div>

      {/* Artwork grid */}
      <div className="flex justify-center px-4 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] w-full">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              id={artwork.id}
              title={artwork.title}
              imageUrls={artwork.imageUrls}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage