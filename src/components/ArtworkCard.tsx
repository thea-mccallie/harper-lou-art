import React, { useState } from "react"
import Link from "next/link"

// Props interface for ArtworkCard component
interface ArtworkCardProps {
  id: string        // Unique identifier for the artwork
  title: string     // Display title of the artwork
  imageUrls: string[] // Array of image URLs (first one used as thumbnail)
}

/**
 * ArtworkCard Component
 * 
 * Displays an artwork as a clickable card with hover effects.
 * Shows the first image as a thumbnail with title overlay on hover.
 * Links to the detailed artwork page when clicked.
 * 
 * @param id - Unique artwork identifier for routing
 * @param title - Artwork title displayed on hover
 * @param imageUrls - Array of image URLs (uses first image as thumbnail)
 */
const ArtworkCard: React.FC<ArtworkCardProps> = ({
  id,
  title,
  imageUrls
}) => {
  // State to track hover status for overlay display
  const [isHovered, setIsHovered] = useState(false)

  return (
    // Wrapper Link - navigates to artwork detail page
    <Link href={`/artwork/${id}`}>
      <div
        className="relative w-full max-w-s aspect-square overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Artwork Thumbnail Image */}
        <img
          src={imageUrls[0]} // Uses first image as thumbnail
          alt={title}
          className="w-full h-full object-contain bg-transparent"
        />
        
        {/* Hover Overlay - shows title when card is hovered */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-opacity duration-100 p-2">
            <div className="text-center">
              {/* Artwork Title */}
              <h3 className="text-white text-xl font-montserrat mb-1">
                {title}
              </h3>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

export default ArtworkCard
