import { User, Mail, Bell, Key, CreditCard } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account preferences and profile details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20 transition-colors">
            <User size={18} />
            <span className="font-medium">Profile</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
            <CreditCard size={18} />
            <span className="font-medium">Billing</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
            <Bell size={18} />
            <span className="font-medium">Notifications</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
            <Key size={18} />
            <span className="font-medium">API Keys</span>
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
            
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                U
              </div>
              <div>
                <button className="btn-secondary text-sm">Change Avatar</button>
                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">First Name</label>
                  <input type="text" className="input-field" defaultValue="User" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Last Name</label>
                  <input type="text" className="input-field" defaultValue="Name" />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Mail size={18} />
                  </div>
                  <input type="email" className="input-field pl-10 text-gray-400 cursor-not-allowed" defaultValue="user@example.com" disabled />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>

          <div className="glass-panel p-6 border-red-500/20">
            <h2 className="text-xl font-semibold text-red-500 mb-2">Danger Zone</h2>
            <p className="text-gray-400 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors duration-300 font-medium border border-red-500/20">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
