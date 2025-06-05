export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, plantName, species } = req.body;

    if (!prompt && !plantName) {
      return res.status(400).json({ error: 'Prompt or plant name is required' });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Hugging Face API key not configured' });
    }

    // Create the prompt
    const finalPrompt = prompt || createPlantPrompt(plantName, species);

    // Call Hugging Face API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: finalPrompt,
          parameters: {
            negative_prompt: "off-center, asymmetrical, tilted, angled view, cropped, cut off, partial plant, blurry, bad quality, distorted, ugly, cartoon, anime, dark background, colored background, outdoor, multiple plants, text, watermark",
            width: 512,
            height: 512,
            guidance_scale: 8.5,
            num_inference_steps: 50,
          },
          options: {
            wait_for_model: true
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Hugging Face API error:', error);
      return res.status(500).json({ error: 'Failed to generate image' });
    }

    // Get the image as a buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return res.status(200).json({ 
      success: true, 
      imageUrl: dataUrl,
      prompt: finalPrompt,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate image' 
    });
  }
}

function createPlantPrompt(plantName, species) {
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
    prompt += `healthy ${plantType} in white ceramic pot, PLANT CENTERED in frame, `;
  }
  
  // Enhanced style instructions for better centering
  prompt += "square 1:1 aspect ratio, plant occupies center 60% of frame, equal white space borders, ";
  prompt += "front facing view, eye level perspective, no tilt, no angle, perfect symmetry, ";
  prompt += "minimalist product photography, pure white seamless background, no shadows on background, ";
  prompt += "soft even lighting, no harsh shadows, professional studio photo, crisp focus on plant, ";
  prompt += "IMPORTANT: plant must be perfectly centered with equal space on all four sides";
  
  return prompt;
}