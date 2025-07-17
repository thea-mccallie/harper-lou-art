import React, { useState } from "react"
import Link from "next/link"

interface ArtworkCardProps {
  id: string
  title: string
  imageUrls: string[]
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({
  id,
  title,
  imageUrls
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={`/artwork/${id}`}>
      <div
        className="relative w-full max-w-s aspect-[1/.75] overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={imageUrls[0]}
          alt={title}
          className="w-full h-full object-cover"
        />
        {isHovered && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-opacity duration-100 p-2">
            <div className="text-center">
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
