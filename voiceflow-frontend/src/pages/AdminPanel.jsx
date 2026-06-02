import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, getUser, BASE_URL } from '../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Mic2, 
  Search, 
  Shield, 
  ShieldAlert, 
  Trash2, 
  Loader2, 
  Calendar, 
  Lock, 
  Unlock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Activity,
  X,
  RefreshCw,
  Play,
  Pause,
  Sliders
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function HighlightText({ text, search }) {
  if (!search || !search.trim()) return <span>{text}</span>;
  
  const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark 
            key={index} 
            className="bg-primary/25 text-white font-semibold rounded px-0.5 border border-primary/20"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function ConfirmationModal({ isOpen, title, message, confirmLabel, confirmVariant = 'primary', onConfirm, onCancel, isLoading }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          {/* Modal Panel */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface border border-white/10 p-6 shadow-2xl z-10"
          >
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              {confirmVariant === 'danger' ? (
                <ShieldAlert className="text-red-500 shrink-0" size={24} />
              ) : (
                <Shield className="text-primary shrink-0" size={24} />
              )}
              {title}
            </h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2 text-sm text-white rounded-lg flex items-center gap-2 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                  confirmVariant === 'danger' 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/15' 
                    : confirmVariant === 'warning'
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/15'
                    : 'bg-gradient-to-r from-primary to-secondary shadow-primary/15'
                }`}
              >
                {isLoading && <Loader2 className="animate-spin" size={16} />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function AdjustUsageModal({ isOpen, user, onSave, onCancel, isLoading }) {
  const [chars, setChars] = useState(0);
  const [voices, setVoices] = useState(0);

  useEffect(() => {
    if (user) {
      setChars(user.characters_used);
      setVoices(user.voices_generated);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        {/* Modal Panel */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface border border-white/10 p-6 shadow-2xl z-10"
        >
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Sliders className="text-primary shrink-0" size={24} />
            Adjust User Usage Stats
          </h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Modify characters used and voices generated count for <strong>{user.name}</strong> ({user.email}).
          </p>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Characters Used</label>
              <input
                type="number"
                min="0"
                value={chars}
                onChange={(e) => setChars(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Voices Generated</label>
              <input
                type="number"
                min="0"
                value={voices}
                onChange={(e) => setVoices(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/5"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(chars, voices)}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-2 font-medium bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/15 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="animate-spin" size={16} />}
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function UserDetailsDrawer({ user, isOpen, onClose, onToggleAdmin, onDeleteUser, onOpenAdjustModal, actionLoadingId }) {
  if (!user) return null;
  
  const formattedDate = new Date(user.created_at).toLocaleString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  
  const colors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-teal-500 to-emerald-500',
    'from-amber-500 to-orange-500'
  ];
  const colorIndex = (user.name.charCodeAt(0) + user.email.charCodeAt(0)) % colors.length;
  const avatarGradient = colors[colorIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />
          
          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-surface border-l border-white/5 shadow-2xl p-6 flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <h2 className="text-xl font-bold text-white">User Profile Details</h2>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors bg-white/5 border border-white/5 hover:border-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Avatar & Basics */}
              <div className="flex flex-col items-center text-center space-y-3 p-6 glass-panel relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-black/30 ring-4 ring-white/5`}>
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white leading-tight">{user.name}</h3>
                  <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
                </div>
                <div className="pt-2">
                  {user.is_admin ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      <Shield size={12} />
                      <span>Administrator</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-400 border border-white/5">
                      <span>Standard User</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-4 bg-white/2">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">Characters Used</span>
                    <TrendingUp size={14} className="text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">
                    {user.characters_used.toLocaleString()}
                  </div>
                </div>
                
                <div className="glass-panel p-4 bg-white/2">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">Voices Generated</span>
                    <Mic2 size={14} className="text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">
                    {user.voices_generated.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Registration Details */}
              <div className="glass-panel p-4 space-y-3">
                <h4 className="text-sm font-semibold text-white border-b border-white/5 pb-2">Account Metadata</h4>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">User ID</span>
                  <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded text-xs">#{user.id}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Join Date</span>
                  <span className="text-white text-right text-xs sm:text-sm">{formattedDate}</span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span>Usage Level</span>
                    <span>{Math.min(100, Math.round((user.characters_used / 100000) * 100))}% of limit</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" 
                      style={{ width: `${Math.min(100, (user.characters_used / 100000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Admin Management Actions */}
              <div className="glass-panel p-4 space-y-4 border border-red-500/10">
                <h4 className="text-sm font-semibold text-white border-b border-white/5 pb-2">Administrative Controls</h4>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => onToggleAdmin(user.id, user.is_admin)}
                    disabled={actionLoadingId !== null}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border text-sm font-medium transition-all duration-300 ${
                      user.is_admin
                        ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20'
                        : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20'
                    }`}
                  >
                    {actionLoadingId === user.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : user.is_admin ? (
                      <>
                        <Unlock size={16} /> Demote from Admin
                      </>
                    ) : (
                      <>
                        <Lock size={16} /> Promote to Admin
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onOpenAdjustModal(user)}
                    disabled={actionLoadingId !== null}
                    className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-sm font-medium transition-all duration-300"
                  >
                    <Sliders size={16} /> Adjust Usage Stats
                  </button>

                  <button
                    onClick={() => onDeleteUser(user.id, user.email)}
                    disabled={actionLoadingId !== null}
                    className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-all duration-300"
                  >
                    {actionLoadingId === user.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        <Trash2 size={16} /> Delete Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────

export default function AdminPanel() {
  const navigate = useNavigate();
  const currentUser = getUser();

  useEffect(() => {
    const isAdminSession = localStorage.getItem('voiceflow_admin_session') === 'true';
    const isAuthorized = currentUser && currentUser.is_admin && currentUser.email.toLowerCase() === 'hasintha@gmail.com' && isAdminSession;
    if (!isAuthorized) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin/login');
    }
  }, [currentUser, navigate]);

  const [stats, setStats] = useState({
    total_users: 0,
    total_characters_used: 0,
    total_voices_generated: 0
  });
  
  // Tabs: 'users' or 'generations'
  const [activeTab, setActiveTab] = useState('users');

  // Users Tab States
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // Generations Tab States
  const [generations, setGenerations] = useState([]);
  const [generationsTotal, setGenerationsTotal] = useState(0);
  const [generationsSearch, setGenerationsSearch] = useState('');
  const [generationsPage, setGenerationsPage] = useState(1);
  const [generationsPageSize, setGenerationsPageSize] = useState(5);
  const [generationsLoading, setGenerationsLoading] = useState(false);

  // Audio Playback States
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);

  // Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLogs, setActionLogs] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    confirmVariant: 'primary',
    onConfirm: null,
    isLoading: false
  });
  const [adjustModal, setAdjustModal] = useState({
    isOpen: false,
    user: null,
    isLoading: false
  });

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLogs(prev => [{ timestamp, message, type }, ...prev]);
  };

  const loadAdminData = async () => {
    const isAdminSession = localStorage.getItem('voiceflow_admin_session') === 'true';
    const isAuthorized = currentUser && currentUser.is_admin && currentUser.email.toLowerCase() === 'hasintha@gmail.com' && isAdminSession;
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers()
      ]);
      setStats(statsData);
      setUsers(usersData);
      addLog('Fetched system statistics and user records successfully.', 'success');
    } catch (err) {
      toast.error('Failed to load admin data. Is the backend running with admin privileges?');
      addLog('Failed to sync data with the backend API.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadGenerationsData = async () => {
    const isAdminSession = localStorage.getItem('voiceflow_admin_session') === 'true';
    const isAuthorized = currentUser && currentUser.is_admin && currentUser.email.toLowerCase() === 'hasintha@gmail.com' && isAdminSession;
    if (!isAuthorized) return;
    setGenerationsLoading(true);
    try {
      const skip = (generationsPage - 1) * generationsPageSize;
      const data = await adminApi.getGenerations(generationsSearch, skip, generationsPageSize);
      setGenerations(data.items);
      setGenerationsTotal(data.total);
      addLog(`Fetched global generations history records (Page ${generationsPage}).`, 'success');
    } catch (err) {
      toast.error('Failed to load global voice generations logs.');
      addLog('Failed to sync generations data with the backend API.', 'danger');
    } finally {
      setGenerationsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 'generations') {
      loadGenerationsData();
    }
  }, [activeTab, generationsSearch, generationsPage, generationsPageSize]);

  // Cleanup audio playback on unmount
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
      }
    };
  }, [audioInstance]);

  const stopAudio = () => {
    if (audioInstance) {
      audioInstance.pause();
      setPlayingAudioId(null);
    }
  };

  const playAudio = (url, genId) => {
    if (!url) {
      toast.error('No audio file associated with this generation.');
      return;
    }
    const absoluteUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    
    if (playingAudioId === genId) {
      audioInstance.pause();
      setPlayingAudioId(null);
    } else {
      if (audioInstance) {
        audioInstance.pause();
      }
      const audio = new Audio(absoluteUrl);
      audio.play().catch(e => {
        toast.error('Playback failed. The audio file might have been cleaned up.');
        setPlayingAudioId(null);
      });
      audio.onended = () => setPlayingAudioId(null);
      setAudioInstance(audio);
      setPlayingAudioId(genId);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    stopAudio();
  };

  const handleSyncData = () => {
    if (activeTab === 'users') {
      loadAdminData();
    } else {
      loadGenerationsData();
    }
  };

  const handleToggleAdmin = (userId, currentStatus) => {
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) return;

    const actionText = currentStatus ? 'revoke admin status for' : 'grant admin status to';
    
    setConfirmModal({
      isOpen: true,
      title: currentStatus ? 'Revoke Admin Privileges?' : 'Grant Admin Privileges?',
      message: `Are you sure you want to ${actionText} ${userToEdit.name} (${userToEdit.email})? Administrators have access to sensitive system settings.`,
      confirmLabel: currentStatus ? 'Revoke Admin' : 'Grant Admin',
      confirmVariant: currentStatus ? 'warning' : 'primary',
      onConfirm: async () => {
        setActionLoadingId(userId);
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          const res = await adminApi.toggleAdmin(userId);
          toast.success(res.message || 'Updated user role.');
          addLog(`Updated role of user "${userToEdit.name}" to ${!currentStatus ? 'Admin' : 'Standard User'}.`, 'success');
          
          setUsers(prev => 
            prev.map(u => u.id === userId ? { ...u, is_admin: !currentStatus } : u)
          );
          
          if (selectedUser && selectedUser.id === userId) {
            setSelectedUser(prev => ({ ...prev, is_admin: !currentStatus }));
          }

          const statsData = await adminApi.getStats();
          setStats(statsData);
        } catch (err) {
          toast.error(err.message || 'Failed to update user role.');
          addLog(`Failed to update privileges for user "${userToEdit.name}".`, 'danger');
        } finally {
          setActionLoadingId(null);
          setConfirmModal({ isOpen: false, title: '', message: '', confirmLabel: '', confirmVariant: 'primary', onConfirm: null, isLoading: false });
        }
      }
    });
  };

  const handleDeleteUser = (userId, userEmail) => {
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) return;

    setConfirmModal({
      isOpen: true,
      title: 'Permanently Delete User Account?',
      message: `WARNING: Are you sure you want to delete user ${userToEdit.name} (${userEmail})? This will permanently delete their account, generation history, and files. This action CANNOT be undone.`,
      confirmLabel: 'Permanently Delete',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setActionLoadingId(userId);
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          const res = await adminApi.deleteUser(userId);
          toast.success(res.message || 'User deleted successfully.');
          addLog(`Deleted user account: "${userToEdit.name}" (${userEmail}).`, 'danger');
          
          setUsers(prev => prev.filter(u => u.id !== userId));
          
          if (selectedUser && selectedUser.id === userId) {
            setSelectedUser(null);
          }

          const statsData = await adminApi.getStats();
          setStats(statsData);
        } catch (err) {
          toast.error(err.message || 'Failed to delete user.');
          addLog(`Failed to delete user account "${userToEdit.name}".`, 'danger');
        } finally {
          setActionLoadingId(null);
          setConfirmModal({ isOpen: false, title: '', message: '', confirmLabel: '', confirmVariant: 'primary', onConfirm: null, isLoading: false });
        }
      }
    });
  };

  const handleAdjustUsageSave = async (chars, voices) => {
    if (!adjustModal.user) return;
    const userId = adjustModal.user.id;
    setAdjustModal(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await adminApi.adjustUsage(userId, chars, voices);
      toast.success(res.message || 'Successfully updated usage stats.');
      addLog(`Adjusted usage stats for "${adjustModal.user.name}" to Characters Used: ${chars}, Voices Generated: ${voices}.`, 'success');
      
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, characters_used: chars, voices_generated: voices } : u)
      );
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, characters_used: chars, voices_generated: voices }));
      }

      const statsData = await adminApi.getStats();
      setStats(statsData);
      
      setAdjustModal({ isOpen: false, user: null, isLoading: false });
    } catch (err) {
      toast.error(err.message || 'Failed to adjust usage.');
      addLog(`Failed to adjust usage stats for "${adjustModal.user.name}".`, 'danger');
    } finally {
      setAdjustModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteGeneration = (genId, userEmail) => {
    setConfirmModal({
      isOpen: true,
      title: 'Permanently Delete Voice Generation?',
      message: 'Are you sure you want to delete this specific voice generation entry and remove its audio file from the server? This action CANNOT be undone.',
      confirmLabel: 'Permanently Delete',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setActionLoadingId(genId);
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          if (playingAudioId === genId) {
            stopAudio();
          }
          await adminApi.deleteGeneration(genId);
          toast.success('Generation log deleted successfully.');
          addLog(`Deleted global voice generation record #${genId} by ${userEmail}.`, 'danger');
          
          loadGenerationsData();
          
          const statsData = await adminApi.getStats();
          setStats(statsData);
        } catch (err) {
          toast.error(err.message || 'Failed to delete generation.');
          addLog(`Failed to delete global voice generation record #${genId}.`, 'danger');
        } finally {
          setActionLoadingId(null);
          setConfirmModal({ isOpen: false, title: '', message: '', confirmLabel: '', confirmVariant: 'primary', onConfirm: null, isLoading: false });
        }
      }
    });
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  useEffect(() => {
    setGenerationsPage(1);
  }, [generationsSearch]);

  const isAdminSession = localStorage.getItem('voiceflow_admin_session') === 'true';
  const isAuthorized = currentUser && currentUser.is_admin && currentUser.email.toLowerCase() === 'hasintha@gmail.com' && isAdminSession;
  if (!isAuthorized) {
    return null;
  }

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    addLog(`Sorted user registry by ${key.replace('_', ' ')} (${direction.toUpperCase()}).`, 'info');
  };

  // Filter and sort computation for users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' 
      ? true 
      : roleFilter === 'admin' 
        ? u.is_admin 
        : !u.is_admin;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === 'created_at') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (typeof aValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === 'asc' 
      ? aValue - bValue 
      : bValue - aValue;
  });

  const totalItems = sortedUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Filter and sort computation for generations
  const generationsTotalPages = Math.ceil(generationsTotal / generationsPageSize) || 1;

  // Dynamic dashboard metadata
  const avgChars = stats.total_users ? Math.round(stats.total_characters_used / stats.total_users) : 0;
  const avgVoices = stats.total_users ? (stats.total_voices_generated / stats.total_users).toFixed(1) : 0;
  const adminRatio = users.length ? Math.round((users.filter(u => u.is_admin).length / users.length) * 100) : 0;

  const statsCards = [
    { 
      label: 'Total Users', 
      value: stats.total_users.toLocaleString(), 
      icon: Users, 
      color: 'text-blue-400',
      bgGlow: 'bg-blue-500/5',
      subtext: `${adminRatio}% administrator ratio` 
    },
    { 
      label: 'Total Characters Used', 
      value: stats.total_characters_used.toLocaleString(), 
      icon: TrendingUp, 
      color: 'text-green-400',
      bgGlow: 'bg-green-500/5',
      subtext: `Avg. ${avgChars.toLocaleString()} chars / user`
    },
    { 
      label: 'Total Voices Generated', 
      value: stats.total_voices_generated.toLocaleString(), 
      icon: Mic2, 
      color: 'text-primary',
      bgGlow: 'bg-indigo-500/5',
      subtext: `Avg. ${avgVoices} generations / user`
    },
  ];

  const SortHeader = ({ label, sortKey, alignClass = 'text-left' }) => {
    const isSorted = sortConfig.key === sortKey;
    return (
      <th 
        onClick={() => handleSort(sortKey)}
        className={`p-4 font-medium cursor-pointer hover:bg-white/5 transition-colors select-none text-gray-400 text-xs uppercase tracking-wider ${alignClass}`}
      >
        <div className={`flex items-center gap-1.5 ${alignClass === 'text-center' ? 'justify-center' : alignClass === 'text-right' ? 'justify-end' : ''}`}>
          <span>{label}</span>
          {isSorted ? (
            sortConfig.direction === 'asc' ? (
              <ChevronUp size={14} className="text-primary" />
            ) : (
              <ChevronDown size={14} className="text-primary" />
            )
          ) : (
            <ArrowUpDown size={12} className="text-gray-600" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Monitor system activity, manage users, and moderate generation outputs.</p>
        </div>
        <button
          onClick={handleSyncData}
          disabled={loading || generationsLoading}
          className="btn-secondary flex items-center gap-2 py-2.5 px-4 text-sm font-medium hover:text-white hover:border-white/20"
        >
          <RefreshCw className={`w-4 h-4 ${(loading || generationsLoading) ? 'animate-spin' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center text-gray-400 gap-3 py-6">
          <Loader2 className="animate-spin" size={20} /> Loading statistics...
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {statsCards.map((stat, idx) => (
            <motion.div 
              key={idx} 
              variants={{
                hidden: { y: 15, opacity: 0 },
                show: { y: 0, opacity: 1 }
              }}
              className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className={`absolute -right-12 -bottom-12 w-32 h-32 rounded-full ${stat.bgGlow} blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${stat.color} group-hover:bg-white/10 group-hover:border-white/10 transition-colors`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 relative z-10 font-mono tracking-tight">{stat.value}</h3>
              <p className="text-gray-400 font-semibold text-sm relative z-10">{stat.label}</p>
              <p className="text-gray-500 text-xs mt-1.5 relative z-10 font-medium">{stat.subtext}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Tab Selector */}
      <div className="flex border-b border-white/5 space-x-6 pb-2">
        <button
          onClick={() => handleTabChange('users')}
          className={`pb-3 font-semibold text-sm transition-all duration-300 relative ${
            activeTab === 'users' ? 'text-primary' : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>Users Registry</span>
          {activeTab === 'users' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => handleTabChange('generations')}
          className={`pb-3 font-semibold text-sm transition-all duration-300 relative ${
            activeTab === 'generations' ? 'text-primary' : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>System Generations Log</span>
          {activeTab === 'generations' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Main Panel Controls & Table */}
      <AnimatePresence mode="wait">
        {activeTab === 'users' ? (
          <motion.div
            key="users-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Table Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white/2 p-4 rounded-xl border border-white/5">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center flex-1">
                {/* Search Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    className="input-field pl-10 bg-surface focus:border-primary/50"
                    placeholder="Search user by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Role Filter */}
                <div className="relative min-w-[150px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Filter size={16} />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="input-field pl-9 bg-surface appearance-none pr-8 cursor-pointer text-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins Only</option>
                    <option value="user">Users Only</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Rows Limit selection */}
              <div className="flex items-center gap-2 self-end lg:self-auto text-sm text-gray-400">
                <span>Rows per page:</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer pr-7 appearance-none text-xs sm:text-sm"
                  >
                    <option value={5} className="bg-surface">5</option>
                    <option value={10} className="bg-surface">10</option>
                    <option value={25} className="bg-surface">25</option>
                    <option value={50} className="bg-surface">50</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500">
                    <ChevronDown size={12} />
                  </div>
                </div>
              </div>
            </div>

            {/* User Table Card */}
            <div className="glass-panel overflow-hidden border border-white/5 shadow-xl">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                  <Loader2 className="animate-spin mr-3" size={24} />
                  Synchronizing user database...
                </div>
              ) : paginatedUsers.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-lg font-medium">No accounts matched your criteria.</p>
                  <p className="text-sm mt-1">Try resetting search parameters or filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <SortHeader label="User Name / Email" sortKey="name" />
                        <SortHeader label="Registration Date" sortKey="created_at" alignClass="hidden md:table-cell" />
                        <SortHeader label="Chars Used" sortKey="characters_used" alignClass="text-center" />
                        <SortHeader label="Voices" sortKey="voices_generated" alignClass="text-center" />
                        <SortHeader label="Access Role" sortKey="is_admin" alignClass="text-center" />
                        <th className="p-4 font-medium text-gray-400 text-xs uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedUsers.map((item) => (
                        <tr 
                          key={item.id} 
                          onClick={() => setSelectedUser(item)}
                          className="hover:bg-white/5 transition-colors group cursor-pointer"
                        >
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-white font-medium group-hover:text-primary transition-colors">
                                <HighlightText text={item.name} search={search} />
                              </span>
                              <span className="text-gray-500 text-sm">
                                <HighlightText text={item.email} search={search} />
                              </span>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <div className="flex items-center text-gray-400 text-sm space-x-2">
                              <Calendar size={14} className="text-gray-500" />
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-white font-mono text-sm font-semibold">
                              {item.characters_used.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-white font-mono text-sm font-semibold">
                              {item.voices_generated}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              {item.is_admin ? (
                                <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                  <Shield size={12} />
                                  <span>Admin</span>
                                </span>
                              ) : (
                                <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-gray-400 border border-white/5">
                                  <span>User</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleToggleAdmin(item.id, item.is_admin)}
                                disabled={actionLoadingId !== null}
                                className={`p-2 rounded-lg transition-colors border border-transparent ${
                                  item.is_admin 
                                    ? 'text-orange-400 hover:bg-orange-400/10 hover:border-orange-400/20' 
                                    : 'text-primary hover:bg-primary/10 hover:border-primary/20'
                                }`}
                                title={item.is_admin ? 'Demote User (Revoke Admin)' : 'Promote User to Admin'}
                              >
                                {actionLoadingId === item.id ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : item.is_admin ? (
                                  <Unlock size={18} />
                                ) : (
                                  <Lock size={18} />
                                )}
                              </button>
                              
                              <button
                                onClick={() => setAdjustModal({ isOpen: true, user: item, isLoading: false })}
                                disabled={actionLoadingId !== null}
                                className="p-2 text-indigo-400 hover:bg-indigo-400/10 hover:border-indigo-400/20 rounded-lg transition-colors border border-transparent"
                                title="Adjust Usage Stats / Credits"
                              >
                                <Sliders size={18} />
                              </button>

                              <button
                                onClick={() => handleDeleteUser(item.id, item.email)}
                                disabled={actionLoadingId !== null}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 rounded-lg transition-colors border border-transparent"
                                title="Delete User Account"
                              >
                                {actionLoadingId === item.id ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Footer */}
              {!loading && totalItems > 0 && (
                <div className="bg-white/2 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5 text-sm text-gray-400">
                  <div>
                    Showing{' '}
                    <span className="text-white font-medium">
                      {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                    </span>{' '}
                    to{' '}
                    <span className="text-white font-medium">
                      {Math.min(currentPage * pageSize, totalItems)}
                    </span>{' '}
                    of <span className="text-white font-medium">{totalItems}</span> entries
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white/5 border border-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/25 border-transparent'
                            : 'bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white/5 border border-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="generations-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Generations Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white/2 p-4 rounded-xl border border-white/5">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center flex-1">
                {/* Search Generations */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    className="input-field pl-10 bg-surface focus:border-primary/50"
                    placeholder="Search generations by user name, email, title, or prompt..."
                    value={generationsSearch}
                    onChange={(e) => setGenerationsSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Rows Limit selection */}
              <div className="flex items-center gap-2 self-end lg:self-auto text-sm text-gray-400">
                <span>Rows per page:</span>
                <div className="relative">
                  <select
                    value={generationsPageSize}
                    onChange={(e) => {
                      setGenerationsPageSize(Number(e.target.value));
                      setGenerationsPage(1);
                    }}
                    className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer pr-7 appearance-none text-xs sm:text-sm"
                  >
                    <option value={5} className="bg-surface">5</option>
                    <option value={10} className="bg-surface">10</option>
                    <option value={25} className="bg-surface">25</option>
                    <option value={50} className="bg-surface">50</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500">
                    <ChevronDown size={12} />
                  </div>
                </div>
              </div>
            </div>

            {/* Generations Table Card */}
            <div className="glass-panel overflow-hidden border border-white/5 shadow-xl">
              {generationsLoading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                  <Loader2 className="animate-spin mr-3" size={24} />
                  Loading generation history log...
                </div>
              ) : generations.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-lg font-medium">No generation logs found.</p>
                  <p className="text-sm mt-1">Make sure standard users have generated speech.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th className="p-4 font-medium text-gray-400 text-xs uppercase tracking-wider">User</th>
                        <th className="p-4 font-medium text-gray-400 text-xs uppercase tracking-wider">Audio Details</th>
                        <th className="p-4 font-medium text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">TTS Config</th>
                        <th className="p-4 font-medium text-gray-400 text-xs uppercase tracking-wider text-center">Chars / Duration</th>
                        <th className="p-4 font-medium text-gray-400 text-xs uppercase tracking-wider text-center">Preview</th>
                        <th className="p-4 font-medium text-gray-400 text-xs uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {generations.map((item) => (
                        <tr 
                          key={item.id} 
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="p-4 align-top">
                            <div className="flex flex-col">
                              <span className="text-white font-medium">
                                {item.user.name}
                              </span>
                              <span className="text-gray-500 text-sm">
                                {item.user.email}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex flex-col max-w-xs sm:max-w-md">
                              <span className="text-white font-semibold text-sm">
                                {item.title}
                              </span>
                              <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all duration-300 cursor-pointer">
                                {item.text}
                              </p>
                              <span className="text-gray-600 font-mono text-[10px] mt-1.5">
                                Generated: {new Date(item.created_at).toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-top hidden md:table-cell text-sm text-gray-400">
                            <div className="space-y-1">
                              <div><span className="text-gray-600">Voice:</span> {item.voice}</div>
                              <div><span className="text-gray-600">Lang:</span> {item.language}</div>
                              <div><span className="text-gray-600">Speed:</span> {item.speed}x</div>
                            </div>
                          </td>
                          <td className="p-4 align-top text-center text-sm font-mono text-white">
                            <div className="flex flex-col items-center justify-center">
                              <span>{item.char_count.toLocaleString()} chars</span>
                              <span className="text-gray-500 text-xs mt-0.5">{item.duration.toFixed(1)}s</span>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex justify-center">
                              <button
                                onClick={() => playAudio(item.audio_url, item.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border ${
                                  playingAudioId === item.id 
                                    ? 'bg-primary/25 text-primary border-primary/40 shadow-lg shadow-primary/10' 
                                    : 'bg-white/5 text-gray-400 hover:text-white border-white/5 hover:border-white/10 hover:bg-white/10'
                                }`}
                                title={playingAudioId === item.id ? 'Pause Audio' : 'Play Audio'}
                              >
                                {playingAudioId === item.id ? <Pause size={14} /> : <Play size={14} />}
                              </button>
                            </div>
                          </td>
                          <td className="p-4 align-top text-right">
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleDeleteGeneration(item.id, item.user.email)}
                                disabled={actionLoadingId !== null}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 rounded-lg transition-colors border border-transparent"
                                title="Delete Generation Record"
                              >
                                {actionLoadingId === item.id ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Generations Pagination Footer */}
              {!generationsLoading && generationsTotal > 0 && (
                <div className="bg-white/2 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5 text-sm text-gray-400">
                  <div>
                    Showing{' '}
                    <span className="text-white font-medium">
                      {generationsTotal === 0 ? 0 : (generationsPage - 1) * generationsPageSize + 1}
                    </span>{' '}
                    to{' '}
                    <span className="text-white font-medium">
                      {Math.min(generationsPage * generationsPageSize, generationsTotal)}
                    </span>{' '}
                    of <span className="text-white font-medium">{generationsTotal}</span> entries
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGenerationsPage(prev => Math.max(1, prev - 1))}
                      disabled={generationsPage === 1}
                      className="p-2 rounded-lg bg-white/5 border border-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: generationsTotalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setGenerationsPage(page)}
                        className={`w-8 h-8 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                          generationsPage === page
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/25 border-transparent'
                            : 'bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setGenerationsPage(prev => Math.min(generationsTotalPages, prev + 1))}
                      disabled={generationsPage === generationsTotalPages}
                      className="p-2 rounded-lg bg-white/5 border border-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsible Session Audit Logs */}
      <div className="glass-panel p-4 overflow-hidden border border-white/5">
        <details className="group cursor-pointer">
          <summary className="list-none flex items-center justify-between text-gray-400 hover:text-white transition-colors select-none">
            <div className="flex items-center gap-2.5">
              <Activity size={18} className="text-secondary animate-pulse" />
              <span className="font-semibold text-white text-sm">Session Audit Logs ({actionLogs.length})</span>
            </div>
            <div className="text-xs text-primary font-bold group-open:rotate-180 transition-transform duration-300">
              ▼
            </div>
          </summary>
          <div className="mt-4 border-t border-white/5 pt-4">
            {actionLogs.length === 0 ? (
              <p className="text-gray-500 text-xs italic">No actions recorded in this session yet.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-2 font-mono text-xs text-gray-400 scrollbar-thin">
                {actionLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 py-0.5 hover:bg-white/2 rounded px-1">
                    <span className="text-gray-500">{log.timestamp}</span>
                    <span className={
                      log.type === 'success' ? 'text-green-400 font-semibold' :
                      log.type === 'danger' ? 'text-red-400 font-semibold' :
                      log.type === 'warning' ? 'text-orange-400 font-semibold' : 'text-blue-400'
                    }>
                      [{log.type.toUpperCase()}]
                    </span>
                    <span className="text-gray-300">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', confirmLabel: '', confirmVariant: 'primary', onConfirm: null, isLoading: false })}
        isLoading={confirmModal.isLoading}
      />

      {/* Adjust Usage Modal */}
      <AdjustUsageModal
        isOpen={adjustModal.isOpen}
        user={adjustModal.user}
        onSave={handleAdjustUsageSave}
        onCancel={() => setAdjustModal({ isOpen: false, user: null, isLoading: false })}
        isLoading={adjustModal.isLoading}
      />

      {/* User details slide over drawer */}
      <UserDetailsDrawer
        user={selectedUser}
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        onToggleAdmin={handleToggleAdmin}
        onDeleteUser={handleDeleteUser}
        onOpenAdjustModal={(u) => setAdjustModal({ isOpen: true, user: u, isLoading: false })}
        actionLoadingId={actionLoadingId}
      />
    </div>
  );
}
