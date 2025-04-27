import React from 'react';
import Message from '../Message';
import { PhoneCard } from './PhoneCard';
import { ComparisonPayload } from '@types';

interface ComparisonMessageProps {
  message: {
    custom?: ComparisonPayload;
    text?: string;
  };
}

export const ComparisonMessage: React.FC<ComparisonMessageProps> = ({ message }) => {
  if (!message.custom || message.custom.payload !== 'comparison') {
    return <div className="text-white">{message.text}</div>;
  }

  const { phone1, phone2, specs, summary } = message.custom.data;

  return (
    <div>
      <Message text={`Here's how ${phone1.name} compares to ${phone2.name}:`} isUser={false}></Message>
    <div className="bg-gray-700 rounded-lg p-4 my-3">
      <h3 className="text-lg font-semibold text-white mb-4">{message.text}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <PhoneCard 
          phone={{
            name: phone1.name,
            price: phone1.price,
            rating: phone1.rating,
            discount: phone1.discount || null,
            image_url: phone1.image_url,
            features: phone1.features || [],
            purchase_url: phone1.purchase_url,
            score: phone1.score
          }} 
          highlight={specs.filter(s => s.winner === 'phone1').length > specs.filter(s => s.winner === 'phone2').length}
        />
        
        <PhoneCard 
          phone={{
            name: phone2.name,
            price: phone2.price,
            rating: phone2.rating,
            discount: phone2.discount || null,
            image_url: phone2.image_url,
            features: phone2.features || [],
            purchase_url: phone2.purchase_url,
            score: phone2.score
          }}
          highlight={specs.filter(s => s.winner === 'phone2').length > specs.filter(s => s.winner === 'phone1').length}
        />
      </div>

      <div className="border-t border-gray-600 pt-4">
        <h4 className="font-medium text-gray-300 mb-3">Detailed Comparison</h4>
        <div className="overflow-x-auto">
        <div className="space-y-4 text-white">
          <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
            <div className="w-1/3 font-medium text-gray-300">Specification</div>
            <div className="w-1/3 text-center font-medium text-gray-300">{phone1.name}</div>
            <div className="w-1/3 text-center font-medium text-gray-300">{phone2.name}</div>
          </div>

          {specs.map((spec, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'
              }`}
            >
              <div className="w-1/3 font-medium">{spec.name}</div>
              
              <div className={`w-1/3 text-center ${
                spec.winner === 'phone1'
                  ? 'text-green-400 font-semibold' 
                  : ''
              }`}>
                {spec.phone1}
              </div>
              
              <div className={`w-1/3 text-center ${
                spec.winner === 'phone2'
                  ? 'text-green-400 font-semibold' 
                  : ''
              }`}>
                {spec.phone2}
              </div>
            </div>
          ))}
        </div>
        <p className="text-white text-lg m-2 mt-8">{summary}</p>
        </div>
      </div>
    </div>
    </div>
  );
};