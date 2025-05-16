import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TutorCreator, TutorChat } from './pages';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/create" element={<TutorCreator />} />
          <Route path="/chat" element={<TutorChat />} />
          <Route path="/" element={<Navigate to="/create" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 