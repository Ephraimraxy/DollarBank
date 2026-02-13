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
        // Assuming gemini-2.0-flash is available, else fallback
        const model = 'gemini-2.0-flash';

        // Format messages for Gemini if needed, or pass directly if format matches
        // The previous frontend code was sending: { role, parts: [{text}] }

        const response = await ai.models.generateContent({
            model,
            contents: messages,
            config: {
                // Re-use system instructions from frontend or define here
                systemInstruction: `You are the Platinum Private Banking Concierge. 
             Maintain a formal, elite, and helpful tone. 
             Be discreet and never reveal sensitive credentials.`,
            }
        });

        res.json({ text: response.text });
    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({ error: 'AI Service Unavailable' });
    }
});

export default router;
