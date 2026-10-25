import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Deep AI Dish Costing in South African Rands (ZAR)
app.post('/api/ai/cost-dish', async (req, res) => {
  try {
    const { dishName, category, description, serviceStyle } = req.body;
    if (!dishName) {
      return res.status(400).json({ error: 'dishName is required' });
    }

    const prompt = `You are the Executive Cost Controller & Master Chef at Rawdons Hotel & Brewery in Nottingham Road, KwaZulu-Natal Midlands, South Africa.
Analyze and calculate an accurate per-person ingredient food cost for the following banquet menu item from the official Rawdons Events Menu:

Dish Name: "${dishName}"
Category: "${category || 'Main Course'}"
Description / Context: "${description || ''}"
Service Style: "${serviceStyle || 'Buffet / Banquet'}"

Consider contemporary South African hospitality food supply costs in ZAR (Rands):
- Meats & Proteins (Midlands beef fillet, Karoo lamb, locally farmed trout, free-range poultry, calamari, pork belly)
- Produce & Starches (Farm butter, fresh cream, stoneground flours, basmati rice, potatoes, local herbs)
- Portion size for conference delegates (buffet portions vs plated portions)
- Standard 33% Food Cost Target (Food Cost % = (Cost per head / Selling Price) * 100).

Return your response in valid JSON matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dishName: { type: Type.STRING },
            category: { type: Type.STRING },
            estimatedCostPerHeadZAR: {
              type: Type.NUMBER,
              description: 'Estimated raw ingredient cost per delegate in South African Rands (ZAR)',
            },
            benchmarkSellingPriceZAR: {
              type: Type.NUMBER,
              description: 'Selling price needed to achieve exactly 33% food cost (cost / 0.33)',
            },
            portionSizeGrams: {
              type: Type.NUMBER,
              description: 'Typical banquet portion weight in grams',
            },
            keyIngredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  costEstimateZAR: { type: Type.NUMBER },
                },
                required: ['item', 'costEstimateZAR'],
              },
            },
            chefRationale: {
              type: Type.STRING,
              description: 'Brief 1-2 sentence culinary explanation of portioning and Nottingham Road sourcing',
            },
            dietaryTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            costEfficiencyRating: {
              type: Type.STRING,
              description: 'High Margin, Moderate Margin, or Premium Item',
            },
          },
          required: [
            'dishName',
            'estimatedCostPerHeadZAR',
            'benchmarkSellingPriceZAR',
            'portionSizeGrams',
            'keyIngredients',
            'chefRationale',
            'dietaryTags',
            'costEfficiencyRating',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error costing dish with Gemini:', error);
    return res.status(500).json({
      error: 'Failed to cost dish with AI',
      message: error?.message || 'Internal server error',
    });
  }
});

// Endpoint: Deep AI Menu Engineering & 33% Food Cost Optimization
app.post('/api/ai/optimize-menu', async (req, res) => {
  try {
    const { selectedDishes, packageSellingPrice, delegateCount, mealType } = req.body;
    if (!Array.isArray(selectedDishes) || selectedDishes.length === 0) {
      return res.status(400).json({ error: 'selectedDishes array is required' });
    }

    const price = Number(packageSellingPrice) || 680;
    const prompt = `You are the Executive Head Chef & Financial Controller at Rawdons Hotel & Brewery in Nottingham Road, KZN Midlands.
You are reviewing a conference banquet menu selection to enforce the strict 33.0% Food Cost Target.

Package Selling Price: R${price} per delegate
Delegate Count: ${delegateCount || 45} pax
Meal Type: ${mealType || 'Full-Day Conference with Banquet Lunch & Dinner'}

Selected Menu Items:
${JSON.stringify(selectedDishes, null, 2)}

Provide a thorough culinary & financial analysis:
1. Calculate the total food cost per head and the resulting food cost percentage.
2. Determine if the 33.0% food cost target is achieved (Compliant <= 33.0%, or Over Budget > 33.0%).
3. If over 33.0%, provide specific, realistic dish swaps, protein portion adjustments, or package pricing changes to hit 33.0% without sacrificing Rawdons' renowned Midlands country hospitality.
4. If under 33.0%, highlight high-margin win items and potential luxury garnish enhancements.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalEstimatedCostPerHeadZAR: { type: Type.NUMBER },
            foodCostPercentage: { type: Type.NUMBER },
            isTargetMet: { type: Type.BOOLEAN },
            targetDifferencePercentage: { type: Type.NUMBER },
            grossProfitPerHeadZAR: { type: Type.NUMBER },
            chefExecutiveSummary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: 'Swap, Portion Adjustment, or Pricing' },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  potentialSavingsZAR: { type: Type.NUMBER },
                },
                required: ['type', 'title', 'description', 'potentialSavingsZAR'],
              },
            },
          },
          required: [
            'totalEstimatedCostPerHeadZAR',
            'foodCostPercentage',
            'isTargetMet',
            'grossProfitPerHeadZAR',
            'chefExecutiveSummary',
            'recommendations',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error optimizing menu with Gemini:', error);
    return res.status(500).json({
      error: 'Failed to optimize menu with AI',
      message: error?.message || 'Internal server error',
    });
  }
});

// Mount Vite or serve static assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rawdons Conference Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
