import axios from 'axios';

interface TutorProfile {
  tone: string;
  style: string;
  useAnalogies: boolean;
  stepByStep: boolean;
}

interface LLMResponse {
  choices: { message: { content: string } }[];
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.REACT_APP_GROQ_API_KEY;

export const analyzeLearningStyle = async (content: string): Promise<TutorProfile> => {
  try {
    const response = await axios.post<LLMResponse>(
      GROQ_API_URL,
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that analyzes learning content and generates a teaching style profile. Respond with a JSON object containing the following fields: tone (string), style (string), useAnalogies (boolean), stepByStep (boolean).'
          },
          {
            role: 'user',
            content: `Analyze this learning content and generate a teaching style profile: ${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const profile = JSON.parse(response.data.choices[0].message.content);
    return profile;
  } catch (error) {
    console.error('Error analyzing learning style:', error);
    throw error;
  }
};

export const generateTutorResponse = async (
  topic: string,
  profile: TutorProfile
): Promise<string> => {
  try {
    const response = await axios.post<LLMResponse>(
      GROQ_API_URL,
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: `You are an AI tutor with the following teaching style:
              - Tone: ${profile.tone}
              - Style: ${profile.style}
              - Use Analogies: ${profile.useAnalogies}
              - Step-by-Step: ${profile.stepByStep}
              Teach the topic in this style.`
          },
          {
            role: 'user',
            content: `Please explain: ${topic}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating tutor response:', error);
    throw error;
  }
};
