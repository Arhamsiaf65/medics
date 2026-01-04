require("dotenv").config();
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { HumanMessage, AIMessage, ToolMessage } = require("@langchain/core/messages");
const { BaseListChatMessageHistory } = require("@langchain/core/chat_history");
const { tool } = require("@langchain/core/tools");
const { PrismaClient } = require("@prisma/client");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { z } = require("zod");

const prisma = new PrismaClient();

if (!process.env.GEMINI_API_KEY) console.warn("⚠️ GEMINI_API_KEY not set!");

// --- Tools ---
const doctorSearchTool = tool(
  async ({ query, specialty }) => {
    const where = {};

    // If both are provided
    if (query && specialty) {
      where.AND = [
        { name: { contains: query, mode: "insensitive" } },
        { specialty: { contains: specialty, mode: "insensitive" } }
      ];
    }

    // If only query provided
    else if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { specialty: { contains: query, mode: "insensitive" } }
      ];
    }

    // If only specialty provided
    else if (specialty) {
      where.specialty = { contains: specialty, mode: "insensitive" };
    }

    const doctors = await prisma.doctor.findMany({
      where,
      select: {
        id: true,
        name: true,
        specialty: true,
        consultationFee: true,
        rating: true,
        distance: true,
      },
      take: 5,
    });

    if (doctors.length === 0) {
      return "No doctors found.";
    }

    return JSON.stringify(doctors);
  },
  {
    name: "search_doctors",
    description: "Search doctors by name or specialty.",
    schema: z.object({
      query: z.string().optional(),
      specialty: z.string().optional(),
    }),
  }
);


const drugSearchTool = tool(
  async ({ name, category }) => {
    const where = {};
    if (name) where.name = { contains: name, mode: "insensitive" };
    if (category) where.category = { contains: category, mode: "insensitive" };

    const drugs = await prisma.drug.findMany({
      where,
      select: { name: true, description: true, actualPrice: true, category: true, inStock: true },
      take: 5,
    });

    if (drugs.length === 0) return "No drugs found in inventory.";
    return JSON.stringify(drugs);
  },
  {
    name: "search_drugs",
    description: "Search medicines/drugs in inventory.",
    schema: z.object({ name: z.string().optional(), category: z.string().optional() }),
  }
);

const tools = [doctorSearchTool, drugSearchTool];
const toolsByName = { search_doctors: doctorSearchTool, search_drugs: drugSearchTool };

// --- Prisma Chat History Adapter ---
class PrismaChatMessageHistory extends BaseListChatMessageHistory {
  constructor(sessionId, userId) {
    super();
    this.sessionId = sessionId;
    this.userId = userId;
  }

  async getMessages(limit = 5) {
    const session = await prisma.aIChatSession.findUnique({
      where: { id: this.sessionId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!session) return [];
    const msgs = session.messages.map((msg) => {
      if (msg.role === "user") return new HumanMessage(msg.content);
      if (msg.role === "tool") return new ToolMessage({ content: msg.content, tool_call_id: "unknown" });
      return new AIMessage(msg.content);
    });
    return msgs.slice(-limit);
  }

  async addMessage(message) {
    let session = await prisma.aIChatSession.findUnique({ where: { id: this.sessionId } });
    if (!session) session = await prisma.aIChatSession.create({ data: { id: this.sessionId, userId: this.userId } });

    let role = "model";
    if (message instanceof HumanMessage) role = "user";
    else if (message instanceof ToolMessage) role = "system";
    if (role === "system") return;

    await prisma.aIChatMessage.create({
      data: {
        sessionId: this.sessionId,
        role,
        content: typeof message.content === "string" ? message.content : JSON.stringify(message.content),
      },
    });
  }
}

// --- Google Gemini Model Setup ---
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.3,
  maxOutputTokens: 400,
});

const modelWithTools = model.bindTools(tools);

// --- Chat Prompt ---
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are Dr. Medics, an AI hospital assistant. 
Rules to follow:
1. Analyze the user's symptoms and reason about causes.
2. Ask clarifying questions if unclear.
3. Provide guidance and empathy.
4. For minor conditions, suggest care and medicines if appropriate.
5. For serious/ambiguous conditions, or the user asks some consultant or doctor do suggest him the doctors available in our tools irrespective of his location but consider the symptoms and his disease type and suggest relevant doctor, explain risks and suggest relevant doctors.
6. Only use tools AFTER reasoning.
7. Always engage the user for clarification.
8. Summarize tool outputs in human-friendly way; never raw JSON.
9. Be professional, empathetic, concise.`
  ],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

// --- Helper: Summarize Tool Output ---
function summarizeToolOutput(toolOutput) {
  try {
    const data = typeof toolOutput === "string" ? JSON.parse(toolOutput) : toolOutput;
    if (Array.isArray(data)) {
      return data
        .map(
          (d, i) =>
            `${i + 1}. Dr. ${d.name}, Specialty: ${d.specialty}, Fee: ${d.consultationFee}, Rating: ${d.rating}/5, Distance: ${d.distance}`
        )
        .join("\n");
    }
    return String(data);
  } catch (e) {
    return String(toolOutput);
  }
}

// --- Helper: Extract AI text ---
function extractTextFromAI(aiResp) {
  if (!aiResp) return "";
  if (typeof aiResp.content === "string") return aiResp.content;
  if (Array.isArray(aiResp.content)) return aiResp.content.map(c => (typeof c === "string" ? c : JSON.stringify(c))).join("\n");
  return "";
}

// --- Main Chat Controller ---
exports.chatWithAI = async (req, res) => {
  try {
    const { message, sessionId: providedSessionId } = req.body;
    const userId = req.user.id;

    if (!message) return res.status(400).json({ error: "Message is required" });


    // --- Session Handling ---
    let sessionId = providedSessionId;
    if (!sessionId) {
      const lastSession = await prisma.aIChatSession.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      });
      sessionId = lastSession ? lastSession.id : (await prisma.aIChatSession.create({ data: { userId } })).id;
    }

    const history = new PrismaChatMessageHistory(sessionId, userId);
    const lastMessages = await history.getMessages(10);

    if (lastMessages.length === 0) {
      lastMessages.push(new AIMessage(
        "Hello! I'm Dr. Medics, your AI hospital assistant. How are you feeling today? Please share your symptoms."
      ));
    }

    // --- Invoke model with tools ---
    const chain = prompt.pipe(modelWithTools);
    const aiResponse = await chain.invoke({ history: lastMessages, input: message });

    let finalText = "";

    if (aiResponse.tool_calls?.length > 0) {
      const toolCall = aiResponse.tool_calls[0];
      const selectedTool = toolsByName[toolCall.name];
      let toolOutput = "";

      if (selectedTool) toolOutput = await selectedTool.invoke(toolCall.args);

      const summary = summarizeToolOutput(toolOutput);

      const followUp = await prompt.pipe(model).invoke({
        history: lastMessages.concat(new AIMessage("Fetching info for user...")),
        input: `Based on the user's query and tool output, provide a concise, friendly response:\n${summary}`,
      });

      finalText = extractTextFromAI(followUp);
    } else {
      finalText = extractTextFromAI(aiResponse);
    }

    // if (!finalText || finalText.length < 20) {
    //   finalText = "I found some relevant information. Could you please provide more details about your symptoms or location so I can give more specific recommendations?";
    // }

    // --- Save conversation ---
    await history.addMessage(new HumanMessage(message));
    await history.addMessage(new AIMessage(finalText));


    res.json({ sessionId, response: finalText });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: "Failed to process chat request." });
  }
};
