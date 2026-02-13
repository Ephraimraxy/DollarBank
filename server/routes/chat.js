import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/stream', authenticateToken, async (req, res) => {
    const { messages } = req.body;

    if (!process.env.GOOGLE_API_KEY) {
        return res.status(500).json({ error: 'AI Service Misconfigured' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
        
        // Use free-tier compatible models (gemini-1.5-flash or gemini-pro)
        // Try gemini-1.5-flash first (faster, free tier), fallback to gemini-pro
        const models = ['gemini-1.5-flash', 'gemini-pro'];
        let lastError = null;

        for (const model of models) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents: messages,
                    config: {
                        systemInstruction: `You are the Platinum Private Banking Concierge. 
                        Maintain a formal, elite, and helpful tone. 
                        Be discreet and never reveal sensitive credentials.`,
                    }
                });

                return res.json({ text: response.text });
            } catch (modelErr) {
                lastError = modelErr;
                // If it's a quota/rate limit error, try next model
                if (modelErr.status === 429 || modelErr.message?.includes('quota')) {
                    console.log(`Model ${model} quota exceeded, trying next...`);
                    continue;
                }
                // For other errors, break and return error
                break;
            }
        }

        // If all models failed, return appropriate error
        if (lastError?.status === 429) {
            console.error('AI Quota Error:', lastError.message);
            return res.status(503).json({ 
                error: 'AI concierge is temporarily unavailable due to high demand. Please try again in a moment.' 
            });
        }

        throw lastError || new Error('All models failed');
    } catch (err) {
        console.error('AI Error:', err);
        
        // Provide user-friendly error messages
        if (err.status === 429 || err.message?.includes('quota')) {
            return res.status(503).json({ 
                error: 'AI concierge is temporarily unavailable. Please try again later.' 
            });
        }
        
        if (err.message?.includes('API key') || err.status === 401) {
            return res.status(500).json({ 
                error: 'AI service configuration error. Please contact support.' 
            });
        }

        res.status(500).json({ error: 'AI Service Unavailable' });
    }
});

export default router;
