"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
          <p className="text-gray-600">Loading about information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-lg font-medium">Error</div>
              <p className="text-gray-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!bioData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-gray-500 text-lg font-medium">No Information Available</div>
              <p className="text-gray-600">Bio information has not been set up yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <Link 
            href="/" 
            className="text-2xl font-light text-gray-900 hover:text-gray-700 transition-colors"
          >
            Harper Lou Art
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-light text-gray-900 mb-3">About Me</h1>
            <div className="w-12 h-0.5 bg-gray-300 mx-auto"></div>
          </div>

          {/* Two Column Layout */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left Column - Image */}
                <div className="relative bg-gray-100 min-h-[400px] lg:min-h-[500px] flex flex-col justify-center p-3">
                  {/* Name above photo */}
                  {bioData.name && (
                    <div className="mb-4">
                      <h2 className="text-2xl lg:text-3xl xl:text-4xl font-light text-black text-center">
                        {bioData.name}
                      </h2>
                    </div>
                  )}
                  
                  {bioData.imageUrl ? (
                    /* Large Image maintaining aspect ratio */
                    <img
                      src={bioData.imageUrl}
                      alt={bioData.name || "Profile"}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    /* Fallback when no image */
                    <div className="flex justify-center">
                      <Avatar className="w-48 h-48 shadow-lg">
                        <AvatarFallback className="text-5xl font-light bg-white text-gray-600">
                          {bioData.name 
                            ? bioData.name.split(' ').map(n => n[0]).join('').toUpperCase() 
                            : 'HL'
                          }
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>

                {/* Right Column - Bio Text */}
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <div className="prose prose-gray prose-base max-w-none">
                    {bioData.content ? (
                      <div className="space-y-4">
                        {bioData.content.split('\n\n').map((paragraph: string, index: number) => (
                          <p key={index} className="text-gray-700 leading-relaxed text-sm lg:text-base">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-sm lg:text-base">
                        Bio information will be displayed here once it's been added.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <div className="mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-light text-gray-900 mb-3">Contact Me</h2>
              <div className="w-8 h-0.5 bg-gray-300 mx-auto"></div>
            </div>
            
            <div className="flex justify-center space-x-8">
              {/* Instagram Link */}
              <a
                href="https://www.instagram.com/harperlouharperlou/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center p-4 rounded-lg hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Instagram className="w-8 h-8 text-pink-600 group-hover:text-pink-700 transition-colors mb-2" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Instagram
                </span>
              </a>

              {/* Email with Hover Reveal */}
              <div className="group relative flex flex-col items-center p-4 rounded-lg hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer">
                <Mail className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors mb-2" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Email
                </span>
                
                {/* Email Tooltip on Hover */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                  harper@example.com
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Gallery Link */}
          <div className="text-center mt-8">
            <Link 
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors group text-sm"
            >
              <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
