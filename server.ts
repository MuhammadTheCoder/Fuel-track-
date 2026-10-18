import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import dotenv from 'dotenv';
import { estimateMealLocally } from './src/utils/localEstimator.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

// Generous body parsing limits for base64 image uploads (up to 15MB)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Simple in-memory sliding window rate limiter
const ipRequestTimestamps: Map<string, number[]> = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute per IP

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const timestamps = ipRequestTimestamps.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestTimestamps.set(ip, validTimestamps);
    return false;
  }
  validTimestamps.push(now);
  ipRequestTimestamps.set(ip, validTimestamps);
  return true;
};

// System instruction for food nutrition analysis
const NUTRITION_SYSTEM_INSTRUCTION = `
You are the world-class nutritional analysis engine for FuelTrack AI.
Your role is to accurately identify food items, estimate portion sizes, and calculate macronutrients (Calories in kcal, Protein in grams, Carbohydrates in grams, Fat in grams) from food photos or text descriptions.

CULTURE & FOOD COMPOSITION ACCURACY:
- Deeply knowledgeable about Pakistani, South Asian, Middle Eastern, and Western food composition.
- Specially recognize everyday Pakistani dishes accurately using authentic portion standards and verified food composition tables (e.g. USDA, FAO, Pakistan National Food Composition):
  * Roti / Chapati: ~100-130 kcal, ~3.2-3.8g protein per medium whole-wheat flatbread (~35g raw whole wheat flour).
  * Paratha: ~250-320 kcal, ~4g protein (depending on oil/ghee used for frying).
  * Puri: ~140-180 kcal, ~2.5g protein (deep fried).
  * Daal (Mash, Chana, Moong, Masoor): ~170-220 kcal, ~10-13g protein per standard cooked katori/bowl (approx 200g with moderate tadka).
  * Chana / Cholay gravy: ~220-270 kcal, ~11-13g protein per cup.
  * Chicken Biryani: ~450-580 kcal, ~22-28g protein per plate (~300-350g, 1.5 cups cooked rice + 1 chicken piece).
  * Chicken Pulao: ~400-500 kcal, ~18-24g protein per plate.
  * Chicken Karahi: ~280-360 kcal, ~28-34g protein per 150g portion (depends on gravy oil).
  * Mutton / Beef Karahi: ~350-450 kcal, ~26-32g protein per 150g portion.
  * Nihari / Haleem: ~420-550 kcal, ~24-32g protein per bowl.
  * Steamed / Boiled Basmati Rice: ~205 kcal, ~4.3g protein, ~45g carbs, ~0.4g fat per 1 cup cooked (~158g).
  * Chai (Pakistani tea with full-cream milk & sugar): ~100-140 kcal, ~3g protein, ~4-5g fat, ~14g carbs (if sweetened).
  * Chai without sugar: ~70-90 kcal, ~3g protein.
  * Whole milk dahi / yogurt: ~140 kcal, ~8g protein per cup.
  * Boiled egg: ~75 kcal, ~6.3g protein, ~0.6g carbs, ~5g fat.
  * Fried egg (with 1 tsp oil): ~95-110 kcal, ~6.3g protein, ~7-8g fat.
  * Medium potato (boiled/baked): ~150 kcal, ~4g protein, ~34g carbs.
  * Common fruits (banana ~105 kcal, apple ~95 kcal, mango ~130 kcal).
- Distinguish raw vs. cooked weights where relevant.
- Account for added oil, sugar, ghee, cream, and sauces when stated or typical of the cooking method.
- NEVER claim exact identification or exact calories from an image alone. Mark estimates as approximate.
- Assign a confidence rating ('high', 'medium', 'low') to each detected item.
- If an essential portion size or preparation method is ambiguous and significantly changes calories (e.g. oil/sugar/ghee level, size of serving), formulate a clear, polite follow-up question.

RESPONSE FORMAT:
You MUST respond with valid JSON matching this schema:
{
  "foods": [
    {
      "name": "boiled egg",
      "quantity": 2,
      "portion_description": "2 medium eggs",
      "calories_kcal": 150,
      "protein_g": 12.6,
      "carbs_g": 1.2,
      "fat_g": 10.0,
      "confidence": "medium"
    }
  ],
  "total_calories_kcal": 150,
  "total_protein_g": 12.6,
  "total_carbs_g": 1.2,
  "total_fat_g": 10.0,
  "assumptions": ["Portion sizes estimated based on standard serving sizes."],
  "needs_confirmation": false,
  "follow_up_question": null
}
Return only JSON. Do not include markdown code fence formatting outside the JSON if responseMimeType is used.
`;

