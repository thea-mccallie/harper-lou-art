"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Save, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Interface for artwork item structure
interface ArtworkItem {
  id: string
  title: string
  imageUrls: string[]
  category: string
  description: string
  dateCreated: string
  sortOrder?: number
}

/**
 * ArtworkOrderManager Component
 * 
 * Allows reordering of artworks to control their display order on the homepage.
 * Features:
 * - Drag and drop interface for reordering
 * - Live preview of artwork thumbnails
 * - Bulk save functionality
 * - Visual feedback for changes
 */

const ArtworkOrderManager = () => {
  // State management
  const [artworks, setArtworks] = useState<ArtworkItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Fetch all artworks on component mount
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
        setError("Failed to load artworks")
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtworks()
  }, [])

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === targetIndex) return

    const newArtworks = [...artworks]
    const draggedItem = newArtworks[draggedIndex]
    
    // Remove dragged item and insert at new position
    newArtworks.splice(draggedIndex, 1)
    newArtworks.splice(targetIndex, 0, draggedItem)
    
    setArtworks(newArtworks)
    setDraggedIndex(null)
    setHasChanges(true)
    setError("")
    setSuccess("")
  }

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Save the new order
  const handleSaveOrder = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      // Create update payload with new sort orders
      const updates = artworks.map((artwork, index) => ({
        id: artwork.id,
        sortOrder: index + 1
      }))

      const response = await fetch("/api/artworks/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ artworks: updates }),
      })

      if (!response.ok) {
        throw new Error("Failed to update artwork order")
      }

      setSuccess("Artwork order updated successfully!")
      setHasChanges(false)
    } catch (error) {
      console.error("Error saving order:", error)
      setError("Failed to save artwork order. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Reset to original order
  const handleReset = () => {
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading artworks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Artwork Display Order</h1>
        <p className="text-muted-foreground">
          Drag and drop to reorder how artworks appear on the homepage. The first item will appear first on the homepage.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      {hasChanges && (
        <div className="flex gap-2">
          <Button onClick={handleSaveOrder} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Order
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            Reset
          </Button>
        </div>
      )}

      {/* Artwork List */}
      <div className="space-y-3">
        {artworks.map((artwork, index) => (
          <Card
            key={artwork.id}
            className={`cursor-move transition-all duration-200 ${
              draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Position Number */}
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  {index + 1}
                </div>

                {/* Artwork Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={artwork.imageUrls && artwork.imageUrls.length > 0 ? artwork.imageUrls[0] : "/placeholder.svg"}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Artwork Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg truncate">{artwork.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {artwork.category && (
                      <Badge variant="secondary" className="text-xs">
                        {artwork.category}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {new Date(artwork.dateCreated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {artworks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No artworks found to reorder.</p>
        </div>
      )}
    </div>
  )
}

export default ArtworkOrderManager
