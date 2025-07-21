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
import { Card, CardContent } from "@/components/ui/card"
import { X, Plus, Upload, GripVertical } from "lucide-react"

interface ImageItem {
  id: string
  url: string
  isExisting: boolean
  file?: File
  markedForDeletion?: boolean
}

interface EditArtworkModalProps {
  isOpen: boolean
  onClose: () => void
  editingArtwork: {
    id: string
    title: string
    imageUrls: string[]
    category: string
    description: string
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onSubmit: (updatedArtwork: any) => void
  onDelete: (id: string) => void
}

const EditArtworkModal: React.FC<EditArtworkModalProps> = ({ isOpen, onClose, editingArtwork, onChange, onSubmit, onDelete }) => {
  // Initialize images array with existing images
  const initializeImages = (): ImageItem[] => {
    return editingArtwork.imageUrls.map((url, index) => ({
      id: `existing-${index}`,
      url,
      isExisting: true,
      markedForDeletion: false
    }))
  }

  const [images, setImages] = useState<ImageItem[]>(initializeImages())
  const [loading, setLoading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Update images when editingArtwork changes
  React.useEffect(() => {
    if (isOpen) {
      setImages(initializeImages())
    }
  }, [editingArtwork, isOpen])

  if (!isOpen) return null

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const newImageItems: ImageItem[] = Array.from(files).map((file, index) => {
        const objectUrl = URL.createObjectURL(file)
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

  const toggleDeletion = (id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id 
        ? { ...img, markedForDeletion: !img.markedForDeletion }
        : img
    ))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newImageUrls = []
      
      // Upload new images using presigned URLs
      for (const imageItem of images) {
        if (!imageItem.isExisting && imageItem.file) {
          // Step 1: Get presigned URL from backend
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

          // Step 2: Upload file directly to S3 using presigned URL
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

      // Build the final image URLs array in the correct order
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

      const updatedArtwork = {
        ...editingArtwork,
        imageUrls: finalImageUrls
      }
      
      await onSubmit(updatedArtwork)
      
      // Clean up object URLs
      images.forEach(img => {
        if (!img.isExisting && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url)
        }
      })
      
      // Reset form state
      setImages(initializeImages())
      
    } catch (error) {
      console.error('Error updating artwork:', error)
      // You might want to add error state handling here
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Artwork</DialogTitle>
          <DialogDescription>
            Make changes to your artwork here. You can edit details, add new images, or delete existing ones.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
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
                  <SelectItem value="sculpture">Sculpture</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Images Management */}
            <div className="grid gap-4">
              <Label>Artwork Images</Label>
              
              {/* Image Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <Card 
                      key={image.id} 
                      className={`relative group cursor-move ${image.markedForDeletion ? 'opacity-50 ring-2 ring-red-500' : ''}`}
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
                          
                          {/* Drag Handle */}
                          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 text-white p-1 rounded">
                              <GripVertical size={12} />
                            </div>
                          </div>
                          
                          {/* Remove Button */}
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
                        
                        {/* Image Info */}
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
              
              {images.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No images yet. Upload some images to get started.
                </p>
              )}
            </div>
          </div>

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
