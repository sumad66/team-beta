import React from 'react';

interface TutorProfile {
  tone: string;
  style: string;
  useAnalogies: boolean;
  stepByStep: boolean;
}

interface TutorProfileCardProps {
  profile: TutorProfile;
}

const TutorProfileCard: React.FC<TutorProfileCardProps> = ({ profile }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4">Your AI Tutor Profile</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Teaching Tone:</span>
          <span className="font-medium">{profile.tone}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Learning Style:</span>
          <span className="font-medium">{profile.style}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Uses Analogies:</span>
          <span className="font-medium">{profile.useAnalogies ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Step-by-Step Approach:</span>
          <span className="font-medium">{profile.stepByStep ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
};

export default TutorProfileCard; 