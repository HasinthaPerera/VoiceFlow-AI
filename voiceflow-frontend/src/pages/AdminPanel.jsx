import { useState, useEffect } from 'react';
import { adminApi } from '../api';
import toast from 'react-hot-toast';
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
  Unlock 
} from 'lucide-react';

export default function AdminPanel() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_characters_used: 0,
    total_voices_generated: 0
  });
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers()
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      toast.error('Failed to load admin data. Is the backend running with admin privileges?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleAdmin = async (userId, currentStatus) => {
    const actionText = currentStatus ? 'revoke admin status for' : 'grant admin status to';
    if (!confirm(`Are you sure you want to ${actionText} this user?`)) return;
    
    setActionLoadingId(userId);
    try {
      const res = await adminApi.toggleAdmin(userId);
      toast.success(res.message || 'Updated user role.');
      
      // Update local user state
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, is_admin: !currentStatus } : u)
      );
      
      // Reload stats
      const statsData = await adminApi.getStats();
      setStats(statsData);
    } catch (err) {
      toast.error(err.message || 'Failed to update user role.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`WARNING: Are you sure you want to delete user ${userEmail}? This will delete their account, TTS generation history, and all stored audio files. This action CANNOT be undone.`)) return;
    
    setActionLoadingId(userId);
    try {
      const res = await adminApi.deleteUser(userId);
      toast.success(res.message || 'User deleted successfully.');
      
      // Remove from local state
      setUsers(prev => prev.filter(u => u.id !== userId));
      
      // Reload stats
      const statsData = await adminApi.getStats();
      setStats(statsData);
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const statsCards = [
    { label: 'Total Users', value: stats.total_users.toLocaleString(), icon: Users, color: 'text-blue-500' },
    { label: 'Total Characters Used', value: stats.total_characters_used.toLocaleString(), icon: TrendingUp, color: 'text-green-500' },
    { label: 'Total Voices Generated', value: stats.total_voices_generated.toLocaleString(), icon: Mic2, color: 'text-primary' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-gray-400">Monitor system activity, manage users, and update privileges.</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center text-gray-400 gap-3">
          <Loader2 className="animate-spin" size={20} /> Loading statistics...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((stat, idx) => (
            <div key={idx} className="glass-panel p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search and User Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-white">Registered Users</h2>

          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              className="input-field pl-10 bg-surface"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="glass-panel overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin mr-3" size={24} />
              Loading users list...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">No users found.</p>
              <p className="text-sm mt-1">Try resetting your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-sm border-b border-white/5">
                    <th className="p-4 font-medium">Name / Email</th>
                    <th className="p-4 font-medium hidden md:table-cell">Created Date</th>
                    <th className="p-4 font-medium text-center">Characters</th>
                    <th className="p-4 font-medium text-center">Voices</th>
                    <th className="p-4 font-medium text-center">Role</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{item.name}</span>
                          <span className="text-gray-500 text-sm">{item.email}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center text-gray-400 text-sm space-x-2">
                          <Calendar size={14} className="text-gray-500" />
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-white font-mono text-sm">
                          {item.characters_used.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-white font-mono text-sm">
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
                      <td className="p-4">
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
        </div>
      </div>
    </div>
  );
}
