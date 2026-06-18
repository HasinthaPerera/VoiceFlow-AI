import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Mic2, LogOut, LayoutDashboard, Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getUser } from '../api';
import Logo from '../components/Logo';

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
            <Link to="/" className="flex items-center space-x-3 group">
              <Logo size="md" className="group-hover:scale-105 transition-transform duration-300" />
              <span className="font-black text-xl tracking-tight text-white transition-all duration-500 font-sans">
                VoiceFlow<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary ml-1">AI</span>
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

      <footer className="border-t border-white/5 pt-16 pb-8 mt-auto bg-surface/20 backdrop-blur-md relative overflow-hidden">
        {/* Decorative background glow for footer */}
        <div className="absolute bottom-0 left-[20%] w-[25rem] h-[25rem] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
            {/* Column 1: Brand & Status */}
            <div className="md:col-span-4 space-y-4 text-left">
              <Link to="/" className="flex items-center space-x-3 group">
                <Logo size="sm" />
                <span className="font-extrabold text-lg text-white">
                  VoiceFlow<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary ml-0.5">AI</span>
                </span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                Transform any text content into hyper-realistic, natural voice tracks in seconds. Engineered for modern developers and content creators.
              </p>
              {/* System status pulse badge */}
              <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-gray-400 font-medium font-mono">All Systems Operational</span>
              </div>
            </div>

            {/* Column 2: Product Link Grid */}
            <div className="md:col-span-2 space-y-4 text-left md:pl-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest text-gray-400">Product</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#playground" className="text-gray-400 hover:text-white transition-colors">Playground</a></li>
                <li><a href="#voices" className="text-gray-400 hover:text-white transition-colors">Voice Library</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing Plans</a></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Free Signup</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="md:col-span-2 space-y-4 text-left">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest text-gray-400">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                <li><span className="text-gray-500 cursor-not-allowed">API Docs</span></li>
                <li><span className="text-gray-500 cursor-not-allowed">Help Center</span></li>
                <li><span className="text-gray-500 cursor-not-allowed">Guides</span></li>
                <li><span className="text-gray-500 cursor-not-allowed">Privacy Policy</span></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="md:col-span-4 space-y-4 text-left">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest text-gray-400">Join our Newsletter</h4>
              <p className="text-sm text-gray-400">
                Get the latest feature updates and voice cloning models directly in your inbox.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed successfully!'); }} className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  required
                  className="bg-black/45 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary w-full"
                />
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shrink-0">
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Footer Section */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} VoiceFlow AI. All rights reserved. Built with Next-Gen Audio Synthesis.
            </span>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
