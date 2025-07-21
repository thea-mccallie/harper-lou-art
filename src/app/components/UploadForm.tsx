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
import { Upload, X, GripVertical, Plus, Save, Loader2, AlertCircle, CheckCircle, Image as ImageIcon } from "lucide-react"

interface ImagePreview {
  file: File
  url: string
  id: string
}

const UploadForm = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const newPreviews: ImagePreview[] = []
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/') && imagePreviews.length + newPreviews.length < 10) {
          const url = URL.createObjectURL(file)
          newPreviews.push({
            file,
            url,
            id: uuidv4()
          })
        }
      })
      setImagePreviews([...imagePreviews, ...newPreviews])
    }
  }

  const removeImage = (id: string) => {
    setImagePreviews(prev => {
      const updated = prev.filter(preview => preview.id !== id)
      // Clean up object URLs
      const removed = prev.find(preview => preview.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.url)
      }
      return updated
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newPreviews = [...imagePreviews]
    const draggedItem = newPreviews[draggedIndex]
    newPreviews.splice(draggedIndex, 1)
    newPreviews.splice(dropIndex, 0, draggedItem)
    
    setImagePreviews(newPreviews)
    setDraggedIndex(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

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

      // Upload each image using presigned URLs in the order they appear
      for (const preview of imagePreviews) {
        // Step 1: Get presigned URL from backend
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

        // Step 2: Upload file directly to S3 using presigned URL
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

      // Create artwork object
      const artwork = {
        id: uuidv4(),
        title: title.trim(),
        description: description.trim(),
        category,
        imageUrls, // Store the array of image URLs in the correct order
        dateCreated: new Date().toISOString(),
      }

      // Save artwork details to the database
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

      setSuccess("Artwork uploaded successfully!")
      setTitle("")
      setDescription("")
      setCategory("")
      
      // Clean up object URLs
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload Artwork</h1>
        <p className="text-muted-foreground">
          Upload your artwork with multiple images and detailed information.
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Artwork Information */}
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
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="sculpture">Sculpture</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="drawing">Drawing</SelectItem>
                    <SelectItem value="digital">Digital Art</SelectItem>
                    <SelectItem value="mixed-media">Mixed Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
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

          {/* Image Upload */}
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
                  disabled={imagePreviews.length >= 10}
                />
                <p className="text-xs text-muted-foreground">
                  Select multiple images at once. Maximum 10 images.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Previews with Drag and Drop */}
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
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 rounded-full p-1">
                            <GripVertical className="w-4 h-4 text-gray-700" />
                          </div>
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
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
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