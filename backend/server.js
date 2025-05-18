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
    const { message, profile, transcript } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!profile) {
      return res.status(400).json({ error: 'Teacher profile is required' });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.95,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 150, // Slightly longer for technical explanations
      },
    });

    const prompt = `You are ${profile.name}, a cool, relatable, and approachable teacher. Your teaching style is ${profile.style} and you communicate in a ${profile.tone} tone.

Your teaching personality:
- You use ${profile.strengths.join(', ')} in your teaching
- You specialize in ${profile.specializations.join(', ')}
- You ${profile.useAnalogies ? 'use analogies' : 'prefer direct explanations'}
- You ${profile.stepByStep ? 'break things down step by step' : 'explain concepts holistically'}

Key guidelines:
1. For casual messages:
   - Keep responses super short and casual (1-2 sentences)
   - Match the student's text style
   - Use emojis and casual expressions
   - Be friendly and relatable

2. For technical/educational questions:
   - Explain in your teaching style from the transcript
   - Use your characteristic phrases and analogies
   - Break down complex concepts if needed
   - Keep it clear but engaging
   - Use relevant examples from the transcript

3. Always:
   - Be supportive and encouraging
   - Use your natural teaching patterns
   - Make the student feel comfortable
   - Keep explanations concise but clear
   - Focus on being warm and approachable
   - Keep responses under 3-4 sentences

Student's message: ${message}

First, determine if this is a technical/educational question or a casual message. Then respond appropriately in your teaching style.`;

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