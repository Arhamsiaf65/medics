
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
// const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { PrismaClient } = require("@prisma/client");

require('dotenv').config();

const prisma = new PrismaClient();

async function testTool() {
    console.log("Testing Doctor Search Tool...");

    // 1. Mock Tool (to avoid hitting DB in unit test if preferred, but we'll use real DB logic for integration test)
    const doctorSearchTool = tool(
        async ({ query, specialty }) => {
            console.log(`[TOOL CALL] Searching for: ${query}, Specialty: ${specialty}`);

            const whereClause = {};

            if (specialty) {
                whereClause.specialty = { contains: specialty, mode: "insensitive" };
            }

            if (query) {
                if (!specialty) {
                    whereClause.OR = [
                        { name: { contains: query, mode: "insensitive" } },
                        { specialty: { contains: query, mode: "insensitive" } }
                    ];
                } else {
                    whereClause.name = { contains: query, mode: "insensitive" };
                }
            }

            // Simplified DB call simulation 
            // In real run this goes to DB.
            const doctors = await prisma.doctor.findMany({
                where: whereClause,
                take: 5
            });

            if (doctors.length === 0) return "No doctors found matching criteria.";
            return JSON.stringify(doctors.map(d => ({ name: d.name, specialty: d.specialty, fee: d.consultationFee })));
        },
        {
            name: "search_doctors",
            description: "Search for doctors.",
            schema: z.object({
                query: z.string().optional(),
                specialty: z.string().optional()
            }),
        }
    );

    // const tools = [doctorSearchTool];

    // const model = new ChatGoogleGenerativeAI({
    //     apiKey: process.env.GEMINI_API_KEY,
    //     model: "gemini-2.5-flash",
    // });

    // const prompt = ChatPromptTemplate.fromMessages([
    //     ["system", "You are a medical assistant. Use tools to find doctors."],
    //     ["human", "{input}"],
    //     new MessagesPlaceholder("agent_scratchpad"),
    // ]);

    // const agent = createToolCallingAgent({
    //     llm: model,
    //     tools,
    //     prompt,
    // });

    // const executor = new AgentExecutor({
    //     agent,
    //     tools,
    //     verbose: true, // Show thought process
    // });

    try {
        // Direct Tool Test to verify logic without Agent overhead/imports issue
        console.log("--- TEST 1: Search by Specialty (Nuerologist) ---");
        const res1 = await doctorSearchTool.invoke({ query: "", specialty: "Nuerologist" });
        console.log("Result 1:", res1);

        console.log("\n--- TEST 2: Search by Name (Fasih) ---");
        const res2 = await doctorSearchTool.invoke({ query: "Fasih", specialty: "" });
        console.log("Result 2:", res2);

        // const result = await executor.invoke({ input: "I need a cardiologist." });
        // console.log("FINAL OUTPUT:", result.output);
    } catch (e) {
        console.error("Agent Error:", e);
    }
}

testTool();
