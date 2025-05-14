import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Vote as VoteType, MP, VotePosition } from '../../types';
import { format } from 'date-fns';
import { Vote, Users, Clock, AlertTriangle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalMPs: 0,
    totalVotes: 0,
    totalVoteRecords: 0,
    recentVotes: [] as VoteType[],
    mpsWithoutVotes: [] as MP[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total MPs
        const { count: mpCount, error: mpError } = await supabase
          .from('mps')
          .select('*', { count: 'exact', head: true });

        if (mpError) throw mpError;

        // Fetch total votes
        const { count: voteCount, error: voteError } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true });

        if (voteError) throw voteError;

        // Fetch total vote records
        const { count: recordCount, error: recordError } = await supabase
          .from('vote_records')
          .select('*', { count: 'exact', head: true });

        if (recordError) throw recordError;

        // Fetch recent votes
        const { data: recentVotesData, error: recentVotesError } = await supabase
          .from('votes')
          .select('*')
          .order('date', { ascending: false })
          .limit(5);

        if (recentVotesError) throw recentVotesError;

        // Find MPs without votes
        const { data: mpsWithoutVotesData, error: mpsWithoutVotesError } = await supabase
          .rpc('get_mps_without_votes')
          .limit(5);

        if (mpsWithoutVotesError) {
          console.error('Error fetching MPs without votes:', mpsWithoutVotesError);
          // Fallback if the RPC doesn't exist, just set an empty array
          setStats({
            totalMPs: mpCount || 0,
            totalVotes: voteCount || 0,
            totalVoteRecords: recordCount || 0,
            recentVotes: recentVotesData as VoteType[] || [],
            mpsWithoutVotes: [],
          });
        } else {
          setStats({
            totalMPs: mpCount || 0,
            totalVotes: voteCount || 0,
            totalVoteRecords: recordCount || 0,
            recentVotes: recentVotesData as VoteType[] || [],
            mpsWithoutVotes: mpsWithoutVotesData as MP[] || [],
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="bg-primary-100 text-primary-600 p-3 rounded-lg mr-4">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Total MPs</p>
            <p className="text-2xl font-bold">{stats.totalMPs}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="bg-secondary-100 text-secondary-600 p-3 rounded-lg mr-4">
            <Vote className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Total Votes</p>
            <p className="text-2xl font-bold">{stats.totalVotes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="bg-success-100 text-success-600 p-3 rounded-lg mr-4">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Vote Records</p>
            <p className="text-2xl font-bold">{stats.totalVoteRecords}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Votes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="font-semibold">Recent Votes</h2>
          </div>
          <div className="p-6">
            {stats.recentVotes.length > 0 ? (
              <div className="divide-y divide-neutral-200">
                {stats.recentVotes.map((vote) => (
                  <div key={vote.id} className="py-4 first:pt-0 last:pb-0">
                    <p className="text-sm text-neutral-500 mb-1">
                      {format(new Date(vote.date), 'MMMM d, yyyy')}
                    </p>
                    <Link 
                      to={`/admin/votes`} 
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      {vote.title}
                    </Link>
                    <div className="flex items-center mt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                        vote.result === 'PASSED' 
                          ? 'bg-success-100 text-success-700' 
                          : 'bg-error-100 text-error-700'
                      }`}>
                        {vote.result === 'PASSED' ? 'Passed' : 'Failed'}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {vote.chamber === 'DEPUTIES' ? 'Camera Deputaților' : 'Senat'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-4">No votes added yet.</p>
            )}
            
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <Link 
                to="/admin/votes" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Manage all votes
              </Link>
            </div>
          </div>
        </div>

        {/* MPs without Votes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="font-semibold">MPs Needing Vote Records</h2>
          </div>
          <div className="p-6">
            {stats.mpsWithoutVotes && stats.mpsWithoutVotes.length > 0 ? (
              <div className="divide-y divide-neutral-200">
                {stats.mpsWithoutVotes.map((mp) => (
                  <div key={mp.id} className="py-4 first:pt-0 last:pb-0 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                      {mp.imageUrl ? (
                        <img 
                          src={mp.imageUrl} 
                          alt={mp.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                    <div>
                      <Link 
                        to={`/admin/vote-records`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {mp.name}
                      </Link>
                      <p className="text-xs text-neutral-500">
                        {mp.party} • {mp.chamber === 'DEPUTIES' ? 'Deputy' : 'Senator'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 text-center">
                <div>
                  <div className="bg-success-100 text-success-600 p-3 rounded-full inline-block mb-2">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="text-neutral-600">All MPs have vote records!</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <Link 
                to="/admin/vote-records" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Manage vote records
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;