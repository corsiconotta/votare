import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Vote, MP, VotePosition, VoteRecord } from '../../types';
import { format, parseISO } from 'date-fns';
import { Plus, Search, Edit, Trash2, FileUp, X, ListChecks } from 'lucide-react';

const AdminVoteRecords: React.FC = () => {
  const [voteRecords, setVoteRecords] = useState<Array<VoteRecord & { mp: MP, vote: Vote }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<(VoteRecord & { mp: MP, vote: Vote }) | null>(null);
  const [mps, setMPs] = useState<MP[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [formData, setFormData] = useState({
    mpId: '',
    voteId: '',
    position: VotePosition.FOR,
  });
  const [csvMode, setCsvMode] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  useEffect(() => {
    fetchVoteRecords();
    fetchMPs();
    fetchVotes();
  }, []);

  const fetchVoteRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vote_records')
        .select(`
          id,
          position,
          mp:mps(id, name, party, chamber),
          vote:votes(id, title, date)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVoteRecords(data as Array<VoteRecord & { mp: MP, vote: Vote }>);
    } catch (error) {
      console.error('Error fetching vote records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMPs = async () => {
    try {
      const { data, error } = await supabase
        .from('mps')
        .select('id, name, party, chamber')
        .order('name');
      
      if (error) throw error;
      setMPs(data as MP[]);
    } catch (error) {
      console.error('Error fetching MPs:', error);
    }
  };

  const fetchVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('id, title, date')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setVotes(data as Vote[]);
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      mpId: '',
      voteId: '',
      position: VotePosition.FOR,
    });
    setEditingRecord(null);
    setCsvMode(false);
    setCsvContent('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleEditRecord = (record: VoteRecord & { mp: MP, vote: Vote }) => {
    setFormData({
      mpId: record.mp.id,
      voteId: record.vote.id,
      position: record.position,
    });
    setEditingRecord(record);
    setShowModal(true);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vote record?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vote_records')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh the list
      fetchVoteRecords();
    } catch (error) {
      console.error('Error deleting vote record:', error);
      alert('Failed to delete vote record.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (csvMode) {
      await handleCsvUpload();
      return;
    }
    
    try {
      if (editingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('vote_records')
          .update(formData)
          .eq('id', editingRecord.id);
        
        if (error) throw error;
      } else {
        // Check if record already exists
        const { data: existingRecord, error: checkError } = await supabase
          .from('vote_records')
          .select('id')
          .eq('mpId', formData.mpId)
          .eq('voteId', formData.voteId)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }
        
        if (existingRecord) {
          alert('A record for this MP and vote already exists. Please edit the existing record instead.');
          return;
        }
        
        // Insert new record
        const { error } = await supabase
          .from('vote_records')
          .insert(formData);
        
        if (error) throw error;
      }
      
      // Close modal and reset form
      handleCloseModal();
      
      // Refresh the list
      fetchVoteRecords();
    } catch (error) {
      console.error('Error saving vote record:', error);
      alert('Failed to save vote record');
    }
  };

  const handleCsvUpload = async () => {
    if (!csvContent.trim()) {
      alert('Please enter CSV content');
      return;
    }
    
    try {
      // Parse CSV
      const lines = csvContent.trim().split('\n');
      const records = [];
      
      for (let i = 0; i < lines.length; i++) {
        if (i === 0) continue; // Skip header row
        
        const columns = lines[i].split(',');
        if (columns.length < 3) continue;
        
        const mpId = columns[0].trim();
        const voteId = columns[1].trim();
        const position = columns[2].trim().toUpperCase() as VotePosition;
        
        // Validate position
        if (!Object.values(VotePosition).includes(position)) {
          alert(`Invalid position at line ${i + 1}: ${position}. Must be one of: FOR, AGAINST, ABSTAIN, ABSENT`);
          return;
        }
        
        records.push({
          mpId,
          voteId,
          position,
        });
      }
      
      if (records.length === 0) {
        alert('No valid records found in CSV');
        return;
      }
      
      // Insert records
      const { error } = await supabase
        .from('vote_records')
        .insert(records);
      
      if (error) throw error;
      
      alert(`Successfully imported ${records.length} vote records`);
      
      // Close modal and refresh
      handleCloseModal();
      fetchVoteRecords();
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Failed to import CSV. Make sure the format is correct and that records don\'t already exist.');
    }
  };

  const toggleCsvMode = () => {
    setCsvMode(!csvMode);
    if (!csvMode && csvContent === '') {
      // Set CSV template
      setCsvContent('mpId,voteId,position\n,,FOR');
    }
  };

  const filteredRecords = voteRecords.filter(record => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      record.mp.name.toLowerCase().includes(searchLower) ||
      record.vote.title.toLowerCase().includes(searchLower) ||
      record.mp.party.toLowerCase().includes(searchLower) ||
      record.position.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Manage Vote Records</h1>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vote Record
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vote records..."
            className="w-full px-4 py-2 pl-10 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Vote Record List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredRecords.length > 0 ? (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  MP
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Vote
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-neutral-900">{record.mp.name}</div>
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-neutral-100 text-neutral-800">
                        {record.mp.party}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-900 line-clamp-1">{record.vote.title}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {format(parseISO(record.vote.date), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.position === VotePosition.FOR 
                        ? 'bg-success-100 text-success-800' 
                        : record.position === VotePosition.AGAINST
                          ? 'bg-error-100 text-error-800'
                          : record.position === VotePosition.ABSTAIN
                            ? 'bg-warning-100 text-warning-800'
                            : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {record.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditRecord(record)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-error-600 hover:text-error-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <ListChecks className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">
              {searchQuery ? 'No vote records found matching your search' : 'No vote records added yet'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Vote Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingRecord ? 'Edit Vote Record' : 'Add Vote Record'}
              </h2>
              <button onClick={handleCloseModal} className="text-neutral-500 hover:text-neutral-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between mb-6">
                <button
                  type="button"
                  onClick={toggleCsvMode}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    csvMode 
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  CSV Import
                </button>
                
                <button
                  type="button"
                  onClick={toggleCsvMode}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    !csvMode 
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Single Record
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                {csvMode ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      CSV Content
                    </label>
                    <p className="text-xs text-neutral-500 mb-2">
                      Format: mpId,voteId,position (one per line, with header row)
                    </p>
                    <textarea
                      value={csvContent}
                      onChange={(e) => setCsvContent(e.target.value)}
                      rows={10}
                      className="w-full border border-neutral-300 rounded-md p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="mpId,voteId,position"
                      required
                    ></textarea>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label htmlFor="mpId" className="block text-sm font-medium text-neutral-700 mb-1">
                        MP *
                      </label>
                      <select
                        id="mpId"
                        name="mpId"
                        value={formData.mpId}
                        onChange={handleInputChange}
                        className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                        disabled={!!editingRecord}
                      >
                        <option value="">Select an MP</option>
                        {mps.map((mp) => (
                          <option key={mp.id} value={mp.id}>
                            {mp.name} ({mp.party}, {mp.chamber === 'DEPUTIES' ? 'Deputy' : 'Senator'})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="voteId" className="block text-sm font-medium text-neutral-700 mb-1">
                        Vote *
                      </label>
                      <select
                        id="voteId"
                        name="voteId"
                        value={formData.voteId}
                        onChange={handleInputChange}
                        className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                        disabled={!!editingRecord}
                      >
                        <option value="">Select a vote</option>
                        {votes.map((vote) => (
                          <option key={vote.id} value={vote.id}>
                            {vote.title} ({format(parseISO(vote.date), 'MMM d, yyyy')})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="position" className="block text-sm font-medium text-neutral-700 mb-1">
                        Position *
                      </label>
                      <select
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value={VotePosition.FOR}>For</option>
                        <option value={VotePosition.AGAINST}>Against</option>
                        <option value={VotePosition.ABSTAIN}>Abstain</option>
                        <option value={VotePosition.ABSENT}>Absent</option>
                      </select>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {csvMode 
                      ? 'Import CSV' 
                      : editingRecord 
                        ? 'Update Record' 
                        : 'Add Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVoteRecords;