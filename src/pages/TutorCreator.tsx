import React, { useState } from 'react';
import { analyzeLearningStyle, createPersonalizedTeacher } from '../services/llmService';
import UploadForm from '../components/UploadForm';
import ChatInterface from '../components/ChatInterface';

interface TeacherProfile {
  name: string;
  style: string;
  tone: string;
  strengths: string[];
  specializations: string[];
  useAnalogies: boolean;
  stepByStep: boolean;
}

const TutorCreator: React.FC = () => {
  const [analysis, setAnalysis] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [isCreatingTeacher, setIsCreatingTeacher] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);

  const handleContentUpload = async (transcript: string) => {
    try {
      setIsLoading(true);
      setError('');
      const result = await analyzeLearningStyle(transcript);
      setAnalysis(result);
    } catch (error: any) {
      setError(error.message || 'Failed to analyze content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeacher = async () => {
    try {
      setIsCreatingTeacher(true);
      setError('');
      const profile = await createPersonalizedTeacher(analysis);
      setTeacherProfile(profile);
    } catch (error: any) {
      setError(error.message || 'Failed to create teacher');
    } finally {
      setIsCreatingTeacher(false);
    }
  };

  const handleTeacherNameChange = (newName: string) => {
    setTeacherProfile(prev => prev ? {
      ...prev,
      name: newName
    } : null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Your AI Tutor</h1>
      
      {!showChat ? (
        <>
          <UploadForm onAnalysisComplete={handleContentUpload} />
          
          {isLoading && (
            <div className="mt-4 text-center">
              <p>Analyzing content...</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {analysis && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Analysis Results</h2>
                <button
                  onClick={handleCreateTeacher}
                  disabled={isCreatingTeacher}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isCreatingTeacher ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Teacher...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Teacher
                    </>
                  )}
                </button>
              </div>
              <div 
                className="w-full p-4 border rounded-md bg-white shadow-sm prose max-w-none"
                dangerouslySetInnerHTML={{ __html: analysis }}
              />
            </div>
          )}

          {teacherProfile && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">{teacherProfile.name}</h2>
                <div className="flex space-x-2">
                  {teacherProfile.useAnalogies && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Uses Analogies</span>
                  )}
                  {teacherProfile.stepByStep && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Step-by-Step</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Teaching Style</h3>
                    <p className="text-gray-700">{teacherProfile.style}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Communication Tone</h3>
                    <p className="text-gray-700">{teacherProfile.tone}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Key Strengths</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {teacherProfile.strengths.map((strength: string, index: number) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Specializations</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {teacherProfile.specializations.map((spec: string, index: number) => (
                        <li key={index}>{spec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowChat(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Start Chat with {teacherProfile.name}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Chat with {teacherProfile?.name}</h2>
            <button
              onClick={() => setShowChat(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>
          {teacherProfile && (
            <ChatInterface
              teacherProfile={teacherProfile}
              onNameChange={handleTeacherNameChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default TutorCreator; 