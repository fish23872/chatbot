import React, { createContext, useContext, useState } from "react";
import { RepairTicket, RepairData } from "@types";

interface TicketsContextType {
  tickets: RepairTicket[];
  createTicket: (data: RepairData) => RepairTicket;
  getTicket: (id: string) => RepairTicket | undefined;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export const TicketsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);

  const createTicket = (data: RepairData): RepairTicket => {
    const newTicket: RepairTicket = {
      ...data,
      id: `ticket-${Date.now()}`,
      createdAt: new Date(),
      status: "open"
    };
    setTickets(prev => [...prev, newTicket]);
    return newTicket;
  };

  const getTicket = (id: string) => tickets.find(t => t.id === id);

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