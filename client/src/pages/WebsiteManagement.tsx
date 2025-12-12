import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Key, BarChart3, Globe, Power } from 'lucide-react';
import { getWebsites, createWebsite, updateWebsite, deleteWebsite } from '../services/api';

interface Website {
  id: string;
  name: string;
  domain: string | null;
  description: string | null;
  phone_number_id: string;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  ApiKeys?: Array<{
    id: string;
    key_name: string;
    is_active: boolean;
  }>;
}

export default function WebsiteManagement() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
    phone_number_id: '',
    webhook_url: '',
    webhook_secret: '',
  });

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const data = await getWebsites();
      setWebsites(data.websites || []);
    } catch (error) {
      console.error('Error fetching websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWebsite) {
        await updateWebsite(editingWebsite.id, formData);
      } else {
        await createWebsite(formData);
      }
      setShowModal(false);
      resetForm();
      fetchWebsites();
    } catch (error) {
      console.error('Error saving website:', error);
    }
  };

  const handleEdit = (website: Website) => {
    setEditingWebsite(website);
    setFormData({
      name: website.name,
      domain: website.domain || '',
      description: website.description || '',
      phone_number_id: website.phone_number_id,
      webhook_url: website.webhook_url || '',
      webhook_secret: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this website?')) return;
    try {
      await deleteWebsite(id);
      fetchWebsites();
    } catch (error) {
      console.error('Error deleting website:', error);
    }
  };

  const handleToggleActive = async (website: Website) => {
    try {
      await updateWebsite(website.id, { ...website, is_active: !website.is_active });
      fetchWebsites();
    } catch (error) {
      console.error('Error toggling website status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      description: '',
      phone_number_id: '',
      webhook_url: '',
      webhook_secret: '',
    });
    setEditingWebsite(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading websites...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Website Management</h1>
          <p className="text-gray-600 mt-1">Manage multiple websites integrated with WhatsApp</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Add Website
        </button>
      </div>

      {/* Websites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites.map((website) => (
          <div key={website.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{website.name}</h3>
                  {website.domain && (
                    <p className="text-sm text-gray-500">{website.domain}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleToggleActive(website)}
                className={`p-2 rounded-lg ${
                  website.is_active
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={website.is_active ? 'Active' : 'Inactive'}
              >
                <Power className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            {website.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{website.description}</p>
            )}

            {/* Phone Number ID */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Phone Number ID</p>
              <p className="text-sm font-mono text-gray-700">{website.phone_number_id}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Key className="w-4 h-4" />
                <span>{website.ApiKeys?.length || 0} API Keys</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                website.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {website.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(website)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => window.location.href = `/api-keys/${website.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
              >
                <Key className="w-4 h-4" />
                Keys
              </button>
              <button
                onClick={() => handleDelete(website.id)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {websites.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No websites yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first website</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus className="w-5 h-5" />
            Add Website
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingWebsite ? 'Edit Website' : 'Add New Website'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Phone Number ID *
                  </label>
                  <input
                    type="text"
                    value={formData.phone_number_id}
                    onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
                    placeholder="803320889535856"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={formData.webhook_url}
                    onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                    placeholder="https://your-website.com/webhooks/whatsapp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook Secret
                  </label>
                  <input
                    type="password"
                    value={formData.webhook_secret}
                    onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
                    placeholder="Leave empty to keep existing"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {editingWebsite ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
