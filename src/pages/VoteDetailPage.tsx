import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MP, VoteRecord, Vote as VoteType } from '../types';
import VoteChart from '../components/VoteChart';
import { format } from 'date-fns';
import { ArrowLeft, User, Vote, Search } from 'lucide-react';

const VoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vote, setVote] = useState<VoteType | null>(null);
  const [voteRecords, setVoteRecords] = useState<Array<VoteRecord & { mp: MP }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<VotePosition | ''>('');

  useEffect(() => {
    const fetchVoteDetails = async () => {
      if (!id) return;
      
      try {
        // Fetch vote details
        const { data: voteData, error: voteError } = await supabase
          .from('votes')
          .select('*')
          .eq('id', id)
          .single();

        if (voteError) throw voteError;
        setVote(voteData as VoteType);

        // Fetch vote records with MP data - Fixed relationship query
        const { data: recordsData, error: recordsError } = await supabase
          .from('vote_records')
          .select(`
            id,
            position,
            mp:mps(id, name, party, chamber, region, imageUrl)
          `)
          .eq('voteId', id);

        if (recordsError) throw recordsError;
        setVoteRecords(recordsData as Array<VoteRecord & { mp: MP }>);
      } catch (error) {
        console.error('Error fetching vote details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVoteDetails();
  }, [id]);

  // Filter vote records by MP name and position
  const filteredVoteRecords = voteRecords.filter((record) => {
    const nameMatch = searchQuery
      ? record.mp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.mp.party.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const positionMatch = positionFilter ? record.position === positionFilter : true;
    
    return nameMatch && positionMatch;
  });

  // Grouped vote records by position
  const groupedByPosition = {
    [VotePosition.FOR]: filteredVoteRecords.filter(r => r.position === VotePosition.FOR),
    [VotePosition.AGAINST]: filteredVoteRecords.filter(r => r.position === VotePosition.AGAINST),
    [VotePosition.ABSTAIN]: filteredVoteRecords.filter(r => r.position === VotePosition.ABSTAIN),
    [VotePosition.ABSENT]: filteredVoteRecords.filter(r => r.position === VotePosition.ABSENT),
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!vote) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Vote className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Vote Not Found</h2>
        <p className="text-neutral-600 mb-4">We couldn't find the vote you're looking for.</p>
        <Link to="/votes" className="text-primary-600 font-medium hover:underline">
          Return to votes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/votes" className="inline-flex items-center text-primary-600 mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to votes
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="border-b border-neutral-200 pb-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center mb-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mr-2 ${
                  vote.result === 'PASSED' 
                    ? 'bg-success-100 text-success-700' 
                    : 'bg-error-100 text-error-700'
                }`}>
                  {vote.result === 'PASSED' ? 'Passed' : 'Failed'}
                </span>
                <span className="text-neutral-500">{format(new Date(vote.date), 'MMMM d, yyyy')}</span>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">{vote.title}</h1>
              
              <div className="flex flex-wrap items-center text-sm text-neutral-600 mb-4">
                <span className="mr-4">Chamber: <span className="font-medium">
                  {vote.chamber === 'DEPUTIES' ? 'Camera Deputaților' : 'Senat'}
                </span></span>
              </div>
              
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
            </div>
          </div>
          
          <p className="text-neutral-700 mt-4">
            {vote.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Vote Result</h2>
            <VoteChart 
              totalFor={vote.totalFor}
              totalAgainst={vote.totalAgainst}
              totalAbstain={vote.totalAbstain}
              totalAbsent={vote.totalAbsent}
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Totals</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-success-50 rounded">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-success-500 mr-2"></span>
                  <span className="font-medium">For</span>
                </div>
                <span className="text-lg font-semibold">{vote.totalFor}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-error-50 rounded">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-error-500 mr-2"></span>
                  <span className="font-medium">Against</span>
                </div>
                <span className="text-lg font-semibold">{vote.totalAgainst}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-warning-50 rounded">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-warning-500 mr-2"></span>
                  <span className="font-medium">Abstain</span>
                </div>
                <span className="text-lg font-semibold">{vote.totalAbstain}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-neutral-400 mr-2"></span>
                  <span className="font-medium">Absent</span>
                </div>
                <span className="text-lg font-semibold">{vote.totalAbsent}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">How MPs Voted</h2>
        
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="relative md:w-1/3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by MP or party..."
              className="w-full px-4 py-2 pl-10 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          <div>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value as VotePosition | '')}
              className="w-full md:w-auto border border-neutral-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Positions</option>
              <option value={VotePosition.FOR}>For</option>
              <option value={VotePosition.AGAINST}>Against</option>
              <option value={VotePosition.ABSTAIN}>Abstain</option>
              <option value={VotePosition.ABSENT}>Absent</option>
            </select>
          </div>
        </div>

        {Object.keys(groupedByPosition).map((position) => {
          const records = groupedByPosition[position as VotePosition];
          if (!records.length && positionFilter && positionFilter !== position) return null;
          
          return (
            <div key={position} className="mb-8">
              <h3 className="font-semibold mb-4 px-4 py-2 rounded-md text-white text-sm uppercase tracking-wider inline-block" 
                style={{
                  backgroundColor: 
                    position === VotePosition.FOR 
                      ? '#16a34a' 
                      : position === VotePosition.AGAINST 
                        ? '#dc2626' 
                        : position === VotePosition.ABSTAIN 
                          ? '#f59e0b' 
                          : '#94a3b8'
                }}>
                {position} ({records.length})
              </h3>
              
              {records.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {records.map((record) => (
                    <Link 
                      key={record.id} 
                      to={`/mps/${record.mp.id}`}
                      className="flex items-center p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors animate-slide-in"
                    >
                      <div className="flex-shrink-0 mr-3">
                        {record.mp.imageUrl ? (
                          <img 
                            src={record.mp.imageUrl} 
                            alt={record.mp.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                            <User className="w-6 h-6 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{record.mp.name}</p>
                        <p className="text-sm text-neutral-500">{record.mp.party}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 italic">No MPs in this category</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VoteDetailPage;