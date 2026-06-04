import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Mic2, LogOut, LayoutDashboard, Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getUser } from '../api';

export default function MainLayout() {
  const [user, setUser] = useState(getUser());
  const [isAdminSession, setIsAdminSession] = useState(localStorage.getItem('voiceflow_admin_session') === 'true');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(getUser());
      setIsAdminSession(localStorage.getItem('voiceflow_admin_session') === 'true');
    };
    window.addEventListener('user_updated', handleUserUpdate);
    return () => window.removeEventListener('user_updated', handleUserUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('voiceflow_token');
    localStorage.removeItem('voiceflow_user');
    localStorage.removeItem('voiceflow_admin_session');
    window.dispatchEvent(new Event('user_updated'));
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full"></div>
      </div>

      <nav className="border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
                <Mic2 size={20} className="animate-pulse" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                VoiceFlow AI
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link 
                    to="/dashboard/generate" 
                    className="flex items-center space-x-1.5 text-gray-300 hover:text-white transition-colors font-medium text-sm"
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                  {isAdminSession && (
                    <Link 
                      to="/admin" 
                      className="flex items-center space-x-1.5 text-primary hover:text-primary/80 transition-colors font-semibold text-sm"
                    >
                      <Shield size={16} />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors duration-300 font-medium text-xs sm:text-sm"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/admin/login" className="text-primary hover:text-primary/80 transition-colors font-semibold text-sm mr-2">
                    Admin Portal
                  </Link>
                  <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-medium text-sm">
                    Log in
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3 flex flex-col">
                {user ? (
                  <>
                    <Link 
                      to="/dashboard/generate" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 py-2 text-gray-300 hover:text-white transition-colors font-medium text-base"
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </Link>
                    {isAdminSession && (
                      <Link 
                        to="/admin" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-2 py-2 text-primary hover:text-primary/80 transition-colors font-semibold text-base"
                      >
                        <Shield size={18} />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center justify-center space-x-2 w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors duration-300 font-medium text-sm"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/admin/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="text-primary hover:text-primary/80 transition-colors font-semibold text-base py-2"
                    >
                      Admin Portal
                    </Link>
                    <Link 
                      to="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="text-gray-300 hover:text-white transition-colors font-medium text-base py-2"
                    >
                      Log in
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setIsMenuOpen(false)}
                      className="btn-primary text-base py-2.5 text-center mt-2"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-8 mt-auto bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} VoiceFlow AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
