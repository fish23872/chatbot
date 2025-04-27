import React from "react";
import { Phone } from "@types";

export const PhoneCard: React.FC<{ phone: Phone; highlight?: boolean }> = ({ phone, highlight = false }) => {
    const features = phone.features || [];
    
    return (
      <div className={`bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors flex flex-col h-full ${highlight ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-white font-medium">{phone.name}</h4>
            {phone.discount && (
              <span className="bg-green-600 text-xs px-2 py-1 rounded-full">
                {phone.discount}
              </span>
            )}
          </div>
          <div className="flex items-center mb-2">
            <span className="text-yellow-400 mr-1">★</span>
            <span className="text-white">{phone.rating || 'N/A'}</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-white font-bold">${phone.price || 'N/A'}</span>
          </div>
          {phone.image_url && (
            <img 
              src={phone.image_url} 
              alt={phone.name} 
              className="w-full h-32 object-contain mb-3"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-phone.png';
              }}
            />
          )}
          {features.length > 0 && (
            <ul className="text-gray-300 text-sm mb-3">
              {features.map((feature, i) => (
                <li key={i} className="mb-1">• {feature}</li>
              ))}
            </ul>
          )}
        </div>
  
        <div className="mt-auto pt-2">
          <a
            href={phone.purchase_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md transition-colors ${
              !phone.purchase_url ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={!phone.purchase_url ? (e) => e.preventDefault() : undefined}
          >
            Buy Now
          </a>
        </div>
      </div>
    );
  };