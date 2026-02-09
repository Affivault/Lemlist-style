import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  Sun,
  Moon,
  Monitor,
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
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
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
    <div>
      <div className="mb-8">
        <h1 className="text-heading-lg text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`} strokeWidth={1.5} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-left text-[var(--error)] hover:bg-[var(--error-bg)] transition-all duration-200"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-card">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">Profile Information</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Update your personal details</p>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                  <div className="w-14 h-14 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] text-lg font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Profile Photo</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">JPG, PNG or GIF. Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Company</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Inc."
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Sales Manager"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2.5">
                      <Mail className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">{user?.email || 'Not set'}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-[var(--success)] bg-[var(--success-bg)] px-3 py-1.5 rounded-full font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    <Globe className="inline h-3.5 w-3.5 mr-1.5 text-[var(--text-tertiary)]" />
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="input-field"
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
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">Account Security</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your password and security settings</p>
                </div>

                <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
                      <Key className="h-5 w-5 text-[var(--text-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">Password</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Change Password</Button>
                </div>

                <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
                        <Shield className="h-5 w-5 text-[var(--text-primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">Two-Factor Authentication</p>
                        <p className="text-xs text-[var(--text-tertiary)]">Add an extra layer of security</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-[var(--warning)] bg-[var(--warning-bg)] px-3 py-1.5 rounded-full font-medium">
                      <AlertCircle className="h-3 w-3" />
                      Not enabled
                    </span>
                  </div>
                  <Button variant="secondary" size="sm">Enable 2FA</Button>
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Connected Accounts</h3>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span className="text-sm font-medium text-[var(--text-primary)]">Google</span>
                    </div>
                    <Button variant="secondary" size="sm">Connect</Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--error)] mb-4">Danger Zone</h3>
                  <div className="p-5 border border-[var(--error)]/20 rounded-xl bg-[var(--error-bg)]">
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    <Button variant="danger" size="sm">Delete Account</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">Notifications</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Choose what notifications you receive</p>
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
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">Preferences</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Customize your experience</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Theme</label>
                  <div className="flex gap-2">
                    {([
                      { value: 'light' as const, label: 'Light', icon: Sun },
                      { value: 'dark' as const, label: 'Dark', icon: Moon },
                      { value: 'system' as const, label: 'System', icon: Monitor },
                    ]).map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setThemeMode(value)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 border ${
                          themeMode === value
                            ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--text-primary)]'
                            : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Default Email Signature
                  </label>
                  <textarea
                    value={defaultSignature}
                    onChange={(e) => setDefaultSignature(e.target.value)}
                    placeholder="Best regards,&#10;John Doe"
                    rows={4}
                    className="input-field resize-none"
                  />
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                    Use {'{{signature}}'} in emails to insert this
                  </p>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex justify-end">
              <button onClick={handleSave} disabled={saving} className="btn-primary rounded-lg px-6 py-2.5">
                {saving ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
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
    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-[var(--accent)]' : 'bg-[var(--border-default)]'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
