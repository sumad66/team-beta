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
    <div className="bg-white p-6 rounded-lg shadow">
      <form onSubmit={handleYoutubeSubmit} className="space-y-4">
        <div>
          <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700">
            YouTube Video URL
          </label>
          <input
            type="text"
            id="youtube-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube video URL"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Processing...' : 'Analyze Video'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </form>

      {transcript && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Transcript:</h3>
          <textarea
            value={transcript}
            readOnly
            className="w-full h-64 p-4 border rounded-md bg-gray-50 font-mono text-sm"
            style={{ resize: 'vertical' }}
          />
        </div>
      )}
    </div>
  );
};

export default UploadForm; 