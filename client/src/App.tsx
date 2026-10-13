import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/auth-page';
import { ChatPage } from './pages/chat-page';
import { Provider } from 'react-redux';
import { store } from './store/store';

function App() {
  return (
    <BrowserRouter>
			<Provider store={store}>
				<Routes>
					<Route path="/login" element={<AuthPage />} />
					<Route path="/chat" element={<ChatPage />} />
					{/* По умолчанию перенаправляем на /chat */}
					<Route path="/" element={<Navigate to="/chat" replace />} />
					{/* Любой неизвестный адрес редиректим на корень */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Provider>
    </BrowserRouter>
  )
}

export default App
