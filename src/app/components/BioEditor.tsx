import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import AWS from 'aws-sdk'

interface BioItem {
  id: string
  name: string
  content: string
  imageUrl: string
}

const s3 = new AWS.S3({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
})

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

  const handleImageUpload = async () => {
    if (!imageFile) return null

    const imageKey = `${uuidv4()}-${imageFile.name}`
    const uploadParams = {
      Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME!,
      Key: imageKey,
      Body: imageFile,
      ContentType: imageFile.type,
    }

    try {
      const uploadResult = await s3.upload(uploadParams).promise()
      return uploadResult.Location
    } catch (error) {
      console.error("Error uploading image:", error)
      setError("Failed to upload image")
      return null
    }
  }

  const handleSave = async () => {
    if (!bio) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const imageUrl = imageFile ? await handleImageUpload() : bio.imageUrl

      const updatedBio = {
        ...bio,
        imageUrl,
      }

      const response = await fetch('/api/bio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBio),
      })

      if (!response.ok) {
        throw new Error('Failed to update bio')
      }

      const data = await response.json()
      setBio(data)
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