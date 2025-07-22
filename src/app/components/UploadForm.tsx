"use client"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, GripVertical, Save, Loader2, AlertCircle, CheckCircle, Image as ImageIcon } from "lucide-react"

// Interface for image preview objects during upload process
interface ImagePreview {
  file: File     // The actual file object for upload
  url: string    // Blob URL for preview display
  id: string     // Unique identifier for React keys and removal
}

/**
 * UploadForm Component
 * 
 * A comprehensive form for uploading new artwork with the following features:
 * - Multi-image upload (1-10 images) with drag-and-drop reordering
 * - Image preview with blob URLs for immediate feedback
 * - S3 integration via presigned URLs for secure image uploads
 * - Form validation for required fields
 * - Memory leak prevention through proper URL cleanup
 * - Real-time upload progress and error handling
 * 
 * Upload Process:
 * 1. User selects images and fills form details
 * 2. Images are uploaded to S3 using presigned URLs
 * 3. Artwork metadata is saved to database with S3 image URLs
 * 4. Form is reset and success message shown
 */

const UploadForm = () => {
  // Form state management
  const [title, setTitle] = useState("")                              // Artwork title (required)
  const [description, setDescription] = useState("")                  // Artwork description (optional)
  const [category, setCategory] = useState("")                        // Artwork category (paintings, prints, ceramics)
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])  // Array of selected images with preview URLs
  const [loading, setLoading] = useState(false)                       // Loading state during form submission
  const [error, setError] = useState("")                              // Error message display
  const [success, setSuccess] = useState("")                          // Success message display
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)   // Index of currently dragged image for reordering

  /**
   * Handle file selection from input
   * Creates blob URLs for immediate preview and validates file types/limits
   */
  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const newPreviews: ImagePreview[] = []
      Array.from(files).forEach((file) => {
        // Validate file type and respect 10-image limit
        if (file.type.startsWith('image/') && imagePreviews.length + newPreviews.length < 10) {
          const url = URL.createObjectURL(file)  // Create blob URL for preview
          newPreviews.push({
            file,
            url,
            id: uuidv4()  // Generate unique ID for React keys
          })
        }
      })
      setImagePreviews([...imagePreviews, ...newPreviews])
    }
  }

  /**
   * Remove an image from the preview list
   * Properly cleans up blob URLs to prevent memory leaks
   */
  const removeImage = (id: string) => {
    setImagePreviews(prev => {
      const updated = prev.filter(preview => preview.id !== id)
      // Clean up object URLs to prevent memory leaks
      const removed = prev.find(preview => preview.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.url)
      }
      return updated
    })
  }

  // Drag and Drop Handlers for Image Reordering

  /**
   * Handle drag start event - store the index of dragged item
   */
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  /**
   * Handle drag over event - allow drop by preventing default
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  /**
   * Handle drop event - reorder images based on drag position
   */
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newPreviews = [...imagePreviews]
    const draggedItem = newPreviews[draggedIndex]
    
    // Remove from current position and insert at new position
    newPreviews.splice(draggedIndex, 1)
    newPreviews.splice(dropIndex, 0, draggedItem)
    
    setImagePreviews(newPreviews)
    setDraggedIndex(null)
  }

  /**
   * Handle form submission
   * Process:
   * 1. Validate form inputs
   * 2. Upload each image to S3 via presigned URLs
   * 3. Create artwork object with S3 URLs in correct order
   * 4. Save artwork metadata to database
   * 5. Clean up and reset form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Form validation
    if (imagePreviews.length === 0) {
      setError("At least one image is required")
      setLoading(false)
      return
    }

    if (!title.trim()) {
      setError("Title is required")
      setLoading(false)
      return
    }

    try {
      const imageUrls = []

      // Step 1: Upload each image to S3 using presigned URLs in the correct order
      for (const preview of imagePreviews) {
        // Get presigned URL from backend
        const urlResponse = await fetch('/api/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: preview.file.name,
            fileType: preview.file.type,
          }),
        })

        if (!urlResponse.ok) {
          throw new Error('Failed to get upload URL')
        }

        const { presignedUrl, imageUrl } = await urlResponse.json()

        // Upload file directly to S3 using presigned URL
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: preview.file,
          headers: {
            'Content-Type': preview.file.type,
          },
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }

        imageUrls.push(imageUrl)
      }

      // Step 2: Create artwork object with uploaded image URLs
      const artwork = {
        id: uuidv4(),
        title: title.trim(),
        description: description.trim(),
        category,
        imageUrls, // Store the array of image URLs in the correct order
        dateCreated: new Date().toISOString(),
      }

      // Step 3: Save artwork metadata to the database
      const response = await fetch("/api/artworks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(artwork),
      })

      if (!response.ok) {
        throw new Error("Failed to upload artwork")
      }

      // Step 4: Success - clean up and reset form
      setSuccess("Artwork uploaded successfully!")
      setTitle("")
      setDescription("")
      setCategory("")
      
      // Clean up object URLs to prevent memory leaks
      imagePreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url)
      })
      setImagePreviews([])
      
    } catch (err) {
      console.error("Error uploading artwork:", err)
      setError("Failed to upload artwork. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload Artwork</h1>
        <p className="text-muted-foreground">
          Upload artwork with 1 - 10 images and a description.
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

      {/* Main Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Artwork Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Artwork Details
              </CardTitle>
              <CardDescription>
                Provide information about your artwork.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title Input - Required Field */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter artwork title"
                  required
                />
              </div>
              
              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paintings">Painting</SelectItem>
                    <SelectItem value="prints">Prints</SelectItem>
                    <SelectItem value="ceramics">Ceramics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Description Textarea */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your artwork, inspiration, techniques used..."
                  className="min-h-[100px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Images ({imagePreviews.length}/10)
              </CardTitle>
              <CardDescription>
                Upload up to 10 images. Drag to reorder them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="images">Upload Images</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e.target.files)}
                  disabled={imagePreviews.length >= 10}  // Disable when limit reached
                />
                <p className="text-xs text-muted-foreground">
                  Select multiple images at once. Maximum 10 images.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Preview & Reordering Section */}
        {imagePreviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Image Preview & Ordering</CardTitle>
              <CardDescription>
                Drag images to reorder them. The first image will be the main display image.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={preview.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="relative group cursor-move border-2 border-dashed border-transparent hover:border-primary/50 transition-colors rounded-lg"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Hover Overlay with Controls */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Drag Handle */}
                          <div className="bg-white/90 rounded-full p-1">
                            <GripVertical className="w-4 h-4 text-gray-700" />
                          </div>
                          {/* Remove Button */}
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeImage(preview.id)}
                            className="rounded-full w-8 h-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Main Image Indicator */}
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                      
                      {/* Image Position Number */}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading || imagePreviews.length === 0}
            size="lg"
            className="min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Upload Artwork
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default UploadForm