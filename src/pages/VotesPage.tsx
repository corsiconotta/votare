import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Vote as VoteType, Chamber } from '../types';
import VoteCard from '../components/VoteCard';
import { Search, Filter, ChevronDown, X } from 'lucide-react';

const VotesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [votes, setVotes] = useState<VoteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [chamberFilter, setChamberFilter] = useState<Chamber | ''>('');
  const [topicFilter, setTopicFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  // Fetch all topics from votes
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { data, error } = await supabase
          .from('votes')
          .select('topics');

        if (error) throw error;

        // Extract unique topics from all votes
        const topics = new Set<string>();
        data.forEach((vote) => {
          vote.topics.forEach((topic: string) => {
            topics.add(topic);
          });
        });

        setAvailableTopics(Array.from(topics));
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  // Fetch votes based on filters
  useEffect(() => {
    const fetchVotes = async () => {
      setLoading(true);
      
      try {
        let query = supabase
          .from('votes')
          .select('*')
          .order('date', { ascending: false });

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        if (chamberFilter) {
          query = query.eq('chamber', chamberFilter);
        }

        if (topicFilter) {
          query = query.contains('topics', [topicFilter]);
        }

        if (dateFilter) {
          // Handle date filtering (simplified for this example)
          const currentYear = new Date().getFullYear();
          
          if (dateFilter === 'thisYear') {
            query = query.gte('date', `${currentYear}-01-01`);
          } else if (dateFilter === 'lastYear') {
            query = query.gte('date', `${currentYear - 1}-01-01`).lt('date', `${currentYear}-01-01`);
          }
        }

        const { data, error } = await query;

        if (error) throw error;
        setVotes(data as VoteType[]);
      } catch (error) {
        console.error('Error fetching votes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
    
    // Update URL search params
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (chamberFilter) params.set('chamber', chamberFilter);
    if (topicFilter) params.set('topic', topicFilter);
    if (dateFilter) params.set('date', dateFilter);
    setSearchParams(params);
    
  }, [searchQuery, chamberFilter, topicFilter, dateFilter, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the effect dependency on searchQuery
  };

  const clearFilters = () => {
    setSearchQuery('');
    setChamberFilter('');
    setTopicFilter('');
    setDateFilter('');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Votes</h1>
        <p className="text-neutral-600 max-w-3xl">
          Browse and search through all votes in the Romanian Parliament. Use the filters to narrow down results by chamber, topic, or date.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for votes..."
              className="w-full px-4 py-3 pl-10 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </form>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center text-neutral-700 font-medium"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>

          {(chamberFilter || topicFilter || dateFilter) && (
            <button
              onClick={clearFilters}
              className="text-neutral-500 text-sm hover:text-neutral-700 flex items-center"
            >
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </button>
          )}
        </div>

        {filtersOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-neutral-200 animate-fade-in">
            <div>
              <label htmlFor="chamber-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                Chamber
              </label>
              <select
                id="chamber-filter"
                value={chamberFilter}
                onChange={(e) => setChamberFilter(e.target.value as Chamber | '')}
                className="w-full border border-neutral-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Chambers</option>
                <option value={Chamber.DEPUTIES}>Camera Deputaților</option>
                <option value={Chamber.SENATE}>Senat</option>
              </select>
            </div>

            <div>
              <label htmlFor="topic-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                Topic
              </label>
              <select
                id="topic-filter"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="w-full border border-neutral-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Topics</option>
                {availableTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                Date
              </label>
              <select
                id="date-filter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-neutral-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Time</option>
                <option value="thisYear">This Year</option>
                <option value="lastYear">Last Year</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : votes.length > 0 ? (
          votes.map((vote) => <VoteCard key={vote.id} vote={vote} />)
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-neutral-600 mb-2">No votes found matching your criteria.</p>
            <button onClick={clearFilters} className="text-primary-600 font-medium">
              Clear filters and try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotesPage;