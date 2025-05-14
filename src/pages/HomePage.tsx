import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Vote as VoteType } from '../types';
import VoteCard from '../components/VoteCard';
import { ChevronRight, Search, Vote, Users } from 'lucide-react';

const HomePage: React.FC = () => {
  const [recentVotes, setRecentVotes] = useState<VoteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecentVotes = async () => {
      try {
        const { data, error } = await supabase
          .from('votes')
          .select('*')
          .order('date', { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentVotes(data as VoteType[]);
      } catch (error) {
        console.error('Error fetching recent votes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentVotes();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to votes page with search query
    window.location.href = `/votes?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-primary-800 text-white py-16 px-6 rounded-lg relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Bringing Transparency to the Romanian Parliament
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8">
            Track how Members of Parliament vote on legislation and hold them accountable.
          </p>
          
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for votes, MPs, or topics..."
              className="w-full px-5 py-4 pr-12 rounded-lg text-neutral-800 focus:outline-none focus:ring-2 focus:ring-romania-yellow"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Search className="h-6 w-6 text-neutral-500" />
            </button>
          </form>
        </div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary-600"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-primary-600"></div>
        </div>
      </section>

      {/* Recent Votes Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900">Recent Votes</h2>
          <Link to="/votes" className="text-primary-600 hover:text-primary-700 flex items-center">
            View all <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : recentVotes.length > 0 ? (
            recentVotes.map((vote) => (
              <VoteCard key={vote.id} vote={vote} />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Vote className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">No votes available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="bg-primary-100 text-primary-600 p-3 rounded-lg inline-block mb-4">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Search & Filter</h3>
          <p className="text-neutral-600">
            Find votes and MPs by name, topic, party, or chamber with our powerful search and filter options.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="bg-secondary-100 text-secondary-600 p-3 rounded-lg inline-block mb-4">
            <Vote className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Voting Records</h3>
          <p className="text-neutral-600">
            See how each MP votes on legislation that matters to you and track their voting patterns over time.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="bg-success-100 text-success-600 p-3 rounded-lg inline-block mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">MP Profiles</h3>
          <p className="text-neutral-600">
            Explore detailed profiles of Members of Parliament, including their voting history and party alignments.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;