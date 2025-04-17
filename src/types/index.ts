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
    recipient_id: string;
    custom: {
      payload: 'recommendation' | 'comparison';
      data: RecommendationsData | ComparisonData;
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