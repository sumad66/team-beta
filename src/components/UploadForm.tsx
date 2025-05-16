import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface UploadFormProps {
  onUpload: (content: string) => void;
  isLoading: boolean;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUpload, isLoading }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl) return;

    // TODO: Implement YouTube transcript extraction
    // For now, we'll use a mock transcript
    const mockTranscript = "This is a mock transcript from the YouTube video. In a real implementation, we would extract the actual transcript using a YouTube API or service.";
    onUpload(mockTranscript);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      onUpload(fullText);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Upload YouTube Video</h2>
        <form onSubmit={handleYoutubeSubmit} className="space-y-4">
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !youtubeUrl}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Analyze Video'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>
        <div className="space-y-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            className="w-full"
            disabled={isLoading}
          />
          {pdfFile && (
            <p className="text-sm text-gray-600">
              Selected file: {pdfFile.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadForm; 