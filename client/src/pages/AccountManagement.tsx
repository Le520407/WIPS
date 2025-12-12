import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

interface Account {
  id: string;
  name: string;
  type: 'business' | 'website';
  whatsapp_business_account_id: string;
  phone_number_id: string;
  status: 'active' | 'suspended' | 'inactive';
  createdAt: string;
}

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'business' as 'business' | 'website',
    whatsapp_business_account_id: '',
    phone_number_id: '',
    access_token: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/accounts');
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      alert('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAccount(null);
    setFormData({
      name: '',
      type: 'business',
      whatsapp_business_account_id: '',
      phone_number_id: '',
      access_token: '',
    });
    setShowModal(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      whatsapp_business_account_id: account.whatsapp_business_account_id,
      phone_number_id: account.phone_number_id,
      access_token: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAccount) {
        await api.put(`/admin/accounts/${editingAccount.id}`, formData);
      } else {
        await api.post('/admin/accounts', formData);
      }
      setShowModal(false);
      loadAccounts();
    } catch (error: any) {
      console.error('Failed to save account:', error);
      alert(error.response?.data?.error || 'Failed to save account');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await api.delete(`/admin/accounts/${id}`);
      loadAccounts();
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      alert(error.response?.data?.error || 'Failed to delete account');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
          <p className="text-gray-600">Manage WhatsApp Business accounts</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Create Account</span>
        </button>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                WABA ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No accounts found
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{account.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {account.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                    {account.whatsapp_business_account_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                    {account.phone_number_id}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(account.status)}`}>
                      {account.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(account.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(account)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <a
                        href={`/admin/accounts/${account.id}/users`}
                        className="text-green-600 hover:text-green-800"
                        title="Manage Users"
                      >
                        <Users className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingAccount ? 'Edit Account' : 'Create Account'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'business' | 'website' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="business">Business</option>
                  <option value="website">Website</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Business Account ID *
                </label>
                <input
                  type="text"
                  value={formData.whatsapp_business_account_id}
                  onChange={(e) => setFormData({ ...formData, whatsapp_business_account_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="673274279136021"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number ID *
                </label>
                <input
                  type="text"
                  value={formData.phone_number_id}
                  onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="803320889535856"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token {editingAccount ? '(leave empty to keep current)' : '*'}
                </label>
                <textarea
                  value={formData.access_token}
                  onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={3}
                  placeholder="EAA..."
                  required={!editingAccount}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAccount ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
