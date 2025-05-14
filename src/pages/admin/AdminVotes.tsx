import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Vote, Chamber } from '../../types';
import { format, parseISO } from 'date-fns';
import { Plus, Search, Edit, Trash2, XCircle, X, Vote as VoteIcon } from 'lucide-react';

const AdminVotes: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVote, setEditingVote] = useState<Vote | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    chamber: Chamber.DEPUTIES,
    date: '',
    topics: [] as string[],
    result: 'PASSED',
    totalFor: 0,
    totalAgainst: 0,
    totalAbstain: 0,
    totalAbsent: 0,
  });
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setVotes(data as Vote[]);
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      chamber: Chamber.DEPUTIES,
      date: format(new Date(), 'yyyy-MM-dd'),
      topics: [],
      result: 'PASSED',
      totalFor: 0,
      totalAgainst: 0,
      totalAbstain: 0,
      totalAbsent: 0,
    });
    setEditingVote(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleEditVote = (vote: Vote) => {
    setFormData({
      title: vote.title,
      description: vote.description,
      chamber: vote.chamber,
      date: format(new Date(vote.date), 'yyyy-MM-dd'),
      topics: vote.topics,
      result: vote.result,
      totalFor: vote.totalFor,
      totalAgainst: vote.totalAgainst,
      totalAbstain: vote.totalAbstain,
      totalAbsent: vote.totalAbsent,
    });
    setEditingVote(vote);
    setShowModal(true);
  };

  const handleDeleteVote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vote? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh the list
      fetchVotes();
    } catch (error) {
      console.error('Error deleting vote:', error);
      alert('Failed to delete vote. It might have associated vote records.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const addTopic = () => {
    if (newTopic.trim() && !formData.topics.includes(newTopic.trim())) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()],
      }));
      setNewTopic('');
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic !== topicToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const voteData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };
      
      if (editingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('votes')
          .update(voteData)
          .eq('id', editingVote.id);
        
        if (error) throw error;
      } else {
        // Insert new vote
        const { error } = await supabase
          .from('votes')
          .insert(voteData);
        
        if (error) throw error;
      }
      
      // Close modal and reset form
      handleCloseModal();
      
      // Refresh the list
      fetchVotes();
    } catch (error) {
      console.error('Error saving vote:', error);
      alert('Failed to save vote');
    }
  };

  const filteredVotes = votes.filter(vote => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      vote.title.toLowerCase().includes(searchLower) ||
      vote.description.toLowerCase().includes(searchLower) ||
      vote.topics.some(topic => topic.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Manage Votes</h1>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vote
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search votes..."
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

      {/* Vote List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredVotes.length > 0 ? (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Vote
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Chamber
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Result
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredVotes.map((vote) => (
                <tr key={vote.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-neutral-100 p-2 rounded-full">
                        <VoteIcon className="h-5 w-5 text-neutral-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900 line-clamp-1">{vote.title}</div>
                        <div className="text-xs text-neutral-500 mt-1 flex flex-wrap gap-1">
                          {vote.topics.map((topic, i) => (
                            <span key={i} className="inline-flex items-center bg-neutral-100 px-2 py-0.5 rounded text-xs">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">
                      {format(parseISO(vote.date), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-800">
                      {vote.chamber === Chamber.DEPUTIES ? 'Deputații' : 'Senat'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      vote.result === 'PASSED' 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {vote.result === 'PASSED' ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditVote(vote)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVote(vote.id)}
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
            <VoteIcon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">
              {searchQuery ? 'No votes found matching your search' : 'No votes added yet'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Vote Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingVote ? 'Edit Vote' : 'Add New Vote'}
              </h2>
              <button onClick={handleCloseModal} className="text-neutral-500 hover:text-neutral-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-neutral-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="chamber" className="block text-sm font-medium text-neutral-700 mb-1">
                    Chamber *
                  </label>
                  <select
                    id="chamber"
                    name="chamber"
                    value={formData.chamber}
                    onChange={handleInputChange}
                    className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value={Chamber.DEPUTIES}>Camera Deputaților</option>
                    <option value={Chamber.SENATE}>Senat</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="result" className="block text-sm font-medium text-neutral-700 mb-1">
                    Result *
                  </label>
                  <select
                    id="result"
                    name="result"
                    value={formData.result}
                    onChange={handleInputChange}
                    className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="PASSED">Passed</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Topics
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="flex-1 border border-neutral-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Add a topic"
                  />
                  <button
                    type="button"
                    onClick={addTopic}
                    className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.topics.map((topic, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center bg-neutral-100 px-3 py-1 rounded-full text-sm"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => removeTopic(topic)}
                        className="ml-2 text-neutral-500 hover:text-neutral-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label htmlFor="totalFor" className="block text-sm font-medium text-neutral-700 mb-1">
                    Total For *
                  </label>
                  <input
                    type="number"
                    id="totalFor"
                    name="totalFor"
                    value={formData.totalFor}
                    onChange={handleNumberInputChange}
                    className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="totalAgainst" className="block text-sm font-medium text-neutral-700 mb-1">
                    Total Against *
                  </label>
                  <input
                    type="number"
                    id="totalAgainst"
                    name="totalAgainst"
                    value={formData.totalAgainst}
                    onChange={handleNumberInputChange}
                    className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="totalAbstain" className="block text-sm font-medium text-neutral-700 mb-1">
                    Total Abstain *
                  </label>
                  <input
                    type="number"
                    id="totalAbstain"
                    name="totalAbstain"
                    value={formData.totalAbstain}
                    onChange={handleNumberInputChange}
                    className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="totalAbsent" className="block text-sm font-medium text-neutral-700 mb-1">
                    Total Absent *
                  </label>
                  <input
                    type="number"
                    id="totalAbsent"
                    name="totalAbsent"
                    value={formData.totalAbsent}
                    onChange={handleNumberInputChange}
                    className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>
              </div>
              
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
                  {editingVote ? 'Update Vote' : 'Add Vote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVotes;