const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getTranscript } = require('./services/youtubeService');
const { analyzeTranscript, createPersonalizedTeacher } = require('./services/geminiService');

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Get transcript endpoint
app.post('/api/transcript', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const transcript = await getTranscript(url);
    
    if (!transcript || transcript.trim() === '') {
      return res.status(404).json({ error: 'No transcript available for this video' });
    }

    return res.json({ transcript });
  } catch (error) {
    console.error('Transcript endpoint error:', error);
    const statusCode = error.message.includes('No captions') ? 404 : 500;
    return res.status(statusCode).json({ 
      error: error.message || 'Failed to fetch transcript'
    });
  }
});

// Analyze transcript endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    if (typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript must be a string' });
    }

    if (transcript.trim() === '') {
      return res.status(400).json({ error: 'Transcript cannot be empty' });
    }

    const analysis = await analyzeTranscript(transcript);
    return res.json({ analysis });
  } catch (error) {
    console.error('Analysis endpoint error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to analyze transcript'
    });
  }
});

// Create personalized teacher endpoint
app.post('/api/create-teacher', async (req, res) => {
  console.log('Received create-teacher request:', req.body);
  try {
    const { analysis } = req.body;
    
    if (!analysis) {
      console.log('Analysis is missing from request');
      return res.status(400).json({ error: 'Analysis is required' });
    }

    if (typeof analysis !== 'string') {
      console.log('Analysis is not a string:', typeof analysis);
      return res.status(400).json({ error: 'Analysis must be a string' });
    }

    console.log('Creating personalized teacher with analysis...');
    const teacherProfile = await createPersonalizedTeacher(analysis);
    console.log('Teacher profile created successfully:', teacherProfile);
    return res.json({ teacherProfile });
  } catch (error) {
    console.error('Teacher creation error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to create personalized teacher'
    });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  console.log('Received chat request:', req.body);
  try {
    const { message, profile } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!profile) {
      return res.status(400).json({ error: 'Teacher profile is required' });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `You are ${profile.name}, a friendly and approachable teacher. Your role is to be supportive and make students feel comfortable.

Key characteristics:
- Teaching Style: ${profile.style}
- Communication Tone: ${profile.tone}
- Key Strengths: ${profile.strengths.join(', ')}
- Use of Analogies: ${profile.useAnalogies ? 'Yes' : 'No'}
- Step-by-Step Approach: ${profile.stepByStep ? 'Yes' : 'No'}

Important guidelines:
1. Keep responses short and conversational
2. Focus on being encouraging and supportive
3. Use simple, clear language
4. Don't focus on specific academic topics
5. Make the student feel comfortable and valued
6. Use your teaching style's communication patterns
7. Be warm and approachable
8. Keep responses under 3-4 sentences

Student's message: ${message}

Remember: Your goal is to be a supportive mentor, not to teach specific content. Focus on the student's comfort and engagement.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return res.json({ response: response.text() });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate response'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- POST /api/transcript');
  console.log('- POST /api/analyze');
  console.log('- POST /api/create-teacher');
  console.log('- POST /api/chat');
}); 