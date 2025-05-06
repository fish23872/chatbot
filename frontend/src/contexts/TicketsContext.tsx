import React, { createContext, useContext, useState } from "react";
import { RepairTicket, RepairData } from "@types";

interface TicketsContextType {
  tickets: RepairTicket[];
  createTicket: (data: RepairData, customerNotes?: string, technicianNotes?: string) => Promise<RepairTicket | null>;
  getTicket: (id: string) => Promise<RepairTicket | undefined>;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export const TicketsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);

const createTicket = async (data: RepairData, customerNotes?: string, technicianNotes?: string, email?: string): Promise<RepairTicket | null> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found');
      return null;
    }

    const payload = {
      urgency: data.urgency,
      category: data.category,
      needs_additional_info: data.needs_additional_info,
      customerNotes: customerNotes || null,
      technicianNotes: technicianNotes || null,
      phone_model: data.phone_model,
      email: email || null,
    };

    const response = await fetch(`http://${window.location.hostname}:8000/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create ticket');
    }

    const responseData = await response.json();
    const newTicket: RepairTicket = {
      id: responseData.ticket._id || responseData.ticket.id,
      urgency: responseData.ticket.urgency,
      category: responseData.ticket.category,
      needs_additional_info: responseData.ticket.needs_additional_info,
      status: responseData.ticket.status as "open" | "in-progress" | "completed",
      createdAt: new Date(responseData.ticket.created_at),
      customerNotes: responseData.ticket.customerNotes,
      technicianNotes: responseData.ticket.technicianNotes,
      phone_model: responseData.ticket.phone_model,
      email: responseData.ticket.email
    };
    setTickets(prev => [...prev, newTicket]);
    return newTicket;
  } catch (error) {
    console.error('Error creating ticket:', error);
    return null;
  }
};

const getTicket = async (id: string): Promise<RepairTicket | undefined> => {
  const found = tickets.find(t => t.id === id);
  if (found) return found;

  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`http://${window.location.hostname}:8000/tickets/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) return undefined;
    const data = await res.json();

    const loaded: RepairTicket = {
      id: data.id,
      urgency: data.urgency,
      category: data.category,
      needs_additional_info: data.needs_additional_info,
      status: data.status,
      createdAt: new Date(data.createdAt),
      customerNotes: data.customerNotes,
      technicianNotes: data.technicianNotes,
      phone_model: data.phone_model,
      email: data.email
    };
    setTickets(prev => [...prev, loaded]);
    return loaded;
  } catch (err) {
    console.error("Error fetching ticket:", err);
    return undefined;
  }
};

  return (
    <TicketsContext.Provider value={{ tickets, createTicket, getTicket }}>
      {children}
    </TicketsContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketsContext);
  if (!context) throw new Error("useTickets must be used within TicketsProvider");
  return context;
};