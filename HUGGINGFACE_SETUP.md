# Hugging Face AI Image Generation Setup

This guide will help you set up the FREE Hugging Face API for AI-generated plant images.

## Step 1: Create a Hugging Face Account

1. Go to [https://huggingface.co/join](https://huggingface.co/join)
2. Sign up for a FREE account (no credit card required)
3. Verify your email address

## Step 2: Get Your API Token

1. Once logged in, click on your profile picture in the top right
2. Go to **Settings** → **Access Tokens**
3. Click **New token**
4. Give it a name like "TanaMind Plant Images"
5. Select **Read** permission (that's all we need)
6. Click **Generate token**
7. Copy the token that starts with `hf_...`

## Step 3: Add the API Key to Your Project

### For Local Development:

1. Create a `.env.local` file in your project root if it doesn't exist
2. Add the following line:
   ```
   VITE_HUGGINGFACE_API_KEY=hf_your_actual_token_here
   ```
3. Replace `hf_your_actual_token_here` with your actual token

### For Vercel Deployment:

1. Go to your Vercel dashboard
2. Select your TanaMind project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - Name: `HUGGINGFACE_API_KEY`
   - Value: Your Hugging Face token (the one starting with `hf_...`)
   - Environment: Production, Preview, Development
5. Click **Save**

## Step 4: Test the Implementation

1. Create a new plant in your application
2. Use a plant name like "Cactus", "Fern", "Succulent", or "Orchid"
3. The system will automatically generate an AI image for your plant
4. The image will appear in the plant card

## How It Works

- When you add a new plant, the system sends a request to generate an image
- The AI creates a unique image based on the plant name and species
- If the API is not configured or fails, it falls back to stock images
- Images are generated on-demand and cached for performance

## API Limits

The free Hugging Face tier includes:
- **Unlimited API calls** (with rate limiting)
- **No credit card required**
- Rate limit: ~30 requests per hour
- If you hit the limit, the system automatically falls back to stock images

## Troubleshooting

### Images not generating?
1. Check that your API key is correctly set in the environment variables
2. Verify the API key starts with `hf_`
3. Check the browser console for error messages
4. Ensure you're not hitting the rate limit

### Getting blurry or low-quality images?
The free tier uses Stable Diffusion 2.1, which provides good quality for most plants. The system is optimized for plant photography.

### Want to use a different model?
You can change the model in `/api/image-generate.js`. Some alternatives:
- `runwayml/stable-diffusion-v1-5` (faster, slightly lower quality)
- `prompthero/openjourney` (artistic style)
- `stabilityai/stable-diffusion-xl-base-1.0` (higher quality, slower)

## Additional Notes

- The first image generation might take 20-30 seconds as the model loads
- Subsequent generations are faster (~5-10 seconds)
- Images are 512x512 pixels, optimized for plant cards
- The system automatically adds photography-style prompts for better results