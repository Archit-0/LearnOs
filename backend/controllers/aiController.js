import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const askAI = async (req, res) => {
  const { question } = req.body;
  const prompt  = `You are an OS tutor. Answer this question in simple terms:
    Question: ${question}`
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};