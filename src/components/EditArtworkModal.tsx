import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { X, Upload, GripVertical } from "lucide-react"

// Interface for managing individual images in the editor
interface ImageItem {
  id: string                    // Unique identifier for the image
  url: string                   // Image URL (S3 URL for existing, blob URL for new)
  isExisting: boolean           // Whether this is an existing image or newly uploaded
  file?: File                   // File object for newly selected images
  markedForDeletion?: boolean   // Whether existing image is marked for deletion
}

// Props interface for the EditArtworkModal component
interface EditArtworkModalProps {
  isOpen: boolean               // Controls modal visibility
  onClose: () => void           // Callback to close the modal
  editingArtwork: {             // Current artwork data being edited
    id: string
    title: string
    imageUrls: string[]
    category: string
    description: string
    showOnHomepage?: boolean
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void  // Form field change handler
  onSubmit: (updatedArtwork: any) => void   // Callback when form is submitted
  onDelete: (id: string) => void            // Callback to delete the artwork
}

/**
 * EditArtworkModal Component
 * 
 * A comprehensive modal for editing artwork details including:
 * - Basic information (title, description, category)
 * - Image management (upload, reorder, delete)
 * - Drag-and-drop functionality for image reordering
 * - S3 integration for image uploads via presigned URLs
 * 
 * Features:
 * - Multi-image upload with preview
 * - Drag-and-drop reordering
 * - Mark existing images for deletion
 * - Real-time form validation
 * - Loading states and error handling
 * - Memory leak prevention with URL cleanup
 */

const EditArtworkModal: React.FC<EditArtworkModalProps> = ({ isOpen, onClose, editingArtwork, onChange, onSubmit, onDelete }) => {
  
  /**
   * Initialize images array from existing artwork imageUrls
   * Converts string URLs to ImageItem objects for consistent handling
   */
  const initializeImages = React.useCallback((): ImageItem[] => {
    return editingArtwork.imageUrls.map((url, index) => ({
      id: `existing-${index}`,
      url,
      isExisting: true,
      markedForDeletion: false
    }))
  }, [editingArtwork.imageUrls])

  // State management
  const [images, setImages] = useState<ImageItem[]>(initializeImages())     // Current images in editor
  const [loading, setLoading] = useState(false)                            // Loading state for form submission
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)     // Index of currently dragged image

  // Reset images when modal opens or editingArtwork changes
  React.useEffect(() => {
    if (isOpen) {
      setImages(initializeImages())
    }
  }, [editingArtwork, isOpen, initializeImages])

  // Early return if modal is closed
  if (!isOpen) return null

