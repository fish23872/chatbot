import React from "react";
import { RecommendationsData } from "@types";

interface RecommendationProps {
  data: RecommendationsData;
}

const Recommendation: React.FC<RecommendationProps> = ({ data }) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 my-3">
      <h3 className="text-lg font-semibold text-white mb-3">{data.title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.phones && data.phones.map((phone, index) => (
          <div 
            key={index} 
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors flex flex-col h-full"
          >
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
                <span className="text-white">{phone.rating}</span>
                <span className="text-gray-400 mx-2">|</span>
                <span className="text-white font-bold">${phone.price}</span>
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
              {phone.features.length > 0 && (
                <ul className="text-gray-300 text-sm mb-3">
                  {phone.features.map((feature, i) => (
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
        ))}
      </div>
    </div>
  );
};

export default Recommendation;