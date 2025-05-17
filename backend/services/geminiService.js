const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeTranscript = async (transcript) => {
  try {
    if (!transcript) {
      throw new Error('Transcript is required for analysis');
    }

    if (typeof transcript !== 'string') {
      throw new Error('Transcript must be a string');
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
    
    const prompt = `Analyze this teaching transcript and provide a concise analysis. Format the response in HTML with proper tags:

<h2>Teaching Style</h2>
<ul>
  <li>Primary method: [brief description]</li>
  <li>Use of examples: [brief description]</li>
  <li>Engagement level: [brief description]</li>
  <li>Clarity rating: [1-10]</li>
</ul>

<h2>Communication</h2>
<ul>
  <li>Pace and tone: [brief description]</li>
  <li>Clarity of speech: [brief description]</li>
  <li>Key strengths: [brief description]</li>
  <li>Areas for improvement: [brief description]</li>
</ul>

<h2>Content Delivery</h2>
<ul>
  <li>Information density: [brief description]</li>
  <li>Logical flow: [brief description]</li>
  <li>Use of visuals/examples: [brief description]</li>
  <li>Target audience: [brief description]</li>
</ul>

<h2>Learning Impact</h2>
<ul>
  <li>Overall effectiveness: [1-10]</li>
  <li>Key strengths: [brief description]</li>
  <li>Main weaknesses: [brief description]</li>
  <li>Improvement suggestions: [brief description]</li>
</ul>

Include specific timestamps for key moments in [MM:SS] format.

Transcript:
${transcript}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (apiError) {
      console.error('Gemini API specific error:', apiError);
      throw new Error(`AI analysis failed: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Gemini service error:', error);
    throw new Error(error.message || 'Failed to analyze transcript with AI');
  }
};

const createPersonalizedTeacher = async (analysis) => {
  try {
    if (!analysis) {
      throw new Error('Analysis is required');
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
    
    const prompt = `Based on this teaching analysis, create a personalized AI tutor that closely matches the teaching style and characteristics of the analyzed teacher. The tutor should adopt the same tone, pace, and teaching methods. Return the response as a JSON object:

${analysis}

Generate a tutor profile with these exact fields:
{
  "name": "string (creative name that reflects the teaching style)",
  "style": "string (detailed description of teaching style, matching the analyzed teacher)",
  "tone": "string (communication tone matching the analyzed teacher)",
  "strengths": ["string (3-4 key strengths from the analysis)"],
  "specializations": ["string (2-3 subject areas based on the content)"],
  "useAnalogies": boolean (based on whether the teacher uses analogies),
  "stepByStep": boolean (based on whether the teacher uses step-by-step explanations)
}

Make sure the response is valid JSON and the teaching style closely matches the analyzed teacher's approach.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response to ensure it's valid JSON
      const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
      const teacherProfile = JSON.parse(jsonStr);

      // Validate the required fields
      const requiredFields = ['name', 'style', 'tone', 'strengths', 'specializations', 'useAnalogies', 'stepByStep'];
      for (const field of requiredFields) {
        if (!(field in teacherProfile)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return teacherProfile;
    } catch (apiError) {
      console.error('Gemini API specific error:', apiError);
      throw new Error(`Failed to create tutor profile: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Tutor creation error:', error);
    throw new Error(error.message || 'Failed to create personalized tutor');
  }
};

module.exports = {
  analyzeTranscript,
  createPersonalizedTeacher
}; 