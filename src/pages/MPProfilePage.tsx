import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MP, VoteRecord, Vote as VoteType } from '../types';
import VoteCard from '../components/VoteCard';
import { format } from 'date-fns';
import { ArrowLeft, Mail, MapPin, Vote, User, Building2 } from 'lucide-react';

const MPProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mp, setMP] = useState<MP | null>(null);
  const [votes, setVotes] = useState<Array<VoteType & { position: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [votingStats, setVotingStats] = useState({
    total: 0,
    for: 0,
    against: 0,
    abstain: 0,
    absent: 0,
  });

  useEffect(() => {
    const fetchMPData = async () => {
      if (!id) return;
      
      try {
        // Fetch MP details
        const { data: mpData, error: mpError } = await supabase
          .from('mps')
          .select('*')
          .eq('id', id)
          .single();

        if (mpError) throw mpError;
        setMP(mpData as MP);

        // Fetch vote records with vote details
        const { data: recordsData, error: recordsError } = await supabase
          .from('vote_records')
          .select(`
            position,
            vote:voteId(*)
          `)
          .eq('mpId', id)
          .order('vote(date)', { ascending: false });

        if (recordsError) throw recordsError;

        // Process and count vote statistics
        let forCount = 0;
        let againstCount = 0;
        let abstainCount = 0;
        let absentCount = 0;

        const processedVotes = recordsData.map((record: any) => {
          // Count votes by position
          switch (record.position) {
            case 'FOR':
              forCount++;
              break;
            case 'AGAINST':
              againstCount++;
              break;
            case 'ABSTAIN':
              abstainCount++;
              break;
            case 'ABSENT':
              absentCount++;
              break;
          }

          return {
            ...record.vote,
            position: record.position,
          };
        });

        setVotes(processedVotes);
        setVotingStats({
          total: recordsData.length,
          for: forCount,
          against: againstCount,
          abstain: abstainCount,
          absent: absentCount,
        });
      } catch (error) {
        console.error('Error fetching MP data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMPData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!mp) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <User className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">MP Not Found</h2>
        <p className="text-neutral-600 mb-4">We couldn't find the MP you're looking for.</p>
        <Link to="/mps" className="text-primary-600 font-medium hover:underline">
          Return to MPs
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/mps" className="inline-flex items-center text-primary-600 mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to MPs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MP Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-24">
            <div className="aspect-square bg-neutral-100 flex items-center justify-center">
              {mp.imageUrl ? (
                <img 
                  src={mp.imageUrl}
                  alt={mp.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-32 h-32 text-neutral-400" />
              )}
            </div>
            
            <div className="p-6">
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                {mp.name}
              </h1>
              
              <div className="flex items-center mb-4">
                <span className="text-lg font-medium">{mp.party}</span>
              </div>
              
              <div className="space-y-3 text-neutral-700">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-neutral-500 mr-2" />
                  <span>
                    {mp.chamber === 'DEPUTIES' ? 'Camera Deputaților' : 'Senat'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-neutral-500 mr-2" />
                  <span>{mp.region}</span>
                </div>
                
                {mp.contactEmail && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-neutral-500 mr-2" />
                    <a href={`mailto:${mp.contactEmail}`} className="text-primary-600 hover:underline">
                      {mp.contactEmail}
                    </a>
                  </div>
                )}
              </div>
              
              {mp.bio && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <h2 className="font-semibold text-lg mb-2">Biography</h2>
                  <p className="text-neutral-700">{mp.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Voting History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Voting Statistics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-success-50 p-4 rounded-lg text-center">
                <span className="block text-2xl font-bold text-success-700">
                  {votingStats.for}
                </span>
                <span className="text-sm text-neutral-600">Votes For</span>
              </div>
              
              <div className="bg-error-50 p-4 rounded-lg text-center">
                <span className="block text-2xl font-bold text-error-700">
                  {votingStats.against}
                </span>
                <span className="text-sm text-neutral-600">Votes Against</span>
              </div>
              
              <div className="bg-warning-50 p-4 rounded-lg text-center">
                <span className="block text-2xl font-bold text-warning-700">
                  {votingStats.abstain}
                </span>
                <span className="text-sm text-neutral-600">Abstentions</span>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg text-center">
                <span className="block text-2xl font-bold text-neutral-700">
                  {votingStats.absent}
                </span>
                <span className="text-sm text-neutral-600">Absences</span>
              </div>
            </div>
            
            {votingStats.total > 0 && (
              <div className="mb-8">
                <h3 className="font-medium mb-2">Voting Distribution</h3>
                <div className="w-full h-4 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    <div 
                      className="bg-success-500 h-full" 
                      style={{ width: `${(votingStats.for / votingStats.total) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-error-500 h-full" 
                      style={{ width: `${(votingStats.against / votingStats.total) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-warning-500 h-full" 
                      style={{ width: `${(votingStats.abstain / votingStats.total) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-neutral-400 h-full" 
                      style={{ width: `${(votingStats.absent / votingStats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>For: {Math.round((votingStats.for / votingStats.total) * 100)}%</span>
                  <span>Against: {Math.round((votingStats.against / votingStats.total) * 100)}%</span>
                  <span>Abstain: {Math.round((votingStats.abstain / votingStats.total) * 100)}%</span>
                  <span>Absent: {Math.round((votingStats.absent / votingStats.total) * 100)}%</span>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-6">Voting History</h2>
            
            {votes.length > 0 ? (
              <div className="space-y-4">
                {votes.map((vote) => (
                  <Link 
                    key={vote.id}
                    to={`/votes/${vote.id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 block animate-slide-in"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-neutral-500 text-sm mb-1">
                          {format(new Date(vote.date), 'MMMM d, yyyy')}
                        </p>
                        
                        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                          {vote.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
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
                      
                      <div className="ml-4 flex-shrink-0">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          vote.position === 'FOR' 
                            ? 'bg-success-100 text-success-700' 
                            : vote.position === 'AGAINST'
                              ? 'bg-error-100 text-error-700'
                              : vote.position === 'ABSTAIN'
                                ? 'bg-warning-100 text-warning-700'
                                : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {vote.position}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Vote className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600">No voting history available for this MP.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MPProfilePage;