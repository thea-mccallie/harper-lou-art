"use client"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
})

const UploadForm = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [fileInputs, setFileInputs] = useState([0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFileChange = (index: number, files: FileList | null) => {
    if (files) {
      const newImages = [...images]
      newImages[index] = files[0]
      setImages(newImages)
    }
  }

  const addFileInput = () => {
    if (fileInputs.length < 10) {
      setFileInputs([...fileInputs, fileInputs.length])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (images.length === 0) {
      setError("At least one image is required")
      setLoading(false)
      return
    }

    try {
      const imageUrls = []

      for (const image of images) {
        const imageKey = `${uuidv4()}-${image.name}`
        const uploadParams = {
          Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME as string,
          Key: imageKey,
          Body: image,
          ContentType: image.type,
        }

        const uploadResult = await s3.upload(uploadParams).promise()
        imageUrls.push(uploadResult.Location)
      }

      // Create artwork object
      const artwork = {
        id: uuidv4(),
        title,
        description,
        category,
        imageUrls, // Store the array of image URLs
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
      setImages([])
      setFileInputs([0])
    } catch (err) {
      console.error("Error uploading artwork:", err)
      setError("Failed to upload artwork")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <h2>Upload Artwork</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <label htmlFor="title">Title</label>
      <input
        type="text"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <label htmlFor="category">Category</label>
      <select
        id="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select a category</option>
        <option value="painting">Painting</option>
        <option value="sculpture">Sculpture</option>
        <option value="photography">Photography</option>
      </select>
      {fileInputs.map((input, index) => (
        <div key={index}>
          <label htmlFor={`image-${index}`}>Image {index + 1}</label>
          <input
            type="file"
            id={`image-${index}`}
            accept="image/*"
            onChange={(e) => handleFileChange(index, e.target.files)}
          />
        </div>
      ))}
      {fileInputs.length < 10 && (
        <button type="button" onClick={addFileInput}>
          Add Extra File
        </button>
      )}
      <button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  )
}

export default UploadForm