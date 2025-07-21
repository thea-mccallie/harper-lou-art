"use client"
import { useState, useEffect } from "react"
import EditArtworkModal from "./EditArtworkModal"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Search, Loader2, ImageIcon } from "lucide-react"

interface ArtworkItem {
  id: string
  title: string
  imageUrls: string[]
  category: string
  description: string
}

const ArtworkList = () => {
  const [artworks, setArtworks] = useState<ArtworkItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingArtwork, setEditingArtwork] = useState<ArtworkItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtworks()
  }, [])

  useEffect(() => {
    console.log("Updated editingArtwork:", editingArtwork)
  }, [editingArtwork])

  const filteredArtworks = artworks.filter((artwork) =>
    typeof artwork.title === 'string' && artwork.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (artwork: ArtworkItem) => {
    console.log("Editing artwork:", artwork) // Debugging statement
    setEditingArtwork({ ...artwork }) // Ensures a new object is created
    setIsModalOpen(true)
  }

  const handleUpdate = async (updatedArtwork: ArtworkItem) => {
    if (!editingArtwork) return

    // Debugging
    console.log("the stuff in the list doc are", updatedArtwork)

    try {
      const response = await fetch(`/api/artworks/${updatedArtwork.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedArtwork),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to update artwork:", errorData)
        throw new Error("Failed to update artwork")
      }

      const updatedArtworkData = await response.json()
      setArtworks((prevArtworks) =>
        prevArtworks.map((artwork) =>
          artwork.id === updatedArtworkData.id ? updatedArtworkData : artwork
        )
      )
      console.log("Artwork updated successfully:", updatedArtworkData)
      setEditingArtwork(null)
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error updating artwork:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to delete artwork:", errorData)
        throw new Error("Failed to delete artwork")
      }

      setArtworks((prevArtworks) => prevArtworks.filter((artwork) => artwork.id !== id))
      console.log("Artwork deleted successfully")
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error deleting artwork:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editingArtwork) return
    const { name, value } = e.target
    setEditingArtwork({ ...editingArtwork, [name]: value })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Artwork Management</h1>
        <p className="text-muted-foreground">
          Manage your artwork collection. Search, edit, and organize your pieces.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search artworks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-muted-foreground">Loading artworks...</p>
          </div>
        </div>
      ) : filteredArtworks.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms.' : 'Start by uploading your first artwork.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtworks.map((artwork) => (
            <Card key={artwork.id} className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={artwork.imageUrls && artwork.imageUrls.length > 0 ? artwork.imageUrls[0] : "/placeholder.svg"}
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(artwork)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  {artwork.category && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 right-2 opacity-90"
                    >
                      {artwork.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <CardTitle className="text-lg line-clamp-2 mb-2">
                  {artwork.title}
                </CardTitle>
                {artwork.description && (
                  <CardDescription className="line-clamp-2">
                    {artwork.description}
                  </CardDescription>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(artwork)}
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Artwork
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingArtwork && (
        <EditArtworkModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingArtwork={editingArtwork}
          onChange={handleChange}
          onSubmit={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default ArtworkList

