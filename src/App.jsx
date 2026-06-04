import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Quiz from './components/Quiz';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Quiz />} />
        <Route path="/admin-gcp" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
