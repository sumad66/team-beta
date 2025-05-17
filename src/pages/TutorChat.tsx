import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTutorProfile } from '../services/profileService';
import { generateTutorResponse } from '../services/llmService';
import ChatUI from '../components/ChatUI';

interface Profile {
  name: string;
  style: string;
  characteristics: string[];
  tone: string;
  useAnalogies: boolean;
  stepByStep: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const TutorChat: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!profile) {
      navigate('/create');
    }
  }, [profile, navigate]);

  useEffect(() => {
    // Initialize profile
    setProfile({
      name: 'AI Tutor',
      style: 'Interactive and engaging',
      characteristics: ['Patient', 'Knowledgeable', 'Clear communicator'],
      tone: 'Friendly and professional',
      useAnalogies: true,
      stepByStep: true
    });
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!profile) return;

    const newMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await generateTutorResponse(content, profile);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error generating response:', error);
      // TODO: Add error handling UI
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Chat with Your AI Tutor</h1>
      <div className="max-w-4xl mx-auto">
        <ChatUI
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default TutorChat; 