"use client"
import React, { useEffect, useState } from 'react';

interface BioItem {
  id: string;
  name: string;
  content: string;
  imageUrl: string;
}

const BioFooter: React.FC = () => {
  const [bio, setBio] = useState<BioItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBio = async () => {
      try {
        const response = await fetch('/api/bio');
        if (!response.ok) {
          throw new Error('Failed to fetch bio');
        }
        const data = await response.json();
        setBio(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBio();
  }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!bio) {
    return <div>No bio available</div>;
  }

    return (
         <footer id="about" className="bio-footer">
      <div className="bio-container">
        <h2 className="bio-name">About {bio.name}</h2>
        <div className="bio-content">
          <img src={bio.imageUrl} alt={bio.name} className="bio-image" />
          <div className="bio-details">
            <p>{bio.content}</p>
          </div>
        </div>
      </div>
    </footer>
    );
}

export default BioFooter;