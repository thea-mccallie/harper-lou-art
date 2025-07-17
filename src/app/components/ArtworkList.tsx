"use client"
import { useState, useEffect } from "react"
import EditArtworkModal from "./EditArtworkModal"

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
    <div className="artwork-list">
      <h1>Artwork List</h1>
      <input
        type="text"
        placeholder="Search artworks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300"
      />
      {isLoading ? (
        <p>Loading artworks...</p>
      ) : (
        <div className="grid">
          {filteredArtworks.map((artwork) => (
            <div key={artwork.id} className="artwork-item">
              <img
                src={artwork.imageUrls && artwork.imageUrls.length > 0 ? artwork.imageUrls[0] : "/placeholder.svg"} // Access the first image in the array or use a placeholder
                alt={artwork.title}
                width={200}
                height={200}
              />
              <h3>{artwork.title}</h3>
              <p>{artwork.category}</p>
              <button onClick={() => handleEdit(artwork)}>EDIT</button>
            </div>
          ))}
        </div>
      )}

      {editingArtwork && (
        <EditArtworkModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingArtwork={editingArtwork}
          onChange={handleChange}
          onSubmit={handleUpdate} // Pass handleUpdate directly
          onDelete={handleDelete} // Pass handleDelete directly
        />
      )}
    </div>
  )
}

export default ArtworkList

