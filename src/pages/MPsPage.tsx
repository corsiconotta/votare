import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MP, Chamber } from '../types';
import MPCard from '../components/MPCard';
import { Search, Filter, ChevronDown, X, Users } from 'lucide-react';

const MPsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mps, setMPs] = useState<MP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [chamberFilter, setChamberFilter] = useState<Chamber | ''>(searchParams.get('chamber') as Chamber || '');
  const [partyFilter, setPartyFilter] = useState(searchParams.get('party') || '');
  const [regionFilter, setRegionFilter] = useState(searchParams.get('region') || '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [availableParties, setAvailableParties] = useState<string[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);

  // Fetch available filters data
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch parties
        const { data: partyData, error: partyError } = await supabase
          .from('mps')
          .select('party');

        if (partyError) throw partyError;
        
        const uniqueParties = Array.from(new Set(partyData.map(mp => mp.party)));
        setAvailableParties(uniqueParties);

        // Fetch regions
        const { data: regionData, error: regionError } = await supabase
          .from('mps')
          .select('region');

        if (regionError) throw regionError;
        
        const uniqueRegions = Array.from(new Set(regionData.map(mp => mp.region)));
        setAvailableRegions(uniqueRegions);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  // Fetch MPs
  useEffect(() => {
    const fetchMPs = async () => {
      setLoading(true);
      
      try {
        let query = supabase
          .from('mps')
          .select('*')
          .order('name');

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,party.ilike.%${searchQuery}%,region.ilike.%${searchQuery}%`);
        }

        if (chamberFilter) {
          query = query.eq('chamber', chamberFilter);
        }

        if (partyFilter) {
          query = query.eq('party', partyFilter);
        }

        if (regionFilter) {
          query = query.eq('region', regionFilter);
        }

        const { data, error } = await query;

        if (error) throw error;
        setMPs(data as MP[]);
      } catch (error) {
        console.error('Error fetching MPs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMPs();
    
    // Update URL search params
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (chamberFilter) params.set('chamber', chamberFilter);
    if (partyFilter) params.set('party', partyFilter);
    if (regionFilter) params.set('region', regionFilter);
    setSearchParams(params);
    
  }, [searchQuery, chamberFilter, partyFilter, regionFilter, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the effect dependency on searchQuery
  };

  const clearFilters = () => {
    setSearchQuery('');
    setChamberFilter('');
    setPartyFilter('');
    setRegionFilter('');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Members of Parliament</h1>
        <p className="text-neutral-600 max-w-3xl">
          Browse and search through all Members of Parliament in Romania. Use the filters to narrow down results by chamber, party, or region.
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
              placeholder="Search for MPs..."
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

          {(chamberFilter || partyFilter || regionFilter) && (
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
              <label htmlFor="party-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                Party
              </label>
              <select
                id="party-filter"
                value={partyFilter}
                onChange={(e) => setPartyFilter(e.target.value)}
                className="w-full border border-neutral-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Parties</option>
                {availableParties.map((party) => (
                  <option key={party} value={party}>
                    {party}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="region-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                Region
              </label>
              <select
                id="region-filter"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full border border-neutral-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Regions</option>
                {availableRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : mps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mps.map((mp) => <MPCard key={mp.id} mp={mp} />)}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 mb-2">No MPs found matching your criteria.</p>
            <button onClick={clearFilters} className="text-primary-600 font-medium">
              Clear filters and try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MPsPage;