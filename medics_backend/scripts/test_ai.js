
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
require('dotenv').config();

async function testGeneric() {
    console.log("Testing Google Gemini Connection...");
    if (!process.env.GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY not found in env");
        return;
    }

    try {
        const model = new ChatGoogleGenerativeAI({
            modelName: "gemini-pro",
            apiKey: process.env.GEMINI_API_KEY,
        });

        const response = await model.invoke("Hello, are you ready to help with medical questions? Answer with yes or no.");
        console.log("Response:", response.content);

        if (response.content.toLowerCase().includes('yes')) {
            console.log("✅ API Connection Successful");
        } else {
            console.log("⚠️ API Connection verified but unexpected response.");
        }

    } catch (e) {
        console.error("❌ API Connection Failed:", e.message);
    }
}

testGeneric();
