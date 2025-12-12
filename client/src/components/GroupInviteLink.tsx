import React, { useState } from 'react';
import { Link as LinkIcon, Copy, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface GroupInviteLinkProps {
  groupId: string;
  inviteLink: string | null;
  onReset?: () => Promise<string>;
  loading?: boolean;
}

const GroupInviteLink: React.FC<GroupInviteLinkProps> = ({
  groupId,
  inviteLink,
  onReset,
  loading = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleCopy = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy invite link');
    }
  };

  const handleReset = async () => {
    if (!onReset) return;

    if (!confirm('Reset invite link? The old link will no longer work.')) {
      return;
    }

    try {
      setResetting(true);
      await onReset();
      alert('✅ Invite link reset successfully!');
    } catch (err: any) {
      console.error('Failed to reset invite link:', err);
      alert(`❌ Failed to reset: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!inviteLink) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center text-gray-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p className="text-sm">No invite link available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Invite Link Display */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900 mb-1">Group Invite Link</p>
            <p className="text-sm text-blue-800 break-all font-mono">
              {inviteLink}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleCopy}
          disabled={copied}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-green-600 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </button>

        {onReset && (
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {resetting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                Resetting...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </>
            )}
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-700 font-medium mb-1">📋 About Invite Links:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Share this link to invite people to join the group</li>
          <li>• Users can join by clicking the link (max 8 participants)</li>
          <li>• Reset the link to invalidate the old one</li>
          <li>• Only one active invite link per group</li>
        </ul>
      </div>

      {/* Warning */}
      {onReset && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800">
              <span className="font-medium">Warning:</span> Resetting the invite link will make the current link invalid. Anyone with the old link will no longer be able to join.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInviteLink;
