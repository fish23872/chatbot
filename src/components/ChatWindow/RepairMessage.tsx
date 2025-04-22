import { useTickets } from "../../contexts/TicketsContext";
import { useNavigate } from "react-router-dom";
import { RepairMessageProps } from "@types";

export const RepairMessage: React.FC<RepairMessageProps> = ({ data }) => {
  const { createTicket } = useTickets();
  const navigate = useNavigate();

  const handleCreateTicket = () => {
    const ticket = createTicket(data);
    navigate(`/repairs/${ticket.id}`);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 my-2 max-w-3xl">
      <button 
        onClick={handleCreateTicket}
        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        View Repair Ticket
      </button>
    </div>
  );
};