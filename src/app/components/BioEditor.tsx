import React, { useState, useEffect } from 'react'

interface BioItem {
  id: string
  name: string
  content: string
  imageUrl: string
}

const BioEditor: React.FC = () => {
  const [bio, setBio] = useState<BioItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

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


  const handleSave = async () => {
    if (!bio) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let imageUrl = bio.imageUrl // Keep existing image URL by default

      // If there's a new image file, upload it to S3 using presigned URL
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

      // Now send JSON data to API
      const bioData = {
        id: bio.id,
        name: bio.name,
        content: bio.content,
        imageUrl: imageUrl
      }

      const response = await fetch('/api/bio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bioData),
      })

      if (!response.ok) {
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

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="bio-editor">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {bio && (
        <>
          <input
            type="text"
            value={bio.name}
            onChange={(e) => setBio({ ...bio, name: e.target.value })}
            placeholder="Name"
            className="bio-input"
          />
          <textarea
            value={bio.content}
            onChange={(e) => setBio({ ...bio, content: e.target.value })}
            placeholder="Content"
            className="bio-textarea"
          />
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
            className="bio-file-input"
          />
          {bio.imageUrl && <img src={bio.imageUrl} alt="Bio" className="bio-image" />}
          <button onClick={handleSave} className="bio-save-button">Save</button>
        </>
      )}
    </div>
  )
}

export default BioEditor