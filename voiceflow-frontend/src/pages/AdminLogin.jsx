import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldAlert, ShieldCheck, Mic2, Eye, EyeOff, Cpu, Server, Activity, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi, setToken, setUser } from '../api';
import loginBanner from '../assets/login_banner.png';
import Logo from '../components/Logo';
import InteractiveParticleBackground from '../components/InteractiveParticleBackground';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // SEO Page Title
  useEffect(() => {
    document.title = "Admin Portal - VoiceFlow AI";
  }, []);

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

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-tr from-background via-[#1a1236] to-[#0d091a] relative overflow-hidden bg-grid-pattern">
      {/* Interactive Particle Network for Admin Workspace background */}
      <InteractiveParticleBackground />

      {/* Glow Effects in Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/15 blur-[120px] rounded-full pointer-events-none -z-10 animate-float"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none -z-10 animate-float-delayed"></div>

      <motion.div 
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-5xl min-h-[620px] rounded-3xl overflow-hidden glass-panel border border-white/10 flex shadow-2xl shadow-black/80 relative"
      >
        {/* Left Column - Form */}
        <div className="w-full md:w-5/12 flex flex-col justify-between p-8 sm:p-10 bg-surface/90 backdrop-blur-md z-10 border-r border-white/5">
          {/* Logo Header */}
          <div className="flex items-center space-x-2.5">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <Logo size="sm" className="group-hover:scale-105 transition-transform duration-300" />
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-primary transition-colors font-sans">
                VoiceFlow<span className="text-primary ml-0.5">AI</span>
                <span className="text-primary text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 ml-1.5 border border-primary/20 align-middle">Admin</span>
              </span>
            </Link>
          </div>

          {/* Form Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="my-auto py-6"
          >
            {/* Header Title */}
            <motion.div variants={itemVariants} className="flex flex-col items-center mb-7 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/10 to-indigo-500/10 border border-white/10 flex items-center justify-center mb-4 shadow-xl shadow-black/35 relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <ShieldAlert size={26} className="text-primary group-hover:scale-110 transition-transform duration-300 animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Admin Portal</h1>
              <p className="text-xs text-gray-400 mt-1 max-w-[280px]">Enter administrative credentials to access the controller.</p>
            </motion.div>

            <form onSubmit={handleAdminLogin} className="space-y-4.5 max-w-sm mx-auto">
              <motion.div variants={itemVariants} className="space-y-1">
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 group-focus-within:text-primary transition-colors duration-300">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    id="admin-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10 input-glow"
                    placeholder="Admin Email (hasintha@gmail.com)"
                  />
                  {email && (
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (
                      <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                    ) : (
                      <AlertCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400" />
                    )
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 group-focus-within:text-primary transition-colors duration-300">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    id="admin-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10 input-glow"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-white transition-colors duration-300"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  id="admin-login-submit-btn"
                  className="w-full py-3.5 btn-premium text-white rounded-full font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/10 hover:shadow-purple-500/30 scale-100 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center text-sm tracking-wide mt-6"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span>Log In as Admin</span>
                  )}
                </button>
              </motion.div>
            </form>
          </motion.div>

          {/* Footer controls */}
          <div className="flex items-center justify-center text-xs text-gray-400 max-w-sm w-full mx-auto border-t border-white/5 pt-4">
            <Link to="/login" className="text-gray-500 hover:text-white transition-colors duration-300 flex items-center gap-1">
              <span>Return to Standard Login</span>
            </Link>
          </div>
        </div>

        {/* Right Column - Hero Banner & System Mock Dashboard */}
        <div 
          className="hidden md:block w-7/12 relative overflow-hidden bg-cover bg-center select-none"
          style={{ backgroundImage: `url(${loginBanner})` }}
        >
          {/* Overlay gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-[#0d091a]/40 to-black/60 z-10" />

          {/* Banner Navbar */}
          <div className="absolute top-8 left-0 right-0 px-8 flex justify-between items-center z-20">
            {/* Status */}
            <div className="flex items-center space-x-2 bg-black/55 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[10px] font-bold tracking-wider text-gray-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>SECURE ADMIN SESSION</span>
            </div>

            {/* Nav */}
            <div className="flex items-center space-x-6 text-[11px] font-bold tracking-wider text-gray-300">
              <Link to="/" className="hover:text-white transition-colors duration-300 uppercase">Home</Link>
              <Link to="/login" className="text-white hover:text-white/80 transition-colors duration-300 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/10 uppercase">Standard Login</Link>
            </div>
          </div>

          {/* Floating GPU Node Monitor Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.6, type: 'spring', stiffness: 80 }}
            className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 glass-panel p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl z-20 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3.5">
              <div className="flex items-center space-x-2">
                <Server size={12} className="text-primary animate-pulse" />
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">Node Status Monitor</span>
              </div>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase">OK</span>
            </div>

            {/* GPU stats list */}
            <div className="space-y-2 mb-4 font-mono text-[10px]">
              <div className="flex justify-between items-center text-gray-400">
                <span className="flex items-center gap-1.5"><Cpu size={10} className="text-primary" /> NVIDIA A100-80G #1</span>
                <span className="text-white font-bold">94% LOAD</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-indigo-500 w-[94%]"></div>
              </div>

              <div className="flex justify-between items-center text-gray-400 pt-1">
                <span className="flex items-center gap-1.5"><Cpu size={10} className="text-primary" /> NVIDIA A100-80G #2</span>
                <span className="text-white font-bold">81% LOAD</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-indigo-500 w-[81%]"></div>
              </div>

              <div className="flex justify-between items-center text-gray-400 pt-1">
                <span className="flex items-center gap-1.5"><Activity size={10} className="text-indigo-400" /> Active Queue Jobs</span>
                <span className="text-white font-bold">0 PENDING</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono pt-3 border-t border-white/5">
              <span>Uptime: 99.98%</span>
              <span>Temp: 64°C</span>
            </div>
          </motion.div>

          {/* Bold Heading Text */}
          <div className="absolute bottom-12 left-12 z-20 max-w-md">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl font-black text-white leading-none tracking-tight drop-shadow-lg"
            >
              Control <br /> Panel.
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-xs text-gray-400 mt-2 font-medium tracking-wide"
            >
              Manage cluster routing and system models.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

