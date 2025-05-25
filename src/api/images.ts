/**
 * Plant image generation service
 * Uses Unsplash API to fetch high-quality plant images
 */

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'demo';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  description: string;
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
}

interface PlantImageOptions {
  plantName: string;
  species?: string;
  size?: 'thumb' | 'small' | 'regular' | 'full';
}

/**
 * Generate a plant image URL using Unsplash API
 */
export async function generatePlantImage(options: PlantImageOptions): Promise<string | null> {
  const { plantName, species, size = 'regular' } = options;
  
  try {
    // Build search query
    const searchQuery = species ? `${plantName} ${species} plant` : `${plantName} plant`;
    
    // If using demo key, return a placeholder image
    if (UNSPLASH_ACCESS_KEY === 'demo') {
      return getPlaceholderImage(plantName);
    }
    
    // Search for plant images
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=10&orientation=square`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error('Unsplash API error:', response.status);
      return getPlaceholderImage(plantName);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Pick a random image from the first 5 results for variety
      const randomIndex = Math.floor(Math.random() * Math.min(5, data.results.length));
      const photo: UnsplashPhoto = data.results[randomIndex];
      
      // Add Unsplash parameters for optimization
      const imageUrl = `${photo.urls[size]}&w=800&h=800&fit=crop&crop=center`;
      
      // Track download for Unsplash guidelines
      if (photo.urls.regular) {
        trackUnsplashDownload(photo.id);
      }
      
      return imageUrl;
    }
    
    return getPlaceholderImage(plantName);
  } catch (error) {
    console.error('Error generating plant image:', error);
    return getPlaceholderImage(plantName);
  }
}

/**
 * Track image download per Unsplash guidelines
 */
async function trackUnsplashDownload(photoId: string): Promise<void> {
  try {
    await fetch(
      `${UNSPLASH_API_URL}/photos/${photoId}/download`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );
  } catch (error) {
    console.error('Error tracking Unsplash download:', error);
  }
}

/**
 * Get a placeholder image based on plant name
 */
function getPlaceholderImage(plantName: string): string {
  // Use a deterministic placeholder based on plant name
  const placeholders = [
    'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=800&h=800&fit=crop', // Green plant
    'https://images.unsplash.com/photo-1493957988430-a5f2e15f39a3?w=800&h=800&fit=crop', // Potted plant
    'https://images.unsplash.com/photo-1521334884684-d80222895322?w=800&h=800&fit=crop', // Succulent
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=800&fit=crop', // Cactus
    'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&h=800&fit=crop', // Leafy plant
  ];
  
  // Use plant name to select a consistent placeholder
  const index = plantName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % placeholders.length;
  return placeholders[index];
}

/**
 * Alternative: Generate image using AI (requires API key)
 * This is a placeholder for future AI integration
 */
export async function generatePlantImageWithAI(plantName: string, species?: string): Promise<string | null> {
  // This could integrate with:
  // - OpenAI DALL-E API
  // - Replicate API (Stable Diffusion)
  // - Midjourney API (when available)
  
  // For now, fallback to Unsplash
  return generatePlantImage({ plantName, species });
}

// Export a simple function for easy use
export const getPlantImage = (plantName: string, species?: string) => 
  generatePlantImage({ plantName, species });