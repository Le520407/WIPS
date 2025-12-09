import { useState, useEffect } from 'react';
import { Settings, Clock, Phone, MessageSquare, Save, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface BusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: {
    [key: string]: {
      enabled: boolean;
      periods: Array<{
        start: string;
        end: string;
      }>;
    };
  };
}

interface CallSettingsData {
  calling_enabled: boolean;
  inbound_enabled: boolean;
  outbound_enabled: boolean;
  callback_enabled: boolean;
  business_hours: BusinessHours | null;
  auto_reply_message: string | null;
}

const CallSettings = () => {
  const [settings, setSettings] = useState<CallSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels: { [key: string]: string } = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/call-settings');
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSaved(false);
    setSyncStatus(null);

    try {
      const response = await api.put('/call-settings', settings);
      setSaved(true);
      
      // Show sync status
      if (response.data.meta_sync) {
        setSyncStatus(response.data.meta_sync);
        setTimeout(() => setSyncStatus(null), 10000); // Show for 10 seconds
      }
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: Partial<CallSettingsData>) => {
    if (!settings) return;
    setSettings({ ...settings, ...updates });
  };

  const updateBusinessHours = (updates: Partial<BusinessHours>) => {
    if (!settings || !settings.business_hours) return;
    setSettings({
      ...settings,
      business_hours: {
        ...settings.business_hours,
        ...updates,
      },
    });
  };

  const updateDaySchedule = (day: string, enabled: boolean) => {
    if (!settings || !settings.business_hours) return;
    setSettings({
      ...settings,
      business_hours: {
        ...settings.business_hours,
        schedule: {
          ...settings.business_hours.schedule,
          [day]: {
            ...settings.business_hours.schedule[day],
            enabled,
          },
        },
      },
    });
  };

  const updateDayPeriod = (day: string, periodIndex: number, field: 'start' | 'end', value: string) => {
    if (!settings || !settings.business_hours) return;
    const daySchedule = settings.business_hours.schedule[day];
    const newPeriods = [...daySchedule.periods];
    newPeriods[periodIndex] = {
      ...newPeriods[periodIndex],
      [field]: value,
    };

    setSettings({
      ...settings,
      business_hours: {
        ...settings.business_hours,
        schedule: {
          ...settings.business_hours.schedule,
          [day]: {
            ...daySchedule,
            periods: newPeriods,
          },
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-red-500">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Call Settings
          </h1>
          <p className="text-sm text-gray-600 mt-1">Configure calling features and business hours</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </>
          )}
        </button>
      </div>

      {/* Sync Status Alert */}
      {syncStatus && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            syncStatus.success
              ? 'bg-blue-50 border border-blue-200 text-blue-800'
              : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {syncStatus.success ? (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              ) : (
                <MessageSquare className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">
                {syncStatus.success ? 'WhatsApp Sync Successful' : 'WhatsApp Sync Warning'}
              </p>
              <p className="text-sm">{syncStatus.message}</p>
              {syncStatus.success && (
                <p className="text-sm mt-2 opacity-75">
                  💡 To see changes immediately in WhatsApp: Open chat with your business → Tap business name → View chat info
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Basic Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Basic Settings
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Enable Calling API</h3>
              <p className="text-sm text-gray-600">Master switch for all calling features</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.calling_enabled}
                onChange={(e) => updateSettings({ calling_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Inbound Calls</h3>
              <p className="text-sm text-gray-600">Allow users to call your business</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.inbound_enabled}
                onChange={(e) => updateSettings({ inbound_enabled: e.target.checked })}
                disabled={!settings.calling_enabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Outbound Calls</h3>
              <p className="text-sm text-gray-600">Allow business-initiated calls</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.outbound_enabled}
                onChange={(e) => updateSettings({ outbound_enabled: e.target.checked })}
                disabled={!settings.calling_enabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Callback Requests</h3>
              <p className="text-sm text-gray-600">Allow users to request callbacks</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.callback_enabled}
                onChange={(e) => updateSettings({ callback_enabled: e.target.checked })}
                disabled={!settings.calling_enabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      {settings.business_hours && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Business Hours
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.business_hours.enabled}
                onChange={(e) => updateBusinessHours({ enabled: e.target.checked })}
                disabled={!settings.calling_enabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          {settings.business_hours.enabled && (
            <div className="space-y-3">
              {daysOfWeek.map((day) => {
                const daySchedule = settings.business_hours!.schedule[day];
                return (
                  <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <label className="flex items-center gap-2 w-32">
                      <input
                        type="checkbox"
                        checked={daySchedule.enabled}
                        onChange={(e) => updateDaySchedule(day, e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="font-medium text-gray-900">{dayLabels[day]}</span>
                    </label>

                    {daySchedule.enabled && daySchedule.periods.length > 0 && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={daySchedule.periods[0].start}
                          onChange={(e) => updateDayPeriod(day, 0, 'start', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={daySchedule.periods[0].end}
                          onChange={(e) => updateDayPeriod(day, 0, 'end', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    )}

                    {!daySchedule.enabled && (
                      <span className="text-sm text-gray-500">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Auto Reply Message */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Auto Reply Message
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Message sent to users when calling outside business hours
        </p>
        <textarea
          value={settings.auto_reply_message || ''}
          onChange={(e) => updateSettings({ auto_reply_message: e.target.value })}
          disabled={!settings.calling_enabled}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="Enter auto reply message..."
        />
      </div>
    </div>
  );
};

export default CallSettings;
