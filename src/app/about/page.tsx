"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FaInstagram } from "react-icons/fa"
import { Mail } from "lucide-react"

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
              <h1 className="text-2xl font-light text-gray-900 cursor-pointer hover:text-gray-700 transition-colors duration-300">
                Harper Lou Art
              </h1>
            </Link>
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

            {/* Right Column - Bio Text and Contact */}
            <div className="lg:pt-20">
              <div className="space-y-8">
                {/* Bio Text */}
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

                {/* Contact Section */}
                <div className="pt-4">
                  <div className="flex items-center space-x-8">
                    {/* Instagram */}
                    <a
                      href="https://www.instagram.com/harperlouharperlou/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center space-x-2 transition-all duration-300"
                    >
                      <FaInstagram className="w-5 h-5 text-gray-400 group-hover:text-gray-700 transition-colors" />
                      <span className="text-sm font-light text-gray-500 group-hover:text-gray-800 transition-colors">
                        Instagram
                      </span>
                    </a>

                    {/* Email */}
                    <div className="group relative flex items-center space-x-2 cursor-pointer">
                      <Mail className="w-5 h-5 text-gray-400 group-hover:text-gray-700 transition-colors" />
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
