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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [campaignAlerts, setCampaignAlerts] = useState(true);
  const [replyNotifications, setReplyNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [defaultSignature, setDefaultSignature] = useState('');

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Settings saved');
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primary">Settings</h1>
        <p className="text-sm text-secondary mt-1">Manage your account</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                    isActive
                      ? 'bg-brand/10 text-brand font-medium'
                      : 'text-secondary hover:bg-hover hover:text-primary'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-brand' : 'text-tertiary'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t border-subtle">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="rounded-lg border border-subtle bg-surface p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-medium text-primary">Profile Information</h2>
                  <p className="text-sm text-secondary mt-1">Update your personal details</p>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-md bg-elevated">
                  <div className="w-14 h-14 rounded-full bg-brand/20 flex items-center justify-center text-brand text-lg font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">Profile Photo</p>
                    <p className="text-xs text-tertiary">JPG, PNG or GIF. Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full rounded-md border border-default bg-surface px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full rounded-md border border-default bg-surface px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">Company</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Inc."
                      className="w-full rounded-md border border-default bg-surface px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Sales Manager"
                      className="w-full rounded-md border border-default bg-surface px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Email</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 rounded-md border border-subtle bg-elevated px-3 py-2">
                      <Mail className="h-4 w-4 text-tertiary" />
                      <span className="text-sm text-secondary">{user?.email || 'Not set'}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-brand">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    <Globe className="inline h-3.5 w-3.5 mr-1 text-tertiary" />
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-md border border-default bg-surface px-3 py-2 text-sm text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-medium text-primary">Account Security</h2>
                  <p className="text-sm text-secondary mt-1">Manage your password and security</p>
                </div>

                <div className="p-4 rounded-md bg-elevated space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-surface">
                      <Key className="h-4 w-4 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">Password</p>
                      <p className="text-xs text-tertiary">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Change Password</Button>
                </div>

                <div className="p-4 rounded-md bg-elevated space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-surface">
                        <Shield className="h-4 w-4 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">Two-Factor Authentication</p>
                        <p className="text-xs text-tertiary">Add extra security</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                      <AlertCircle className="h-3 w-3" />
                      Not enabled
                    </span>
                  </div>
                  <Button variant="secondary" size="sm">Enable 2FA</Button>
                </div>

                <div className="pt-5 border-t border-subtle">
                  <h3 className="text-sm font-medium text-primary mb-3">Connected Accounts</h3>
                  <div className="flex items-center justify-between p-3 rounded-md bg-elevated">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span className="text-sm font-medium text-primary">Google</span>
                    </div>
                    <Button variant="secondary" size="sm">Connect</Button>
                  </div>
                </div>

                <div className="pt-5 border-t border-subtle">
                  <h3 className="text-sm font-medium text-red-400 mb-3">Danger Zone</h3>
                  <div className="p-4 border border-red-500/20 rounded-md bg-red-500/5">
                    <p className="text-sm text-secondary mb-3">
                      Once you delete your account, there is no going back.
                    </p>
                    <Button variant="danger" size="sm">Delete Account</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-medium text-primary">Notifications</h2>
                  <p className="text-sm text-secondary mt-1">Choose what notifications you receive</p>
                </div>

                <div className="space-y-3">
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
              <div className="space-y-5">
                <div>
                  <h2 className="font-medium text-primary">Preferences</h2>
                  <p className="text-sm text-secondary mt-1">Customize your experience</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Theme</label>
                  <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          theme === t
                            ? 'bg-brand text-primary'
                            : 'bg-elevated text-secondary hover:text-primary border border-subtle'
                        }`}
                      >
                        <span className="capitalize">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Default Email Signature
                  </label>
                  <textarea
                    value={defaultSignature}
                    onChange={(e) => setDefaultSignature(e.target.value)}
                    placeholder="Best regards,&#10;John Doe"
                    rows={4}
                    className="w-full rounded-md border border-default bg-surface px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30 resize-none"
                  />
                  <p className="mt-1.5 text-xs text-tertiary">
                    Use {'{{signature}}'} in emails to insert this
                  </p>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="mt-6 pt-5 border-t border-subtle flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4" />
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
    <div className="flex items-center justify-between p-3 rounded-md bg-elevated">
      <div>
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="text-xs text-tertiary">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? 'bg-brand' : 'bg-elevated border border-subtle'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
