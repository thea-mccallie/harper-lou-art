"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, Mail } from "lucide-react"

interface Bio {
  id: string
  name: string
  content: string
  imageUrl: string
}

const AboutPage = () => {
  const [bioData, setBioData] = useState<Bio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchBio = async () => {
      try {
        const response = await fetch("/api/bio")
        if (!response.ok) {
          throw new Error("Failed to fetch bio")
        }
        const data = await response.json()
        setBioData(data)
      } catch (error) {
        console.error("Error fetching bio:", error)
        setError("Failed to load bio information")
      } finally {
        setLoading(false)
      }
    }

    fetchBio()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !bioData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load information</p>
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
              <span className="text-base font-light text-gray-400">About Me</span>
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
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Two Column Layout - Clean and Minimal */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Image */}
            <div className="flex flex-col items-center space-y-8">
              {/* Name */}
              {bioData.name && (
                <h2 className="text-4xl lg:text-5xl font-light text-gray-900 text-center">
                  {bioData.name}
                </h2>
              )}
              
              {/* Image */}
              {bioData.imageUrl ? (
                <div className="w-full max-w-md">
                  <img
                    src={bioData.imageUrl}
                    alt={bioData.name || "Profile"}
                    className="w-full h-auto object-cover rounded-sm"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-200 rounded-sm flex items-center justify-center">
                  <span className="text-4xl font-light text-gray-400">
                    {bioData.name 
                      ? bioData.name.split(' ').map(n => n[0]).join('').toUpperCase() 
                      : 'HL'
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Right Column - Bio Text */}
            <div className="lg:pt-20">
              <div className="space-y-6">
                {bioData.content ? (
                  <div className="space-y-6">
                    {bioData.content.split('\n\n').map((paragraph: string, index: number) => (
                      <p key={index} className="text-lg text-gray-700 leading-relaxed font-light">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-lg text-gray-400 italic font-light">
                    Information coming soon...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Section - Minimal */}
          <div className="mt-20 text-center">
            <div className="flex justify-center items-center space-x-12">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/harperlouharperlou/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center space-y-2 transition-all duration-300"
              >
                <Instagram className="w-6 h-6 text-gray-400 group-hover:text-gray-700 transition-colors" />
                <span className="text-sm font-light text-gray-500 group-hover:text-gray-800 transition-colors">
                  Instagram
                </span>
              </a>

              {/* Email */}
              <div className="group relative flex flex-col items-center space-y-2 cursor-pointer">
                <Mail className="w-6 h-6 text-gray-400 group-hover:text-gray-700 transition-colors" />
                <span className="text-sm font-light text-gray-500 group-hover:text-gray-800 transition-colors">
                  Email
                </span>
                
                {/* Email Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                  harper@example.com
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Link - Minimal */}
          <div className="text-center mt-16">
            <Link 
              href="/"
              className="text-sm font-light text-gray-400 hover:text-gray-700 transition-colors"
            >
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
