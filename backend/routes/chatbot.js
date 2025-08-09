const express = require('express');
const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// System prompt for OS tutor
const SYSTEM_PROMPT = `You are an expert Operating Systems tutor designed to help students learn OS concepts. Your goals are:

1. Explain concepts clearly and in student-friendly language
2. Use analogies and real-world examples
3. Break down complex topics into digestible parts
4. Encourage critical thinking with guided questions
5. Adapt explanations based on student's level (beginner/intermediate/advanced)
6. Focus on practical understanding, not just theory
7. Help debug and explain code related to OS concepts

Topics you cover:
- Process Management & Scheduling
- CPU Scheduling Algorithms (FCFS, SJF, Round Robin, etc.)
- Deadlock Detection & Prevention
- Synchronization (Semaphores, Mutexes, etc.)
- Memory Management (Paging, Segmentation, Virtual Memory)
- File Systems & I/O Management

Always be encouraging and patient. If a student seems confused, try a different approach or analogy.`;

// Chat with AI tutor
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const currentSessionId = sessionId || uuidv4();

    // Get or create chat history
    let chatHistory = await ChatHistory.findOne({
      user: req.user._id,
      sessionId: currentSessionId
    });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        user: req.user._id,
        sessionId: currentSessionId,
        messages: [],
        context: context || {}
      });
    }

    // Add user message to history
    chatHistory.messages.push({
      role: 'user',
      content: message,
      context: context || {}
    });

    // Prepare conversation for OpenAI
    const conversation = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory.messages.slice(-10).map(msg => ({ // Keep last 10 messages for context
        role: msg.role,
        content: msg.content
      }))
    ];

    // Add context information if available
    if (context?.currentModule || context?.topics) {
      const contextPrompt = `Current context: ${context.currentModule ? `Module: ${context.currentModule}` : ''} ${context.topics ? `Topics: ${context.topics.join(', ')}` : ''} User Level: ${context.userLevel || req.user.preferences.difficulty}`;
      conversation.splice(1, 0, { role: 'system', content: contextPrompt });
    }

    if (!OPENAI_API_KEY) {
      // Fallback response when OpenAI key is not configured
      const fallbackResponse = generateFallbackResponse(message);
      
      chatHistory.messages.push({
        role: 'assistant',
        content: fallbackResponse,
        context: context || {}
      });

      await chatHistory.save();

      return res.json({
        response: fallbackResponse,
        sessionId: currentSessionId
      });
    }

    // Call OpenAI API
    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: conversation,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const aiResponse = response.data.choices[0].message.content;

    // Add AI response to history
    chatHistory.messages.push({
      role: 'assistant',
      content: aiResponse,
      context: context || {}
    });

    await chatHistory.save();

    res.json({
      response: aiResponse,
      sessionId: currentSessionId
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Provide fallback response on error
    const fallbackResponse = generateFallbackResponse(req.body.message);
    res.json({
      response: fallbackResponse,
      sessionId: req.body.sessionId || uuidv4(),
      error: 'AI service temporarily unavailable'
    });
  }
});

// Get chat history
router.get('/history/:sessionId', auth, async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({
      user: req.user._id,
      sessionId: req.params.sessionId
    });

    if (!chatHistory) {
      return res.json({ messages: [] });
    }

    res.json({
      messages: chatHistory.messages,
      context: chatHistory.context
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear chat history
router.delete('/history/:sessionId', auth, async (req, res) => {
  try {
    await ChatHistory.deleteOne({
      user: req.user._id,
      sessionId: req.params.sessionId
    });

    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fallback response generator
function generateFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('process') && lowerMessage.includes('scheduling')) {
    return "Process scheduling is about determining which process runs next on the CPU. Common algorithms include FCFS (First Come First Served), SJF (Shortest Job First), and Round Robin. Would you like me to explain any specific scheduling algorithm?";
  }
  
  if (lowerMessage.includes('deadlock')) {
    return "Deadlock occurs when processes are blocked forever, waiting for each other. The four conditions for deadlock are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. We can prevent deadlock by breaking any of these conditions. Which aspect would you like to explore?";
  }
  
  if (lowerMessage.includes('memory') || lowerMessage.includes('paging')) {
    return "Memory management is crucial in OS. Paging divides memory into fixed-size blocks called pages, while segmentation divides it into variable-size segments. Virtual memory allows processes to use more memory than physically available. What specific memory concept interests you?";
  }
  
  if (lowerMessage.includes('semaphore') || lowerMessage.includes('synchronization')) {
    return "Synchronization ensures processes access shared resources safely. Semaphores are counters that control access - binary semaphores work like locks, while counting semaphores allow multiple accesses. Mutexes provide mutual exclusion. Need help with a specific synchronization problem?";
  }
  
  return "I'm here to help you learn Operating Systems! I can explain concepts like process scheduling, memory management, deadlocks, synchronization, file systems, and more. What specific topic would you like to explore?";
}

module.exports = router;
