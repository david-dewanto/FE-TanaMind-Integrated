import React, { useState, useEffect } from 'react';
import { getPlantImage } from '../../api/images';
import { Loader2 } from 'lucide-react';

interface PlantImageProps {
  plantName: string;
  species?: string;
  className?: string;
  fallbackImage?: string;
}

const PlantImage: React.FC<PlantImageProps> = ({ 
  plantName, 
  species, 
  className = "w-full h-full object-cover object-center",
  fallbackImage = 'https://images.unsplash.com/photo-1521334884684-d80222895322?w=800&h=800&fit=crop&crop=center'
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Try to generate AI image
        const generatedUrl = await getPlantImage(plantName, species);
        
        if (mounted && generatedUrl) {
          // Preload the image to check if it's valid
          const img = new Image();
          img.onload = () => {
            if (mounted) {
              setImageUrl(generatedUrl);
              setIsLoading(false);
            }
          };
          img.onerror = () => {
            if (mounted) {
              setImageUrl(fallbackImage);
              setHasError(true);
              setIsLoading(false);
            }
          };
          img.src = generatedUrl;
        } else if (mounted) {
          setImageUrl(fallbackImage);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading plant image:', error);
        if (mounted) {
          setImageUrl(fallbackImage);
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [plantName, species, fallbackImage]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img 
        src={imageUrl || fallbackImage} 
        alt={plantName} 
        className={className}
        style={{
          objectPosition: 'center center',
          imageRendering: 'crisp-edges'
        }}
        onError={(e) => {
          e.currentTarget.src = fallbackImage;
        }}
      />
    </div>
  );
};

export default PlantImage;