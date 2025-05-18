import React, { useState, useRef, useEffect } from 'react';
import { generateTutorResponse } from '../services/llmService';

interface Message {
  role: 'user' | 'teacher';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  teacherProfile: {
    name: string;
    style: string;
    tone: string;
    strengths: string[];
    specializations: string[];
    useAnalogies: boolean;
    stepByStep: boolean;
  };
  onNameChange: (newName: string) => void;
}

// Clean response text by removing markdown asterisks and filler words
const cleanResponseText = (text: string): string => {
  // Remove markdown asterisks
  let cleanedText = text.replace(/\*\*/g, '');
  
  // Remove filler words and sounds
  const fillerWords = [
    /\bahh\b/gi,
    /\buhm\b/gi,
    /\bum\b/gi,
    /\buh\b/gi,
    /\bumm\b/gi,
    /\buhmm\b/gi,
    /\bummm\b/gi,
    /\buhmmm\b/gi,
    /\bwell\b/gi,
    /\bso\b/gi,
    /\blike\b/gi,
    /\byou know\b/gi,
    /\bkind of\b/gi,
    /\bsort of\b/gi,
    /\bactually\b/gi,
    /\bbasically\b/gi,
    /\bliterally\b/gi,
    /\bjust\b/gi,
    /\banyway\b/gi,
    /\banyways\b/gi
  ];

  // Remove each filler word
  fillerWords.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, '');
  });

  // Clean up extra spaces and punctuation
  cleanedText = cleanedText
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\s+([.,!?])/g, '$1') // Remove spaces before punctuation
    .replace(/([.,!?])\s+/g, '$1 ') // Ensure single space after punctuation
    .trim(); // Remove leading/trailing spaces

  return cleanedText;
};

// Text-to-Speech function
const speak = (text: string, isMuted: boolean) => {
  if (isMuted) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;

  // Get available voices and select a female voice if available
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(voice => 
    voice.name.includes('female') || 
    voice.name.includes('Female') || 
    voice.name.includes('Samantha')
  );
  
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  window.speechSynthesis.speak(utterance);
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ teacherProfile, onNameChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [teacherName, setTeacherName] = useState(teacherProfile.name);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNameChange = () => {
    if (teacherName.trim()) {
      onNameChange(teacherName);
      setIsEditingName(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    inputRef.current?.focus();

    try {
      const response = await generateTutorResponse(inputMessage, teacherProfile);
      const cleanedResponse = cleanResponseText(response);
      const teacherMessage: Message = {
        role: 'teacher',
        content: cleanedResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, teacherMessage]);
      // Speak the response if not muted
      speak(cleanedResponse, isMuted);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'teacher',
        content: `I apologize, but I encountered an error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      // Speak the error message if not muted
      speak(errorMessage.content, isMuted);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg transform transition-all duration-300 hover:shadow-xl">
      {/* Teacher Profile Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          {isEditingName ? (
            <div className="flex items-center space-x-2 animate-fadeIn">
              <input
                ref={inputRef}
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter teacher name"
                autoFocus
              />
              <button
                onClick={handleNameChange}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTeacherName(teacherProfile.name);
                  setIsEditingName(false);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-800">{teacherProfile.name}</h2>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
          {/* Mute/Unmute Button */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full transform transition-all duration-200 hover:scale-110 ${
              isMuted ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            } hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isMuted ? 'focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 transform transition-all duration-200 hover:scale-[1.02] ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-800 shadow-sm hover:shadow-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-gray-100 rounded-lg p-3 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 