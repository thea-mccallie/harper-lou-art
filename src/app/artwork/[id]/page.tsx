"use client"
import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"

interface Artwork {
  id: string
  title: string
  imageUrls: string[]
  description: string
}

const ArtworkPage = () => {
  const params = useParams()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch(`/api/artworks/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch artwork")
        }
        const data = await response.json()
        setArtwork(data)
      } catch (error) {
        console.error("Error fetching artwork:", error)
      }
    }

    fetchArtwork()
  }, [params.id])

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (artwork?.imageUrls.length || 1))
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + (artwork?.imageUrls.length || 1)) % (artwork?.imageUrls.length || 1))
  }

  if (!artwork) {
    return <div className="text-center mt-10">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto mb-24 px-5 text-center">
      <header>
        <h1 className="text-4xl font-sans mb-5">Harper Lou Art</h1>
      </header>

      <h1 className="text-3xl font-sans mb-8">{artwork.title}</h1>

      <div className="flex items-center justify-center mb-6 gap-4">
        <button
          onClick={handlePrevImage}
          className="bg-blue-600 hover:bg-blue-800 text-white rounded-md px-4 py-2 transition"
        >
          Previous
        </button>

        <img
          src={artwork.imageUrls[currentImageIndex]}
          alt={artwork.title}
          className="max-w-full h-auto rounded-lg"
        />

        <button
          onClick={handleNextImage}
          className="bg-blue-600 hover:bg-blue-800 text-white rounded-md px-4 py-2 transition"
        >
          Next
        </button>
      </div>

      <p className="text-base font-sans mt-5">{artwork.description}</p>
    </div>
  )
}

export default ArtworkPage
