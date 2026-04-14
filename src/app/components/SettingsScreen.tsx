import { useNavigate } from 'react-router';
import { ArrowLeft, Moon, Bell, Shield, Palette, ChevronRight, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export function SettingsScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sleepTime, setSleepTime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [notifications, setNotifications] = useState(true);
  const [appBlocking, setAppBlocking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load user's current settings
  useEffect(() => {
    if (user) {
      setSleepTime(user.bedtime_target || '22:30');
      setWakeTime(user.wake_time_target || '07:00');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.users.updateProfile({
        sleep_goal_hours: 8,
        bedtime_target: sleepTime,
        wake_time_target: wakeTime,
        stress_level: user?.stress_level || 'moderate',
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl text-gray-900">Settings</h1>
          {saved && <span className="ml-auto text-green-600 text-sm">✅ Saved!</span>}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

        {/* Profile Card */}
        {user && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                {user.name?.[0]?.toUpperCase() || '👤'}
              </div>
              <div>
                <div className="text-xl">{user.name}</div>
                <div className="text-sm opacity-80">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Sleep Settings */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg text-gray-900">Sleep Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Target sleep time</label>
              <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Wake up time</label>
              <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-gray-900">Sleep reminders</div>
                <div className="text-sm text-gray-500">Notify 30 min before bedtime</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Sleep Settings'}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            <ToggleItem label="Task reminders" description="Get notified about upcoming tasks" enabled={true} />
            <ToggleItem label="Schedule updates" description="Notify when schedule changes" enabled={true} />
            <ToggleItem label="Progress updates" description="Daily summary of achievements" enabled={false} />
          </div>
        </div>

        {/* App Blocking */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="text-lg text-gray-900">Focus Protection</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-900">Enable focus reminders</div>
                <div className="text-sm text-gray-500">Remind to avoid distracting apps</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={appBlocking} onChange={e => setAppBlocking(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            {appBlocking && (
              <div className="pt-2 space-y-2">
                <div className="text-sm text-gray-600 mb-2">Apps to avoid during focus:</div>
                {['Instagram', 'TikTok', 'YouTube', 'Twitter'].map(app => (
                  <div key={app} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-900">{app}</span>
                    <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600">
                  + Add app
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Personalization */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg text-gray-900">Personalization</h3>
          </div>
          <div className="space-y-3">
            <SettingsButton label="Energy patterns" onClick={() => {}} />
            <SettingsButton label="Task categories" onClick={() => {}} />
            <SettingsButton label="Wind-down preferences" onClick={() => {}} />
          </div>
        </div>

        {/* Account */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200">
          <h3 className="text-lg mb-4 text-gray-900">Account</h3>
          <div className="space-y-3">
            <SettingsButton label="Data & Privacy" onClick={() => {}} />
            <SettingsButton label="Help & Support" onClick={() => {}} />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 py-4 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>

        <div className="text-center text-sm text-gray-500 pb-6">
          <p>SleepWell v1.0.0</p>
          <p className="mt-1">Made with ❤️ for better sleep</p>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ label, description, enabled }: { label: string; description: string; enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="text-gray-900">{label}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={isEnabled} onChange={e => setIsEnabled(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
      </label>
    </div>
  );
}

function SettingsButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
      <span className="text-gray-900">{label}</span>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}