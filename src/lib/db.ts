import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb"
import { ArtworkItem } from "./model"

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
})

const docClient = DynamoDBDocumentClient.from(client)

const BIO_TABLE_NAME = process.env.BIO_TABLE_NAME
const ARTWORKS_TABLE_NAME = process.env.ARTWORKS_TABLE_NAME

interface BioItem {
  id: string
  name: string
  content: string
  imageUrl: string
}

// Bio operations
export async function getBio(): Promise<BioItem | null> {
    const command = new GetCommand({
      TableName: BIO_TABLE_NAME,
      Key: { id: "bio" },
    })
    try {
      const response = await docClient.send(command)
      return response.Item as BioItem
    } catch (error) {
      console.error("Error fetching bio:", error)
      return null
    }
}

export async function updateBio(bioUpdates: Partial<BioItem>): Promise<BioItem | null> {
    const command = new UpdateCommand({
        TableName: BIO_TABLE_NAME,
        Key: { id: "bio" },
        UpdateExpression: 'set #name = :name, #content = :content, #imageUrl = :imageUrl',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#content': 'content',
          '#imageUrl': 'imageUrl',
        },
        ExpressionAttributeValues: {
          ':name': bioUpdates.name,
          ':content': bioUpdates.content,
          ':imageUrl': bioUpdates.imageUrl,
        },
        ReturnValues: 'ALL_NEW',
    })
    try {
        const response = await docClient.send(command)
        return response.Attributes as BioItem
    } catch (error) {
        console.error("Error updating bio:", error)
        return null
    }
}
  // Artwork operations
  export async function getArtworks(): Promise<ArtworkItem[]> {
    const command = new ScanCommand({
      TableName: ARTWORKS_TABLE_NAME,
    })
    try {
      const response = await docClient.send(command)
      const artworks = response.Items as ArtworkItem[]
      // Sort by sortOrder if available, otherwise by dateCreated (newest first)
      return artworks.sort((a, b) => {
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return a.sortOrder - b.sortOrder
        }
        if (a.sortOrder !== undefined && b.sortOrder === undefined) {
          return -1
        }
        if (a.sortOrder === undefined && b.sortOrder !== undefined) {
          return 1
        }
        return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      })
    } catch (error) {
      console.error("Error fetching artworks:", error)
      return []
    }
  }
  
  export async function getArtwork(id: string): Promise<ArtworkItem | null> {
    const command = new GetCommand({
      TableName: ARTWORKS_TABLE_NAME,
      Key: { id },
    })
    try {
      const response = await docClient.send(command)
      return response.Item as ArtworkItem
    } catch (error) {
      console.error("Error fetching artwork:", error)
      return null
    }
  }
  
  export async function createArtwork(artwork: ArtworkItem): Promise<void> {
    const command = new PutCommand({
      TableName: ARTWORKS_TABLE_NAME,
      Item: artwork,
    })
    try {
      await docClient.send(command)
    } catch (error) {
      console.error("Error creating artwork:", error)
    }
  }

export async function updateArtwork(id: string, updates: any) {
    // Build dynamic update expression based on provided fields
    const updateExpressions: string[] = []
    const expressionAttributeNames: { [key: string]: string } = {}
    const expressionAttributeValues: { [key: string]: any } = {}

    // Only add fields that are actually provided in updates
    if (updates.title !== undefined) {
      updateExpressions.push('#title = :title')
      expressionAttributeNames['#title'] = 'title'
      expressionAttributeValues[':title'] = updates.title
    }
    
    if (updates.description !== undefined) {
      updateExpressions.push('#description = :description')
      expressionAttributeNames['#description'] = 'description'
      expressionAttributeValues[':description'] = updates.description
    }
    
    if (updates.category !== undefined) {
      updateExpressions.push('#category = :category')
      expressionAttributeNames['#category'] = 'category'
      expressionAttributeValues[':category'] = updates.category
    }
    
    if (updates.imageUrls !== undefined) {
      updateExpressions.push('#imageUrls = :imageUrls')
      expressionAttributeNames['#imageUrls'] = 'imageUrls'
      expressionAttributeValues[':imageUrls'] = updates.imageUrls
    }
    
    if (updates.sortOrder !== undefined) {
      updateExpressions.push('#sortOrder = :sortOrder')
      expressionAttributeNames['#sortOrder'] = 'sortOrder'
      expressionAttributeValues[':sortOrder'] = updates.sortOrder
    }

    if (updates.showOnHomepage !== undefined) {
      updateExpressions.push('#showOnHomepage = :showOnHomepage')
      expressionAttributeNames['#showOnHomepage'] = 'showOnHomepage'
      expressionAttributeValues[':showOnHomepage'] = updates.showOnHomepage
    }

    // If no fields to update, return error
    if (updateExpressions.length === 0) {
      throw new Error("No valid fields provided for update")
    }

    const command = new UpdateCommand({
      TableName: ARTWORKS_TABLE_NAME,
      Key: { id },
      UpdateExpression: `set ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  
    try {
      const result = await docClient.send(command)
      return result.Attributes
    } catch (error) {
      console.error("Error updating artwork:", error)
      throw new Error("Failed to update artwork")
    }
  }
  

  export async function deleteArtwork(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: ARTWORKS_TABLE_NAME,
      Key: { id },
    })
    try {
      await docClient.send(command)
    } catch (error) {
      console.error("Error deleting artwork:", error)
    }
  }