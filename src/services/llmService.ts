import axios from 'axios';

interface AnalysisResponse {
  analysis: string;
}

interface TutorResponse {
  response: string;
}

interface TeacherProfile {
  name: string;
  style: string;
  tone: string;
  strengths: string[];
  specializations: string[];
  useAnalogies: boolean;
  stepByStep: boolean;
}

const API_URL = 'http://localhost:5000/api';

export const analyzeLearningStyle = async (transcript: string): Promise<string> => {
  try {
    if (!transcript) {
      throw new Error('Transcript is required for analysis');
    }

    const response = await axios.post<AnalysisResponse>(`${API_URL}/analyze`, { transcript });
    return response.data.analysis;
  } catch (error: any) {
    console.error('Error analyzing learning style:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please check if the server is running.');
    }
    throw new Error('Failed to analyze learning style. Please try again.');
  }
};

export const generateTutorResponse = async (message: string, profile: any): Promise<string> => {
  try {
    if (!message) {
      throw new Error('Message is required');
    }

    if (!profile) {
      throw new Error('Tutor profile is required');
    }

    const response = await axios.post<TutorResponse>(`${API_URL}/chat`, {
      message,
      profile
    });

    return response.data.response;
  } catch (error: any) {
    console.error('Error generating tutor response:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please check if the server is running.');
    }
    throw new Error('Failed to generate tutor response. Please try again.');
  }
};

export const createPersonalizedTeacher = async (analysis: string): Promise<TeacherProfile> => {
  try {
    if (!analysis) {
      throw new Error('Analysis is required');
    }

    const response = await axios.post<{ teacherProfile: TeacherProfile }>(`${API_URL}/create-teacher`, { analysis });
    return response.data.teacherProfile;
  } catch (error: any) {
    console.error('Error creating personalized teacher:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please check if the server is running.');
    }
    throw new Error('Failed to create personalized teacher. Please try again.');
  }
};
