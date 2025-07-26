export interface BioItem {
    id: string
    name: string
    content: string
    imageUrl: string
  }
  
  export interface ArtworkItem {
    id: string
    title: string
    imageUrl: string
    category: string
    description: string
    dateCreated: string
    sortOrder?: number  // Optional field for controlling display order on homepage
    showOnHomepage?: boolean  // Optional field to control homepage visibility
  }