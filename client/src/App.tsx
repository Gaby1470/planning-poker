import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import SessionPage from './pages/SessionPage';
import './App.css';

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:sessionId" element={<SessionPage />} />
      </Routes>
    </>
  );
};

export default App;
