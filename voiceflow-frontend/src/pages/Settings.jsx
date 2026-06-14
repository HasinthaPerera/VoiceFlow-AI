import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Bell, Key, CreditCard, Lock, Copy, 
  Trash2, Plus, AlertTriangle, Check, Eye, EyeOff,
  Sliders, Palette, Sparkles, Shield, Mic2,
  Laptop, Smartphone, RefreshCw, Globe, Webhook,
  Activity, Terminal, Code, Cpu, Wifi, CheckCircle2,
  Volume2, Info, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getUser, setUser, userApi } from '../api';

export default function Settings() {
  const navigate = useNavigate();
  const currentUser = getUser();

  // Navigation State
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Information & Avatar State
  const [name, setName] = useState(currentUser?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [avatarBg, setAvatarBg] = useState(() => localStorage.getItem('voiceflow_avatar_bg') || 'cosmic');
  const [avatarIcon, setAvatarIcon] = useState(() => localStorage.getItem('voiceflow_avatar_icon') || 'initials');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  // Preferences & Accent Theme State
  const [accentTheme, setAccentTheme] = useState(() => localStorage.getItem('voiceflow_accent_theme') || 'cosmic-purple');
  const [prefLanguage, setPrefLanguage] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('voiceflow_tts_defaults') || '{}');
    return saved.language || 'english';
  });
  const [prefVoice, setPrefVoice] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('voiceflow_tts_defaults') || '{}');
    return saved.voice || 'natural';
  });
  const [prefSpeed, setPrefSpeed] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('voiceflow_tts_defaults') || '{}');
    return saved.speed !== undefined ? saved.speed : 1.0;
  });
  const [prefPitch, setPrefPitch] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('voiceflow_tts_defaults') || '{}');
    return saved.pitch !== undefined ? saved.pitch : 1.0;
  });

  // Billing & Usage State
  const [stats, setStats] = useState({
    characters_used: 0,
    character_limit: 100000,
    voices_generated: 0,
    hours_saved: 0
  });
  const [isBillingLoading, setIsBillingLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(() => localStorage.getItem('voiceflow_plan') || 'Free Tier');
  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-004', date: 'Jun 12, 2026', amount: '$15.00', status: 'Paid' },
    { id: 'INV-2026-003', date: 'May 12, 2026', amount: '$15.00', status: 'Paid' },
    { id: 'INV-2026-002', date: 'Apr 12, 2026', amount: '$15.00', status: 'Paid' },
    { id: 'INV-2026-001', date: 'Mar 12, 2026', amount: '$0.00', status: 'Trial' },
  ]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeProgress, setUpgradeProgress] = useState(0);

  // Audio Preview State
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('voiceflow_notifications');
    return saved ? JSON.parse(saved) : {
      emailOnTts: true,
      productUpdates: false,
      securityAlerts: true,
      weeklyReports: true,
      digestFrequency: 'daily'
    };
  });

  // API Keys State
  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem('voiceflow_apikeys');
    return saved ? JSON.parse(saved) : [];
  });
  const [newKeyName, setNewKeyName] = useState('');
  const [keyScopes, setKeyScopes] = useState({
    ttsGenerate: true,
    historyRead: true,
    analyticsRead: false,
    adminWrite: false
  });
  const [activeSnippetTab, setActiveSnippetTab] = useState('curl');

  // Webhooks State
  const [webhookUrl, setWebhookUrl] = useState('https://api.my-app.com/voice-webhooks');
  const [webhookSecret, setWebhookSecret] = useState('vf_whsec_7d3b8f102ca3e529a64e1c258f90c128');
  const [webhookEvents, setWebhookEvents] = useState({
    audioGenerated: true,
    billingLimit: true,
    securityAlert: false
  });
  const [isWebhookSaving, setIsWebhookSaving] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Security / Active Sessions State
  const [sessions, setSessions] = useState([
    { id: '1', device: 'Windows 11 PC', browser: 'Chrome 125', ip: '127.0.0.1 (Localhost)', location: 'Colombo, Sri Lanka', status: 'Active Now', icon: Laptop },
    { id: '2', device: 'iPhone 15 Pro', browser: 'Safari Mobile', ip: '192.168.1.14', location: 'Colombo, Sri Lanka', status: '2 hours ago', icon: Smartphone },
    { id: '3', device: 'MacBook Pro 16', browser: 'Safari 17.2', ip: '182.52.20.104', location: 'Galle, Sri Lanka', status: '5 days ago', icon: Laptop }
  ]);
  const [securityLogs, setSecurityLogs] = useState([
    { id: '1', event: 'Password Changed', status: 'Success', ip: '127.0.0.1', date: 'Jun 14, 2026 10:45 PM' },
    { id: '2', event: 'API Key Created', status: 'Success', ip: '127.0.0.1', date: 'Jun 14, 2026 09:12 PM' },
    { id: '3', event: 'User Login', status: 'Success', ip: '127.0.0.1', date: 'Jun 14, 2026 09:00 PM' },
    { id: '4', event: 'Failed Login Attempt', status: 'Failed', ip: '203.0.113.88', date: 'Jun 11, 2026 04:30 AM' }
  ]);

  // Diagnostics State
  const [diagnosticsActive, setDiagnosticsActive] = useState(false);
  const [diagnosticsStep, setDiagnosticsStep] = useState(0);
  const [diagnosticsLogs, setDiagnosticsLogs] = useState([]);

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
        // Fallback mock stats for visual completeness
        setStats({
          characters_used: 12450,
          character_limit: currentPlan === 'Pro Plan' ? 1000000 : 100000,
          voices_generated: 14,
          hours_saved: 2.8
        });
      } finally {
        setIsBillingLoading(false);
      }
    };

    if (activeTab === 'billing') {
      loadStats();
    }
  }, [activeTab, currentPlan]);

  // Persist settings
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
      
      localStorage.setItem('voiceflow_avatar_bg', avatarBg);
      localStorage.setItem('voiceflow_avatar_icon', avatarIcon);
      
      setUser(updatedUser);
      toast.success('Profile and avatar updated successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleRandomizeAvatar = () => {
    const randomBg = avatarGradients[Math.floor(Math.random() * avatarGradients.length)].id;
    const randomIcon = avatarSymbols[Math.floor(Math.random() * avatarSymbols.length)].id;
    setAvatarBg(randomBg);
    setAvatarIcon(randomIcon);
    toast.success('Random combination loaded! Save changes to persist.', {
      icon: '✨',
      style: {
        borderRadius: '12px',
        background: '#13131a',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }
    });
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    const defaults = {
      language: prefLanguage,
      voice: prefVoice,
      speed: prefSpeed,
      pitch: prefPitch
    };
    localStorage.setItem('voiceflow_tts_defaults', JSON.stringify(defaults));
    toast.success('TTS default settings saved!');
  };

  const handleTestVoicePreview = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingPreview(true);

      let langCode = 'en-US';
      if (prefLanguage === 'sinhala') langCode = 'si-LK';
      else if (prefLanguage === 'tamil') langCode = 'ta-IN';
      else if (prefLanguage === 'hindi') langCode = 'hi-IN';

      const text = prefLanguage === 'sinhala'
        ? "ආයුබෝවන්. මෙය ඔබගේ පෙරනිමි හඬ සැකසුමෙහි පෙරදසුනකි."
        : prefLanguage === 'tamil'
        ? "வணக்கம். இது உங்கள் இயல்புநிலை குரல் அமைப்பின் மாதிரிக்காட்சி ஆகும்."
        : prefLanguage === 'hindi'
        ? "नमस्ते। यह आपकी डिफ़ॉल्ट आवाज़ सेटिंग्स का पूर्वावलोकन है।"
        : "Hello! This is a preview of your default Text to Speech settings.";

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = prefSpeed;
      utterance.pitch = prefPitch;

      utterance.onend = () => setIsPlayingPreview(false);
      utterance.onerror = () => setIsPlayingPreview(false);

      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Speech synthesis is not supported on this browser.");
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
      // Add log
      setSecurityLogs(prev => [
        { id: Date.now().toString(), event: 'Password Changed', status: 'Success', ip: '127.0.0.1', date: new Date().toLocaleString() },
        ...prev
      ]);
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

  const handleNotificationDigestChange = (e) => {
    const value = e.target.value;
    setNotifications(prev => ({
      ...prev,
      digestFrequency: value
    }));
    toast.success(`Digest frequency set to ${value}`);
  };

  const handleGenerateApiKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name.');
      return;
    }

    const randomHex = [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const activeScopes = Object.keys(keyScopes)
      .filter(k => keyScopes[k])
      .map(k => {
        if (k === 'ttsGenerate') return 'tts:generate';
        if (k === 'historyRead') return 'history:read';
        if (k === 'analyticsRead') return 'analytics:read';
        if (k === 'adminWrite') return 'admin:write';
        return k;
      });

    const newKey = {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      secret: `vf_live_${randomHex}`,
      createdAt: new Date().toLocaleDateString(),
      scopes: activeScopes.length > 0 ? activeScopes : ['tts:generate']
    };

    setApiKeys(prev => [newKey, ...prev]);
    setNewKeyName('');
    toast.success('New API key generated with selected scopes.');
    // Add log
    setSecurityLogs(prev => [
      { id: Date.now().toString(), event: `API Key Created (${newKey.name})`, status: 'Success', ip: '127.0.0.1', date: new Date().toLocaleString() },
      ...prev
    ]);
  };

  const handleDeleteApiKey = (id) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    toast.success('API key deleted.');
  };

  const handleCopyKey = (secret) => {
    navigator.clipboard.writeText(secret);
    toast.success('API key copied to clipboard!');
  };

  const handleDownloadInvoice = (invoice) => {
    const docContent = `=============================================
               VOICEFLOW AI
             INVOICE RECEIPT
=============================================
Invoice ID:  ${invoice.id}
Date:        ${invoice.date}
Customer:    ${currentUser?.name || 'Valued User'}
Email:       ${currentUser?.email || 'user@voiceflow.ai'}
=============================================
Item                       Qty    Rate     Amount
---------------------------------------------
VoiceFlow Pro Subscription   1    ${invoice.amount}    ${invoice.amount}
=============================================
TOTAL AMOUNT:                      ${invoice.amount}
STATUS:                            Paid (Visa ending in 4242)
=============================================
Thank you for your purchase!
If you have questions, contact support@voiceflow.ai`;

    const blob = new Blob([docContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Invoice ${invoice.id} downloaded!`);
  };

  const handleUpgradePlan = () => {
    setShowUpgradeModal(true);
    setUpgradeProgress(0);

    const interval = setInterval(() => {
      setUpgradeProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setCurrentPlan('Pro Plan');
            localStorage.setItem('voiceflow_plan', 'Pro Plan');
            setShowUpgradeModal(false);
            toast.success("Upgrade Successful! Welcome to VoiceFlow Pro.");
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDowngradePlan = () => {
    setCurrentPlan('Free Tier');
    localStorage.setItem('voiceflow_plan', 'Free Tier');
    toast.success("Downgraded to Free Tier. Features will reflect immediately.");
  };

  const handleSaveWebhook = (e) => {
    e.preventDefault();
    if (!webhookUrl.trim()) {
      toast.error('Webhook payload URL is required.');
      return;
    }
    setIsWebhookSaving(true);
    setTimeout(() => {
      setIsWebhookSaving(false);
      toast.success('Webhook target endpoint updated.');
    }, 800);
  };

  const handleTestWebhook = () => {
    setIsTestingWebhook(true);
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      event: 'audio.generated',
      url: webhookUrl,
      status: 'Pending',
      statusCode: null,
      response: null
    };

    setWebhookLogs(prev => [newLog, ...prev]);

    setTimeout(() => {
      setWebhookLogs(prev => prev.map(log => {
        if (log.id === newLog.id) {
          return {
            ...log,
            status: 'Success',
            statusCode: 200,
            response: '{"received":true,"status":"synced"}'
          };
        }
        return log;
      }));
      setIsTestingWebhook(false);
      toast.success('Simulated webhook fired successfully! Payload received.', { icon: '🚀' });
    }, 1500);
  };

  const handleRevokeSession = (id, device) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success(`Session revoked on ${device}`);
    setSecurityLogs(prev => [
      { id: Date.now().toString(), event: `Session Revoked (${device})`, status: 'Success', ip: '127.0.0.1', date: new Date().toLocaleString() },
      ...prev
    ]);
  };

  const runDiagnostics = () => {
    setDiagnosticsActive(true);
    setDiagnosticsStep(1);
    setDiagnosticsLogs([
      { name: 'Establishing API server link', status: 'pending', duration: null },
      { name: 'Pinging main database clusters', status: 'pending', duration: null },
      { name: 'Testing Cloud TTS Engine latency', status: 'pending', duration: null },
      { name: 'Testing Audio Storage Buckets', status: 'pending', duration: null }
    ]);

    setTimeout(() => {
      setDiagnosticsLogs(prev => {
        const copy = [...prev];
        copy[0] = { name: 'Establishing API server link', status: 'success', duration: '34ms' };
        return copy;
      });
      setDiagnosticsStep(2);

      setTimeout(() => {
        setDiagnosticsLogs(prev => {
          const copy = [...prev];
          copy[1] = { name: 'Pinging main database clusters', status: 'success', duration: '9ms' };
          return copy;
        });
        setDiagnosticsStep(3);

        setTimeout(() => {
          setDiagnosticsLogs(prev => {
            const copy = [...prev];
            copy[2] = { name: 'Testing Cloud TTS Engine latency', status: 'success', duration: '124ms' };
            return copy;
          });
          setDiagnosticsStep(4);

          setTimeout(() => {
            setDiagnosticsLogs(prev => {
              const copy = [...prev];
              copy[3] = { name: 'Testing Audio Storage Buckets', status: 'success', duration: '41ms' };
              return copy;
            });
            setDiagnosticsStep(5);
            setDiagnosticsActive(false);
            toast.success("System operational! All services are active.", { icon: '📡' });
          }, 800);
        }, 1000);
      }, 600);
    }, 700);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      await userApi.deleteAccount();
      localStorage.clear();
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

  const handleSelectTheme = (theme) => {
    localStorage.setItem('voiceflow_accent_theme', theme.id);
    setAccentTheme(theme.id);
    document.documentElement.style.setProperty('--color-primary-rgb', theme.primary);
    document.documentElement.style.setProperty('--color-secondary-rgb', theme.secondary);
    toast.success(`Theme updated to ${theme.label}!`);
  };

  // ─── Rendering Helpers ──────────────────────────────────────────────────────

  const avatarGradients = [
    { id: 'cosmic', label: 'Cosmic Glow', classes: 'from-indigo-500 via-purple-500 to-pink-500' },
    { id: 'sunset', label: 'Sunset Ember', classes: 'from-orange-500 via-red-500 to-rose-500' },
    { id: 'forest', label: 'Neon Forest', classes: 'from-emerald-400 via-teal-500 to-cyan-600' },
    { id: 'ocean', label: 'Ocean Breeze', classes: 'from-cyan-400 via-blue-500 to-indigo-600' },
    { id: 'midnight', label: 'Midnight Slate', classes: 'from-gray-700 via-slate-800 to-zinc-900' },
    { id: 'neon', label: 'Cyber Neon', classes: 'from-yellow-400 via-pink-500 to-purple-600' }
  ];

  const avatarSymbols = [
    { id: 'initials', label: 'Initials (First Letter)' },
    { id: 'user', label: 'User Outline' },
    { id: 'sparkles', label: 'Sparkles Symbol' },
    { id: 'mic', label: 'Microphone Symbol' },
    { id: 'shield', label: 'Shield Symbol' }
  ];

  const themeOptions = [
    { id: 'cosmic-purple', label: 'Cosmic Purple', primary: '99 102 241', secondary: '168 85 247', colors: 'from-[#6366f1] to-[#a855f7]' },
    { id: 'cyberpunk-rose', label: 'Cyberpunk Rose', primary: '217 70 239', secondary: '236 72 153', colors: 'from-[#d946ef] to-[#ec4899]' },
    { id: 'emerald-forest', label: 'Emerald Forest', primary: '16 185 129', secondary: '20 184 166', colors: 'from-[#10b981] to-[#14b8a6]' },
    { id: 'oceanic-cyan', label: 'Oceanic Cyan', primary: '6 182 212', secondary: '59 130 246', colors: 'from-[#06b6d4] to-[#3b82f6]' },
    { id: 'sunset-amber', label: 'Sunset Amber', primary: '245 158 11', secondary: '239 68 68', colors: 'from-[#f59e0b] to-[#ef4444]' }
  ];

  const renderSelectedAvatarPreview = (size = 32) => {
    const activeGrad = avatarGradients.find(g => g.id === avatarBg) || avatarGradients[0];
    return (
      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${activeGrad.classes} flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-primary/20 ring-2 ring-white/10 select-none transition-all duration-500`}>
        {renderAvatarIconForPreview(size)}
      </div>
    );
  };

  const renderAvatarIconForPreview = (size) => {
    switch (avatarIcon) {
      case 'user': return <User size={size} />;
      case 'sparkles': return <Sparkles size={size} />;
      case 'mic': return <Mic2 size={size} />;
      case 'shield': return <Shield size={size} />;
      case 'initials':
      default:
        return <span>{name ? name[0].toUpperCase() : 'U'}</span>;
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Avatar', icon: User },
    { id: 'preferences', label: 'Preferences & Theme', icon: Sliders },
    { id: 'billing', label: 'Billing & Usage', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'security', label: 'Security & Sessions', icon: Shield },
    { id: 'integrations', label: 'Integrations & Webhooks', icon: Webhook },
    { id: 'diagnostics', label: 'System Diagnostics', icon: Activity },
  ];

  // Integration Snippets
  const getSnippet = () => {
    const apiKeyLabel = apiKeys.length > 0 ? apiKeys[0].secret : 'YOUR_API_KEY';
    if (activeSnippetTab === 'curl') {
      return `curl -X POST "http://localhost:8080/api/tts/generate" \\
  -H "Authorization: Bearer ${apiKeyLabel}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello world from VoiceFlow AI!",
    "language": "${prefLanguage}",
    "voice": "${prefVoice}",
    "speed": ${prefSpeed},
    "pitch": ${prefPitch}
  }'`;
    } else if (activeSnippetTab === 'nodejs') {
      return `const fetch = require('node-fetch');

fetch('http://localhost:8080/api/tts/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKeyLabel}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Hello world from VoiceFlow AI!',
    language: '${prefLanguage}',
    voice: '${prefVoice}',
    speed: ${prefSpeed},
    pitch: ${prefPitch}
  })
})
.then(res => res.json())
.then(data => console.log('Speech synthesized:', data));`;
    } else {
      return `import requests

url = "http://localhost:8080/api/tts/generate"
headers = {
    "Authorization": "Bearer ${apiKeyLabel}",
    "Content-Type": "application/json"
}
data = {
    "text": "Hello world from VoiceFlow AI!",
    "language": "${prefLanguage}",
    "voice": "${prefVoice}",
    "speed": ${prefSpeed},
    "pitch": ${prefPitch}
}

response = requests.post(url, headers=headers, json=data)
print("Response:", response.json())`;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure your profile details, customize default voice preferences, monitor API configurations, and verify system status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none border-b lg:border-b-0 border-white/5">
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
                <Icon size={18} className={isActive ? 'text-primary' : 'text-gray-400'} />
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
              {/* PROFILE & AVATAR TAB */}
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Left Main Form */}
                  <div className="xl:col-span-2 space-y-6">
                    {/* Profile Details Panel */}
                    <div className="glass-panel p-6 sm:p-8">
                      <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 bg-white/3 p-6 rounded-2xl border border-white/5">
                        {renderSelectedAvatarPreview()}
                        <div>
                          <h3 className="text-white font-medium text-lg">{currentUser?.name || 'VoiceFlow User'}</h3>
                          <p className="text-sm text-gray-400">{currentUser?.email || 'user@voiceflow.ai'}</p>
                          <p className="text-xs text-gray-500 mt-1 capitalize">Role: {currentUser?.is_admin ? 'Administrator' : 'User'}</p>
                        </div>
                      </div>

                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                value={currentUser?.email || 'user@voiceflow.ai'}
                                disabled
                              />
                            </div>
                            <p className="text-2xs text-gray-500 ml-1">Email addresses cannot be changed for security.</p>
                          </div>
                        </div>

                        {/* Avatar Customization */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <h3 className="text-sm font-semibold text-white">Customize Avatar Display</h3>
                          
                          <div className="space-y-3">
                            <span className="text-xs font-medium text-gray-400">Background Gradient</span>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              {avatarGradients.map((g) => (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() => setAvatarBg(g.id)}
                                  className={`h-10 rounded-xl bg-gradient-to-tr ${g.classes} relative border transition-all duration-300 flex items-center justify-center ${
                                    avatarBg === g.id ? 'border-white scale-105 shadow-lg shadow-white/10 ring-2 ring-primary' : 'border-transparent opacity-70 hover:opacity-100'
                                  }`}
                                  title={g.label}
                                >
                                  {avatarBg === g.id && <Check size={14} className="text-white drop-shadow-md" />}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <span className="text-xs font-medium text-gray-400">Avatar Center Symbol</span>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              {avatarSymbols.map((s) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => setAvatarIcon(s.id)}
                                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all duration-300 flex items-center justify-center space-x-2 ${
                                    avatarIcon === s.id 
                                      ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10' 
                                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <span>{s.label.split(' ')[0]}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-end">
                          <button
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="btn-primary flex items-center gap-2"
                          >
                            {isUpdatingProfile ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : 'Save Profile Changes'}
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

                    {/* Danger Zone */}
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

                  {/* Right Glassmorphic Card ID Preview */}
                  <div className="xl:col-span-1">
                    <div className="sticky top-6 space-y-4">
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">Live Badge Preview</span>
                      
                      {/* ID Card Wrapper */}
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#14141d]/75 p-6 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:scale-[1.02] group hover:border-primary/20">
                        {/* Decorative background grid and blurs */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                        <div className={`absolute -right-16 -top-16 w-32 h-32 bg-gradient-to-tr ${avatarGradients.find(g => g.id === avatarBg)?.classes || 'from-indigo-500 to-purple-500'} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                        <div className="absolute left-6 top-6 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center space-y-4 mt-2">
                          {renderSelectedAvatarPreview(36)}
                          
                          <div className="space-y-1">
                            <h4 className="text-lg font-bold text-white transition-all">{name || 'VoiceFlow User'}</h4>
                            <p className="text-xs text-gray-400 font-mono">{currentUser?.email || 'user@voiceflow.ai'}</p>
                          </div>

                          <div className="w-full h-px bg-white/5 my-2" />

                          <div className="w-full grid grid-cols-2 gap-4 text-left font-mono">
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Account Type</span>
                              <span className="text-xs font-bold text-primary uppercase">{currentPlan}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Est. Latency</span>
                              <span className="text-xs font-bold text-emerald-400">24 ms</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Role Level</span>
                              <span className="text-xs font-bold text-white uppercase">{currentUser?.is_admin ? 'Admin' : 'Developer'}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Registered</span>
                              <span className="text-xs font-bold text-gray-300">Jun 2026</span>
                            </div>
                          </div>

                          <button
                            onClick={handleRandomizeAvatar}
                            className="mt-4 w-full flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all text-gray-400 active:scale-95"
                          >
                            <Sparkles size={14} className="text-primary" />
                            <span>Randomize Badge</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PREFERENCES & THEME TAB */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  {/* Theme Accent Panel */}
                  <div className="glass-panel p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-white mb-2">App Color Theme</h2>
                    <p className="text-sm text-gray-400 mb-6">Select a dynamic gradient color accent for buttons, active tabs, and highlights across the entire dashboard.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {themeOptions.map((theme) => {
                        const isActive = accentTheme === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => handleSelectTheme(theme)}
                            className={`p-4 rounded-2xl bg-white/3 border text-left transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] flex flex-col justify-between h-32 ${
                              isActive 
                                ? 'border-primary shadow-lg shadow-primary/10 bg-primary/5' 
                                : 'border-white/5 hover:border-white/20'
                            }`}
                          >
                            {/* miniature mockup container */}
                            <div className="w-full flex items-center justify-between z-10">
                              <span className="text-sm font-semibold text-white">{theme.label}</span>
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${theme.colors} flex items-center justify-center shadow-md`}>
                                {isActive && <Check size={14} className="text-white" />}
                              </div>
                            </div>

                            {/* UI Dashboard Mini Mockup preview inside button */}
                            <div className="w-full bg-black/40 rounded-lg p-2 flex items-center space-x-2 border border-white/5 z-10 overflow-hidden">
                              <div className="w-1.5 h-6 rounded bg-white/10" />
                              <div className="flex-1 space-y-1">
                                <div className="h-1.5 w-1/3 rounded bg-white/25" />
                                <div className="h-1 w-2/3 rounded bg-white/10" />
                              </div>
                              <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${theme.colors} opacity-80`} />
                            </div>

                            <div className={`absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-tr ${theme.colors} rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Speech Generation Defaults Panel */}
                  <div className="glass-panel p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <Palette className="text-primary" size={22} />
                        <h2 className="text-xl font-semibold text-white">Default TTS Settings</h2>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isPlayingPreview && (
                          <div className="flex items-end space-x-0.5 h-4 px-2">
                            <div className="w-0.5 bg-primary animate-wave-bar wave-height-2 h-full" style={{ animationDelay: '0.1s' }} />
                            <div className="w-0.5 bg-secondary animate-wave-bar wave-height-4 h-full" style={{ animationDelay: '0.2s' }} />
                            <div className="w-0.5 bg-primary animate-wave-bar wave-height-1 h-full" style={{ animationDelay: '0.3s' }} />
                            <div className="w-0.5 bg-secondary animate-wave-bar wave-height-3 h-full" style={{ animationDelay: '0.4s' }} />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleTestVoicePreview}
                          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg border border-white/10 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                        >
                          <Volume2 size={13} className="text-primary" />
                          <span>Test Voice Preview</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">Configure the default options that load when you open the Voice Generator page.</p>
                    
                    <form onSubmit={handleSavePreferences} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Default Language</label>
                          <select
                            value={prefLanguage}
                            onChange={(e) => setPrefLanguage(e.target.value)}
                            className="input-field appearance-none bg-[#13131a]"
                          >
                            <option value="english">English (US)</option>
                            <option value="sinhala">Sinhala</option>
                            <option value="tamil">Tamil</option>
                            <option value="hindi">Hindi</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Default Voice Type</label>
                          <select
                            value={prefVoice}
                            onChange={(e) => setPrefVoice(e.target.value)}
                            className="input-field appearance-none bg-[#13131a]"
                          >
                            <option value="natural">Natural AI Voice (Recommended)</option>
                            <option value="male">Standard Male</option>
                            <option value="female">Standard Female</option>
                            <option value="robotic">Robotic / Synthetic</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">Default Speed</label>
                            <span className="text-xs text-primary font-mono">{prefSpeed.toFixed(1)}x</span>
                          </div>
                          <input
                            type="range" min="0.5" max="2" step="0.1"
                            value={prefSpeed}
                            onChange={(e) => setPrefSpeed(parseFloat(e.target.value))}
                            className="w-full accent-primary bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">Default Pitch</label>
                            <span className="text-xs text-primary font-mono">{prefPitch.toFixed(1)}</span>
                          </div>
                          <input
                            type="range" min="0.5" max="2" step="0.1"
                            value={prefPitch}
                            onChange={(e) => setPrefPitch(parseFloat(e.target.value))}
                            className="w-full accent-primary bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-end">
                        <button
                          type="submit"
                          className="btn-primary"
                        >
                          Save Preferences
                        </button>
                      </div>
                    </form>
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
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                          {/* Circle Progress */}
                          <div className="col-span-1 flex flex-col items-center justify-center p-4 bg-white/3 border border-white/5 rounded-2xl">
                            <span className="text-xs text-gray-400 mb-3 font-medium">Characters Remaining</span>
                            <div className="relative flex items-center justify-center w-28 h-28">
                              <svg className="w-28 h-28 transform -rotate-90">
                                <circle
                                  className="text-white/5"
                                  strokeWidth="8"
                                  stroke="currentColor"
                                  fill="transparent"
                                  r="46"
                                  cx="56"
                                  cy="56"
                                />
                                <circle
                                  className="text-primary transition-all duration-1000 ease-out"
                                  strokeWidth="8"
                                  strokeDasharray={2 * Math.PI * 46} 
                                  strokeDashoffset={2 * Math.PI * 46 - (Math.min(100, (stats.characters_used / stats.character_limit) * 100) / 100) * 2 * Math.PI * 46}
                                  strokeLinecap="round"
                                  stroke="url(#billingProgressGradient)"
                                  fill="transparent"
                                  r="46"
                                  cx="56"
                                  cy="56"
                                />
                                <defs>
                                  <linearGradient id="billingProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--color-primary)" />
                                    <stop offset="100%" stopColor="var(--color-secondary)" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-lg font-bold text-white font-mono">
                                  {Math.max(0, stats.character_limit - stats.characters_used).toLocaleString()}
                                </span>
                                <span className="text-3xs text-gray-400 uppercase tracking-widest font-semibold mt-0.5">chars</span>
                              </div>
                            </div>
                            <div className="text-2xs text-gray-500 font-medium mt-3">
                              {Math.round((stats.characters_used / stats.character_limit) * 100)}% consumed
                            </div>
                          </div>

                          {/* Usage details */}
                          <div className="md:col-span-2 space-y-4">
                            <div>
                              <div className="flex justify-between text-sm font-medium mb-2">
                                <span className="text-gray-400">Total Characters Consumed</span>
                                <span className="text-white font-mono font-bold">
                                  {stats.characters_used.toLocaleString()} / {stats.character_limit.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full bg-white/5 border border-white/5 h-4.5 rounded-full overflow-hidden p-0.5 flex">
                                <div 
                                  className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                                  style={{ width: `${Math.min(100, (stats.characters_used / stats.character_limit) * 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2 text-right">Stats resets monthly on your sign-up date</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white/3 p-3 rounded-xl border border-white/5">
                                <p className="text-2xs text-gray-400 uppercase font-bold tracking-wider">Voices Generated</p>
                                <p className="text-xl font-bold text-white mt-1">{stats.voices_generated}</p>
                              </div>
                              <div className="bg-white/3 p-3 rounded-xl border border-white/5">
                                <p className="text-2xs text-gray-400 uppercase font-bold tracking-wider">Estimated Hours Saved</p>
                                <p className="text-xl font-bold text-white mt-1">{stats.hours_saved}h</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Languages Usage Breakdown Segmented Bar */}
                        <div className="pt-6 border-t border-white/5 space-y-3">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Character Breakdown by Language</h3>
                          <div className="h-3.5 bg-white/5 border border-white/5 rounded-full overflow-hidden flex">
                            <div className="bg-indigo-500 h-full" style={{ width: '55%' }} title="English (55%)" />
                            <div className="bg-emerald-500 h-full" style={{ width: '20%' }} title="Sinhala (20%)" />
                            <div className="bg-amber-500 h-full" style={{ width: '15%' }} title="Hindi (15%)" />
                            <div className="bg-cyan-500 h-full" style={{ width: '10%' }} title="Tamil (10%)" />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                              <span className="text-gray-300 font-medium">English (55%)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                              <span className="text-gray-300 font-medium">Sinhala (20%)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                              <span className="text-gray-300 font-medium">Hindi (15%)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                              <span className="text-gray-300 font-medium">Tamil (10%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Plan Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Free Card */}
                    <div className="glow-card p-6 border border-white/5 relative flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Free Tier</h3>
                        <p className="text-xs text-gray-400 mb-4">Standard features for hobbyists</p>
                        <div className="text-2xl font-black text-white mb-6">$0 <span className="text-xs text-gray-500 font-medium">/ month</span></div>
                        <ul className="text-sm text-gray-300 space-y-3 mb-8">
                          <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 100,000 characters limit</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> English & Hindi languages</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Natural & Robotic voices</li>
                        </ul>
                      </div>
                      <button 
                        disabled={currentPlan === 'Free Tier'} 
                        onClick={handleDowngradePlan}
                        className="btn-secondary w-full"
                      >
                        {currentPlan === 'Free Tier' ? 'Current Plan' : 'Downgrade'}
                      </button>
                    </div>

                    {/* Pro Card with Conic border glow & Popular Badge */}
                    <div className="glow-card p-6 border border-primary/30 relative flex flex-col justify-between overflow-hidden">
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-secondary to-primary text-white text-2xs font-extrabold px-3 py-1.5 rounded-bl-xl uppercase tracking-wider">
                        Popular Pro
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Pro Plan</h3>
                        <p className="text-xs text-gray-400 mb-4">Ideal for professionals and developers</p>
                        <div className="text-2xl font-black text-white mb-6">$15 <span className="text-xs text-gray-500 font-medium">/ month</span></div>
                        <ul className="text-sm text-gray-300 space-y-3 mb-8">
                          <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 1,000,000 characters limit</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Access to 50+ languages</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> High-fidelity voice styles</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> API Access & Integrations</li>
                        </ul>
                      </div>
                      <button 
                        onClick={handleUpgradePlan}
                        className="btn-primary w-full shadow-lg shadow-primary/25"
                      >
                        {currentPlan === 'Pro Plan' ? 'Current Plan (Manage)' : 'Upgrade to Pro'}
                      </button>
                    </div>
                  </div>

                  {/* Invoice Logs Section */}
                  <div className="glass-panel p-6 sm:p-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Billing History</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-gray-400 font-medium">
                            <th className="pb-3 pr-4">Invoice ID</th>
                            <th className="pb-3 pr-4">Date</th>
                            <th className="pb-3 pr-4">Amount</th>
                            <th className="pb-3 pr-4">Status</th>
                            <th className="pb-3 text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
                          {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-white/1">
                              <td className="py-3.5 pr-4 font-semibold text-white">{inv.id}</td>
                              <td className="py-3.5 pr-4">{inv.date}</td>
                              <td className="py-3.5 pr-4">{inv.amount}</td>
                              <td className="py-3.5 pr-4">
                                <span className={`px-2 py-0.5 rounded text-3xs font-bold uppercase tracking-wider ${
                                  inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-gray-400'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="py-3.5 text-right font-sans">
                                <button
                                  onClick={() => handleDownloadInvoice(inv)}
                                  className="text-primary hover:text-primary/80 text-xs font-semibold hover:underline"
                                >
                                  Download TXT
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="glass-panel p-6 sm:p-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                  <p className="text-sm text-gray-400 mb-6">Configure how and when you want to receive emails and system alerts.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start justify-between p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
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

                    <div className="flex items-start justify-between p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
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

                    <div className="flex items-start justify-between p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
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

                    <div className="flex items-start justify-between p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
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

                    {/* Email Digest Frequency dropdown */}
                    <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Email Digest Schedule</h4>
                        <p className="text-xs text-gray-400 mt-1">Configure your preferred reporting interval for analytics.</p>
                      </div>
                      <select
                        value={notifications.digestFrequency || 'daily'}
                        onChange={handleNotificationDigestChange}
                        className="input-field max-w-xs appearance-none bg-[#13131a] sm:w-48"
                      >
                        <option value="realtime">Real-time alerts</option>
                        <option value="daily">Daily summary</option>
                        <option value="weekly">Weekly digest</option>
                        <option value="disabled">Muted</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* API KEYS TAB */}
              {activeTab === 'apikeys' && (
                <div className="space-y-6">
                  {/* Create Key Panel */}
                  <div className="glass-panel p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-white mb-2">API Access Keys</h2>
                    <p className="text-sm text-gray-400 mb-6">Create API credentials to build custom integrations with VoiceFlow's speech generation engines.</p>
                    
                    <form onSubmit={handleGenerateApiKey} className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
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
                      </div>

                      {/* Scopes choice selection */}
                      <div className="bg-white/3 p-4 rounded-xl border border-white/5 space-y-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select API Key Scopes</span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={keyScopes.ttsGenerate}
                              onChange={(e) => setKeyScopes(prev => ({ ...prev, ttsGenerate: e.target.checked }))}
                              className="rounded bg-white/5 border-white/10 text-primary focus:ring-0"
                            />
                            <span>tts:generate</span>
                          </label>
                          <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={keyScopes.historyRead}
                              onChange={(e) => setKeyScopes(prev => ({ ...prev, historyRead: e.target.checked }))}
                              className="rounded bg-white/5 border-white/10 text-primary focus:ring-0"
                            />
                            <span>history:read</span>
                          </label>
                          <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={keyScopes.analyticsRead}
                              onChange={(e) => setKeyScopes(prev => ({ ...prev, analyticsRead: e.target.checked }))}
                              className="rounded bg-white/5 border-white/10 text-primary focus:ring-0"
                            />
                            <span>analytics:read</span>
                          </label>
                          <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={keyScopes.adminWrite}
                              onChange={(e) => setKeyScopes(prev => ({ ...prev, adminWrite: e.target.checked }))}
                              className="rounded bg-white/5 border-white/10 text-primary focus:ring-0"
                            />
                            <span>admin:write</span>
                          </label>
                        </div>
                      </div>
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
                            className="p-4 rounded-2xl bg-white/3 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-colors"
                          >
                            <div className="space-y-1">
                              <h4 className="text-white font-medium text-sm">{key.name}</h4>
                              <div className="flex items-center space-x-2 font-mono text-xs text-gray-400 bg-black/25 px-2.5 py-1.5 rounded-lg border border-white/5 select-all">
                                <span>{key.secret.substring(0, 12)}...{key.secret.substring(key.secret.length - 4)}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {key.scopes?.map((sc) => (
                                  <span key={sc} className="px-2 py-0.5 rounded bg-white/5 text-3xs text-gray-400 font-mono">{sc}</span>
                                ))}
                              </div>
                              <p className="text-2xs text-gray-500 pt-1">Created on {key.createdAt}</p>
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

                  {/* SDK Code Snippets integration panel */}
                  <div className="glass-panel p-6 sm:p-8 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Developer Integration Snippets</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Integrate voice generations programmatically using python, node or curl.</p>
                      </div>
                      <div className="flex space-x-1 border border-white/5 bg-white/3 rounded-lg p-0.5 text-xs">
                        <button
                          onClick={() => setActiveSnippetTab('curl')}
                          className={`px-3 py-1 rounded-md transition-colors ${activeSnippetTab === 'curl' ? 'bg-primary text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
                        >
                          cURL
                        </button>
                        <button
                          onClick={() => setActiveSnippetTab('nodejs')}
                          className={`px-3 py-1 rounded-md transition-colors ${activeSnippetTab === 'nodejs' ? 'bg-primary text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
                        >
                          Node.js
                        </button>
                        <button
                          onClick={() => setActiveSnippetTab('python')}
                          className={`px-3 py-1 rounded-md transition-colors ${activeSnippetTab === 'python' ? 'bg-primary text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
                        >
                          Python
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <pre className="p-4 bg-black/40 rounded-xl border border-white/5 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre leading-relaxed select-all">
                        <code>{getSnippet()}</code>
                      </pre>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(getSnippet());
                          toast.success("Snippet copied!");
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg border border-white/10 transition-colors"
                        title="Copy Snippet"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY & SESSIONS TAB (NEW) */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Sessions Panel */}
                  <div className="glass-panel p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-white mb-2">Active Developer Sessions</h2>
                    <p className="text-sm text-gray-400 mb-6">Manage all authorized devices currently logged into your account dashboard.</p>

                    <div className="space-y-4">
                      {sessions.map((sess) => {
                        const Icon = sess.icon;
                        return (
                          <div 
                            key={sess.id}
                            className="p-4 rounded-2xl bg-white/3 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                                <Icon size={20} />
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                                  <span>{sess.device}</span>
                                  {sess.status === 'Active Now' && (
                                    <span className="px-2 py-0.5 text-[8px] bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-full font-bold uppercase tracking-wider">Current Session</span>
                                  )}
                                </h4>
                                <p className="text-xs text-gray-400">{sess.browser} • {sess.ip}</p>
                                <p className="text-[10px] text-gray-500 flex items-center space-x-1">
                                  <Globe size={10} />
                                  <span>{sess.location}</span>
                                </p>
                              </div>
                            </div>

                            {sess.status !== 'Active Now' && (
                              <button
                                onClick={() => handleRevokeSession(sess.id, sess.device)}
                                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-colors self-end sm:self-center"
                              >
                                Revoke Session
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Security Access Log */}
                  <div className="glass-panel p-6 sm:p-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Security Auditing Log</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-gray-400 font-medium">
                            <th className="pb-3 pr-4">Security Event</th>
                            <th className="pb-3 pr-4">IP Address</th>
                            <th className="pb-3 pr-4">Timestamp</th>
                            <th className="pb-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
                          {securityLogs.map((log) => (
                            <tr key={log.id}>
                              <td className="py-3 pr-4 font-sans text-white font-medium">{log.event}</td>
                              <td className="py-3 pr-4">{log.ip}</td>
                              <td className="py-3 pr-4 text-xs">{log.date}</td>
                              <td className="py-3 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* INTEGRATIONS & WEBHOOKS TAB (NEW) */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  {/* Webhook Configuration Panel */}
                  <div className="glass-panel p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <Webhook className="text-primary" size={24} />
                      <h2 className="text-xl font-semibold text-white">Developer Webhook</h2>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">Receive real-time notifications on external applications when events occur inside your VoiceFlow account (e.g. audio synthesis completed).</p>

                    <form onSubmit={handleSaveWebhook} className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Payload URL</label>
                        <input
                          type="url"
                          required
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          className="input-field font-mono text-sm"
                          placeholder="https://api.domain.com/webhook"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-300">Webhook Secret Signing Key</label>
                          <div className="relative">
                            <input
                              type="text"
                              disabled
                              value={webhookSecret}
                              className="input-field font-mono text-sm pr-10 text-gray-400 bg-white/1 border-white/5"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(webhookSecret);
                                toast.success("Secret key copied!");
                              }}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <span className="text-sm font-medium text-gray-300 block">Trigger Events</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={webhookEvents.audioGenerated}
                                onChange={(e) => setWebhookEvents(prev => ({ ...prev, audioGenerated: e.target.checked }))}
                                className="rounded bg-white/5 border-white/10 text-primary"
                              />
                              <span>audio.generated</span>
                            </label>
                            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={webhookEvents.billingLimit}
                                onChange={(e) => setWebhookEvents(prev => ({ ...prev, billingLimit: e.target.checked }))}
                                className="rounded bg-white/5 border-white/10 text-primary"
                              />
                              <span>billing.limit_reached</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <button
                          type="button"
                          disabled={isTestingWebhook}
                          onClick={handleTestWebhook}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-all"
                        >
                          {isTestingWebhook ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : <Activity size={14} className="text-primary" />}
                          <span>Send Test Payload</span>
                        </button>

                        <button
                          type="submit"
                          disabled={isWebhookSaving}
                          className="btn-primary"
                        >
                          {isWebhookSaving ? 'Saving...' : 'Save Webhook Endpoint'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Webhook Delivery Log */}
                  <div className="glass-panel p-6 sm:p-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Webhook Delivery Logs</h3>
                    {webhookLogs.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        No webhook test payloads dispatched yet. Click "Send Test Payload" above to inspect responses.
                      </div>
                    ) : (
                      <div className="space-y-3 font-mono text-xs">
                        {webhookLogs.map((log) => (
                          <div 
                            key={log.id}
                            className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2"
                          >
                            <div className="flex flex-col sm:flex-row justify-between gap-1 text-[11px]">
                              <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${log.status === 'Pending' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                                <span className="font-semibold text-white uppercase">{log.event}</span>
                              </div>
                              <div className="text-gray-500 flex space-x-3">
                                <span>{log.timestamp}</span>
                                <span>Code: {log.statusCode || 'PENDING'}</span>
                              </div>
                            </div>
                            <p className="text-gray-400 break-all select-all font-semibold">POST {log.url}</p>
                            {log.response && (
                              <pre className="p-2 bg-white/2 border border-white/5 rounded text-[10px] text-indigo-300 overflow-x-auto">
                                <code>{log.response}</code>
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SYSTEM DIAGNOSTICS TAB (NEW) */}
              {activeTab === 'diagnostics' && (
                <div className="glass-panel p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Service Status & Diagnostics</h2>
                    <p className="text-sm text-gray-400">Perform real-time checks on the VoiceFlow platform components and verify system status metrics.</p>
                  </div>

                  {/* Diagnostics status columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/3 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">API Gateway</span>
                        <span className="text-sm font-bold text-white">Online</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 size={18} />
                      </div>
                    </div>

                    <div className="bg-white/3 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Database Latency</span>
                        <span className="text-sm font-bold text-white">9 ms (Optimal)</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Cpu size={18} />
                      </div>
                    </div>

                    <div className="bg-white/3 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">TTS engine cluster</span>
                        <span className="text-sm font-bold text-white">124ms (Healthy)</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Wifi size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Console Terminal */}
                  <div className="border border-white/10 bg-black/60 rounded-2xl overflow-hidden font-mono text-xs">
                    {/* Header Bar */}
                    <div className="bg-white/5 border-b border-white/5 px-4 py-2 flex items-center justify-between text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Terminal size={14} className="text-primary" />
                        <span>System diagnostics Console</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-500">VT-100 emulator</span>
                    </div>

                    {/* Terminal body */}
                    <div className="p-5 space-y-3 min-h-[160px] text-gray-300 leading-relaxed">
                      {diagnosticsLogs.length === 0 ? (
                        <div className="text-gray-500 italic py-6 text-center">
                          Click "Run Diagnostics Scan" below to start pinging system components.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {diagnosticsLogs.map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {log.status === 'pending' ? (
                                  <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                ) : (
                                  <span className="text-emerald-400 font-bold">✓</span>
                                )}
                                <span>{log.name}</span>
                              </div>
                              <span className={log.status === 'pending' ? 'text-gray-500 animate-pulse' : 'text-primary'}>
                                {log.status === 'pending' ? 'checking...' : log.duration}
                              </span>
                            </div>
                          ))}
                          
                          {diagnosticsStep === 5 && (
                            <div className="pt-4 border-t border-white/5 text-[11px] text-emerald-400 font-semibold flex items-center space-x-1.5">
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>STATUS: ALL CORE INFRASTRUCTURE OPERATIONAL AND SECURED</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={diagnosticsActive}
                      onClick={runDiagnostics}
                      className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-primary/10 transition-all"
                    >
                      {diagnosticsActive ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Conducting Checks...</span>
                        </>
                      ) : (
                        <>
                          <Activity size={16} />
                          <span>Run Diagnostics Scan</span>
                        </>
                      )}
                    </button>
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

      {/* Mock Upgrade Plan Loading Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl z-[60] text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles size={24} className="text-secondary absolute animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Opening Payment Gateway...</h3>
                <p className="text-xs text-gray-400">Redirecting to Stripe sandbox billing checkout page.</p>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-white/5 border border-white/5 h-2 rounded-full overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-200"
                  style={{ width: `${upgradeProgress}%` }}
                />
              </div>

              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">SECURE TRANSPARENT CONNECTION</span>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
