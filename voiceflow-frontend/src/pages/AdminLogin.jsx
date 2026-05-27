import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldAlert, ShieldCheck, Mic2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi, setToken, setUser } from '../api';
import loginBanner from '../assets/login_banner.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (email.trim().toLowerCase() !== 'hasintha@gmail.com') {
      toast.error('Access denied. Only hasintha@gmail.com can access the Admin Portal.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.login(email, password);
      
      // Verify email and admin privilege
      if (data.user.email.toLowerCase() !== 'hasintha@gmail.com' || !data.user.is_admin) {
        toast.error('Access denied. Administrator role required.');
        setIsLoading(false);
        return;
      }

      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('voiceflow_admin_session', 'true');
      window.dispatchEvent(new Event('user_updated'));
      
      toast.success('Admin authentication successful! Welcome to the Admin Panel.');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-tr from-background via-[#1a1236] to-[#0d091a] relative overflow-hidden">
      {/* Glow Effects in Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl min-h-[600px] rounded-3xl overflow-hidden glass-panel border border-white/10 flex shadow-2xl shadow-black/60 relative"
      >
        {/* Left Column - Form */}
        <div className="w-full md:w-5/12 flex flex-col justify-between p-8 sm:p-10 bg-surface/90 backdrop-blur-md">
          {/* Logo Header */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <ShieldCheck size={16} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">VoiceFlow AI <span className="text-primary text-xs font-semibold px-1.5 py-0.5 rounded bg-primary/10 ml-1 border border-primary/20">Admin</span></span>
          </div>

          {/* Form Content */}
          <div className="my-auto py-8">
            {/* Circle Shield Icon */}
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-black/25">
              <ShieldAlert size={32} className="text-primary animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-6">Administrator Portal</h2>

            <form onSubmit={handleAdminLogin} className="space-y-5 max-w-sm mx-auto">
              <div className="space-y-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 text-sm"
                  placeholder="Admin Email (hasintha@gmail.com)"
                />
              </div>

              <div className="space-y-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 text-sm"
                  placeholder="Password"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-700 text-white rounded-full font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/10 flex items-center justify-center text-sm tracking-wide mt-6"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Log In as Admin</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-center text-xs text-gray-400 max-w-sm w-full mx-auto border-t border-white/5 pt-4">
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
              Return to Standard Login
            </Link>
          </div>
        </div>

        {/* Right Column - Hero Banner */}
        <div 
          className="hidden md:block w-7/12 relative overflow-hidden bg-cover bg-center select-none"
          style={{ backgroundImage: `url(${loginBanner})` }}
        >
          {/* Overlay gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 z-10" />

          {/* Banner Navbar */}
          <div className="absolute top-0 left-0 right-0 p-8 flex justify-end items-center space-x-8 z-20 text-xs font-semibold tracking-wider text-gray-300">
            <Link to="/" className="hover:text-white transition-colors">HOME</Link>
            <Link to="/login" className="text-white hover:text-white/80 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">STANDARD LOGIN</Link>
          </div>

          {/* Bold Heading Text */}
          <div className="absolute bottom-12 left-12 z-20 max-w-md">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md"
            >
              Control <br /> Panel.
            </motion.h2>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
