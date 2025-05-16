interface TutorProfile {
  tone: string;
  style: string;
  useAnalogies: boolean;
  stepByStep: boolean;
}

const STORAGE_KEY = 'tutorProfile';

export const saveTutorProfile = (profile: TutorProfile): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

export const getTutorProfile = (): TutorProfile | null => {
  const profile = localStorage.getItem(STORAGE_KEY);
  return profile ? JSON.parse(profile) : null;
};

export const hasTutorProfile = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};

export const clearTutorProfile = (): void => {
  localStorage.removeItem(STORAGE_KEY);
}; 