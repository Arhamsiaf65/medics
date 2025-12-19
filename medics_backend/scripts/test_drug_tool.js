
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { PrismaClient } = require("@prisma/client");

require('dotenv').config();

const prisma = new PrismaClient();

async function testDrugTool() {
    console.log("Testing Drug Search Tool...");

    // Mocking the tool logic for standalone test
    const drugSearchTool = tool(
        async ({ name, category }) => {
            console.log(`[TOOL CALL] Searching for Drug: ${name}, Category: ${category}`);
            const where = {};
            if (name) where.name = { contains: name, mode: 'insensitive' };
            if (category) where.category = { contains: category, mode: 'insensitive' };

            const drugs = await prisma.drug.findMany({
                where,
                select: { name: true, category: true, actualPrice: true }
            });
            return JSON.stringify(drugs);
        },
        {
            name: "search_drugs",
            description: "Search for drugs.",
            schema: z.object({
                name: z.string().optional(),
                category: z.string().optional()
            }),
        }
    );

    const tools = [drugSearchTool];
    const model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        model: "gemini-2.5-flash",
    });

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a concise pharmacy assistant. Use tools."],
        ["human", "{input}"],
        new MessagesPlaceholder("agent_scratchpad"), // Note: For AgentExecutor only
    ]);

    // Just testing tool execution logic directly for speed
    try {
        const result = await drugSearchTool.invoke({ name: "Panadol" });
        console.log("TOOL OUTPUT:", result);
    } catch (e) {
        console.error("Tool Error:", e);
    }
}

testDrugTool();
