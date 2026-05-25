import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Bell, Key, CreditCard, Lock, Copy, 
  Trash2, Plus, AlertTriangle, Check, Eye, EyeOff 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getUser, setUser, userApi } from '../api';

export default function Settings() {
  const navigate = useNavigate();
  const currentUser = getUser();

  // Navigation State
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Information State
  const [name, setName] = useState(currentUser?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  // Billing & Usage State
  const [stats, setStats] = useState({
    characters_used: 0,
    character_limit: 100000,
    voices_generated: 0,
    hours_saved: 0
  });
  const [isBillingLoading, setIsBillingLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('Free Tier');

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('voiceflow_notifications');
    return saved ? JSON.parse(saved) : {
      emailOnTts: true,
      productUpdates: false,
      securityAlerts: true,
      weeklyReports: true
    };
  });

  // API Keys State
  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem('voiceflow_apikeys');
    return saved ? JSON.parse(saved) : [];
  });
  const [newKeyName, setNewKeyName] = useState('');

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Load Billing Stats
  useEffect(() => {
    const loadStats = async () => {
      setIsBillingLoading(true);
      try {
        const data = await userApi.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setIsBillingLoading(false);
      }
    };

    if (activeTab === 'billing') {
      loadStats();
    }
  }, [activeTab]);

  // Persist Notifications & API Keys
  useEffect(() => {
    localStorage.setItem('voiceflow_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('voiceflow_apikeys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // ─── Event Handlers ─────────────────────────────────────────────────────────

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const updatedUser = await userApi.updateProfile(name);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await userApi.updatePassword(currentPassword, newPassword);
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleToggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Preference updated!');
  };

  const handleGenerateApiKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name.');
      return;
    }

    const randomHex = [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const newKey = {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      secret: `vf_live_${randomHex}`,
      createdAt: new Date().toLocaleDateString(),
    };

    setApiKeys(prev => [newKey, ...prev]);
    setNewKeyName('');
    toast.success('New API key generated.');
  };

  const handleDeleteApiKey = (id) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    toast.success('API key deleted.');
  };

  const handleCopyKey = (secret) => {
    navigator.clipboard.writeText(secret);
    toast.success('API key copied to clipboard!');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      await userApi.deleteAccount();
      localStorage.removeItem('voiceflow_token');
      localStorage.removeItem('voiceflow_user');
      toast.success('Your account has been deleted.');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  };

  const handleUpgradePlan = () => {
    toast.success("Sandbox: Checkout session created! Account upgraded to Pro Plan.");
    setCurrentPlan('Pro Plan');
  };

  // ─── Rendering Helpers ──────────────────────────────────────────────────────

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing & Usage', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'apikeys', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your profile details, subscriptions, notifications, and API credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none border-b lg:border-b-0 border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm whitespace-nowrap shrink-0 ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Profile Details Panel */}
                  <div className="glass-panel p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-primary/20 ring-2 ring-white/10 select-none">
                        {name ? name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">{currentUser?.name}</h3>
                        <p className="text-sm text-gray-400">{currentUser?.email}</p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">Role: {currentUser?.is_admin ? 'Administrator' : 'User'}</p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <User size={18} />
                          </div>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field pl-10"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <Mail size={18} />
                          </div>
                          <input
                            type="email"
                            className="input-field pl-10 text-gray-500 cursor-not-allowed opacity-75"
                            value={currentUser?.email || ''}
                            disabled
                          />
                        </div>
                        <p className="text-xs text-gray-500 ml-1">Email addresses cannot be changed for security.</p>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-end">
                        <button
                          type="submit"
                          disabled={isUpdatingProfile}
                          className="btn-primary flex items-center gap-2"
                        >
                          {isUpdatingProfile ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Change Password Panel */}
                  <div className="glass-panel p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                      
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300 ml-1">Current Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <Lock size={18} />
                          </div>
                          <input
                            type={showPass.current ? "text" : "password"}
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="input-field pl-10 pr-10"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                          >
                            {showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-300 ml-1">New Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                              <Lock size={18} />
                            </div>
                            <input
                              type={showPass.new ? "text" : "password"}
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="input-field pl-10 pr-10"
                              placeholder="Min 8 characters"
                              minLength={8}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                            >
                              {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-300 ml-1">Confirm New Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                              <Lock size={18} />
                            </div>
                            <input
                              type={showPass.confirm ? "text" : "password"}
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="input-field pl-10 pr-10"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                            >
                              {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-end">
                        <button
                          type="submit"
                          disabled={isUpdatingPassword}
                          className="btn-primary flex items-center gap-2"
                        >
                          {isUpdatingPassword ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Danger Zone Panel */}
                  <div className="glass-panel p-6 border-red-500/10">
                    <h2 className="text-xl font-semibold text-red-500 mb-2">Danger Zone</h2>
                    <p className="text-gray-400 text-sm mb-4">Once you delete your account, all your generation logs, stats, and stored files are permanently deleted. This action is irreversible.</p>
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all duration-300 font-medium text-sm"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              )}

              {/* BILLING TAB */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  {/* Stats and Usage Bar */}
                  <div className="glass-panel p-6 sm:p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-white">Usage & Plan Summary</h2>
                      <span className="px-3 py-1 text-xs font-bold text-primary bg-primary/10 rounded-full border border-primary/20 uppercase tracking-wider">
                        {currentPlan}
                      </span>
                    </div>

                    {isBillingLoading ? (
                      <div className="py-8 flex justify-center text-gray-400">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-gray-400">Characters Used</span>
                            <span className="text-white">
                              {stats.characters_used.toLocaleString()} / {stats.character_limit.toLocaleString()}
                            </span>
                          </div>
                          {/* Progress bar container */}
                          <div className="w-full bg-white/5 border border-white/5 h-4 rounded-full overflow-hidden p-0.5">
                            <div 
                              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                              style={{ width: `${Math.min(100, (stats.characters_used / stats.character_limit) * 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>
                              {Math.min(100, Math.round((stats.characters_used / stats.character_limit) * 100))}% consumed
                            </span>
                            <span>Resets monthly</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-gray-400">Voices Generated</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.voices_generated}</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-gray-400">Estimated Hours Saved</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.hours_saved}h</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Plan Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-6 border-white/5 relative flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Free Tier</h3>
                        <p className="text-xs text-gray-400 mb-4">Standard features for hobbyists</p>
                        <div className="text-2xl font-black text-white mb-6">$0 <span className="text-xs text-gray-500 font-medium">/ month</span></div>
                        <ul className="text-sm text-gray-300 space-y-3 mb-8">
                          <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 100,000 chars limit</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> English & Hindi languages</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Natural & Robotic voices</li>
                        </ul>
                      </div>
                      <button 
                        disabled={currentPlan === 'Free Tier'} 
                        className="btn-secondary w-full"
                      >
                        {currentPlan === 'Free Tier' ? 'Current Plan' : 'Downgrade'}
                      </button>
                    </div>

                    <div className="glass-panel p-6 border-secondary/30 relative flex flex-col justify-between overflow-hidden">
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-secondary to-primary text-white text-2xs font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Popular
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Pro Plan</h3>
                        <p className="text-xs text-gray-400 mb-4">Ideal for professionals and developers</p>
                        <div className="text-2xl font-black text-white mb-6">$15 <span className="text-xs text-gray-500 font-medium">/ month</span></div>
                        <ul className="text-sm text-gray-300 space-y-3 mb-8">
                          <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 1,000,000 characters limit</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Access to 50+ languages</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> High-fidelity voice styles</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> API Access & Integrations</li>
                        </ul>
                      </div>
                      <button 
                        onClick={handleUpgradePlan}
                        className="btn-primary w-full"
                      >
                        {currentPlan === 'Pro Plan' ? 'Current Plan (Manage)' : 'Upgrade to Pro'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="glass-panel p-6 sm:p-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                  <p className="text-sm text-gray-400 mb-6">Configure how and when you want to receive emails and system alerts.</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-start justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="space-y-1 pr-4">
                        <label className="text-white font-medium text-sm">Audio Generation Alert</label>
                        <p className="text-xs text-gray-400">Receive an email completion alert when a large Text-to-Speech generation is completed.</p>
                      </div>
                      <button
                        onClick={() => handleToggleNotification('emailOnTts')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 ${
                          notifications.emailOnTts ? 'bg-primary' : 'bg-white/10'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-300 transform ${
                          notifications.emailOnTts ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-start justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="space-y-1 pr-4">
                        <label className="text-white font-medium text-sm">Weekly Usage Reports</label>
                        <p className="text-xs text-gray-400">Receive weekly summaries regarding character consumption, hours saved, and audio statistics.</p>
                      </div>
                      <button
                        onClick={() => handleToggleNotification('weeklyReports')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 ${
                          notifications.weeklyReports ? 'bg-primary' : 'bg-white/10'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-300 transform ${
                          notifications.weeklyReports ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-start justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="space-y-1 pr-4">
                        <label className="text-white font-medium text-sm">Security & Logins</label>
                        <p className="text-xs text-gray-400">Receive security alerts on logins from unrecognized devices or IP addresses.</p>
                      </div>
                      <button
                        onClick={() => handleToggleNotification('securityAlerts')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 ${
                          notifications.securityAlerts ? 'bg-primary' : 'bg-white/10'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-300 transform ${
                          notifications.securityAlerts ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-start justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="space-y-1 pr-4">
                        <label className="text-white font-medium text-sm">Product Updates & Features</label>
                        <p className="text-xs text-gray-400">Receive newsletter and email notifications regarding new voice models and product offerings.</p>
                      </div>
                      <button
                        onClick={() => handleToggleNotification('productUpdates')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 ${
                          notifications.productUpdates ? 'bg-primary' : 'bg-white/10'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-300 transform ${
                          notifications.productUpdates ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* API KEYS TAB */}
              {activeTab === 'apikeys' && (
                <div className="space-y-6">
                  {/* Create Key Panel */}
                  <div className="glass-panel p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-white mb-4">API Access Keys</h2>
                    <p className="text-sm text-gray-400 mb-6">Create API credentials to build custom integrations with VoiceFlow's speech generation engines.</p>
                    
                    <form onSubmit={handleGenerateApiKey} className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        required
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="input-field"
                        placeholder="e.g. My Production Voice Server"
                      />
                      <button
                        type="submit"
                        className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <Plus size={18} />
                        <span>Generate Key</span>
                      </button>
                    </form>
                  </div>

                  {/* List of Keys Panel */}
                  <div className="glass-panel p-6 sm:p-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Credentials</h3>
                    
                    {apiKeys.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No active API keys generated. Enter a name above to create your first credential.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {apiKeys.map((key) => (
                          <div 
                            key={key.id}
                            className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <h4 className="text-white font-medium text-sm">{key.name}</h4>
                              <div className="flex items-center space-x-2 font-mono text-xs text-gray-400 bg-black/25 px-2.5 py-1.5 rounded-lg border border-white/5 select-all">
                                <span>{key.secret.substring(0, 12)}...{key.secret.substring(key.secret.length - 4)}</span>
                              </div>
                              <p className="text-2xs text-gray-500">Created on {key.createdAt}</p>
                            </div>
                            
                            <div className="flex items-center space-x-2 self-end sm:self-center">
                              <button
                                onClick={() => handleCopyKey(key.secret)}
                                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
                                title="Copy API Key"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteApiKey(key.id)}
                                className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-500 border border-red-500/10 transition-colors"
                                title="Delete API Key"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl z-[60] space-y-6"
            >
              <div className="flex items-center space-x-3 text-red-500">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle size={22} />
                </div>
                <h3 className="text-xl font-bold text-white">Delete Account?</h3>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed">
                This is a permanent action. You will lose access to all generated voice files and statistics. To confirm, please type <span className="text-white font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded">DELETE</span> below.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="input-field border-red-500/20 focus:ring-red-500/50"
                  placeholder="Type DELETE"
                />

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    className="btn-secondary w-1/2 py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-red-600/10 transition-colors w-1/2 flex items-center justify-center"
                  >
                    {isDeletingAccount ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
