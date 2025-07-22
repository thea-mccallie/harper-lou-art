"use client"
import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FaInstagram } from "react-icons/fa"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

// Type definition for artwork data from API
interface Artwork {
  id: string
  title: string
  imageUrls: string[]
  description: string
}

const ArtworkPage = () => {
  // Get artwork ID from URL parameters
  const params = useParams()
  
  // State for artwork data
  const [artwork, setArtwork] = useState<Artwork | null>(null)

  // Fetch artwork data on component mount
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

  // Loading state UI
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
      {/* Page Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          {/* Site Title */}
          <Link href="/">
            <h1 className="text-2xl font-light text-gray-900 cursor-pointer hover:text-gray-700 transition-colors duration-300">
              Harper Lou Art
            </h1>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link 
              href="/about"
              className="text-base font-light text-gray-700 hover:text-gray-900 transition-colors underline underline-offset-4 decoration-gray-300 hover:decoration-gray-600"
            >
              About Me
            </Link>
            
            {/* Instagram Button */}
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column - Artwork Details */}
          <section className="space-y-6">
            {/* Artwork Title */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-sans font-light text-gray-900 mb-4 leading-tight">
                {artwork.title}
              </h1>
              {/* Decorative divider */}
              <div className="w-12 h-0.5 bg-gray-300"></div>
            </div>
            
            {/* Artwork Description */}
            {artwork.description && (
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {artwork.description}
                </p>
              </div>
            )}
          </section>

          {/* Right Column - Image Carousel */}
          <section className="w-full">
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
              
              {/* Carousel Navigation - only show if multiple images */}
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
          </section>
        </div>
        
        {/* Back Navigation */}
        <footer className="text-center mt-16">
          <Link 
            href="/"
            className="text-sm font-light text-gray-400 hover:text-gray-700 transition-colors"
          >
            Back to Gallery
          </Link>
        </footer>
      </main>
    </div>
  )
}

export default ArtworkPage
