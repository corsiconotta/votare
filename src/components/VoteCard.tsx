import React from 'react';
import { Link } from 'react-router-dom';
import { Vote as VoteType } from '../types';
import { format } from 'date-fns';
import { Vote } from 'lucide-react';

interface VoteCardProps {
  vote: VoteType;
}

const VoteCard: React.FC<VoteCardProps> = ({ vote }) => {
  const totalVotes = vote.totalFor + vote.totalAgainst + vote.totalAbstain + vote.totalAbsent;
  const forPercentage = totalVotes > 0 ? Math.round((vote.totalFor / totalVotes) * 100) : 0;
  const againstPercentage = totalVotes > 0 ? Math.round((vote.totalAgainst / totalVotes) * 100) : 0;
  
  return (
    <Link 
      to={`/votes/${vote.id}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 block animate-slide-in"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-neutral-900 mb-2 line-clamp-2">
            {vote.title}
          </h3>
          <p className="text-neutral-500 text-sm mb-4">
            {format(new Date(vote.date), 'MMMM d, yyyy')} • {vote.chamber === 'DEPUTIES' ? 'Camera Deputaților' : 'Senat'}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {vote.topics.map((topic, index) => (
              <span 
                key={index}
                className="bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
          
          <p className="text-neutral-700 line-clamp-2 mb-4 text-sm">
            {vote.description}
          </p>
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <div className={`p-2 rounded-full ${
            vote.result === 'PASSED' 
              ? 'bg-success-100 text-success-700' 
              : 'bg-error-100 text-error-700'
          }`}>
            <Vote className="h-5 w-5" />
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div 
              className="bg-success-500 h-full" 
              style={{ width: `${forPercentage}%` }}
            ></div>
            <div 
              className="bg-error-500 h-full" 
              style={{ width: `${againstPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <div className="flex space-x-4">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-success-500 mr-1"></span>
              For: {vote.totalFor}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-error-500 mr-1"></span>
              Against: {vote.totalAgainst}
            </span>
          </div>
          <div>
            <span className="font-medium">
              {vote.result === 'PASSED' ? 'Passed' : 'Failed'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VoteCard;