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

const ChatInterface: React.FC<ChatInterfaceProps> = ({ teacherProfile, onNameChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [teacherName, setTeacherName] = useState(teacherProfile.name);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    try {
      const response = await generateTutorResponse(inputMessage, teacherProfile);
      const teacherMessage: Message = {
        role: 'teacher',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, teacherMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'teacher',
        content: `I apologize, but I encountered an error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Teacher Profile Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {isEditingName ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="px-2 py-1 border rounded"
                placeholder="Enter teacher name"
              />
              <button
                onClick={handleNameChange}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTeacherName(teacherProfile.name);
                  setIsEditingName(false);
                }}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold">{teacherProfile.name}</h2>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
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
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
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
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 