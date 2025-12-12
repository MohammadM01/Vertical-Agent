const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini Client
// WARNING: Ensure GEMINI_API_KEY is set in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
    res.send('Gemini Clinic Agent Backend Running');
});

// Endpoint for Multimodal Analysis
app.post('/api/analyze', async (req, res) => {
    try {
        const { prompt, image, history } = req.body;

        // Select model - using the latest available alias
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        let chat;
        if (history && history.length > 0) {
            chat = model.startChat({
                history: history.map(h => ({
                    role: h.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: h.text }]
                }))
            });
        } else {
            chat = model.startChat();
        }

        let result;
        if (image) {
            // Handle Image Input (Base64)
            // Note: For multi-turn chat with images, we might need a different flow or use generateContent directly
            // For now, let's assume single-turn multimodal or text-only chat
            const imagePart = {
                inlineData: {
                    data: image,
                    mimeType: "image/jpeg"
                }
            };
            result = await model.generateContent([prompt, imagePart]);
        } else {
            // Text-only chat
            result = await chat.sendMessage(prompt);
        }

        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error) {
        console.error("Error in analysis:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
