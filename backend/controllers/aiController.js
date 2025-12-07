import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const askAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "Question is required" });
    }

    const prompt = `
      You are an expert OS tutor. Explain answers in simple terms with examples.
      Question: ${question}
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // fast + cheap + reliable
    });

    const result = await model.generateContent(prompt);

    // Recommended method to extract text
    const response = result.response.text();

    res.json({ response });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({
      error: "AI service error. Try again later.",
      details: error.message,
    });
  }
};
