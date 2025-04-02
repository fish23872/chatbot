export interface PhoneData {
    name: string;
    price: number;
    rating: number;
    discount?: string | null;
    image_url: string;
    features: string[];
    purchase_url: string | null;
  }
  
  export interface RecommendationData {
    title: string;
    phones: PhoneData[];
    subtitle?: string;
    badge?: string;
  }
  
  export interface TextMessage {
    type: 'text';
    text: string;
    isUser: boolean;
  }
  
  export interface RecommendationMessage {
    type: 'recommendation';
    data: RecommendationData;
  }
  
  export type ChatMessage = TextMessage | RecommendationMessage;
  
  export interface SocketTextMessage {
    text: string;
  }
  
  export interface SocketRecommendationMessage {
    custom: {
      payload: 'recommendations';
      data: RecommendationData;
    };
  }
  
  export type SocketMessage = SocketTextMessage | SocketRecommendationMessage | string;