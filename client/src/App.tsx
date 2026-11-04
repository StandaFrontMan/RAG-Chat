import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/auth-page";
import { ChatPage } from "./pages/chat-page";
import { DocumentsPage } from "./pages/documents-page";
import { ProtectedRoute } from "./components/protected-route";
import { GuestRoute } from "./components/guest-route";
import { GraphPage } from "./pages/graph-page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Гостевой маршрут: доступен только неавторизованным */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<AuthPage />} />
        </Route>

        {/* Защищенные маршруты: требуют авторизации */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<ChatPage />} />

          <Route path="/documents" element={<DocumentsPage />} />

					<Route path="/graph" element={<GraphPage />} />
        </Route>

        {/* Перенаправления по умолчанию */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
