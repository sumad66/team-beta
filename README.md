# PersonalAI-Tutor

A full-stack web application that creates a personalized AI tutor based on your preferred learning style from reference materials (YouTube videos, PDFs, articles).

## Features

- Create a personalized AI tutor by uploading learning materials
- Support for YouTube videos and PDF documents
- Persistent tutor profile that adapts to your learning style
- Interactive chat interface for learning new topics
- Modern, responsive UI built with React and Tailwind CSS

## Tech Stack

- Frontend: React.js + TypeScript + Tailwind CSS
- PDF Parsing: pdf.js
- LLM API: Groq (Mixtral-8x7b)
- Storage: localStorage (with optional Firebase integration)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/personal-ai-tutor.git
cd personal-ai-tutor
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Groq API key:
```
REACT_APP_GROQ_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Usage

1. **Create Your Tutor**
   - Upload a YouTube video or PDF document
   - The system will analyze the content and create a personalized teaching style
   - Your tutor profile will be saved for future sessions

2. **Chat with Your Tutor**
   - Ask questions about any topic
   - The tutor will respond using your preferred learning style
   - Upload additional materials to enhance the learning experience

## Project Structure

```
personal-ai-tutor/
├── public/
├── src/
│   ├── components/
│   │   ├── UploadForm.tsx
│   │   ├── ChatUI.tsx
│   │   ├── TutorProfileCard.tsx
│   ├── pages/
│   │   ├── TutorCreator.tsx
│   │   ├── TutorChat.tsx
│   ├── services/
│   │   ├── llmService.ts
│   │   ├── profileService.ts
│   ├── App.tsx
├── tailwind.config.js
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 