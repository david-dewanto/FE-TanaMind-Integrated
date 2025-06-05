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
 * Get a curated, well-centered plant image based on plant type
 */
function getCuratedPlantImage(plantName: string, species?: string): string {
  const plantType = (species || plantName).toLowerCase();
  
  // Curated images that are well-centered and properly cropped
  const curatedImages: Record<string, string> = {
    // Cacti
    'cactus': 'https://images.unsplash.com/photo-1519336056116-bc0f1771dec8?w=800&h=800&fit=crop&crop=center',
    'prickly pear': 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=800&h=800&fit=crop&crop=center',
    'barrel cactus': 'https://images.unsplash.com/photo-1528475478853-5b89bed65c4c?w=800&h=800&fit=crop&crop=center',
    
    // Succulents
    'succulent': 'https://images.unsplash.com/photo-1521503862198-2ae9a997bbc9?w=800&h=800&fit=crop&crop=center',
    'aloe vera': 'https://images.unsplash.com/photo-1567689265664-1c48de61db0b?w=800&h=800&fit=crop&crop=center',
    'jade plant': 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&h=800&fit=crop&crop=center',
    'echeveria': 'https://images.unsplash.com/photo-1522444432501-2ae906773d99?w=800&h=800&fit=crop&crop=center',
    
    // Ferns
    'fern': 'https://images.unsplash.com/photo-1598880940371-c756e015faf1?w=800&h=800&fit=crop&crop=center',
    'boston fern': 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=800&h=800&fit=crop&crop=center',
    
    // Popular houseplants
    'snake plant': 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=800&h=800&fit=crop&crop=center',
    'pothos': 'https://images.unsplash.com/photo-1602923668104-8f9e03dd2c94?w=800&h=800&fit=crop&crop=center',
    'monstera': 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&h=800&fit=crop&crop=center',
    'peace lily': 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=800&h=800&fit=crop&crop=center',
    'fiddle leaf fig': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&crop=center',
    'rubber plant': 'https://images.unsplash.com/photo-1602923668104-8f9e03dd2c94?w=800&h=800&fit=crop&crop=center',
    'zz plant': 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=800&h=800&fit=crop&crop=center',
    
    // Orchids
    'orchid': 'https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=800&h=800&fit=crop&crop=center',
    
    // Default centered plant images
    'default1': 'https://images.unsplash.com/photo-1521334884684-d80222895322?w=800&h=800&fit=crop&crop=center',
    'default2': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=800&fit=crop&crop=center',
    'default3': 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&h=800&fit=crop&crop=center',
  };
  
  // Try to find exact match
  for (const [key, url] of Object.entries(curatedImages)) {
    if (plantType.includes(key) || key.includes(plantType)) {
      return url;
    }
  }
  
  // Return a random default centered image
  const defaultImages = ['default1', 'default2', 'default3'];
  const randomDefault = defaultImages[Math.floor(Math.random() * defaultImages.length)];
  return curatedImages[randomDefault];
}

/**
 * Generate plant image using Hugging Face's free AI models
 */
export async function generatePlantImageWithAI(plantName: string, species?: string): Promise<string | null> {
  try {
    // Get API key from environment variable
    const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    
    if (!HF_API_KEY || HF_API_KEY === 'your-api-key-here') {
      console.log('Hugging Face API key not configured, using curated plant images');
      return getCuratedPlantImage(plantName, species);
    }

    // Create a descriptive prompt for the plant
    const prompt = createPlantPrompt(plantName, species);
    
    // Call our backend API endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch('/api/image-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plantName,
        species,
        prompt
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      console.error('Image generation API error:', error);
      return getCuratedPlantImage(plantName, species);
    }

    const data = await response.json();
    
    if (data.success && data.imageUrl) {
      // Validate that the image is a valid data URL
      if (data.imageUrl.startsWith('data:image/')) {
        return data.imageUrl;
      }
    }
    
    console.error('Invalid response from image generation API');
    return getCuratedPlantImage(plantName, species);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Image generation timeout');
    } else {
      console.error('Error generating AI plant image:', error);
    }
    return getCuratedPlantImage(plantName, species);
  }
}

/**
 * Create an optimized prompt for plant image generation
 */
function createPlantPrompt(plantName: string, species?: string): string {
  const plantType = species || plantName;
  
  // Enhanced prompt with stronger centering emphasis
  let prompt = `CENTERED ${plantType} plant, MIDDLE of frame, symmetrical composition, `;
  
  // Add specific characteristics based on plant type
  if (plantType.toLowerCase().includes('cactus')) {
    prompt += "desert cactus in white ceramic pot, spines visible, CENTERED in square frame, equal space on all sides, ";
  } else if (plantType.toLowerCase().includes('fern')) {
    prompt += "lush fern with green fronds in white pot, PLANT IN CENTER, symmetrical leaves, ";
  } else if (plantType.toLowerCase().includes('succulent')) {
    prompt += "succulent with thick leaves in white pot, CENTERED rosette shape, equal margins, ";
  } else if (plantType.toLowerCase().includes('orchid')) {
    prompt += "orchid with elegant flowers in white pot, STEM CENTERED, balanced petals, ";
  } else if (plantType.toLowerCase().includes('snake plant')) {
    prompt += "snake plant with tall vertical leaves in white pot, CENTERED upright position, ";
  } else if (plantType.toLowerCase().includes('monstera')) {
    prompt += "monstera with split leaves in white pot, CENTERED tropical plant, ";
  } else {
    prompt += "healthy ${plantType} in white ceramic pot, PLANT CENTERED in frame, ";
  }
  
  // Enhanced style instructions for better centering
  prompt += "square 1:1 aspect ratio, plant occupies center 60% of frame, equal white space borders, ";
  prompt += "front facing view, eye level perspective, no tilt, no angle, perfect symmetry, ";
  prompt += "minimalist product photography, pure white seamless background, no shadows on background, ";
  prompt += "soft even lighting, no harsh shadows, professional studio photo, crisp focus on plant, ";
  prompt += "IMPORTANT: plant must be perfectly centered with equal space on all four sides";
  
  return prompt;
}

/**
 * Enhanced plant image generation with multiple fallback strategies
 */
export async function getPlantImageEnhanced(plantName: string, species?: string): Promise<string> {
  // Try AI generation first
  const aiImage = await generatePlantImageWithAI(plantName, species);
  if (aiImage) return aiImage;
  
  // Fallback to curated images
  return getCuratedPlantImage(plantName, species);
}

// Export a simple function for easy use - prioritize AI generation
export const getPlantImage = (plantName: string, species?: string) => 
  getPlantImageEnhanced(plantName, species);