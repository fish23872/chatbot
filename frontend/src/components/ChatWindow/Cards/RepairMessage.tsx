import { useTickets } from "../../../contexts/TicketsContext";
import { useNavigate } from "react-router-dom";
import { RepairMessageProps } from "@types";
import { useState } from "react";

export const RepairMessage: React.FC<RepairMessageProps> = ({ data }) => {
  const { createTicket } = useTickets();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTicket = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const ticket = await createTicket(data);
      if (!ticket) {
        throw new Error('Ticket creation returned null');
      }
      
      if (!('id' in ticket)) {
        throw new Error('Created ticket is missing id property');
      }
      
      navigate(`/repairs/${ticket.id}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
      console.error('Ticket creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 my-2 max-w-3xs">
      <h2 className="font-medium text-green-500">Repair ticket created</h2>
      <button 
        onClick={handleCreateTicket}
        disabled={isLoading}
        className={`mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Creating Ticket...' : 'View Repair Ticket'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};