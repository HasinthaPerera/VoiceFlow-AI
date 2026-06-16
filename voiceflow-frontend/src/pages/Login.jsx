import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Mic2, Eye, EyeOff, Sparkles, Volume2, ArrowRight, Mic, UserPlus, User } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi, setToken, setUser } from '../api';
import loginBanner from '../assets/login_banner.png';

export default function Login({ initialMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode state: true for Sign In (Login), false for Sign Up (Register)
  const [isLogin, setIsLogin] = useState(true);

  // Synchronize state with route or initial prop
  useEffect(() => {
    const isRegister = location.pathname === '/register' || initialMode === 'register';
    setIsLogin(!isRegister);
  }, [location.pathname, initialMode]);

  const toggleMode = () => {
    if (isLogin) {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegLoading, setIsRegLoading] = useState(false);

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Voice Assistant Speech Recognition
  const startVoiceAssistant = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Voice assistant active. Say 'forgot password'...", { id: 'voice-active', duration: 4000 });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Voice assistant transcript:', transcript);
      
      if (
        transcript.includes('forgot password') || 
        transcript.includes('lost password') || 
        transcript.includes('reset password') || 
        transcript.includes('forgot my password')
      ) {
        toast.success('Voice command recognized: "Forgot password"', { icon: '🎙️' });
        setForgotEmail(email || regEmail);
        setForgotStep(1);
        setShowForgotModal(true);
        
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance("Opening password recovery helper.");
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } else {
        toast.error(`Command not recognized: "${transcript}". Try saying "forgot password".`);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        toast.error("Microphone permission denied. Please enable microphone access in your browser.");
      } else {
        toast.error("Speech recognition error. Please try again.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsSendingForgot(true);
    try {
      const res = await authApi.forgotPassword(forgotEmail);
      toast.success(res.detail, { duration: 6000 });
      if (res.demo_code) {
        toast(`Demo reset code: ${res.demo_code}`, {
          icon: '🔑',
          duration: 10000,
          style: {
            background: '#13131a',
            color: '#fff',
            border: '1px solid #a855f7'
          }
        });
        setResetCode(res.demo_code);
      }
      setForgotStep(2);
    } catch (err) {
      toast.error(err.message || "Failed to initiate password reset.");
    } finally {
      setIsSendingForgot(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !resetCode || !newPassword) return;
    setIsSendingForgot(true);
    try {
      await authApi.resetPassword(forgotEmail, resetCode, newPassword);
      toast.success("Password reset successfully! You can now log in.");
      setShowForgotModal(false);
      setPassword(newPassword);
      setEmail(forgotEmail);
      setForgotEmail('');
      setResetCode('');
      setNewPassword('');
      setForgotStep(1);
    } catch (err) {
      toast.error(err.message || "Failed to reset password. Check your code.");
    } finally {
      setIsSendingForgot(false);
    }
  };

  // SEO Page Title updates dynamically
  useEffect(() => {
    document.title = isLogin ? "Log In - VoiceFlow AI" : "Register - VoiceFlow AI";
  }, [isLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoginLoading(true);
    try {
      const data = await authApi.login(email, password);
      setToken(data.access_token);
      setUser(data.user);
      toast.success('Welcome back!');
      navigate('/dashboard/generate');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegLoading(true);
    try {
      const data = await authApi.register(regName, regEmail, regPassword);
      setToken(data.access_token);
      setUser(data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard/generate');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsRegLoading(false);
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
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-tr from-background via-[#120e26] to-[#0a0a0f] relative overflow-hidden bg-grid-pattern">
      {/* Glow Effects in Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/15 blur-[120px] rounded-full pointer-events-none -z-10 animate-float"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/15 blur-[120px] rounded-full pointer-events-none -z-10 animate-float-delayed"></div>

      <motion.div 
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-5xl min-h-[640px] rounded-3xl overflow-hidden glass-panel border border-white/10 flex shadow-2xl shadow-black/80 relative"
      >
        {/* Sliding Welcome / Banner Panel (Desktop Only) */}
        <div 
          className={`hidden md:flex absolute top-0 bottom-0 left-0 w-1/2 z-20 transition-transform duration-700 ease-in-out overflow-hidden select-none bg-cover bg-center ${
            isLogin ? 'translate-x-full border-l border-white/5' : 'translate-x-0 border-r border-white/5'
          }`}
          style={{ backgroundImage: `url(${loginBanner})` }}
        >
          {/* Overlay gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-[#0a0a0f]/40 to-black/60 z-10" />

          {/* GPU Node Status Badge */}
          <div className="absolute top-8 left-8 z-20 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[10px] font-bold tracking-wider text-gray-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-md shadow-green-500/50"></span>
            <span>GPU_CLUSTER_ACTIVE</span>
          </div>

          {/* Navigation Links inside Banner */}
          <div className="absolute top-8 right-8 flex items-center space-x-6 z-20 text-[11px] font-bold tracking-wider text-gray-300">
            <Link to="/" className="hover:text-white transition-colors duration-300 uppercase">Home</Link>
          </div>

          {/* Floating Showcase Mockup Card */}
          <div className="absolute inset-0 flex flex-col justify-between p-10 z-20 text-white">
            <div className="my-auto flex flex-col items-center justify-center pt-10">
              <motion.div
                key={isLogin ? 'login-card' : 'register-card'}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="w-80 glass-panel p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl mb-7"
              >
                {isLogin ? (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3.5">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={12} className="text-secondary animate-pulse" />
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">Neural Engine v2.0</span>
                      </div>
                      <span className="text-[9px] bg-secondary/20 text-secondary border border-secondary/30 px-1.5 py-0.5 rounded-full font-bold uppercase">PRO</span>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-secondary to-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
                        <Volume2 size={16} className="animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">Arthur (UK Narrator)</h4>
                        <p className="text-[9px] text-gray-400 font-mono">Sample: audiobook_narrator.wav</p>
                      </div>
                    </div>

                    {/* Soundwave bars */}
                    <div className="flex items-end justify-between h-9 gap-1.5 bg-black/25 rounded-xl p-3 border border-white/5">
                      <div className="w-1 bg-primary/75 rounded-full animate-wave-bar wave-height-1" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 bg-secondary/80 rounded-full animate-wave-bar wave-height-4" style={{ animationDelay: '0.3s' }}></div>
                      <div className="w-1 bg-pink-500/85 rounded-full animate-wave-bar wave-height-2" style={{ animationDelay: '0.5s' }}></div>
                      <div className="w-1 bg-secondary/80 rounded-full animate-wave-bar wave-height-5" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 bg-primary/75 rounded-full animate-wave-bar wave-height-3" style={{ animationDelay: '0.4s' }}></div>
                      <div className="w-1 bg-pink-500/85 rounded-full animate-wave-bar wave-height-6" style={{ animationDelay: '0.6s' }}></div>
                      <div className="w-1 bg-secondary/80 rounded-full animate-wave-bar wave-height-2" style={{ animationDelay: '0.1s' }}></div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono mt-3">
                      <span>Status: Synthesizing</span>
                      <span>4.8s</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3.5">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={12} className="text-primary animate-pulse" />
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">Clone Engine v1.5</span>
                      </div>
                      <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-bold uppercase">PREMIUM</span>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/25">
                        <Volume2 size={16} className="animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">Self-Clone Studio</h4>
                        <p className="text-[9px] text-gray-400 font-mono">Sample: voice_profile_02.wav</p>
                      </div>
                    </div>

                    {/* Soundwave bars */}
                    <div className="flex items-end justify-between h-9 gap-1.5 bg-black/25 rounded-xl p-3 border border-white/5">
                      <div className="w-1 bg-secondary/80 rounded-full animate-wave-bar wave-height-3" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 bg-primary/75 rounded-full animate-wave-bar wave-height-1" style={{ animationDelay: '0.4s' }}></div>
                      <div className="w-1 bg-pink-500/85 rounded-full animate-wave-bar wave-height-5" style={{ animationDelay: '0.6s' }}></div>
                      <div className="w-1 bg-secondary/80 rounded-full animate-wave-bar wave-height-2" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 bg-primary/75 rounded-full animate-wave-bar wave-height-4" style={{ animationDelay: '0.3s' }}></div>
                      <div className="w-1 bg-pink-500/85 rounded-full animate-wave-bar wave-height-3" style={{ animationDelay: '0.5s' }}></div>
                      <div className="w-1 bg-secondary/80 rounded-full animate-wave-bar wave-height-1" style={{ animationDelay: '0.2s' }}></div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono mt-3">
                      <span>Status: Voice Cloned</span>
                      <span>Ready</span>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Text toggle call */}
              <div className="text-center max-w-[320px] space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-white leading-tight">
                  {isLogin ? 'New Here?' : 'One of Us?'}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  {isLogin 
                    ? 'Sign up and configure advanced synthetic voices instantly.' 
                    : 'Log in to access your cloned profiles and generation histories.'
                  }
                </p>
                <button
                  onClick={toggleMode}
                  className="mt-4 px-8 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-black/20"
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider pt-4">
              <span>VoiceFlow AI v2.0</span>
              <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
            </div>
          </div>
        </div>

        {/* ─── LEFT FORM: Sign In (Login) ─────────────────────────────────── */}
        <div className={`w-full md:w-1/2 flex flex-col justify-between p-8 sm:p-10 bg-surface/90 backdrop-blur-md z-10 transition-all duration-700 ${
          !isLogin ? 'hidden md:flex opacity-0 -translate-x-12 pointer-events-none' : 'opacity-100 translate-x-0'
        }`}>
          {/* Logo Header */}
          <div className="flex items-center space-x-2.5">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#db2777] to-[#a855f7] flex items-center justify-center text-white shadow-md shadow-pink-500/25 group-hover:scale-105 transition-transform duration-300">
                <Mic2 size={16} />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-pink-400 transition-colors">VoiceFlow AI</span>
            </Link>
          </div>

          {/* Form Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isLogin ? "visible" : "hidden"}
            className="my-auto py-6"
          >
            {/* Header Title */}
            <motion.div variants={itemVariants} className="flex flex-col items-center mb-7 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/10 to-secondary/10 border border-white/10 flex items-center justify-center mb-4 shadow-xl shadow-black/35 relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary to-secondary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <Mic2 size={26} className="text-secondary group-hover:scale-110 transition-transform duration-300 animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Welcome Back</h1>
              <p className="text-xs text-gray-400 mt-1 max-w-[280px]">Enter your credentials to access your AI voice workspace.</p>
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto">
              <motion.div variants={itemVariants} className="space-y-1">
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 group-focus-within:text-secondary transition-colors duration-300">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    id="email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-6 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10"
                    placeholder="Email Address"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 group-focus-within:text-secondary transition-colors duration-300">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    id="password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10"
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

              <motion.div variants={itemVariants} className="flex items-center justify-between text-xs text-gray-400 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    id="remember-me"
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    className="rounded border-white/10 bg-white/5 text-secondary focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={startVoiceAssistant}
                    className={`relative p-1.5 rounded-full transition-all duration-300 ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50 scale-110' 
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                    title="Voice assistant: Click and say 'forgot password'"
                  >
                    <Mic size={12} className={isListening ? "animate-bounce" : ""} />
                    {isListening && (
                      <span className="absolute -inset-1 rounded-full border border-red-500/50 animate-ping pointer-events-none"></span>
                    )}
                  </button>
                  <span 
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotStep(1);
                      setShowForgotModal(true);
                    }}
                    className="hover:text-white cursor-pointer transition-colors duration-300"
                  >
                    Forgot password?
                  </span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button 
                  type="submit" 
                  disabled={isLoginLoading}
                  id="login-submit-btn"
                  className="w-full py-3.5 bg-gradient-to-r from-[#c084fc] to-[#db2777] hover:from-[#a855f7] hover:to-[#be185d] text-white rounded-full font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 active:scale-[0.98] flex items-center justify-center text-sm tracking-wide mt-5"
                >
                  {isLoginLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span className="flex items-center space-x-1.5">
                      <span>Log In</span>
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>
              </motion.div>
            </form>
          </motion.div>

          {/* Footer controls */}
          <div className="flex flex-col gap-3 max-w-sm w-full mx-auto border-t border-white/5 pt-4">
            <div className="text-center text-xs text-gray-400 md:hidden">
              New to VoiceFlow AI?{' '}
              <button 
                type="button"
                onClick={toggleMode} 
                className="text-secondary hover:text-secondary/80 font-bold transition-colors duration-300"
              >
                Register Account
              </button>
            </div>
            
            <div className="text-center text-[11px]">
              <span className="text-gray-500">Are you an administrator? </span>
              <Link to="/admin/login" className="text-secondary/80 hover:text-secondary font-semibold transition-colors duration-300 bg-secondary/5 px-2 py-0.5 rounded border border-secondary/10">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>

        {/* ─── RIGHT FORM: Sign Up (Register) ─────────────────────────────── */}
        <div className={`w-full md:w-1/2 flex flex-col justify-between p-8 sm:p-10 bg-surface/90 backdrop-blur-md z-10 transition-all duration-700 ${
          isLogin ? 'hidden md:flex opacity-0 translate-x-12 pointer-events-none' : 'opacity-100 translate-x-0'
        }`}>
          {/* Logo Header */}
          <div className="flex items-center space-x-2.5">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#db2777] to-[#a855f7] flex items-center justify-center text-white shadow-md shadow-pink-500/25 group-hover:scale-105 transition-transform duration-300">
                <Mic2 size={16} />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-pink-400 transition-colors">VoiceFlow AI</span>
            </Link>
          </div>

          {/* Form Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={!isLogin ? "visible" : "hidden"}
            className="my-auto py-6"
          >
            {/* Header Title */}
            <motion.div variants={itemVariants} className="flex flex-col items-center mb-7 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/10 to-secondary/10 border border-white/10 flex items-center justify-center mb-4 shadow-xl shadow-black/35 relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary to-secondary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <UserPlus size={26} className="text-secondary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create Account</h1>
              <p className="text-xs text-gray-400 mt-1 max-w-[280px]">Join us to build custom voice syntheses and clones.</p>
            </motion.div>

            <form onSubmit={handleRegister} className="space-y-4 max-w-sm mx-auto">
              <motion.div variants={itemVariants} className="space-y-1">
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 group-focus-within:text-secondary transition-colors duration-300">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-6 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10"
                    placeholder="Full Name"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 group-focus-within:text-secondary transition-colors duration-300">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-6 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10"
                    placeholder="Email Address"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 group-focus-within:text-secondary transition-colors duration-300">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10"
                    placeholder="Password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-white transition-colors duration-300"
                    tabIndex="-1"
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button 
                  type="submit" 
                  disabled={isRegLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#c084fc] to-[#db2777] hover:from-[#a855f7] hover:to-[#be185d] text-white rounded-full font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 active:scale-[0.98] flex items-center justify-center text-sm tracking-wide mt-5"
                >
                  {isRegLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span className="flex items-center space-x-1.5">
                      <span>Sign Up</span>
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>
              </motion.div>
            </form>
          </motion.div>

          {/* Footer controls */}
          <div className="flex flex-col gap-3 max-w-sm w-full mx-auto border-t border-white/5 pt-4">
            <div className="text-center text-xs text-gray-400 md:hidden">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={toggleMode} 
                className="text-secondary hover:text-secondary/80 font-bold transition-colors duration-300"
              >
                Sign In
              </button>
            </div>
            
            <div className="text-center text-[11px] text-gray-500 uppercase tracking-widest font-bold">
              VoiceFlow AI Studio
            </div>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-6 rounded-3xl glass-panel border border-white/15 shadow-2xl relative"
          >
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-sm font-semibold bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center border border-white/10"
            >
              ✕
            </button>
            
            <div className="flex items-center space-x-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#db2777] to-[#a855f7] flex items-center justify-center text-white shadow-md shadow-pink-500/25">
                <Lock size={16} />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">Password Recovery</h2>
            </div>
            
            {forgotStep === 1 ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Enter your email address and we'll generate a secure reset code for your account.
                </p>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400" htmlFor="forgot-email">Email Address</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 group-focus-within:text-secondary">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      required
                      id="forgot-email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSendingForgot}
                  className="w-full py-3.5 bg-gradient-to-r from-[#c084fc] to-[#db2777] hover:from-[#a855f7] hover:to-[#be185d] text-white rounded-full font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center space-x-2 mt-4 shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 active:scale-[0.98]"
                >
                  {isSendingForgot ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span>Send Reset Code</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-gray-400 leading-relaxed font-semibold text-secondary animate-pulse">
                  Verification code generated! Enter it below along with your new password.
                </p>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400" htmlFor="reset-code">Reset Code</label>
                  <input
                    type="text"
                    required
                    id="reset-code"
                    placeholder="e.g. VF-1234"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10 font-mono tracking-wider text-center"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400" htmlFor="new-password">New Password</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 group-focus-within:text-secondary">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-white transition-colors duration-300"
                      tabIndex="-1"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-5">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="w-1/3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold transition-all duration-300 text-sm active:scale-[0.98]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingForgot}
                    className="w-2/3 py-3.5 bg-gradient-to-r from-[#c084fc] to-[#db2777] hover:from-[#a855f7] hover:to-[#be185d] text-white rounded-full font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center active:scale-[0.98]"
                  >
                    {isSendingForgot ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
