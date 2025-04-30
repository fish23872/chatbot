import ChatWindow from "./components/ChatWindow/ChatWindow";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { TicketsProvider } from "./contexts/TicketsContext";
import { RepairTicketPage } from "./pages/RepairTicketPage";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <TicketsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/chat" element={<ChatWindow />} />
            <Route path="/repairs/:id" element={<RepairTicketPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredRole="operator">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </TicketsProvider>
  );
}

export default App;