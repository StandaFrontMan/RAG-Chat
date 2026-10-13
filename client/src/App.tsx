import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/auth-page';
import { ChatPage } from './pages/chat-page';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/chat" element={<ChatPage />} />
        {/* По умолчанию перенаправляем на /chat */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        {/* Любой неизвестный адрес редиректим на корень */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
