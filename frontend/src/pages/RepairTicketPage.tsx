import React from "react";
import { useParams } from "react-router-dom";
import { useTickets } from "../contexts/TicketsContext";

export const RepairTicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTicket } = useTickets();
  const ticket = getTicket(id!);

  if (!ticket) return <div>Ticket not found</div>;
 //TODO: Important: Personalized tips - myth debunk for water dmg- etc, very important...
  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-900 min-w-screen h-screen text-white">
      <div className="flex flex-row text-2xl font-bold mb-6">      
        <h1 className="mr-2">Repair Ticket</h1>
        <h1 className="text-green-500">#{ticket.id}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Issue Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Urgency</h3>
              <p className={ticket.urgency === "urgent" ? "text-red-400" : "text-yellow-400"}>
                {ticket.urgency}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Issue Category</h3>
              <p>{ticket.category.join(", ")}</p>
            </div>
            <div>
              <h3 className="font-medium">Status</h3>
              <p className={ticket.status === "open" ? "text-yellow-400" : "text-green-500"}>{ticket.status}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Timeline</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Created</h3>
              <p>{ticket.createdAt.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairTicketPage;