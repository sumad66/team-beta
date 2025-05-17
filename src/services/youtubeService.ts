import axios from 'axios';

// Your YouTube API key
const YOUTUBE_API_KEY = 'AIzaSyApXWAoAYayJouq0iKRlMj-3R61VRLqkCE';

interface TranscriptResponse {
  transcript: string;
}

interface AnalysisResponse {
  analysis: string;
}

const API_URL = 'http://localhost:5000/api';

export const extractVideoId = (url: string): string | null => {
  try {
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^#&?]*).*/,
      /youtube\.com\/shorts\/([^#&?]*).*/,
      /youtube\.com\/watch\?.*v=([^#&?]*).*/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }

    // If no pattern matches, try to extract from the URL directly
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
    const videoId = searchParams.get('v');
    
    if (videoId && videoId.length === 11) {
      return videoId;
    }

    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
};

export const getVideoTranscript = async (url: string): Promise<string> => {
  try {
    if (!url) {
      throw new Error('YouTube URL is required');
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const response = await axios.post<TranscriptResponse>(`${API_URL}/transcript`, { url });
    
    if (!response.data.transcript || response.data.transcript.trim() === '') {
      throw new Error('No transcript available for this video');
    }

    return response.data.transcript;
  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please check if the server is running.');
    }
    throw new Error('Failed to fetch transcript. Please try again.');
  }
};

export const analyzeTranscript = async (transcript: string): Promise<string> => {
  try {
    if (!transcript) {
      throw new Error('Transcript is required for analysis');
    }

    if (typeof transcript !== 'string') {
      throw new Error('Transcript must be a string');
    }

    const response = await axios.post<AnalysisResponse>(`${API_URL}/analyze`, { transcript });
    return response.data.analysis;
  } catch (error: any) {
    console.error('Error analyzing transcript:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please check if the server is running.');
    }
    throw new Error('Failed to analyze transcript. Please try again.');
  }
}; 