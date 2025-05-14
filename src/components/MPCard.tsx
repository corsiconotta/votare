import React from 'react';
import { Link } from 'react-router-dom';
import { MP } from '../types';
import { UserCircle } from 'lucide-react';

interface MPCardProps {
  mp: MP;
}

const MPCard: React.FC<MPCardProps> = ({ mp }) => {
  return (
    <Link 
      to={`/mps/${mp.id}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col animate-slide-in"
    >
      <div className="aspect-square bg-neutral-100 flex items-center justify-center">
        {mp.imageUrl ? (
          <img 
            src={mp.imageUrl}
            alt={mp.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <UserCircle className="w-20 h-20 text-neutral-400" />
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 mb-1">
          {mp.name}
        </h3>
        
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium mr-2">{mp.party}</span>
          <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
            {mp.chamber === 'DEPUTIES' ? 'Deputy' : 'Senator'}
          </span>
        </div>
        
        <p className="text-neutral-500 text-sm">
          {mp.region}
        </p>
      </div>
    </Link>
  );
};

export default MPCard;