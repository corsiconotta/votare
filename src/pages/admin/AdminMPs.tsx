import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MP, Chamber } from '../../types';
import { Plus, Search, Edit, Trash2, User, X } from 'lucide-react';

const AdminMPs: React.FC = () => {
  const [mps, setMPs] = useState<MP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMP, setEditingMP] = useState<MP | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    chamber: Chamber.DEPUTIES,
    region: '',
    imageUrl: '',
    bio: '',
    contactEmail: '',
  });

  useEffect(() => {
    fetchMPs();
  }, []);

  const fetchMPs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mps')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setMPs(data as MP[]);
    } catch (error) {
      console.error('Error fetching MPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      party: '',
      chamber: Chamber.DEPUTIES,
      region: '',
      imageUrl: '',
      bio: '',
      contactEmail: '',
    });
    setEditingMP(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleEditMP = (mp: MP) => {
    setFormData({
      name: mp.name,
      party: mp.party,
      chamber: mp.chamber,
      region: mp.region,
      imageUrl: mp.imageUrl || '',
      bio: mp.bio || '',
      contactEmail: mp.contactEmail || '',
    });
    setEditingMP(mp);
    setShowAddModal(true);
  };

  const handleDeleteMP = async (id: string) => {
    if (!confirm('Are you sure you want to delete this MP? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('mps')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh the list
      fetchMPs();
    } catch (error) {
      console.error('Error deleting MP:', error);
      alert('Failed to delete MP. They might have associated vote records.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMP) {
        // Update existing MP
        const { error } = await supabase
          .from('mps')
          .update(formData)
          .eq('id', editingMP.id);
        
        if (error) throw error;
      } else {
        // Insert new MP
        const { error } = await supabase
          .from('mps')
          .insert(formData);
        
        if (error) throw error;
      }
      
      // Close modal and reset form
      handleCloseModal();
      
      // Refresh the list
      fetchMPs();
    } catch (error) {
      console.error('Error saving MP:', error);
      alert('Failed to save MP');
    }
  };

  const filteredMPs = mps.filter(mp => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      mp.name.toLowerCase().includes(searchLower) ||
      mp.party.toLowerCase().includes(searchLower) ||
      mp.region.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Manage MPs</h1>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add MP
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search MPs..."
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

      {/* MP List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredMPs.length > 0 ? (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Party
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Chamber
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Region
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredMPs.map((mp) => (
                <tr key={mp.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                        {mp.imageUrl ? (
                          <img src={mp.imageUrl} alt={mp.name} className="h-10 w-10 object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-neutral-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">{mp.name}</div>
                        {mp.contactEmail && (
                          <div className="text-sm text-neutral-500">{mp.contactEmail}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">{mp.party}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-800">
                      {mp.chamber === Chamber.DEPUTIES ? 'Deputy' : 'Senator'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {mp.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditMP(mp)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMP(mp.id)}
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
            <User className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">
              {searchQuery ? 'No MPs found matching your search' : 'No MPs added yet'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit MP Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingMP ? 'Edit MP' : 'Add New MP'}
              </h2>
              <button onClick={handleCloseModal} className="text-neutral-500 hover:text-neutral-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="party" className="block text-sm font-medium text-neutral-700 mb-1">
                    Party *
                  </label>
                  <input
                    type="text"
                    id="party"
                    name="party"
                    value={formData.party}
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
                  <label htmlFor="region" className="block text-sm font-medium text-neutral-700 mb-1">
                    Region *
                  </label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-neutral-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-1">
                  Biography
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
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
                  {editingMP ? 'Update MP' : 'Add MP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMPs;