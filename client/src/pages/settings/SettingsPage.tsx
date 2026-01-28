import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Bell,
  Shield,
  Key,
  Globe,
  Palette,
  Save,
  LogOut,
  CheckCircle,
  AlertCircle,
  Camera,
} from 'lucide-react';

type Tab = 'profile' | 'account' | 'notifications' | 'preferences';

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ElementType;
}

const tabs: TabConfig[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Palette },
];

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');

  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [campaignAlerts, setCampaignAlerts] = useState(true);
  const [replyNotifications, setReplyNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Preferences state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [defaultSignature, setDefaultSignature] = useState('');

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully');
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-500">Manage your account settings and preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Sign out button */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Update your personal information and public profile</p>
                </div>

                {/* Avatar section */}
                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <button className="absolute -bottom-1 -right-1 p-2 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors">
                      <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Profile Photo</p>
                    <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 2MB</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full h-11 rounded-xl border border-gray-200 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full h-11 rounded-xl border border-gray-200 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Inc."
                      className="w-full h-11 rounded-xl border border-gray-200 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Sales Manager"
                      className="w-full h-11 rounded-xl border border-gray-200 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center h-11 rounded-xl border border-gray-200 px-4 bg-gray-50">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">{user?.email || 'Not set'}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="inline h-4 w-4 mr-1.5 text-gray-400" />
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none bg-white"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Australia/Sydney">Sydney (AEST)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Account Security</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your password and security settings</p>
                </div>

                {/* Password section */}
                <div className="p-5 bg-gray-50 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white rounded-lg shadow-sm">
                      <Key className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    Change Password
                  </Button>
                </div>

                {/* Two-factor section */}
                <div className="p-5 bg-gray-50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-lg shadow-sm">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      <AlertCircle className="h-4 w-4" />
                      Not enabled
                    </span>
                  </div>
                  <Button variant="secondary" size="sm">
                    Enable 2FA
                  </Button>
                </div>

                {/* Connected accounts */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-4">Connected Accounts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <svg className="h-6 w-6" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="font-medium text-gray-900">Google</span>
                      </div>
                      <Button variant="secondary" size="sm">Connect</Button>
                    </div>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-red-600 mb-4">Danger Zone</h3>
                  <div className="p-5 border border-red-200 rounded-xl bg-red-50/50">
                    <p className="text-sm text-gray-600 mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button
                      variant="danger"
                      size="sm"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                  <p className="text-sm text-gray-500 mt-1">Choose what notifications you want to receive</p>
                </div>

                <div className="space-y-4">
                  <ToggleSetting
                    label="Email Notifications"
                    description="Receive email notifications for important updates"
                    checked={emailNotifications}
                    onChange={setEmailNotifications}
                  />
                  <ToggleSetting
                    label="Campaign Alerts"
                    description="Get notified when campaigns start, pause, or complete"
                    checked={campaignAlerts}
                    onChange={setCampaignAlerts}
                  />
                  <ToggleSetting
                    label="Reply Notifications"
                    description="Receive instant notifications when contacts reply"
                    checked={replyNotifications}
                    onChange={setReplyNotifications}
                  />
                  <ToggleSetting
                    label="Weekly Digest"
                    description="Receive a weekly summary of your campaign performance"
                    checked={weeklyDigest}
                    onChange={setWeeklyDigest}
                  />
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">App Preferences</h2>
                  <p className="text-sm text-gray-500 mt-1">Customize your SkySend experience</p>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                  <div className="flex gap-3">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                          theme === t
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <span className="capitalize font-medium">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Email Signature
                  </label>
                  <textarea
                    value={defaultSignature}
                    onChange={(e) => setDefaultSignature(e.target.value)}
                    placeholder="Best regards,&#10;John Doe&#10;Sales Manager"
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Use {'{{signature}}'} merge tag in your emails to insert this signature
                  </p>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/25"
              >
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
          checked ? 'bg-indigo-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
