import React, { useState } from 'react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subject: string, description: string, joinApprovalMode: 'auto_approve' | 'approval_required') => Promise<void>;
  phoneNumberId: string;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  phoneNumberId,
}) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    joinApprovalMode: 'auto_approve' as 'auto_approve' | 'approval_required',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get phoneNumberId from localStorage as backup
    const storedPhoneNumberId = localStorage.getItem('phoneNumberId');
    const actualPhoneNumberId = phoneNumberId || storedPhoneNumberId;
    
    console.log('Phone Number ID check:', {
      fromProps: phoneNumberId,
      fromStorage: storedPhoneNumberId,
      actual: actualPhoneNumberId
    });
    
    if (!actualPhoneNumberId || actualPhoneNumberId.trim() === '') {
      alert('Please enter your Phone Number ID first in the blue box above\n\nYour Phone Number ID is: 803320889535856');
      onClose();
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData.subject, formData.description, formData.joinApprovalMode);
      // Reset form
      setFormData({
        subject: '',
        description: '',
        joinApprovalMode: 'auto_approve',
      });
      onClose();
    } catch (error) {
      // Error is handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent form submission on Enter key in input fields
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Create New Group</h2>
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter group subject"
              maxLength={128}
              required
              autoFocus
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">Max 128 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter group description (optional)"
              rows={3}
              maxLength={2048}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">Max 2048 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Join Approval Mode
            </label>
            <select
              value={formData.joinApprovalMode}
              onChange={(e) => setFormData({ ...formData, joinApprovalMode: e.target.value as 'auto_approve' | 'approval_required' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="auto_approve">Auto Approve - Users join instantly</option>
              <option value="approval_required">Approval Required - Manual approval needed</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium">📌 Note:</p>
            <p className="mt-1">The invite link will be received via webhook after group creation.</p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
