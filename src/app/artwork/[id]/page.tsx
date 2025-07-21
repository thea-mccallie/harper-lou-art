"use client"
import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface Artwork {
  id: string
  title: string
  imageUrls: string[]
  description: string
}

const ArtworkPage = () => {
  const params = useParams()
  const [artwork, setArtwork] = useState<Artwork | null>(null)

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

  if (!artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading artwork...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Top Row with Title and Navigation */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/">
              <h1 className="text-5xl font-light text-gray-900 cursor-pointer hover:text-gray-700 transition-colors duration-300">
                Harper Lou Art
              </h1>
            </Link>
            
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
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                  </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Title and Description */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-sans font-light text-gray-900 mb-4 leading-tight">
                {artwork.title}
              </h1>
              <div className="w-12 h-0.5 bg-gray-300"></div>
            </div>
            
            {artwork.description && (
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {artwork.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Carousel */}
          <div className="w-full">
            <Carousel className="w-full">
              <CarouselContent>
                {artwork.imageUrls.map((imageUrl, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={imageUrl}
                        alt={`${artwork.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {artwork.imageUrls.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
            
            {/* Image Counter */}
            {artwork.imageUrls.length > 1 && (
              <div className="text-center mt-4 text-sm text-gray-500">
                {artwork.imageUrls.length} image{artwork.imageUrls.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtworkPage
