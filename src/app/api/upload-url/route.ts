import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import s3 from "@/lib/bucket"

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType } = await request.json()
    
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType are required" },
        { status: 400 }
      )
    }

    const imageKey = `${uuidv4()}-${fileName}`
    const bucketName = process.env.BUCKET_NAME!

    const params = {
      Bucket: bucketName,
      Key: imageKey,
      ContentType: fileType,
      Expires: 300, // URL expires in 5 minutes
    }

    // Generate presigned URL
    const presignedUrl = s3.getSignedUrl('putObject', params)
    
    // The final URL where the image will be accessible
    const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`

    return NextResponse.json({
      presignedUrl,
      imageUrl,
      imageKey
    })
  } catch (error) {
    console.error("Error generating presigned URL:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
