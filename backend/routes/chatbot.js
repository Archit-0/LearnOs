const express = require("express");
const axios = require("axios");
const ChatHistory = require("../models/ChatHistory");
const auth = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = `... your system prompt ...`;

// ---------------------
// CHAT ROUTE
// ---------------------
router.post("/chat", auth, async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message is required" });
    }

    const currentSessionId = sessionId || uuidv4();

    // Safe user preference
    const userLevel =
      context?.userLevel || req?.user?.preferences?.difficulty || "beginner";

    // Load or create chat history
    let chatHistory = await ChatHistory.findOne({
      user: req.user._id,
      sessionId: currentSessionId,
    });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        user: req.user._id,
        sessionId: currentSessionId,
        messages: [],
        context: context || {},
      });
    }

    // Add user message
    chatHistory.messages.push({
      role: "user",
      content: message,
      context: context || {},
    });

    // Limit chat history
    chatHistory.messages = chatHistory.messages.slice(-20);

    const conversation = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatHistory.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Add advanced context
    if (context) {
      const topics = Array.isArray(context.topics)
        ? context.topics.join(", ")
        : "";

      conversation.unshift({
        role: "system",
        content: `User level: ${userLevel}. Module: ${
          context.currentModule || "N/A"
        }. Topics: ${topics}.`,
      });
    }

    // No API key → fallback
    if (!OPENAI_API_KEY) {
      const fallback = generateFallbackResponse(message);

      chatHistory.messages.push({
        role: "assistant",
        content: fallback,
      });

      await chatHistory.save();

      return res.json({
        response: fallback,
        sessionId: currentSessionId,
      });
    }

    // Call OpenAI
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: conversation,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    chatHistory.messages.push({
      role: "assistant",
      content: aiResponse,
    });

    await chatHistory.save();

    res.json({
      response: aiResponse,
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    const fallback = generateFallbackResponse(req.body?.message || "");

    return res.status(500).json({
      response: fallback,
      sessionId: req.body.sessionId || uuidv4(),
      error: "AI service temporarily unavailable",
    });
  }
});

// ---------------------
// GET HISTORY
// ---------------------
router.get("/history/:sessionId", auth, async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({
      user: req.user._id,
      sessionId: req.params.sessionId,
    });

    res.json({
      messages: chatHistory?.messages || [],
      context: chatHistory?.context || {},
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------
// DELETE HISTORY
// ---------------------
router.delete("/history/:sessionId", auth, async (req, res) => {
  try {
    await ChatHistory.deleteOne({
      user: req.user._id,
      sessionId: req.params.sessionId,
    });

    res.json({ message: "Chat history cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------
// FALLBACK GENERATOR
// ---------------------

function generateFallbackResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes("process") && msg.includes("scheduling"))
    return "Process scheduling decides which process uses the CPU next...";

  if (msg.includes("deadlock"))
    return "Deadlock occurs when processes are blocked forever...";

  if (msg.includes("memory") || msg.includes("paging"))
    return "Memory management includes paging, segmentation...";

  if (msg.includes("semaphore"))
    return "Semaphores help in process synchronization...";

  return "I'm here to help you learn Operating Systems! What topic would you like to explore?";
}

module.exports = router;
