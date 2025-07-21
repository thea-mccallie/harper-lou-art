import React, { useState } from 'react'
import ReactDOM from 'react-dom'

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
  const [newImageUrl, setNewImageUrl] = useState('')
  const [imagesToDelete, setImagesToDelete] = useState<boolean[]>(new Array(editingArtwork.imageUrls.length).fill(false))
  const [fileInputs, setFileInputs] = useState<number[]>([])
  const [newImages, setNewImages] = useState<File[]>([])

  if (!isOpen) return null

  const handleFileChange = (index: number, files: FileList | null) => {
    if (files) {
      const newImagesCopy = [...newImages]
      newImagesCopy[index] = files[0]
      setNewImages(newImagesCopy)
    }
  }

  const addFileInput = () => {
    if (fileInputs.length < 10) {
      setFileInputs([...fileInputs, fileInputs.length])
    }
  }

  const handleCheckboxChange = (index: number) => {
    const updatedImagesToDelete = [...imagesToDelete]
    updatedImagesToDelete[index] = !updatedImagesToDelete[index]
    setImagesToDelete(updatedImagesToDelete)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newImageUrls = []
    
    // Upload new images using presigned URLs
    for (const image of newImages) {
      if (!image) continue; // Skip empty file slots
      
      // Step 1: Get presigned URL from backend
      const urlResponse = await fetch('/api/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: image.name,
          fileType: image.type,
        }),
      })

      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { presignedUrl, imageUrl } = await urlResponse.json()

      // Step 2: Upload file directly to S3 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: image,
        headers: {
          'Content-Type': image.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      newImageUrls.push(imageUrl)
    }

    const updatedArtwork = {
      ...editingArtwork,
      imageUrls: [
        ...editingArtwork.imageUrls.filter((_, index) => !imagesToDelete[index]),
        ...newImageUrls
      ]
    }
    onSubmit(updatedArtwork)
  }

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <form onSubmit={handleSubmit} className="edit-form">
          <h2>Edit Artwork</h2>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={editingArtwork.title || ''}
            onChange={onChange}
          />
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={editingArtwork.description || ''}
            onChange={onChange}
          />
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={editingArtwork.category || ''}
            onChange={onChange}
          >
            <option value="">Select a category</option>
            <option value="painting">Painting</option>
            <option value="sculpture">Sculpture</option>
            <option value="photography">Photography</option>
          </select>
          <label htmlFor="newImageUrl">Add Image</label>
          <input
            type="file"
            id="newImageUrl"
            name="newImageUrl"
            onChange={(e) => handleFileChange(fileInputs.length, e.target.files)}
          />
          <button type="button" onClick={addFileInput}>Add More Images</button>
          {fileInputs.map((input, index) => (
            <input key={index} type="file" id={`file-input-${index}`} onChange={(e) => handleFileChange(index, e.target.files)} />
          ))}
          <div className="image-list">
            {editingArtwork.imageUrls.map((url, index) => (
              <div key={index} className="image-item">
                <img src={url} alt={`Artwork ${index + 1}`} />
                <label>
                  <input
                    type="checkbox"
                    checked={imagesToDelete[index] || false}
                    onChange={() => handleCheckboxChange(index)}
                  />
                  Delete
                </label>
              </div>
            ))}
          </div>
          <button type="submit">Update</button>
          <button type="button" onClick={() => onDelete(editingArtwork.id)}>Delete</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default EditArtworkModal
