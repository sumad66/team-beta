const { YoutubeTranscript } = require('youtube-transcript');

const extractVideoId = (url) => {
  try {
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

const formatTimestamp = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getTranscript = async (url) => {
  try {
    if (!url) {
      throw new Error('YouTube URL is required');
    }

    const videoId = extractVideoId(url);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Try to get transcript without language specification first
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcriptItems || transcriptItems.length === 0) {
      // If no transcript found, try with English
      const englishTranscript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en'
      });

      if (!englishTranscript || englishTranscript.length === 0) {
        throw new Error('No captions found for this video');
      }

      return englishTranscript.map(item => item.text).join('\n');
    }

    return transcriptItems.map(item => item.text).join('\n');
  } catch (error) {
    console.error('Transcript fetch error:', error);
    throw error;
  }
};

module.exports = {
  getTranscript
}; 