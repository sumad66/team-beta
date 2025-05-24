import React, { useState } from 'react';
import { getVideoTranscript } from '../services/youtubeService';

interface UploadFormProps {
  onAnalysisComplete: (transcript: string) => Promise<void>;
}

const UploadForm: React.FC<UploadFormProps> = ({ onAnalysisComplete }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setTranscript('');

    try {
      const transcriptText = await getVideoTranscript(url);
      setTranscript(transcriptText);
      await onAnalysisComplete(transcriptText);
    } catch (error: any) {
      setError(error.message || 'Failed to process video');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleYoutubeSubmit} className="space-y-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-[#213448]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <input
          type="text"
          id="youtube-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube video URL"
          className="block w-full pl-10 pr-3 py-4 border border-[#213448] rounded-xl shadow-sm placeholder-[#547792]/60 focus:outline-none focus:ring-2 focus:ring-[#213448] focus:border-[#213448] text-lg transition-all duration-200"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-[#213448] hover:bg-[#213448]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#213448] transform transition-all duration-200 hover:scale-[1.02] ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Analyze Video
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-white/80 border border-red-200 rounded-xl">
          <div className="flex items-center text-red-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}
    </form>
  );
};

export default UploadForm; 