export interface Ticket {
  id: string;
  user_id: string;
  urgency: string;
  category: string[];
  status: string;
  phone_model: string;
}

export interface RepairTicket extends RepairData {
  id: string;
  createdAt: Date;
  status: "open" | "in-progress" | "completed";
  customerNotes?: string;
  technicianNotes?: string;
  email?: string;
  updatedAt?: string;
}

export interface MessageType {
  text: string;
  isUser: boolean;
  payload?: RecommendationsData | ComparisonData | RepairData;
  buttons?: Array<{
    title: string,
    payload: string
  }>
  isLoading?: boolean;
}

export interface RepairMessageProps {
  data: RepairData;
}

export interface TicketsContextType {
  tickets: RepairTicket[];
  createTicket: (data: RepairData) => RepairTicket;
  getTicket: (id: string) => RepairTicket | undefined;
}

export type Phone = {
    name: string;
    price: number;
    rating: number;
    discount: string | null;
    image_url: string;
    features: string[];
    purchase_url: string | null;
    score: number;
  };
  
  export type RecommendationsData = {
    title: string;
    phones: Phone[];
  };
  
  export type ComparisonData = {
    phone1: Phone;
    phone2: Phone;
    specs: {
      name: string;
      phone1: string | number;
      phone2: string | number;
      winner: 'phone1' | 'phone2';
    }[];
    summary: string
  };
  
  export type Response = Array<{
    buttons?: Array<{
      title: string,
      payload: string
    }>
    recipient_id: string;
    custom: {
      payload: 'recommendation' | 'comparison' | 'repairs';
      data: RecommendationsData | ComparisonData | RepairData;
    };
    text?: string;
  }>;
  
  export type ComparisonSpec = {
    name: string;
    phone1: string | number;
    phone2: string | number;
    winner: 'phone1' | 'phone2';
  };
  
  export type ComparisonPayload = {
    payload: 'comparison';
    data: ComparisonData;
  };

  export type PhoneIssueCategory = "screen" | "battery" | "water" | "charging" | "other" | "unclear";

  export type RepairData = {
    urgency: "urgent" | "standard";
    category: PhoneIssueCategory[];
    needs_additional_info: boolean;
    phone_model: string
  };