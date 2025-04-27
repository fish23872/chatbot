import ChatWindow from "./components/ChatWindow/ChatWindow";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { TicketsProvider } from "./contexts/TicketsContext";
import { RepairTicketPage } from "./pages/RepairTicketPage";

function App() {
  return (
    <TicketsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ChatWindow />} />
          <Route path="/repairs/:id" element={<RepairTicketPage />} />
        </Routes>
      </Router>
    </TicketsProvider>
  );
}

export default App;