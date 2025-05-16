import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import TutorProfileCard from '../components/TutorProfileCard';
import { analyzeLearningStyle } from '../services/llmService';
import { saveTutorProfile } from '../services/profileService';

interface TutorProfile {
  tone: string;
  style: string;
  useAnalogies: boolean;
  stepByStep: boolean;
}

const TutorCreator: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<TutorProfile | null>(null);

  const handleContentUpload = async (content: string) => {
    setIsLoading(true);
    try {
      const styleProfile = await analyzeLearningStyle(content);
      setProfile(styleProfile);
      saveTutorProfile(styleProfile);
      navigate('/chat');
    } catch (error) {
      console.error('Error analyzing learning style:', error);
      // TODO: Add error handling UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Create Your AI Tutor</h1>
      <div className="max-w-2xl mx-auto">
        <UploadForm onUpload={handleContentUpload} isLoading={isLoading} />
        {profile && <TutorProfileCard profile={profile} />}
      </div>
    </div>
  );
};

export default TutorCreator; 