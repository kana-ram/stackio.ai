require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the correct model: gemini-1.5-flash (faster) or gemini-pro (more powerful)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getGeminiResponse(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("❌ Gemini API error:", error.response?.data || error.message);
    throw new Error("Failed to fetch response from Gemini.");
  }
}

module.exports = { getGeminiResponse };
