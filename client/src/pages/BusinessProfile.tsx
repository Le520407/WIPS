import { useState, useEffect } from 'react';
import { Building2, Mail, Globe, MapPin, Upload, Trash2, Save } from 'lucide-react';
import api from '../services/api';

interface BusinessProfile {
  about?: string;
  address?: string;
  description?: string;
  email?: string;
  profile_picture_url?: string;
  websites?: string[];
  vertical?: string;
}

interface Vertical {
  value: string;
  label: string;
}

const BusinessProfile = () => {
  const [profile, setProfile] = useState<BusinessProfile>({});
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<BusinessProfile>({});

  useEffect(() => {
    fetchProfile();
    fetchVerticals();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/business-profile');
      const profileData = response.data.profile.data[0];
      setProfile(profileData);
      setFormData(profileData);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      showMessage('error', error.response?.data?.error || 'Failed to load business profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerticals = async () => {
    try {
      const response = await api.get('/business-profile/verticals');
      setVerticals(response.data.verticals);
    } catch (error) {
      console.error('Failed to fetch verticals:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/business-profile', formData);
      setProfile(formData);
      showMessage('success', 'Business profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showMessage('error', error.response?.data?.error || 'Failed to update business profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setUploadingPicture(true);
      const formData = new FormData();
      formData.append('image', file);

      await api.post('/business-profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showMessage('success', 'Profile picture uploaded successfully');
      // Refresh profile to get new picture URL
      await fetchProfile();
    } catch (error: any) {
      console.error('Failed to upload picture:', error);
      showMessage('error', error.response?.data?.error || 'Failed to upload profile picture');
      setPreviewUrl(null); // Clear preview on error
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!confirm('Are you sure you want to delete your profile picture?')) return;

    try {
      await api.delete('/business-profile/picture');
      setPreviewUrl(null);
      showMessage('success', 'Profile picture deleted successfully');
      await fetchProfile();
    } catch (error: any) {
      console.error('Failed to delete picture:', error);
      showMessage('error', error.response?.data?.error || 'Failed to delete profile picture');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleWebsiteChange = (index: number, value: string) => {
    const newWebsites = [...(formData.websites || [])];
    newWebsites[index] = value;
    setFormData({ ...formData, websites: newWebsites });
  };

  const addWebsite = () => {
    setFormData({ ...formData, websites: [...(formData.websites || []), ''] });
  };

  const removeWebsite = (index: number) => {
    const newWebsites = (formData.websites || []).filter((_, i) => i !== index);
    setFormData({ ...formData, websites: newWebsites });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading business profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Business Profile
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your WhatsApp Business profile information
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-start gap-6">
            {/* Current/Preview Image */}
            <div className="flex flex-col items-center gap-2">
              {previewUrl || profile.profile_picture_url ? (
                <img
                  src={previewUrl || profile.profile_picture_url}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-gray-400" />
                </div>
              )}
              {previewUrl && (
                <span className="text-xs text-blue-600 font-medium">Preview</span>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1">
              <div className="flex gap-2 mb-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPicture}
                    className="hidden"
                    disabled={uploadingPicture}
                  />
                  <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    uploadingPicture 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  } text-white`}>
                    <Upload className="w-4 h-4" />
                    {uploadingPicture ? 'Uploading...' : 'Upload New'}
                  </div>
                </label>
                {(profile.profile_picture_url || previewUrl) && (
                  <button
                    onClick={handleDeletePicture}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Square image recommended</p>
                <p>• At least 640x640 pixels</p>
                <p>• Max file size: 5MB</p>
                <p>• Formats: JPG, PNG</p>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About (Status)
          </label>
          <input
            type="text"
            value={formData.about || ''}
            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            placeholder="e.g., We're here to help!"
            maxLength={139}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            {(formData.about || '').length}/139 characters
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tell customers about your business..."
            rows={4}
            maxLength={512}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            {(formData.description || '').length}/512 characters
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Category
          </label>
          <select
            value={formData.vertical || ''}
            onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {verticals.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contact@business.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address
          </label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Business St, City, Country"
            maxLength={256}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Websites */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Websites
          </label>
          <div className="space-y-2">
            {(formData.websites || []).map((website, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={website}
                  onChange={(e) => handleWebsiteChange(index, e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeWebsite(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(formData.websites || []).length < 2 && (
              <button
                onClick={addWebsite}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Website
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            You can add up to 2 websites
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
