import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Command {
  command_name: string;
  command_description: string;
}

interface Config {
  enableWelcomeMessage: boolean;
  prompts: string[];
  commands: Command[];
  welcomeMessageTemplate: string;
}

const ConversationalComponents: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [config, setConfig] = useState<Config>({
    enableWelcomeMessage: false,
    prompts: [],
    commands: [],
    welcomeMessageTemplate: '',
  });
  const [newPrompt, setNewPrompt] = useState('');
  const [newCommand, setNewCommand] = useState({ command_name: '', command_description: '' });

  const phoneNumberId = user?.phoneNumberId || '803320889535856';

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/conversational-components/${phoneNumberId}`);
      const localConfig = response.data.local;
      
      if (localConfig) {
        setConfig({
          enableWelcomeMessage: localConfig.enableWelcomeMessage || false,
          prompts: localConfig.prompts || [],
          commands: localConfig.commands || [],
          welcomeMessageTemplate: localConfig.welcomeMessageTemplate || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading configuration:', error);
      alert('Failed to load configuration: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/conversational-components/${phoneNumberId}`, config);
      alert('Configuration saved successfully!');
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post(`/conversational-components/${phoneNumberId}/sync`);
      await loadConfiguration();
      alert('Configuration synced from Meta successfully!');
    } catch (error: any) {
      console.error('Error syncing configuration:', error);
      alert('Failed to sync configuration: ' + (error.response?.data?.error || error.message));
    } finally {
      setSyncing(false);
    }
  };

  const addPrompt = () => {
    if (!newPrompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    if (newPrompt.length > 80) {
      alert('Prompt must be 80 characters or less');
      return;
    }
    if (config.prompts.length >= 4) {
      alert('Maximum 4 ice breakers allowed');
      return;
    }
    setConfig({ ...config, prompts: [...config.prompts, newPrompt.trim()] });
    setNewPrompt('');
  };

  const removePrompt = (index: number) => {
    setConfig({
      ...config,
      prompts: config.prompts.filter((_, i) => i !== index),
    });
  };

  const addCommand = () => {
    if (!newCommand.command_name.trim() || !newCommand.command_description.trim()) {
      alert('Please enter both command name and description');
      return;
    }
    if (newCommand.command_name.length > 32) {
      alert('Command name must be 32 characters or less');
      return;
    }
    if (newCommand.command_description.length > 256) {
      alert('Command description must be 256 characters or less');
      return;
    }
    if (config.commands.length >= 30) {
      alert('Maximum 30 commands allowed');
      return;
    }
    setConfig({
      ...config,
      commands: [...config.commands, { ...newCommand }],
    });
    setNewCommand({ command_name: '', command_description: '' });
  };

  const removeCommand = (index: number) => {
    setConfig({
      ...config,
      commands: config.commands.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Conversational Components</h1>
        <p className="text-gray-600 mt-2">
          Configure welcome messages, ice breakers, and commands for your WhatsApp Business number
        </p>
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Welcome messages are currently not functioning as intended per Meta. 
            Ice breakers and commands work as expected.
          </p>
        </div>
      </div>

      {/* Welcome Message Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome Message</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableWelcome"
              checked={config.enableWelcomeMessage}
              onChange={(e) =>
                setConfig({ ...config, enableWelcomeMessage: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enableWelcome" className="ml-2 text-gray-700">
              Enable welcome message for first-time users
            </label>
          </div>

          {config.enableWelcomeMessage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message Template (Optional)
              </label>
              <textarea
                value={config.welcomeMessageTemplate}
                onChange={(e) =>
                  setConfig({ ...config, welcomeMessageTemplate: e.target.value })
                }
                placeholder="Enter the message to send when a user opens chat for the first time..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                This message will be automatically sent when a user opens a chat with you for the first time
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ice Breakers Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Ice Breakers <span className="text-sm text-gray-500">({config.prompts.length}/4)</span>
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Tappable prompts that appear when users first chat with you. Max 80 characters each.
        </p>

        <div className="space-y-3 mb-4">
          {config.prompts.map((prompt, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-800">{prompt}</span>
              <button
                onClick={() => removePrompt(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {config.prompts.length < 4 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder="e.g., Plan a trip"
              maxLength={80}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addPrompt}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          {newPrompt.length}/80 characters
        </p>
      </div>

      {/* Commands Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Commands <span className="text-sm text-gray-500">({config.commands.length}/30)</span>
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Slash commands users can type. Command max 32 chars, description max 256 chars.
        </p>

        <div className="space-y-3 mb-4">
          {config.commands.map((cmd, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-mono text-blue-600">/{cmd.command_name}</div>
                  <div className="text-sm text-gray-600 mt-1">{cmd.command_description}</div>
                </div>
                <button
                  onClick={() => removeCommand(index)}
                  className="text-red-600 hover:text-red-800 text-sm ml-4"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {config.commands.length < 30 && (
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={newCommand.command_name}
                onChange={(e) =>
                  setNewCommand({ ...newCommand, command_name: e.target.value })
                }
                placeholder="Command name (e.g., imagine)"
                maxLength={32}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {newCommand.command_name.length}/32 characters
              </p>
            </div>
            <div>
              <input
                type="text"
                value={newCommand.command_description}
                onChange={(e) =>
                  setNewCommand({ ...newCommand, command_description: e.target.value })
                }
                placeholder="Description (e.g., Create images using a text prompt)"
                maxLength={256}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {newCommand.command_description.length}/256 characters
              </p>
            </div>
            <button
              onClick={addCommand}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Command
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {syncing ? 'Syncing...' : 'Sync from Meta'}
        </button>
      </div>

      {/* Testing Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Testing Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Save your configuration above</li>
          <li>Open WhatsApp and find your business number</li>
          <li>Delete the existing chat thread (if any)</li>
          <li>Start a new chat to see ice breakers</li>
          <li>Type "/" to see available commands</li>
        </ol>
      </div>
    </div>
  );
};

export default ConversationalComponents;
