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
    <div className="min-h-screen w-full bg-[#94B4C1]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-black">TeachClone</h1>
        
        {!showChat ? (
          <>
            <div className="mb-8 bg-white rounded-xl shadow-lg p-8 border border-[#213448]">
              <h2 className="text-3xl font-semibold mb-6 text-[#213448]">Welcome to TeachClone! 👋</h2>
              <p className="text-sm text-[#547792] mb-6 leading-relaxed">
                TeachClone is an AI-powered platform that creates personalized tutors based on your learning style and preferences. 
                Our system analyzes your content and creates a custom tutor that matches your needs.
              </p>
              
              <div className="bg-[#EAEFEF] rounded-xl p-6 mb-6 border border-[#213448]">
                <h3 className="text-lg font-semibold mb-4 text-[#213448] flex items-center">
                  <svg className="w-6 h-6 mr-2 text-[#547792]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to Get Started:
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-sm text-[#547792]">
                  <li className="flex items-center">
                    <span className="font-medium text-[#213448]">Upload a YouTube video URL</span> that represents your learning style
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium text-[#213448]">Our AI will analyze</span> the content and understand your preferences
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium text-[#213448]">We'll create a personalized tutor</span> profile based on the analysis
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium text-[#213448]">Start chatting</span> with your AI tutor and get personalized help!
                  </li>
                </ol>
              </div>

              <div className="bg-[#EAEFEF] rounded-xl p-6 border border-[#213448]">
                <h3 className="text-lg font-semibold mb-4 text-[#213448] flex items-center">
                  <svg className="w-6 h-6 mr-2 text-[#547792]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tips for Best Results:
                </h3>
                <ul className="list-disc list-inside space-y-3 text-sm text-[#547792]">
                  <li className="flex items-center">
                    <span className="font-medium text-[#213448]">Choose content</span> that you find easy to understand and engaging
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium text-[#213448]">Select videos</span> that match your preferred learning style
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium text-[#213448]">Be specific</span> in your questions when chatting with your tutor
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium text-[#213448]">Ask for clarification</span> or examples when needed
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8 border border-[#213448] transform transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-2xl font-semibold mb-6 text-[#213448] flex items-center">
                <svg className="w-6 h-6 mr-2 text-[#547792]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Your Content
              </h2>
              <UploadForm onAnalysisComplete={handleContentUpload} />
            </div>
            
            {isLoading && (
              <div className="mt-6 text-center p-4 bg-white/80 rounded-lg border border-[#213448]">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-[#547792]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-[#213448] font-medium">Analyzing content...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-white/80 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {analysis && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-white">Analysis Results</h2>
                  <button
                    onClick={handleCreateTeacher}
                    disabled={isCreatingTeacher}
                    className="flex items-center px-4 py-2 bg-[#213448] text-white rounded-md hover:bg-[#213448]/90 focus:outline-none focus:ring-2 focus:ring-[#213448] disabled:opacity-50"
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
                  className="w-full p-6 border rounded-xl bg-white shadow-sm prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: analysis
                      .replace(/```html\n?/g, '')
                      .replace(/```\n?/g, '')
                      .replace(/<h1>(.*?)<\/h1>/g, '<h1 class="text-3xl font-bold mb-4 text-[#213448]">$1</h1>')
                      .replace(/<h2>(.*?)<\/h2>/g, '<h2 class="text-2xl font-bold mb-3 text-[#213448]">$1</h2>')
                      .replace(/<h3>(.*?)<\/h3>/g, '<h3 class="text-xl font-bold mb-2 text-[#213448]">$1</h3>')
                      .replace(/<p>(.*?)<\/p>/g, '<p class="mb-4 text-[#547792]">$1</p>')
                      .replace(/<ul>(.*?)<\/ul>/g, '<ul class="list-disc list-inside mb-4 text-[#547792]">$1</ul>')
                      .replace(/<li>(.*?)<\/li>/g, '<li class="mb-2">$1</li>')
                  }}
                />
              </div>
            )}

            {teacherProfile && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow border border-[#213448]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-[#213448]">{teacherProfile.name}</h2>
                  <div className="flex space-x-2">
                    {teacherProfile.useAnalogies && (
                      <span className="px-3 py-1 bg-[#EAEFEF] text-[#213448] rounded-full text-sm">Uses Analogies</span>
                    )}
                    {teacherProfile.stepByStep && (
                      <span className="px-3 py-1 bg-[#EAEFEF] text-[#213448] rounded-full text-sm">Step-by-Step</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-[#213448]">Teaching Style</h3>
                      <p className="text-[#547792]">{teacherProfile.style}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-[#213448]">Communication Tone</h3>
                      <p className="text-[#547792]">{teacherProfile.tone}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-[#213448]">Key Strengths</h3>
                      <ul className="list-disc list-inside text-[#547792]">
                        {teacherProfile.strengths.map((strength: string, index: number) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-[#213448]">Specializations</h3>
                      <ul className="list-disc list-inside text-[#547792]">
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
                    className="px-6 py-3 bg-[#213448] text-white rounded-lg hover:bg-[#213448]/90 focus:outline-none focus:ring-2 focus:ring-[#213448] transform transition-all duration-200 hover:scale-[1.02]"
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
              <h2 className="text-2xl font-semibold text-white">Chat with {teacherProfile?.name}</h2>
              <button
                onClick={() => setShowChat(false)}
                className="px-4 py-2 text-white hover:text-[#EAEFEF]"
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
    </div>
  );
};

export default TutorCreator; 