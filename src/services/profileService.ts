import axios from 'axios';

interface TutorProfile {
  name: string;
  style: string;
  tone: string;
  characteristics: string[];
  useAnalogies: boolean;
  stepByStep: boolean;
}

interface ProfileResponse {
  profile: TutorProfile | null;
}

const API_URL = 'http://localhost:5000/api';

// Generate a unique user ID or get it from your auth system
const getUserId = (): string => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('userId', userId);
  }
  return userId;
};

export const saveTutorProfile = async (profile: TutorProfile): Promise<void> => {
  try {
    const userId = getUserId();
    await axios.post(`${API_URL}/profile`, { userId, profile });
  } catch (error) {
    console.error('Error saving tutor profile:', error);
    throw new Error('Failed to save tutor profile');
  }
};

export const getTutorProfile = async (): Promise<TutorProfile | null> => {
  try {
    const userId = getUserId();
    const response = await axios.get<ProfileResponse>(`${API_URL}/profile/${userId}`);
    return response.data.profile;
  } catch (error) {
    console.error('Error getting tutor profile:', error);
    return null;
  }
};

export const hasTutorProfile = async (): Promise<boolean> => {
  try {
    const profile = await getTutorProfile();
    return profile !== null;
  } catch (error) {
    return false;
  }
};

export const clearTutorProfile = async (): Promise<void> => {
  try {
    const userId = getUserId();
    await axios.delete(`${API_URL}/profile/${userId}`);
    localStorage.removeItem('userId');
  } catch (error) {
    console.error('Error clearing tutor profile:', error);
    throw new Error('Failed to clear tutor profile');
  }
}; 