// Helper: Clean and safely parse JSON from model output
function safeJsonParse(rawText: string): any {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/i, '').trim();
  }
  return JSON.parse(cleaned);
}

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Main Meal Analysis Endpoint
app.post('/api/analyze-meal', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    res.status(429).json({
      success: false,
      error: 'Too many analysis requests. Please wait a minute before submitting again.',
      canUseFallback: true,
    });
    return;
  }

  const { text, imageBase64, mimeType, userNotes } = req.body;

  if (!text && !imageBase64) {
    res.status(400).json({
      success: false,
      error: 'Please provide either a meal description or a photo.',
      canUseFallback: true,
    });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(503).json({
      success: false,
      error: 'Gemini API key is not configured on the server. You can still use manual entry or local estimation.',
      canUseFallback: true,
    });
    return;
  }

  try {
    let contents: any;

    if (imageBase64) {
      // Validate image format
      const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
      const effectiveMime = mimeType && validMimes.includes(mimeType) ? mimeType : 'image/jpeg';

      // Clean base64 data if it contains a data URI prefix
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      // Check max image base64 length (~10MB raw)
      if (cleanBase64.length > 14 * 1024 * 1024) {
        res.status(400).json({
          success: false,
          error: 'Image is too large. Please upload an image under 10MB.',
          canUseFallback: true,
        });
        return;
      }

      const promptText = userNotes
        ? `Analyze this meal photo. Additional notes from user: "${userNotes}". Identify foods, estimate portion sizes, calories (kcal), and macronutrients (protein, carbs, fat in grams).`
        : `Analyze this meal photo. Identify all visible foods, estimate portion sizes, calories (kcal), and macronutrients (protein, carbs, fat in grams).`;

      contents = {
        parts: [
          {
            inlineData: {
              mimeType: effectiveMime,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      };
    } else {
      // Text description analysis
      const textPrompt = `Analyze this meal description: "${text}".
Identify all distinct foods and quantities mentioned, cooking methods, and estimate portions.
Compute calories (kcal), protein (g), carbohydrates (g), and fat (g) based on verified food composition data.
State assumptions and ask a follow-up question if ingredients like oil, sugar, or portion sizes create large variance.`;

      contents = textPrompt;
    }

    const nutritionSchema = {
      type: Type.OBJECT,
      properties: {
        foods: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              portion_description: { type: Type.STRING },
              calories_kcal: { type: Type.NUMBER },
              protein_g: { type: Type.NUMBER },
              carbs_g: { type: Type.NUMBER },
              fat_g: { type: Type.NUMBER },
              confidence: { type: Type.STRING },
            },
            required: [
              'name',
              'quantity',
              'portion_description',
              'calories_kcal',
              'protein_g',
              'carbs_g',
              'fat_g',
              'confidence',
            ],
          },
        },
        total_calories_kcal: { type: Type.NUMBER },
        total_protein_g: { type: Type.NUMBER },
        total_carbs_g: { type: Type.NUMBER },
        total_fat_g: { type: Type.NUMBER },
        assumptions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        needs_confirmation: { type: Type.BOOLEAN },
        follow_up_question: { type: Type.STRING },
      },
      required: [
        'foods',
        'total_calories_kcal',
        'total_protein_g',
        'total_carbs_g',
        'total_fat_g',
        'assumptions',
        'needs_confirmation',
      ],
    };

    let rawResponseText: string | undefined;
    let lastError: any = null;

    try {
      const config: any = {
        systemInstruction: NUTRITION_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.2,
      };

      const callPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: config,
      });

      // 12-second timeout so the user never experiences long hangs
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timed out after 12 seconds')), 12000)
      );

      const response: any = await Promise.race([callPromise, timeoutPromise]);
      rawResponseText = response?.text;
    } catch (err: any) {
      lastError = err;
      console.warn('[FuelTrack] Gemini API call note:', err?.message || err);
    }

    // If Gemini was unavailable or timed out:
    if (!rawResponseText) {
      const fallbackQuery = text || userNotes;
      if (fallbackQuery) {
        console.log(`[FuelTrack] Using regional food composition fallback for: "${fallbackQuery}"`);
        const fallbackResult = estimateMealLocally(fallbackQuery);
        res.json({
          success: true,
          data: {
            ...fallbackResult,
            assumptions: [
              'AI service was temporarily busy; estimated using verified food composition tables.',
              ...(fallbackResult.assumptions || []),
            ],
            source: 'fallback',
          },
        });
        return;
      }

      // If photo without text notes could not be analyzed in time
      res.status(503).json({
        success: false,
        error: 'The AI vision service is currently experiencing high demand. Please describe your meal in text for an instant estimate.',
        canUseFallback: true,
      });
      return;
    }

    const parsedData = safeJsonParse(rawResponseText);

    // Validate and sanitize response structure
    if (!parsedData || !Array.isArray(parsedData.foods)) {
      throw new Error('Invalid format returned by AI model');
    }

    // Assign unique IDs to each food item and sanitize numbers
    const sanitizedFoods = parsedData.foods.map((food: any, idx: number) => ({
      id: `food-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name: String(food.name || 'Unknown food item'),
      quantity: Number(food.quantity) || 1,
      portion_description: String(food.portion_description || '1 serving'),
      calories_kcal: Math.max(0, Math.round(Number(food.calories_kcal) || 0)),
      protein_g: Math.max(0, Math.round((Number(food.protein_g) || 0) * 10) / 10),
      carbs_g: Math.max(0, Math.round((Number(food.carbs_g) || 0) * 10) / 10),
      fat_g: Math.max(0, Math.round((Number(food.fat_g) || 0) * 10) / 10),
      confidence: ['high', 'medium', 'low'].includes(food.confidence) ? food.confidence : 'medium',
    }));

    // Recalculate totals strictly from individual foods to prevent mathematical discrepancies
    const calculatedTotalCalories = sanitizedFoods.reduce((acc: number, f: any) => acc + f.calories_kcal, 0);
    const calculatedTotalProtein = Math.round(sanitizedFoods.reduce((acc: number, f: any) => acc + f.protein_g, 0) * 10) / 10;
    const calculatedTotalCarbs = Math.round(sanitizedFoods.reduce((acc: number, f: any) => acc + f.carbs_g, 0) * 10) / 10;
    const calculatedTotalFat = Math.round(sanitizedFoods.reduce((acc: number, f: any) => acc + f.fat_g, 0) * 10) / 10;

    const resultPayload = {
      foods: sanitizedFoods,
      total_calories_kcal: calculatedTotalCalories,
      total_protein_g: calculatedTotalProtein,
      total_carbs_g: calculatedTotalCarbs,
      total_fat_g: calculatedTotalFat,
      assumptions: Array.isArray(parsedData.assumptions) && parsedData.assumptions.length > 0
        ? parsedData.assumptions
        : ['Nutritional values estimated from standard verified food composition data.'],
      needs_confirmation: Boolean(parsedData.needs_confirmation) || sanitizedFoods.some((f: any) => f.confidence === 'low'),
      follow_up_question: parsedData.follow_up_question || null,
      source: 'ai' as const,
    };

    res.json({
      success: true,
      data: resultPayload,
    });
  } catch (err: any) {
    console.error('Error in /api/analyze-meal:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to analyze meal with AI.',
      canUseFallback: true,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: port,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[FuelTrack] Server running on port ${port} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[FuelTrack] Failed to start server:', err);
  process.exit(1);
});
