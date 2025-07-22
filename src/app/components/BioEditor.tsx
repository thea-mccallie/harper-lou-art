import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Loader2, User, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react"

// Interface for bio data structure
interface BioItem {
  id: string              // Unique identifier
  name: string | null     // Artist name
  content: string | null  // Bio content/description
  imageUrl: string | null // Profile image URL
}

/**
 * BioEditor Component
 * 
 * Provides an interface for editing artist bio information including:
 * - Artist name
 * - Bio content/description
 * - Profile image upload (via S3 presigned URLs)
 * 
 * Features:
 * - Real-time form updates
 * - Image upload with preview
 * - Success/error messaging
 * - Loading states
 * - Form validation
 */

const BioEditor: React.FC = () => {
  // State management
  const [bio, setBio] = useState<BioItem | null>(null)           // Current bio data
  const [loading, setLoading] = useState<boolean>(true)          // Loading state for API calls
  const [error, setError] = useState<string | null>(null)        // Error message display
  const [success, setSuccess] = useState<string | null>(null)    // Success message display
  const [imageFile, setImageFile] = useState<File | null>(null)  // Selected image file for upload

  // Fetch bio data on component mount
  useEffect(() => {
    const fetchBio = async () => {
      try {
        const response = await fetch('/api/bio')
        if (!response.ok) {
          throw new Error('Failed to fetch bio')
        }
        const data = await response.json()
        setBio(data)
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError('An unknown error occurred')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBio()
  }, [])


  /**
   * Handle saving bio data and image upload
   * Process:
   * 1. Upload new image to S3 if selected (via presigned URL)
   * 2. Update bio data with new image URL
   * 3. Send updated bio data to API
   */
  const handleSave = async () => {
    if (!bio) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let imageUrl = bio.imageUrl || '' // Keep existing image URL by default

      // Handle image upload if new file selected
      if (imageFile) {
        // Step 1: Get presigned URL from backend
        const urlResponse = await fetch('/api/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: imageFile.name,
            fileType: imageFile.type,
          }),
        })

        if (!urlResponse.ok) {
          throw new Error('Failed to get upload URL')
        }

        const { presignedUrl, imageUrl: newImageUrl } = await urlResponse.json()

        // Step 2: Upload file directly to S3 using presigned URL
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: imageFile,
          headers: {
            'Content-Type': imageFile.type,
          },
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }

        imageUrl = newImageUrl
      }

      // Prepare bio data for API update
      const bioData = {
        id: bio.id,
        name: bio.name || '',
        content: bio.content || '',
        imageUrl: imageUrl
      }

      // Send updated bio data to API
      const response = await fetch('/api/bio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bioData),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error:', errorData)
        throw new Error('Failed to update bio')
      }

      const data = await response.json()
      setBio(data)
      setImageFile(null) // Clear the selected file after successful upload
      setSuccess('Bio updated successfully')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  // Loading state UI
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading bio information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bio Editor</h1>
        <p className="text-muted-foreground">
          Update artist bio, to be displayed on about me page.
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Content - Two Column Layout */}
      {bio && (
        <div className="grid gap-6 md:grid-cols-2" key={bio.id}>
          {/* Profile Image Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Profile Photo
              </CardTitle>
              <CardDescription>
                Upload a high-quality photo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                {/* Current Profile Image Display */}
                <div className="w-48 h-48 bg-gray-100 rounded-sm overflow-hidden flex items-center justify-center">
                  {bio.imageUrl ? (
                    <img 
                      src={bio.imageUrl} 
                      alt={bio.name || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Placeholder when no image exists
                    <div className="flex flex-col items-center text-gray-400">
                      <User className="w-12 h-12 mb-2" />
                      <span className="text-sm">No photo uploaded</span>
                    </div>
                  )}
                </div>
                
                {/* Image Upload Input */}
                <div className="w-full">
                  <Label htmlFor="photo-upload" className="text-sm font-medium">
                    Upload New Photo
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: Square image, at least 400x400px
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Artist Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Artist Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name">Artist Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={bio.name || ''}
                  onChange={(e) => setBio({ ...bio, name: e.target.value })}
                  placeholder="Enter your artist name"
                />
              </div>
              
              {/* Bio Content Textarea */}
              <div className="space-y-2">
                <Label htmlFor="content">Bio Content</Label>
                <Textarea
                  id="content"
                  value={bio.content || ''}
                  onChange={(e) => setBio({ ...bio, content: e.target.value })}
                  placeholder="Tell your story as an artist. Describe your background, artistic journey, inspirations, and what makes your work unique..."
                  className="min-h-[150px] resize-none"
                />
                {/* Character counter */}
                <p className="text-xs text-muted-foreground">
                  {(bio.content || '').length}/1000 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Button */}
      {bio && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            size="lg"
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default BioEditor