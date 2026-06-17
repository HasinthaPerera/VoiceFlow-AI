import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Mic2, Eye, EyeOff, Sparkles, Volume2, ArrowRight, Mic, UserPlus, User, Check, AlertCircle, Play, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi, setToken, setUser } from '../api';
import loginBanner from '../assets/login_banner.png';
import Logo from '../components/Logo';

export default function Login({ initialMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode state: true for Sign In (Login), false for Sign Up (Register)
  const [isLogin, setIsLogin] = useState(true);

  // Initialize email & rememberMe from localStorage
  const [email, setEmail] = useState(() => localStorage.getItem('remembered_voiceflow_email') || '');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('remembered_voiceflow_email'));

  useEffect(() => {
    const isRegister = location.pathname === '/register' || initialMode === 'register';
    setIsLogin(!isRegister);
    
    // Stop any active previews or listening overlays when switching pages
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingPreview(false);
    setIsListening(false);
    
    // Clear password fields on route transition
    setPassword('');
    setRegPassword('');
  }, [location.pathname, initialMode]);

  const toggleMode = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingPreview(false);
    setIsListening(false);
    
    if (isLogin) {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

  // Login States
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

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
  const [voiceCommandMessage, setVoiceCommandMessage] = useState('');

  // Audio Showcase Preview State
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // References
  const recognitionRef = useRef(null);


  // Voice Assistant Speech Recognition
  const startVoiceAssistant = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isPlayingPreview) {
      window.speechSynthesis.cancel();
      setIsPlayingPreview(false);
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceCommandMessage("Listening for command...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Voice assistant transcript:', transcript);
      setVoiceCommandMessage(`Recognized: "${transcript}"`);
      
      const speakBack = (text) => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          // Try to select a natural voice
          const voices = window.speechSynthesis.getVoices();
          const englishVoice = voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-US')) || voices[0];
          if (englishVoice) {
            utterance.voice = englishVoice;
          }
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        }
      };

      if (
        transcript.includes('forgot password') || 
        transcript.includes('lost password') || 
        transcript.includes('reset password') || 
        transcript.includes('forgot my password')
      ) {
        speakBack("Opening password recovery helper.");
        toast.success('Command: Forgot password', { icon: '🎙️' });
        setTimeout(() => {
          setForgotEmail(email || regEmail);
          setForgotStep(1);
          setShowForgotModal(true);
          setIsListening(false);
        }, 1200);
      } else if (
        transcript.includes('register') || 
        transcript.includes('sign up') || 
        transcript.includes('create account') ||
        transcript.includes('create an account')
      ) {
        speakBack("Switching to registration form.");
        toast.success('Command: Switch to Register', { icon: '🎙️' });
        setTimeout(() => {
          navigate('/register');
          setIsListening(false);
        }, 1200);
      } else if (
        transcript.includes('login') || 
        transcript.includes('sign in') || 
        transcript.includes('standard log')
      ) {
        speakBack("Switching to login form.");
        toast.success('Command: Switch to Login', { icon: '🎙️' });
        setTimeout(() => {
          navigate('/login');
          setIsListening(false);
        }, 1200);
      } else if (
        transcript.includes('admin') || 
        transcript.includes('administrator')
      ) {
        speakBack("Redirecting to administrator portal.");
        toast.success('Command: Redirect to Admin', { icon: '🎙️' });
        setTimeout(() => {
          navigate('/admin/login');
          setIsListening(false);
        }, 1200);
      } else if (
        transcript.includes('help') || 
        transcript.includes('option') || 
        transcript.includes('command')
      ) {
        speakBack("Available commands are sign up, sign in, forgot password, and admin.");
        setVoiceCommandMessage('Options: "sign up", "sign in", "forgot password", "admin"');
        setTimeout(() => {
          // Restart recognition to let them say another command
          try {
            recognition.start();
          } catch(e) {}
        }, 4500);
      } else {
        speakBack("Command not recognized.");
        setVoiceCommandMessage(`Unknown: "${transcript}". Say "help" for commands.`);
        setTimeout(() => {
          setIsListening(false);
        }, 3000);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        toast.error("Microphone permission denied. Please enable microphone access in your browser.");
      } else {
        toast.error("Speech recognition error.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      // Auto close listening view if it finished without a valid action
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
      
      // Remember me handling
      if (rememberMe) {
        localStorage.setItem('remembered_voiceflow_email', email);
      } else {
        localStorage.removeItem('remembered_voiceflow_email');
      }

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

  // Play Showcase Audio Preview (Speech Synthesis with Sync Waves)
  const playPreview = () => {
    if (isPlayingPreview) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingPreview(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      toast.error("Speech synthesis is not supported in this browser. Try Chrome or Safari.", { id: 'tts-synth-err' });
      return;
    }

    window.speechSynthesis.cancel(); // Clear any running speech

    const textToSpeak = isLogin 
      ? "Welcome back to VoiceFlow A.I. Neural Engine version 2.0 is active. Synthesizing audiobook narrator voice sample."
      : "Hello there! Create an account today on VoiceFlow A.I. and experience our premium voice clone studio.";

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Choose natural sounding voice if possible
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-US')) || voices[0];
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }
    
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlayingPreview(true);
    };

    utterance.onend = () => {
      setIsPlayingPreview(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis error", e);
      setIsPlayingPreview(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Mock Social OAuth authentication
  const handleSocialLogin = (provider) => {
    toast.loading(`Authenticating via secure ${provider} gateway...`, { id: 'social-login', duration: 1200 });
    setTimeout(() => {
      const demoUser = {
        id: 999,
        name: `${provider === 'google' ? 'Google' : 'GitHub'} Workspace User`,
        email: `demo_${provider}@voiceflow.ai`,
        is_admin: false
      };
      setToken(`demo_oauth_token_${provider}_987654`);
      setUser(demoUser);
      toast.success(`Welcome! Logged in with ${provider}.`, { id: 'social-login' });
      navigate('/dashboard/generate');
    }, 1200);
  };

  // Password Strength Calculation Helper
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'No Password Entered', color: 'bg-white/10', text: 'text-gray-500' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 0:
      case 1:
        return { score: 1, label: 'Weak (Must be 8+ chars)', color: 'bg-red-500', text: 'text-red-400' };
      case 2:
        return { score: 2, label: 'Fair (Try adding numbers)', color: 'bg-orange-500', text: 'text-orange-400' };
      case 3:
        return { score: 3, label: 'Good (Add symbols & mixed case)', color: 'bg-yellow-500', text: 'text-yellow-400' };
      case 4:
        return { score: 4, label: 'Strong Workspace Password', color: 'bg-green-500', text: 'text-green-400' };
      default:
        return { score: 0, label: '', color: 'bg-white/10', text: 'text-gray-500' };
    }
  };

  // Check email validation
  const isValidEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
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
                animate={{ scale: 1, opacity: 1, y: 0 }}
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
                      <div className={`w-1 bg-primary/75 rounded-full wave-height-1 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.1s' }}></div>
                      <div className={`w-1 bg-secondary/80 rounded-full wave-height-4 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.3s' }}></div>
                      <div className={`w-1 bg-pink-500/85 rounded-full wave-height-2 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.5s' }}></div>
                      <div className={`w-1 bg-secondary/80 rounded-full wave-height-5 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.2s' }}></div>
                      <div className={`w-1 bg-primary/75 rounded-full wave-height-3 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.4s' }}></div>
                      <div className={`w-1 bg-pink-500/85 rounded-full wave-height-6 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.6s' }}></div>
                      <div className={`w-1 bg-secondary/80 rounded-full wave-height-2 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.1s' }}></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] mt-3 border-t border-white/5 pt-3">
                      <button 
                        type="button"
                        onClick={playPreview}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border transition-all duration-300 font-bold uppercase tracking-wider text-[9px] ${
                          isPlayingPreview 
                            ? 'bg-pink-500/25 border-pink-500/50 text-pink-400 shadow-md shadow-pink-500/10' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white'
                        }`}
                      >
                        {isPlayingPreview ? (
                          <>
                            <Square size={8} fill="currentColor" />
                            <span>Stop Demo</span>
                          </>
                        ) : (
                          <>
                            <Play size={8} fill="currentColor" />
                            <span>Listen Sample</span>
                          </>
                        )}
                      </button>
                      <span className="text-[9px] text-gray-500 font-mono">{isPlayingPreview ? "Synthesizing..." : "Sample: 4.8s"}</span>
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
                      <div className={`w-1 bg-secondary/80 rounded-full wave-height-3 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.2s' }}></div>
                      <div className={`w-1 bg-primary/75 rounded-full wave-height-1 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.4s' }}></div>
                      <div className={`w-1 bg-pink-500/85 rounded-full wave-height-5 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.6s' }}></div>
                      <div className={`w-1 bg-secondary/80 rounded-full wave-height-2 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.1s' }}></div>
                      <div className={`w-1 bg-primary/75 rounded-full wave-height-4 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.3s' }}></div>
                      <div className={`w-1 bg-pink-500/85 rounded-full wave-height-3 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.5s' }}></div>
                      <div className={`w-1 bg-secondary/80 rounded-full wave-height-1 ${isPlayingPreview ? 'animate-wave-active' : 'animate-wave-bar'}`} style={{ animationDelay: '0.2s' }}></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] mt-3 border-t border-white/5 pt-3">
                      <button 
                        type="button"
                        onClick={playPreview}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border transition-all duration-300 font-bold uppercase tracking-wider text-[9px] ${
                          isPlayingPreview 
                            ? 'bg-primary/25 border-primary/50 text-primary shadow-md shadow-primary/10' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white'
                        }`}
                      >
                        {isPlayingPreview ? (
                          <>
                            <Square size={8} fill="currentColor" />
                            <span>Stop Demo</span>
                          </>
                        ) : (
                          <>
                            <Play size={8} fill="currentColor" />
                            <span>Listen Sample</span>
                          </>
                        )}
                      </button>
                      <span className="text-[9px] text-gray-500 font-mono">{isPlayingPreview ? "Cloning..." : "Ready"}</span>
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
              <Logo size="sm" className="group-hover:scale-105 transition-transform duration-300" />
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-pink-400 transition-colors font-sans">
                VoiceFlow<span className="text-secondary ml-0.5">AI</span>
              </span>
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
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-10 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10 input-glow"
                    placeholder="Email Address"
                  />
                  {email && (
                    isValidEmail(email) ? (
                      <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                    ) : (
                      <AlertCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400" />
                    )
                  )}
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
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10 input-glow"
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

              <motion.div variants={itemVariants} className="relative flex items-center justify-center my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <span className="relative bg-[#0d0a15] px-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Or continue with</span>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-gray-200 hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.714 5.714 0 018.25 12.9a5.714 5.714 0 015.741-5.7 5.617 5.617 0 013.9 1.545l3.07-3.07A10 10 0 1013.99 2 9.99 9.99 0 0024 12c0 .64-.07 1.3-.2 1.9H12.24z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-gray-200 hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  <span>GitHub</span>
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
              <Logo size="sm" className="group-hover:scale-105 transition-transform duration-300" />
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-pink-400 transition-colors font-sans">
                VoiceFlow<span className="text-secondary ml-0.5">AI</span>
              </span>
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
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-10 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10 input-glow"
                    placeholder="Full Name"
                  />
                  {regName && (
                    regName.trim().length >= 2 ? (
                      <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                    ) : (
                      <AlertCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400" />
                    )
                  )}
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
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-10 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10 input-glow"
                    placeholder="Email Address"
                  />
                  {regEmail && (
                    isValidEmail(regEmail) ? (
                      <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                    ) : (
                      <AlertCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400" />
                    )
                  )}
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
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-transparent transition-all duration-300 text-sm focus:bg-white/10 input-glow"
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
                
                {/* Real-time Password Strength Meter */}
                {regPassword && (
                  <div className="space-y-1.5 px-1.5 pt-1.5 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center text-[10px] font-semibold">
                      <span className="text-gray-400">Password Strength:</span>
                      <span className={`${getPasswordStrength(regPassword).text} font-bold transition-all duration-300`}>
                        {getPasswordStrength(regPassword).label}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`strength-bar h-full ${getPasswordStrength(regPassword).color}`} 
                        style={{ width: `${(getPasswordStrength(regPassword).score / 4) * 100}%` }}
                      ></div>
                    </div>
                    {/* Validation Checklist */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1.5 text-[9px] font-medium text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors ${regPassword.length >= 8 ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-gray-600'}`}></span>
                        <span>8+ Characters</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors ${(/[A-Z]/.test(regPassword) && /[a-z]/.test(regPassword)) ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-gray-600'}`}></span>
                        <span>Mixed Case</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors ${/[0-9]/.test(regPassword) ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-gray-600'}`}></span>
                        <span>Numbers</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors ${/[^A-Za-z0-9]/.test(regPassword) ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-gray-600'}`}></span>
                        <span>Special Symbols</span>
                      </div>
                    </div>
                  </div>
                )}
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

              <motion.div variants={itemVariants} className="relative flex items-center justify-center my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <span className="relative bg-[#0d0a15] px-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Or continue with</span>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-gray-200 hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.714 5.714 0 018.25 12.9a5.714 5.714 0 015.741-5.7 5.617 5.617 0 013.9 1.545l3.07-3.07A10 10 0 1013.99 2 9.99 9.99 0 0024 12c0 .64-.07 1.3-.2 1.9H12.24z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-gray-200 hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  <span>GitHub</span>
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

      {/* Advanced Voice Assistant concentric overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#07050f]/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="max-w-md w-full glass-panel p-8 border border-white/10 flex flex-col items-center shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => {
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.abort();
                    } catch(e) {}
                  }
                  setIsListening(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-sm font-semibold bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center border border-white/10"
              >
                ✕
              </button>

              <div className="relative mb-8 mt-2 flex items-center justify-center">
                {/* Ripples from index.css */}
                <div className="absolute w-24 h-24 rounded-full bg-secondary/10 border border-secondary/20 animate-ripple"></div>
                <div className="absolute w-24 h-24 rounded-full bg-secondary/20 border border-secondary/30 animate-ripple" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute w-24 h-24 rounded-full bg-secondary/5 border border-secondary/10 animate-ripple" style={{ animationDelay: '1.2s' }}></div>
                
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-secondary to-[#db2777] flex items-center justify-center text-white relative z-10 shadow-lg shadow-pink-500/35">
                  <Mic size={24} className="animate-bounce" />
                </div>
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">Voice Command Assistant</h3>
              <p className="text-xs text-secondary mt-1 font-mono tracking-wider font-extrabold uppercase animate-pulse">
                Neural Assistant Listening
              </p>
              
              <div className="mt-4 p-4 w-full bg-black/35 rounded-2xl border border-white/5 min-h-[50px] flex items-center justify-center">
                <p className="text-sm font-medium text-white transition-all duration-300">
                  {voiceCommandMessage || "Listening for speech..."}
                </p>
              </div>

              <div className="mt-6 w-full text-left text-[11px] font-medium text-gray-400 bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1.5">
                <p className="font-bold text-gray-300 uppercase tracking-widest text-[9px] mb-1">Supported Commands:</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono">
                  <div className="text-gray-400 hover:text-white transition-colors">🎙️ "sign up" / "register"</div>
                  <div className="text-gray-400 hover:text-white transition-colors">🎙️ "sign in" / "login"</div>
                  <div className="text-gray-400 hover:text-white transition-colors">🎙️ "forgot password"</div>
                  <div className="text-gray-400 hover:text-white transition-colors">🎙️ "admin"</div>
                </div>
                <p className="text-[10px] text-gray-500 italic pt-1 mt-1 border-t border-white/5 text-center">Say "help" to list instructions aloud</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
}