  /**
   * Handle new file selection for image upload
   * Creates blob URLs for preview and adds to images array
   */
  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const newImageItems: ImageItem[] = Array.from(files).map((file, index) => {
        const objectUrl = URL.createObjectURL(file)  // Create preview URL
        return {
          id: `new-${Date.now()}-${index}`,
          url: objectUrl,
          isExisting: false,
          file,
          markedForDeletion: false
        }
      })
      setImages(prev => [...prev, ...newImageItems])
    }
  }

  /**
   * Remove an image from the editor
   * For new images: revokes blob URL to prevent memory leaks
   * For existing images: handled by toggleDeletion instead
   */
  const removeImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id)
      if (imageToRemove && !imageToRemove.isExisting) {
        // Revoke object URL for new images to prevent memory leaks
        URL.revokeObjectURL(imageToRemove.url)
      }
      return prev.filter(img => img.id !== id)
    })
  }

  /**
   * Toggle deletion status for existing images
   * Existing images are marked for deletion rather than immediately removed
   */
  const toggleDeletion = (id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id 
        ? { ...img, markedForDeletion: !img.markedForDeletion }
        : img
    ))
  }

  // Drag and Drop Handlers for Image Reordering
  
  /**
   * Handle drag start event
   * Stores the index of the dragged item
   */
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  /**
   * Handle drag over event
   * Allows the drop by preventing default behavior
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  /**
   * Handle drop event
   * Reorders the images array based on drag and drop positions
   */
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null) return
    
    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    
    // Remove dragged image from its current position
    newImages.splice(draggedIndex, 1)
    
    // Insert dragged image at new position
    newImages.splice(dropIndex, 0, draggedImage)
    
    setImages(newImages)
    setDraggedIndex(null)
  }

  /**
   * Handle form submission
   * Process:
   * 1. Upload new images to S3 via presigned URLs
   * 2. Build final imageUrls array respecting order and deletions
   * 3. Submit updated artwork data
   * 4. Clean up blob URLs to prevent memory leaks
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newImageUrls = []
      
      // Step 1: Upload new images using presigned URLs
      for (const imageItem of images) {
        if (!imageItem.isExisting && imageItem.file) {
          // Get presigned URL from backend
          const urlResponse = await fetch('/api/upload-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: imageItem.file.name,
              fileType: imageItem.file.type,
            }),
          })

          if (!urlResponse.ok) {
            throw new Error('Failed to get upload URL')
          }

          const { presignedUrl, imageUrl } = await urlResponse.json()

          // Upload file directly to S3 using presigned URL
          const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            body: imageItem.file,
            headers: {
              'Content-Type': imageItem.file.type,
            },
          })

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image')
          }

          newImageUrls.push(imageUrl)
        }
      }

      // Step 2: Build the final image URLs array in the correct order
      const finalImageUrls = []
      for (const imageItem of images) {
        if (imageItem.isExisting && !imageItem.markedForDeletion) {
          // Keep existing images that aren't marked for deletion
          finalImageUrls.push(imageItem.url)
        } else if (!imageItem.isExisting && imageItem.file) {
          // Add new images - find the corresponding uploaded URL
          const newUrlIndex = images
            .filter(img => !img.isExisting && img.file)
            .indexOf(imageItem)
          if (newUrlIndex >= 0 && newUrlIndex < newImageUrls.length) {
            finalImageUrls.push(newImageUrls[newUrlIndex])
          }
        }
      }

      // Step 3: Submit updated artwork data
      const updatedArtwork = {
        ...editingArtwork,
        imageUrls: finalImageUrls
      }
      
      await onSubmit(updatedArtwork)
      
      // Step 4: Clean up object URLs to prevent memory leaks
      images.forEach(img => {
        if (!img.isExisting && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url)
        }
      })
      
      // Reset form state
      setImages(initializeImages())
      
    } catch (error) {
      console.error('Error updating artwork:', error)
      // TODO: Add user-facing error handling
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        {/* Modal Header */}
        <DialogHeader>
          <DialogTitle>Edit Artwork</DialogTitle>
          <DialogDescription>
            Make changes to your artwork here. You can edit details, add new images, or delete existing ones.
          </DialogDescription>
        </DialogHeader>
        
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            
            {/* Basic Information Section */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={editingArtwork.title || ''}
                onChange={onChange}
                placeholder="Artwork title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editingArtwork.description || ''}
                onChange={onChange}
                placeholder="Describe your artwork"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={editingArtwork.category || ''} 
                onValueChange={(value) => onChange({ 
                  target: { name: 'category', value } 
                } as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="ceramics">Ceramics</SelectItem>
                  <SelectItem value="prints">Prints</SelectItem>
                  <SelectItem value="multimedia">Multimedia</SelectItem>
                  <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Homepage Visibility Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showOnHomepage"
                checked={editingArtwork.showOnHomepage || false}
                onCheckedChange={(checked) => onChange({ 
                  target: { name: 'showOnHomepage', value: checked } 
                } as any)}
              />
              <Label 
                htmlFor="showOnHomepage" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show on Homepage
              </Label>
            </div>

            {/* Images Management Section */}
            <div className="grid gap-4">
              <div>
                <Label>Artwork Images</Label>
                <p className="text-sm text-muted-foreground">Drag and drop to reorder</p>
              </div>
              
              {/* Current Images Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <Card 
                      key={image.id} 
                      className={`relative group cursor-move ${
                        image.markedForDeletion ? 'opacity-50 ring-2 ring-red-500' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <CardContent className="p-2">
                        <div className="relative aspect-square">
                          <img
                            src={image.url}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          
                          {/* Drag Handle - appears on hover */}
                          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 text-white p-1 rounded">
                              <GripVertical size={12} />
                            </div>
                          </div>
                          
                          {/* Remove/Delete Button - appears on hover */}
                          <button
                            type="button"
                            onClick={() => image.isExisting ? toggleDeletion(image.id) : removeImage(image.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                          
                          {/* Deletion Indicator for Existing Images */}
                          {image.isExisting && image.markedForDeletion && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center rounded-md">
                              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                                Will be deleted
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Image Status Indicator */}
                        <div className="mt-2 text-xs text-gray-500 text-center">
                          {image.isExisting ? 'Current' : 'New'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">Upload new images</span>
                  <span className="text-xs text-gray-500 block mt-1">
                    Click to select or drag and drop
                  </span>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </div>
              
              {/* Empty State Message */}
              {images.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No images yet. Upload some images to get started.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => onDelete(editingArtwork.id)}
              disabled={loading}
            >
              Delete Artwork
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Artwork'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditArtworkModal
