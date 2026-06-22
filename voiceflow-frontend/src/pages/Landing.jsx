import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic2, PlayCircle, Settings2, Download, Zap, Play, Square, 
  Volume2, Sparkles, Languages, Check, ArrowRight, Star, 
  Shield, ChevronDown, Search, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getUser, ttsApi } from '../api';
import InteractiveParticleBackground from '../components/InteractiveParticleBackground';
import VoiceSphereVisualizer from '../components/VoiceSphereVisualizer';

export default function Landing() {
  // SEO Page Title
  useEffect(() => {
    document.title = "VoiceFlow AI - Transform Text into Lifelike Speech";
  }, []);

  // --- Cursor Tracking System ---
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  // --- Interactive Slider Comparison State ---
  const [sliderPos, setSliderPos] = useState(50);
  const sliderContainerRef = useRef(null);
  const [isSliderDragging, setIsSliderDragging] = useState(false);

  const handleSliderMove = (clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMoveSlider = (e) => {
    if (e.touches && e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMoveSlider = (e) => {
    if (isSliderDragging) {
      handleSliderMove(e.clientX);
    }
  };

  const handleMouseDownSlider = () => {
    setIsSliderDragging(true);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isSliderDragging) {
        handleSliderMove(e.clientX);
      }
    };
    const handleGlobalMouseUp = () => {
      setIsSliderDragging(false);
    };

    if (isSliderDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isSliderDragging]);

  // --- Auth & User State ---
  const [user, setUser] = useState(null);
  useEffect(() => {
    setUser(getUser());
  }, []);

  // --- Live Stats Ticker State ---
  const [liveChars, setLiveChars] = useState(15248109);
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveChars(prev => prev + Math.floor(Math.random() * 95) + 30);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // --- Interactive Playground State ---
  const [demoText, setDemoText] = useState('Welcome to VoiceFlow AI. Experience the future of natural speech synthesis.');
  const [demoLang, setDemoLang] = useState('english');
  const [demoSpeed, setDemoSpeed] = useState(1.0);
  const [demoPitch, setDemoPitch] = useState(1.0);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [isDemoSynthesizing, setIsDemoSynthesizing] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [cloudAudioUrl, setCloudAudioUrl] = useState(null);
  
  // Refs for Web Audio API & Canvas Visualizer
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null);

  const demoPresets = [
    { text: "Welcome to VoiceFlow AI. Experience the future of natural speech synthesis.", label: "Welcome" },
    { text: "Create engaging audiobooks in seconds with studio-quality narrations.", label: "Audiobooks" },
    { text: "Improve retention in e-learning courses with friendly and articulate voiceovers.", label: "E-Learning" },
    { text: "බොහෝම ස්තූතියි VoiceFlow භාවිතා කිරීම පිළිබඳව. ඔබගේ නිර්මාණ අදම අරඹන්න.", label: "Sinhala", lang: "sinhala" },
    { text: "ভয়েসফ্লো এআই-তে আপনাকে স্বাগতম। আপনার লেখার জন্য সেরা ভয়েস তৈরি করুন।", label: "Bengali", lang: "hindi" }
  ];

  // --- Voice Showcase State ---
  const [activeCategory, setActiveCategory] = useState('All');
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');

  const categories = ['All', 'Podcast', 'Audiobooks', 'Corporate', 'E-Learning', 'Entertainment'];

  const sampleVoices = [
    { id: 'emma', name: 'Emma', lang: 'English (US)', flag: '🇺🇸', category: 'Podcast', gender: 'Female', desc: 'Warm, conversational, and perfect for storytelling.', text: 'Hey there! Welcome back to another episode. Today we are exploring the impact of AI on design.' },
    { id: 'arthur', name: 'Arthur', lang: 'English (UK)', flag: '🇬🇧', category: 'Audiobooks', gender: 'Male', desc: 'Deep, theatrical, and ideal for classic narrations.', text: 'It was a cold, bright day in April, and the clocks were striking thirteen.' },
    { id: 'amara', name: 'Amara', lang: 'Hindi (IN)', flag: '🇮🇳', category: 'E-Learning', gender: 'Female', desc: 'Clear, informative, and engaging for lessons.', text: 'नमस्ते! आज के पाठ में आपका स्वागत है। चलिए शुरू करते हैं।' },
    { id: 'arjun', name: 'Arjun', lang: 'Tamil (IN)', flag: '🇮🇳', category: 'Corporate', gender: 'Male', desc: 'Professional, articulate, and trustworthy.', text: 'அனைவருக்கும் வணக்கம். இன்றைய கூட்டத்திற்கு உங்களை வரவேற்கிறோம்.' },
    { id: 'nimal', name: 'Nimal', lang: 'Sinhala (LK)', flag: '🇱🇰', category: 'Entertainment', gender: 'Male', desc: 'Energetic, expressive, and perfect for promos.', text: 'ආයුබෝවන්! VoiceFlow AI වෙත ඔබව සාදරයෙන් පිළිගන්නවා. ඔබේ නිර්මාණ අදම අරඹන්න.' },
    { id: 'priya', name: 'Priya', lang: 'English (IN)', flag: '🇮🇳', category: 'E-Learning', gender: 'Female', desc: 'Gentle, friendly, and great for tutorial voiceovers.', text: 'Welcome to this training session. Let us go through the dashboard step-by-step.' }
  ];

  const filteredVoices = sampleVoices.filter(v => {
    const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
    const matchesSearch = v.name.toLowerCase().includes(voiceSearchQuery.toLowerCase()) ||
                          v.lang.toLowerCase().includes(voiceSearchQuery.toLowerCase()) ||
                          v.desc.toLowerCase().includes(voiceSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- Hero Interactive Mockup State ---
  const [isHeroPlaying, setIsHeroPlaying] = useState(false);
  const [heroText, setHeroText] = useState("Welcome to VoiceFlow AI. Experience the future of neural speech synthesis.");
  const [heroSpeed, setHeroSpeed] = useState(1.0);
  const [heroPitch, setHeroPitch] = useState(1.0);
  const [heroStatus, setHeroStatus] = useState('idle'); // 'idle' | 'normalizing' | 'synthesizing' | 'playing'
  const [heroPreset, setHeroPreset] = useState('welcome');

  // --- Voice Comparison State ---
  const [playingCompare, setPlayingCompare] = useState('none'); // 'none' | 'standard' | 'neural'
  const [activeStage, setActiveStage] = useState(0);

  // --- Web Speech Synth voices caching ---
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handleVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoices);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoices);
    }
  }, []);

  // Ensure speech cuts off if component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // --- Local TTS player execution ---
  const speakText = (text, lang, speed = 1, pitch = 1, onStart, onEnd) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Web Speech Synthesis is not supported in this browser.');
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    let locale = 'en-US';
    if (lang === 'sinhala' || lang.toLowerCase().includes('sinhala') || lang.toLowerCase().includes('lk')) {
      locale = 'si-LK';
    } else if (lang === 'tamil' || lang.toLowerCase().includes('tamil')) {
      locale = 'ta-IN';
    } else if (lang === 'hindi' || lang.toLowerCase().includes('hindi')) {
      locale = 'hi-IN';
    } else if (lang.toLowerCase().includes('uk')) {
      locale = 'en-GB';
    } else if (lang.toLowerCase().includes('in') && lang.toLowerCase().includes('english')) {
      locale = 'en-IN';
    }

    utterance.lang = locale;
    utterance.rate = speed;
    utterance.pitch = pitch;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(locale)) ||
                          voices.find(v => v.lang.toLowerCase().includes(locale.split('-')[0]));
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = onStart;
    utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.error('Speech synthesis error', e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  // --- Web Audio Analyser Init ---
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64; 
      
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } else if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  // --- Canvas visualizer animation loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    let height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;

    const resizeHandler = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    window.addEventListener('resize', resizeHandler);

    let phase = 0;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);

      // If playing cloud audio with real AnalyserNode
      if (isDemoPlaying && isCloudMode && analyserRef.current) {
        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.6;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.85;

          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
          gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.8)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 1)');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth - 3, barHeight);
          x += barWidth;
        }
      } 
      // If playing local synthesis or demo voice sample (procedural wave animation)
      else if (isDemoPlaying || playingVoiceId || isHeroPlaying) {
        phase += 0.08 * demoSpeed;
        
        // Draw 3 layers of glowing waves
        const waves = [
          { amplitude: height * 0.25 * demoPitch, frequency: 0.008, color: 'rgba(99, 102, 241, 0.65)', speed: 1 },
          { amplitude: height * 0.16 * demoPitch, frequency: 0.015, color: 'rgba(168, 85, 247, 0.55)', speed: -1.3 },
          { amplitude: height * 0.10 * demoPitch, frequency: 0.022, color: 'rgba(236, 72, 153, 0.45)', speed: 2 }
        ];

        waves.forEach((wave) => {
          ctx.beginPath();
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = wave.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = wave.color;
          
          for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin(x * wave.frequency + phase * wave.speed) * wave.amplitude * Math.sin(phase * 0.15);
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        });
        ctx.shadowBlur = 0; // reset shadow
      } else {
        // Idle state line
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', resizeHandler);
    };
  }, [isDemoPlaying, isCloudMode, demoSpeed, demoPitch, playingVoiceId, isHeroPlaying]);

  // --- Handlers ---
  const handlePlayDemo = async () => {
    if (!demoText.trim()) {
      toast.error('Please enter some text to speak');
      return;
    }

    if (isDemoPlaying) {
      if (isCloudMode) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      } else {
        window.speechSynthesis.cancel();
      }
      setIsDemoPlaying(false);
      return;
    }

    if (isCloudMode) {
      if (!user) {
        toast.error('Please login to use Cloud Neural Engine.');
        return;
      }
      setIsDemoSynthesizing(true);
      try {
        initAudioContext();
        const res = await ttsApi.generate(
          demoText,
          demoLang,
          "natural",
          demoSpeed,
          demoPitch,
          "Playground Demo"
        );
        const url = ttsApi.getAudioUrl(res.audio_url.split('/').pop());
        setCloudAudioUrl(url);
        setIsDemoSynthesizing(false);
        setIsDemoPlaying(true);
        
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch(e => {
              console.error(e);
              setIsDemoPlaying(false);
            });
          }
        }, 50);
      } catch (err) {
        toast.error(err.message || 'Cloud generation failed.');
        setIsDemoSynthesizing(false);
        setIsDemoPlaying(false);
      }
    } else {
      setIsDemoSynthesizing(true);
      speakText(
        demoText,
        demoLang,
        demoSpeed,
        demoPitch,
        () => {
          setIsDemoSynthesizing(false);
          setIsDemoPlaying(true);
        },
        () => {
          setIsDemoSynthesizing(false);
          setIsDemoPlaying(false);
        }
      );
    }
  };

  const handlePlayVoiceSample = (voice) => {
    if (playingVoiceId === voice.id) {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(voice.id);
    speakText(
      voice.text,
      voice.lang,
      1.0,
      1.0,
      () => {},
      () => {
        setPlayingVoiceId(null);
      }
    );
  };

  const handlePlayHeroMockup = () => {
    if (isHeroPlaying || heroStatus !== 'idle') {
      window.speechSynthesis.cancel();
      setIsHeroPlaying(false);
      setHeroStatus('idle');
      return;
    }

    setHeroStatus('normalizing');
    setTimeout(() => {
      setHeroStatus('synthesizing');
      setTimeout(() => {
        setHeroStatus('playing');
        setIsHeroPlaying(true);
        speakText(
          heroText,
          "english",
          heroSpeed,
          heroPitch,
          () => {},
          () => {
            setIsHeroPlaying(false);
            setHeroStatus('idle');
          }
        );
      }, 700);
    }, 600);
  };

  const handlePlayComparison = (type) => {
    if (playingCompare === type) {
      window.speechSynthesis.cancel();
      setPlayingCompare('none');
      return;
    }

    window.speechSynthesis.cancel();
    setPlayingCompare(type);

    if (type === 'standard') {
      speakText(
        "Warning. Standard synthesis active. Pacing vectors are linear. Pitch is flat and robotic.",
        "english",
        1.15,
        1.75,
        () => {},
        () => setPlayingCompare('none')
      );
    } else {
      speakText(
        "Hi! This is Emma, powered by VoiceFlow's next-gen neural engine. Notice how the pacing naturally slows down for emphasis, and the tone carries warm, human-like expression.",
        "english",
        0.95,
        1.0,
        () => {},
        () => setPlayingCompare('none')
      );
    }
  };

  // --- Pricing State ---
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [priceSliderVal, setPriceSliderVal] = useState(2); // default to 250k chars (Pro)
  const [showCompareTable, setShowCompareTable] = useState(false);

  // --- FAQ State & Search ---
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  const faqs = [
    { q: "How natural do the voices sound?", a: "VoiceFlow AI uses industry-leading neural synthesis technology to recreate human-like cadence, phrasing, and inflections. The natural voices adjust their emotion and tone based on context." },
    { q: "Which languages are supported out of the box?", a: "Currently, we fully support English (US & UK), Sinhala, Tamil, and Hindi. We are actively developing additional language models to launch soon." },
    { q: "Can I download and use the generated audio commercially?", a: "Yes, absolutely! All generations on our Pro and Enterprise plans grant you full commercial usage rights for videos, social media ads, podcasts, and audiobooks." },
    { q: "How does the local try-out demo differ from the real backend service?", a: "The homepage demo runs on your browser's local SpeechSynthesis engine. Once you register and log in, the real dashboard connects to our cloud GPU-accelerated deep-learning clusters which sound substantially more lifelike and expressive." }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col items-center bg-grid-pattern relative">
      <InteractiveParticleBackground />
      {/* Hidden HTML5 Audio Element for Cloud Preview */}
      <audio 
        ref={audioRef}
        src={cloudAudioUrl}
        onEnded={() => setIsDemoPlaying(false)}
        onError={() => {
          setIsDemoPlaying(false);
          toast.error("Audio playback error");
        }}
      />

      {/* Decorative Gradient Blobs */}
      <div className="absolute top-[10%] left-[5%] w-[35rem] h-[35rem] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-float"></div>
      <div className="absolute top-[40%] right-[5%] w-[40rem] h-[40rem] bg-secondary/10 rounded-full blur-[180px] pointer-events-none -z-10 animate-float-delayed"></div>

      {/* Grid Particle Overlays */}
      <div className="absolute top-[15%] right-[20%] w-4 h-4 bg-primary/30 rounded-full blur-sm animate-pulse-slow"></div>
      <div className="absolute top-[50%] left-[15%] w-6 h-6 bg-secondary/20 rounded-full blur-sm animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-16 md:pt-24 pb-20 w-full grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8 text-left z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-primary text-xs sm:text-sm font-semibold tracking-wide"
          >
            <Sparkles size={16} className="text-secondary animate-pulse" />
            <span>Next-Gen Neural Voice Engine</span>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white"
          >
            Transform Text into <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-secondary drop-shadow-sm">
              Lifelike Speech
            </span>
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed"
          >
            Generate studio-grade voiceovers instantly. Choose from curated voices across English, Sinhala, Tamil, and Hindi for your videos, learning materials, and products.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <Link to="/register" id="hero-cta-start" className="btn-primary w-full sm:w-auto text-lg px-8 py-3.5 flex items-center justify-center space-x-2 shadow-xl shadow-primary/25">
              <span>Start Generating Free</span>
              <PlayCircle size={20} />
            </Link>
            <a href="#playground" id="hero-cta-playground" className="btn-secondary w-full sm:w-auto text-lg px-8 py-3.5 flex items-center justify-center">
              Try Interactive Demo
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4 pt-6 text-gray-400 text-sm"
          >
            <div className="flex -space-x-2">
              {['U', 'M', 'K', 'S'].map((char, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary border-2 border-background flex items-center justify-center text-[10px] text-white font-bold font-mono">
                  {char}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center text-yellow-500 gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="mt-0.5 text-xs text-gray-500">Trusted by 10,000+ creators & developers</p>
            </div>
          </motion.div>
        </div>

        {/* Hero Interactive UI Card Mockup */}
        <div className="lg:col-span-5 z-10 relative">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="glass-panel p-6 border border-white/10 shadow-[0_20px_50px_rgba(99,102,241,0.15)] relative overflow-hidden group"
          >
            {/* Shimmer Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl shimmer-effect opacity-10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 text-xs text-gray-500">
              <span className="font-semibold text-gray-400 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isHeroPlaying ? 'bg-green-500 animate-ping' : 'bg-yellow-500'}`}></span>
                neural_engine_v3.0.io
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Neural GPU
                </span>
              </div>
            </div>

            {/* Presets Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setHeroPreset('welcome');
                  setHeroText("Welcome to VoiceFlow AI. Experience the future of neural speech synthesis.");
                  setHeroSpeed(1.0);
                  setHeroPitch(1.0);
                }}
                className={`text-[10px] px-2.5 py-1 rounded-md transition-all font-semibold ${
                  heroPreset === 'welcome' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                👋 Welcome
              </button>
              <button
                onClick={() => {
                  setHeroPreset('audiobook');
                  setHeroText("It was a dark and mysterious night, and the storyteller's voice resonated through the valley.");
                  setHeroSpeed(0.9);
                  setHeroPitch(0.95);
                }}
                className={`text-[10px] px-2.5 py-1 rounded-md transition-all font-semibold ${
                  heroPreset === 'audiobook' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                📖 Narrative
              </button>
              <button
                onClick={() => {
                  setHeroPreset('promo');
                  setHeroText("Breaking News! Unleash studio-grade voice generation directly from your browser.");
                  setHeroSpeed(1.15);
                  setHeroPitch(1.1);
                }}
                className={`text-[10px] px-2.5 py-1 rounded-md transition-all font-semibold ${
                  heroPreset === 'promo' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                🔥 Promo
              </button>
            </div>

            {/* Editable text area */}
            <div className="bg-black/45 rounded-xl p-4 min-h-[130px] border border-white/5 text-sm text-gray-300 leading-relaxed mb-4 relative focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <span className="text-secondary font-bold font-mono">&gt; </span>
              <textarea
                value={heroText}
                onChange={(e) => {
                  setHeroText(e.target.value);
                  setHeroPreset(null);
                }}
                className="w-full bg-transparent border-0 outline-none text-gray-200 placeholder-gray-600 text-sm leading-relaxed resize-none h-[90px] focus:ring-0"
                maxLength={120}
                placeholder="Type something here to preview..."
              />
              <div className="absolute bottom-2 right-2 text-[9px] text-gray-600 font-mono">{heroText.length} / 120 chars</div>
            </div>

            {/* Slider Mockups */}
            <div className="space-y-3.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="text-gray-400">Pace / Speed</span>
                  <span className="font-mono text-secondary">{heroSpeed.toFixed(2)}x</span>
                </div>
                <input 
                  type="range" min="0.6" max="1.5" step="0.05"
                  value={heroSpeed}
                  onChange={(e) => setHeroSpeed(parseFloat(e.target.value))}
                  className="w-full accent-secondary bg-black/40 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="text-gray-400">Tone / Pitch</span>
                  <span className="font-mono text-primary">{heroPitch.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0.6" max="1.5" step="0.05"
                  value={heroPitch}
                  onChange={(e) => setHeroPitch(parseFloat(e.target.value))}
                  className="w-full accent-primary bg-black/40 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Simulated pipeline steps */}
            <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500 font-mono bg-black/20 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${heroStatus === 'normalizing' ? 'bg-primary animate-ping' : heroStatus === 'synthesizing' || heroStatus === 'playing' ? 'bg-primary' : 'bg-gray-700'}`}></span>
                <span className={heroStatus === 'normalizing' ? 'text-primary' : 'text-gray-500'}>NORM</span>
              </div>
              <span className="text-gray-700">&rarr;</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${heroStatus === 'synthesizing' ? 'bg-secondary animate-ping' : heroStatus === 'playing' ? 'bg-secondary' : 'bg-gray-700'}`}></span>
                <span className={heroStatus === 'synthesizing' ? 'text-secondary' : 'text-gray-500'}>ACOUSTIC</span>
              </div>
              <span className="text-gray-700">&rarr;</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${heroStatus === 'playing' ? 'bg-green-500 animate-ping' : 'bg-gray-700'}`}></span>
                <span className={heroStatus === 'playing' ? 'text-green-400' : 'text-gray-500'}>WAVE</span>
              </div>
            </div>

            {/* Audio Wave Visualizer Panel (Functional) */}
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePlayHeroMockup}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all duration-300 ${
                    isHeroPlaying || heroStatus !== 'idle' ? 'bg-red-500 shadow-red-500/20' : 'bg-gradient-to-tr from-primary to-secondary shadow-primary/20'
                  }`}
                >
                  {isHeroPlaying || heroStatus !== 'idle' ? (
                    <Square size={16} fill="currentColor" />
                  ) : (
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <div>
                  <h4 className="text-xs text-white font-semibold flex items-center gap-1">
                    {heroStatus === 'idle' && 'engine_ready.wav'}
                    {heroStatus === 'normalizing' && 'Normalizing script...'}
                    {heroStatus === 'synthesizing' && 'Generating voice vectors...'}
                    {heroStatus === 'playing' && 'Streaming output...'}
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    {isHeroPlaying ? 'Simulated Latency: 145ms' : 'Status: Idle'}
                  </p>
                </div>
              </div>

              {/* Voice Sphere Visualizer (Mini version for Hero Mockup) */}
              <div className="w-16 h-16 overflow-hidden flex items-center justify-center">
                <VoiceSphereVisualizer 
                  isPlaying={isHeroPlaying} 
                  speed={heroSpeed} 
                  pitch={heroPitch} 
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Infinite Partners Logo Marquee */}
      <div className="w-full py-10 border-t border-b border-white/5 bg-black/10 overflow-hidden relative mb-12">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        <div className="flex animate-marquee whitespace-nowrap gap-16 text-gray-500 font-bold uppercase tracking-wider text-sm sm:text-base items-center">
          <span>🎙️ VoiceCast.fm</span>
          <span>📚 Narration Labs</span>
          <span>🎓 EducateMe</span>
          <span>🎬 IndieStudio</span>
          <span>🎮 GameQuest Audio</span>
          <span>🌐 GlobalReach Translate</span>
          
          {/* Loop copy for seamless slider effect */}
          <span>🎙️ VoiceCast.fm</span>
          <span>📚 Narration Labs</span>
          <span>🎓 EducateMe</span>
          <span>🎬 IndieStudio</span>
          <span>🎮 GameQuest Audio</span>
          <span>🌐 GlobalReach Translate</span>
        </div>
      </div>

      {/* Live Platform Stats */}
      <section className="max-w-6xl mx-auto w-full px-4 py-8 mb-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onMouseMove={handleCardMouseMove}
            className="interactive-glow-card p-6 border border-white/5 flex flex-col justify-between items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full m-3 animate-ping"></div>
            <div className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full m-3"></div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono">Live Synthesizing</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-2 select-none">
              {liveChars.toLocaleString()}
            </div>
            <span className="text-[10px] text-primary font-semibold mt-1">Total Chars Synthesized</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            onMouseMove={handleCardMouseMove}
            className="interactive-glow-card p-6 border border-white/5 flex flex-col justify-between items-center text-center"
          >
            <Zap size={20} className="text-yellow-500" />
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-2">
              &lt; 145ms
            </div>
            <span className="text-[10px] text-secondary font-semibold mt-1">Average Response Latency</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onMouseMove={handleCardMouseMove}
            className="interactive-glow-card p-6 border border-white/5 flex flex-col justify-between items-center text-center"
          >
            <Languages size={20} className="text-blue-400" />
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-2">
              4 Major
            </div>
            <span className="text-[10px] text-blue-400 font-semibold mt-1">Native Accent Engines</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            onMouseMove={handleCardMouseMove}
            className="interactive-glow-card p-6 border border-white/5 flex flex-col justify-between items-center text-center"
          >
            <Check size={20} className="text-green-400" />
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-2">
              99.99%
            </div>
            <span className="text-[10px] text-green-400 font-semibold mt-1">Uptime SLA Guarantee</span>
          </motion.div>
        </div>
      </section>

      {/* Interactive Try-it-now Playground Widget */}
      <section id="playground" className="max-w-4xl mx-auto w-full px-4 py-16 scroll-mt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Try Voice Synthesis Right Now</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Type custom content below, configure the settings, and hear the system read your text immediately.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onMouseMove={handleCardMouseMove}
          className="interactive-glow-card p-6 md:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Engine Mode Toggle */}
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-400">Synthesis Engine:</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                isCloudMode ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-gray-400'
              }`}>
                {isCloudMode ? 'Cloud Neural' : 'Local Browser'}
              </span>
            </div>
            
            <button
              onClick={() => {
                if (!user) {
                  toast.error("Please log in to unlock our high-fidelity GPU Cloud Neural Engine!");
                  return;
                }
                setIsCloudMode(!isCloudMode);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
                !user 
                  ? 'bg-black/40 border-white/5 text-gray-500 cursor-not-allowed'
                  : isCloudMode
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Cpu size={14} />
              <span>{isCloudMode ? 'Switch to Local' : 'Switch to Cloud Neural'}</span>
              {!user && <span className="text-[9px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
            </button>
          </div>

          {/* Preset Chips */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mr-2">Presets:</span>
            {demoPresets.map((preset, idx) => (
              <button
                key={idx}
                id={`preset-chip-${idx}`}
                onClick={() => {
                  setDemoText(preset.text);
                  setActivePresetIndex(idx);
                  if (preset.lang) {
                    setDemoLang(preset.lang);
                  } else {
                    setDemoLang('english');
                  }
                }}
                className={`text-xs px-3.5 py-1.5 rounded-full transition-all duration-300 font-medium ${
                  activePresetIndex === idx
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Input area */}
            <div className="md:col-span-7 flex flex-col space-y-4">
              <div className="flex-1 min-h-[160px] bg-black/35 rounded-xl border border-white/5 p-4 flex flex-col relative focus-within:ring-1 focus-within:ring-primary/50 transition-all duration-300">
                <textarea
                  id="demo-textarea"
                  value={demoText}
                  onChange={(e) => {
                    setDemoText(e.target.value);
                    setActivePresetIndex(null);
                  }}
                  placeholder="Enter custom text for synthesis here..."
                  className="w-full bg-transparent border-0 outline-none text-gray-200 placeholder-gray-600 text-base leading-relaxed resize-none flex-grow"
                  maxLength={300}
                />
                <span className="absolute bottom-3 right-3 text-xs text-gray-600 font-mono">
                  {demoText.length} / 300
                </span>
              </div>
            </div>

            {/* Settings panel */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-4 bg-white/5 rounded-xl p-5 border border-white/5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Language</label>
                  <div className="relative">
                    <select
                      id="demo-lang-select"
                      value={demoLang}
                      onChange={(e) => setDemoLang(e.target.value)}
                      className="w-full bg-black/45 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none font-medium"
                    >
                      <option value="english">🇺🇸 English (US)</option>
                      <option value="sinhala">🇱🇰 Sinhala (Sri Lanka)</option>
                      <option value="tamil">🇮🇳 Tamil (India/SL)</option>
                      <option value="hindi">🇮🇳 Hindi (India)</option>
                    </select>
                    <Languages size={16} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-400 uppercase tracking-wider">Speed</span>
                      <span className="font-mono text-primary font-bold">{demoSpeed.toFixed(1)}x</span>
                    </div>
                    <input
                      id="demo-speed-slider"
                      type="range" min="0.5" max="2" step="0.1"
                      value={demoSpeed}
                      onChange={(e) => setDemoSpeed(parseFloat(e.target.value))}
                      className="w-full accent-primary bg-black/30 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-400 uppercase tracking-wider">Pitch</span>
                      <span className="font-mono text-primary font-bold">{demoPitch.toFixed(1)}</span>
                    </div>
                    <input
                      id="demo-pitch-slider"
                      type="range" min="0.5" max="2" step="0.1"
                      value={demoPitch}
                      onChange={(e) => setDemoPitch(parseFloat(e.target.value))}
                      className="w-full accent-primary bg-black/30 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-play-demo"
                  onClick={handlePlayDemo}
                  disabled={isDemoSynthesizing}
                  className={`w-full py-3.5 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                    isDemoPlaying
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 shadow-lg shadow-red-500/10'
                      : 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/25'
                  }`}
                >
                  {isDemoSynthesizing ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      <span>Synthesizing...</span>
                    </>
                  ) : isDemoPlaying ? (
                    <>
                      <Square size={16} fill="currentColor" />
                      <span>Stop Speech</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                      <span>Listen to Audio</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Soundwave Canvas Visualizer strip */}
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-gray-500 font-medium">Output:</span>
              <div className="w-12 h-12 bg-black/40 rounded-full border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                <VoiceSphereVisualizer 
                  isPlaying={isDemoPlaying} 
                  analyserRef={analyserRef} 
                  speed={demoSpeed} 
                  pitch={demoPitch} 
                />
              </div>
            </div>
            <div className="flex-1 h-12 bg-black/20 rounded-lg overflow-hidden relative border border-white/5 w-full">
              {isDemoPlaying && isCloudMode && (
                <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none"></div>
              )}
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>
            <Volume2 size={16} className={isDemoPlaying ? 'text-primary animate-bounce shrink-0' : 'text-gray-600 shrink-0'} />
          </div>
        </motion.div>
      </section>

      {/* Robotic vs Neural Comparison Section */}
      <section className="max-w-6xl mx-auto w-full px-4 py-16 border-t border-white/5 relative">
        <div className="absolute top-[30%] left-[50%] w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2"></div>
        <div className="text-center mb-12">
          <span className="text-xs bg-secondary/15 text-secondary border border-secondary/25 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Engine Duel
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-4 mb-3 font-display tracking-tight">
            Robotic vs. <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Lifelike</span> Speech
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">Compare legacy text-to-speech with VoiceFlow's hyper-realistic neural architecture using our interactive slider.</p>
        </div>

        {/* Dynamic Split Screen Interactive Slider */}
        <div 
          ref={sliderContainerRef}
          onMouseMove={handleMouseMoveSlider}
          onTouchMove={handleTouchMoveSlider}
          className="comparison-slider-container h-[420px] md:h-[360px] relative select-none cursor-ew-resize overflow-hidden"
        >
          {/* Right Side: Neural AI (Base Background layer - full width) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#120f24] to-[#07060f] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="max-w-md space-y-4 text-left z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">
                  Active Neural AI
                </span>
                <Sparkles size={16} className="text-secondary animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-white font-display">VoiceFlow Neural Engine</h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                "Hi! This is Emma, powered by VoiceFlow's next-gen neural engine. Notice how the pacing naturally slows down for emphasis, and the tone carries warm, human-like expression."
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handlePlayComparison('neural')}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all duration-300 ${
                    playingCompare === 'neural'
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'bg-primary text-white hover:opacity-90 shadow-md shadow-primary/10'
                  }`}
                >
                  {playingCompare === 'neural' ? (
                    <>
                      <Square size={14} fill="currentColor" />
                      <span>Stop Neural Audio</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                      <span>Hear Neural Voice</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Neural Waves graphics */}
            <div className="w-full md:w-80 flex flex-col items-center justify-center space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm z-10 font-sans">
              <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Deep Learning Vocoder Wave</span>
              <div className="h-16 w-full flex items-end justify-center gap-1.5 overflow-hidden">
                {playingCompare === 'neural' ? (
                  [...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-gradient-to-t from-primary to-secondary rounded-full animate-wave-bar"
                      style={{ 
                        height: `${30 + Math.sin(i * 0.8) * 55}%`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    ></div>
                  ))
                ) : (
                  [...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-primary/20 rounded-full"
                      style={{ height: `${20 + Math.sin(i * 0.2) * 15}%` }}
                    ></div>
                  ))
                )}
              </div>
              <span className="text-xs text-primary font-bold">48,000 Hz Studio Quality</span>
            </div>
          </div>

          {/* Left Side: Legacy Standard (Overlay layer - width set by slider position) */}
          <div 
            className="absolute top-0 left-0 bottom-0 overflow-hidden bg-gradient-to-br from-[#121217] to-[#1a1a24] border-r border-white/10"
            style={{ width: `${sliderPos}%` }}
          >
            {/* Absolute container matching parent width so children don't squeeze */}
            <div className="absolute top-0 left-0 bottom-0 w-[100vw] max-w-[1200px] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-6" style={{ width: sliderContainerRef.current?.offsetWidth || '100vw' }}>
              <div className="max-w-md space-y-4 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/5 border border-white/10 text-gray-500 px-3 py-1 rounded-full font-mono uppercase tracking-wider font-bold">
                    Legacy Codec
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-400 font-display">Legacy Standard TTS</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                  "Warning. Standard synthesis active. Pacing vectors are linear. Pitch is flat and robotic."
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handlePlayComparison('standard')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all duration-300 ${
                      playingCompare === 'standard'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {playingCompare === 'standard' ? (
                      <>
                        <Square size={14} fill="currentColor" />
                        <span>Stop Standard Audio</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                        <span>Hear Standard TTS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Standard waves graphics */}
              <div className="w-full md:w-80 flex flex-col items-center justify-center space-y-4 bg-black/30 p-6 rounded-2xl border border-white/5 backdrop-blur-sm font-sans">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">Linear Wave Synthesis</span>
                <div className="h-16 w-full flex items-end justify-center gap-1.5 overflow-hidden">
                  {playingCompare === 'standard' ? (
                    [...Array(24)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-gray-600 rounded-full animate-flat-wave"
                        style={{ height: '35%', animationDelay: `${i * 0.04}s` }}
                      ></div>
                    ))
                  ) : (
                    <div className="h-0.5 w-full bg-white/5 self-center"></div>
                  )}
                </div>
                <span className="text-xs text-gray-500 font-medium">8,000 Hz Monotone</span>
              </div>
            </div>
          </div>

          {/* Draggable Divider Handle */}
          <div 
            onMouseDown={handleMouseDownSlider}
            onTouchStart={handleMouseDownSlider}
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-pink-500 flex items-center justify-center cursor-ew-resize z-20 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
          >
            {/* Grab circles */}
            <div className="w-9 h-9 rounded-full bg-[#13131a] border-2 border-secondary shadow-[0_0_20px_rgba(168,85,247,0.6)] flex flex-col gap-0.5 items-center justify-center hover:scale-110 active:scale-95 transition-transform select-none shrink-0">
              <div className="flex gap-0.5">
                <div className="w-1 h-3 bg-secondary rounded-full"></div>
                <div className="w-1 h-3 bg-secondary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Showcase Library Section */}
      <section id="voices" className="max-w-7xl mx-auto w-full px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Explore the Voice Library</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Listen to samples of professional voices tailored for different industries and content types.</p>
          
          {/* Search and Category Control panel */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 max-w-3xl mx-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={voiceSearchQuery}
                onChange={(e) => setVoiceSearchQuery(e.target.value)}
                placeholder="Search voices or languages..."
                className="w-full bg-black/35 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/10'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Voices Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredVoices.map((voice) => (
              <motion.div
                key={voice.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onMouseMove={handleCardMouseMove}
                className={`interactive-glow-card p-5 border transition-all duration-300 relative ${
                  playingVoiceId === voice.id 
                    ? 'border-primary/50 shadow-lg shadow-primary/15'
                    : 'border-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold uppercase shadow-sm">
                      {voice.name.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base flex items-center gap-1.5">
                        {voice.name}
                        <span className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded">
                          {voice.category}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">{voice.flag} {voice.lang} • {voice.gender}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlayVoiceSample(voice)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      playingVoiceId === voice.id
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {playingVoiceId === voice.id ? (
                      <Square size={14} fill="currentColor" />
                    ) : (
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed mb-4">{voice.desc}</p>

                {/* Audio Card Footer / Simulated Waveform & Progress */}
                <div className="space-y-3 mt-4">
                  {playingVoiceId === voice.id && (
                    <div className="space-y-2">
                      {/* Waveform */}
                      <div className="h-6 flex items-end gap-1.5 bg-black/45 rounded-lg p-2 border border-white/5 overflow-hidden">
                        {[...Array(24)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-gradient-to-t from-primary to-secondary rounded-full animate-wave-bar flex-1"
                            style={{ 
                              height: `${20 + Math.sin(i * 1.8) * 80}%`, 
                              animationDelay: `${i * 0.05}s` 
                            }}
                          />
                        ))}
                      </div>
                      {/* Progress Bar scrubber simulation */}
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                        <span>0:04</span>
                        <div className="flex-1 mx-3 h-1 bg-white/10 rounded relative overflow-hidden">
                          <div className="absolute top-0 left-0 h-full w-[45%] bg-primary rounded animate-pulse"></div>
                        </div>
                        <span>0:12</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] text-gray-500 font-mono">Sample Rate: 48kHz</span>
                    <button 
                      onClick={() => {
                        toast.success(`Downloading ${voice.name}'s voice template sample...`);
                      }}
                      className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-2 py-1 rounded border border-white/10 flex items-center gap-1 font-semibold transition-all"
                    >
                      <Download size={10} />
                      <span>Download Sample</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Bento Grid Feature Cards */}
      <section className="max-w-7xl mx-auto w-full px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3 font-display tracking-tight">Engineered for Quality</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Advanced voice intelligence combined with professional utilities to accelerate your audio creation.</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[220px]">
          {/* Card 1: Large Box - Neural Synthesis */}
          <div onMouseMove={handleCardMouseMove} className="md:col-span-2 md:row-span-2 interactive-glow-card p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-500"></div>
            
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110 duration-300">
              <Zap size={24} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-3 font-display">Premium Neural Voice Synthesis</h3>
              <p className="text-gray-400 leading-relaxed max-w-xl">
                Experience high-fidelity audio mapping that reproduces realistic voice inflections, phrasing pauses, and localized dialects. The neural AI model filters out mechanical clipping for perfectly clear WAV and MP3 files.
              </p>
            </div>

            {/* Visual background simulation */}
            <div className="hidden sm:flex items-end gap-1.5 absolute bottom-8 right-8 h-20 opacity-30 group-hover:opacity-60 transition-opacity duration-300">
              {[...Array(14)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1.5 bg-gradient-to-t from-primary to-secondary rounded-full animate-wave-bar"
                  style={{ 
                    height: `${30 + Math.sin(i * 0.6) * 50}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1.5s'
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Card 2: Regular Box - Languages */}
          <div onMouseMove={handleCardMouseMove} className="interactive-glow-card p-6 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:rotate-12 transition-transform duration-300">
                <Languages size={20} />
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Native Support</span>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Multilingual Support</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Generate high-quality voices natively in English, Sinhala, Tamil, and Hindi.
              </p>
            </div>
          </div>

          {/* Card 3: Regular Box - Control parameters */}
          <div onMouseMove={handleCardMouseMove} className="interactive-glow-card p-6 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
                <Settings2 size={20} />
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Granular UI</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Fine-tune Controls</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Adjust speed rates and sound pitch keys. Sculpt standard voices to sound enthusiastic, calm, or quick.
              </p>
            </div>
          </div>

          {/* Card 4: Full Row on Mobile, 1 span in bento - Exports */}
          <div onMouseMove={handleCardMouseMove} className="interactive-glow-card p-6 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:translate-y-1 transition-transform duration-300">
                <Download size={20} />
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Formats</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Instant MP3 Export</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Render and download your files in high bitrate MP3 instantly. High-speed delivery straight to your browser downloads folder.
              </p>
            </div>
          </div>

          {/* Card 5: Large Box - Dashboard Mockup Details */}
          <div onMouseMove={handleCardMouseMove} className="md:col-span-2 interactive-glow-card p-6 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/15 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Shield size={20} />
              </div>
              <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold">Cloud Synced</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Secure History & Dashboard management</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
                Every file generated is cataloged in your user database. Never lose track of your work. Copy, download, or review your audio log histories anytime, anywhere, with an administration control interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Speech Pipeline Visualizer */}
      <section className="max-w-7xl mx-auto w-full px-4 py-16 border-t border-white/5 relative">
        <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-secondary/5 rounded-full blur-[160px] pointer-events-none -z-10"></div>
        <div className="text-center mb-12">
          <span className="text-xs bg-primary/15 text-primary border border-primary/25 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Neural Architecture
          </span>
          <h2 className="text-3xl font-bold text-white mt-4 mb-3">AI Speech Pipeline</h2>
          <p className="text-gray-400 max-w-xl mx-auto">See how raw characters are converted into natural speech using VoiceFlow's neural modeling flow.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Left Column: Pipeline Stages Steps */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
            {[
              { id: 0, title: "1. Text Normalization", subtitle: "Prepares raw text symbols & formats" },
              { id: 1, title: "2. Phonetic Alignment", subtitle: "Translates characters to phonetic sounds" },
              { id: 2, title: "3. Acoustic Modeling", subtitle: "Predicts sound pitch & tone matrices" },
              { id: 3, title: "4. Neural Vocoding", subtitle: "Constructs raw audio waves at 48kHz" }
            ].map((stage) => (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex items-start gap-4 ${
                  activeStage === stage.id
                    ? 'bg-gradient-to-r from-surface to-primary/10 border-primary/45 shadow-lg shadow-primary/5'
                    : 'bg-surface/40 border-white/5 text-gray-400 hover:bg-surface hover:text-white hover:border-white/10'
                }`}
              >
                {activeStage === stage.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary"></div>
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${
                  activeStage === stage.id ? 'bg-primary text-white' : 'bg-white/5 text-gray-500'
                }`}>
                  {stage.id + 1}
                </div>
                <div>
                  <h3 className={`font-semibold text-base ${activeStage === stage.id ? 'text-white' : 'text-gray-300'}`}>
                    {stage.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{stage.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Right Column: Visual Stage Detail Card */}
          <div className="lg:col-span-7">
            <div onMouseMove={handleCardMouseMove} className="interactive-glow-card p-6 md:p-8 min-h-[420px] flex flex-col justify-between border border-white/5 relative">
              <div className="absolute inset-0 pointer-events-none shimmer-effect opacity-5"></div>
              
              {/* Dynamic Interactive Panel */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                  <span className="text-[10px] font-mono text-secondary uppercase font-bold tracking-wider">
                    Stage Process {activeStage + 1} of 4
                  </span>
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono font-bold">
                    ACTIVE FLOW
                  </span>
                </div>

                {activeStage === 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                      <Zap size={20} className="text-primary animate-pulse" />
                      Text Normalization & Prep
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      First, the raw text script is normalized. The engine identifies abbreviation markers, symbol structures, phone numbers, and numbers, expanding them to full spoken words.
                    </p>
                    
                    <div className="bg-black/35 rounded-xl border border-white/5 p-4 space-y-3 font-mono text-xs text-left relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pipeline-flow"></div>
                      <div className="text-gray-500 flex justify-between">
                        <span>&gt; Input Script</span>
                        <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-sans uppercase font-bold">Raw Text</span>
                      </div>
                      <div className="text-red-400 pl-4 bg-red-500/5 py-2.5 rounded border border-red-500/10 relative">
                        <span className="animate-pulse">"Launch v3.0 on 2026-06-15 at $15."</span>
                      </div>
                      <div className="text-gray-500 mt-2 flex justify-between">
                        <span>&gt; Normalized Output</span>
                        <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded font-sans uppercase font-bold">Expanded Words</span>
                      </div>
                      <div className="text-green-400 pl-4 bg-green-500/5 py-2.5 rounded border border-green-500/10 relative">
                        <span>"Launch version <span className="text-white underline decoration-wavy decoration-primary font-bold">three point zero</span> on <span className="text-white underline decoration-wavy decoration-primary font-bold">June fifteenth twenty twenty-six</span> at <span className="text-white underline decoration-wavy decoration-primary font-bold">fifteen dollars</span>."</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStage === 1 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                      <Languages size={20} className="text-secondary animate-pulse" />
                      Phonetic Mapping & Accent Analysis
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      The normalized words are converted into linguistic phoneme codes, defining word stresses, sentence breaks, and dialect accents (e.g. US vs UK English, or Sinhala syllables).
                    </p>
                    
                    <div className="bg-black/35 rounded-xl border border-white/5 p-4 space-y-3 font-mono text-xs text-left relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent animate-pipeline-flow"></div>
                      <div className="text-gray-500 flex justify-between">
                        <span>&gt; Text Phrase</span>
                        <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-sans uppercase font-bold">Syllables</span>
                      </div>
                      <div className="text-gray-300 pl-4 bg-white/5 py-2 rounded">"VoiceFlow Engine"</div>
                      <div className="text-gray-500 mt-2 flex justify-between">
                        <span>&gt; Phoneme Representation</span>
                        <span className="text-[9px] bg-secondary/15 text-secondary px-1.5 py-0.5 rounded font-sans uppercase font-bold">IPA Format</span>
                      </div>
                      <div className="text-secondary pl-4 bg-secondary/5 py-2.5 rounded border border-secondary/10 flex gap-2">
                        <span className="bg-secondary/10 px-1.5 py-0.5 rounded font-bold">/vɔɪs/</span>
                        <span className="bg-secondary/10 px-1.5 py-0.5 rounded font-bold">/floʊ/</span>
                        <span className="bg-secondary/10 px-1.5 py-0.5 rounded font-bold">/ˈɛn.dʒɪn/</span>
                      </div>
                      <div className="text-gray-500 mt-2 flex justify-between">
                        <span>&gt; Syllable Stress Map</span>
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans uppercase font-bold">Acoustic Emphasis</span>
                      </div>
                      <div className="text-primary pl-4 bg-primary/5 py-2.5 rounded border border-primary/10 flex gap-3 items-center">
                        <span>[Primary Stresses]</span>
                        <div className="flex gap-1.5 font-sans">
                          <span className="bg-primary text-white text-[9px] px-2 py-0.5 rounded font-extrabold uppercase animate-pulse">VOICE</span>
                          <span className="bg-primary text-white text-[9px] px-2 py-0.5 rounded font-extrabold uppercase animate-pulse">EN</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStage === 2 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                      <Settings2 size={20} className="text-blue-400 animate-pulse" />
                      Acoustic Feature Extraction
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      The phoneme strings are parsed by a neural acoustic model, mapping exact speech frequencies, volume inflections, and emotional characteristics into a complex Mel-spectrogram map.
                    </p>
                    
                    <div className="bg-black/35 rounded-xl border border-white/5 p-4 space-y-2 text-left relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pipeline-flow"></div>
                      <div className="text-xs font-mono text-gray-500 mb-2 flex justify-between">
                        <span>&gt; Synthesizing Mel-Spectrogram Matrix (80 Frequency Channels)</span>
                        <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded font-sans uppercase font-bold">Neural Spectrum</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1 h-24 items-end bg-black/40 p-3 rounded-xl border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_90%,rgba(99,102,241,0.05)_90%)] bg-[size:100%_8px] pointer-events-none"></div>
                        {[55, 85, 25, 95, 65, 45, 80, 15, 90, 35, 95, 70, 50, 75, 20, 85, 60, 40, 95, 65, 45, 80, 25, 90].map((val, idx) => (
                          <div
                            key={idx}
                            className="bg-gradient-to-t from-blue-500/20 via-primary/75 to-secondary rounded-sm w-full animate-wave-bar"
                            style={{ 
                              height: `${val}%`,
                              animationDelay: `${idx * 0.04}s`,
                              animationDuration: `${0.8 + (idx % 3) * 0.2}s`
                            }}
                          ></div>
                        ))}
                      </div>
                      <div className="text-[10px] font-mono text-gray-600 mt-1 flex justify-between">
                        <span>0ms (Start)</span>
                        <span>Time Duration Axis</span>
                        <span>420ms (End)</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStage === 3 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                      <Cpu size={20} className="text-green-400 animate-pulse" />
                      Neural Vocoding Wave Output
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Finally, the GPU neural vocoder acts on the Mel-spectrogram, predicting phase relationships and reconstructing standard high-fidelity audio output sampled at 48kHz.
                    </p>
                    
                    <div className="bg-black/35 rounded-xl border border-white/5 p-4 text-left relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pipeline-flow"></div>
                      <div className="text-xs font-mono text-gray-500 mb-2 flex justify-between">
                        <span>&gt; Reconstructed Waveform</span>
                        <span className="text-[9px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded font-sans uppercase font-bold">Vocoder Output</span>
                      </div>
                      <div className="h-16 flex items-center justify-center bg-black/40 rounded-xl border border-white/5 relative overflow-hidden">
                        {/* Dynamic pipeline wave animation */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                          {[...Array(60)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-gradient-to-y from-green-400 via-secondary to-primary rounded-full mx-[1px] animate-wave-bar"
                              style={{
                                height: `${25 + Math.sin(i * 0.4) * 60}%`,
                                animationDelay: `${i * 0.02}s`,
                                animationDuration: '1.1s'
                              }}
                            ></div>
                          ))}
                        </div>
                        <div className="z-10 text-[10px] font-mono text-green-400 bg-black/60 px-3.5 py-1.5 rounded-full border border-green-500/30 animate-pulse flex items-center gap-1.5 shadow-lg shadow-green-500/10">
                          <Volume2 size={12} className="text-green-400 animate-bounce" />
                          <span>WAV File Output Sample Ready: 48,000 Hz</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Progress Flow Connection Lines */}
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>Current State: {activeStage === 3 ? "Pipeline Complete" : "Next Stage Pending"}</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={activeStage === 0}
                    onClick={() => setActiveStage(prev => prev - 1)}
                    className="px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    &larr; Prev
                  </button>
                  <button
                    disabled={activeStage === 3}
                    onClick={() => setActiveStage(prev => prev + 1)}
                    className="px-2.5 py-1 rounded bg-primary text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step - How It Works */}
      <section className="max-w-7xl mx-auto w-full px-4 py-16 border-t border-white/5 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-3">How it Works</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Create beautiful narration voice tracks in three straightforward steps.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/10 via-secondary/20 to-primary/10 border-t border-dashed border-white/10 -z-10"></div>

          {/* Step 1 */}
          <div className="text-center flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-lg shadow-lg border border-white/10 relative">
              1
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">Enter Your Script</h3>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Write or paste your message text in the editor. Support text blocks up to 5,000 characters per file request.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 font-extrabold text-lg shadow">
              2
            </div>
            <h3 className="text-xl font-bold text-white">Tune Voice Parameters</h3>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Select languages, accents, and voice presets. Modify pitch key signatures and sound speed scales.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 font-extrabold text-lg shadow">
              3
            </div>
            <h3 className="text-xl font-bold text-white">Synthesize & Download</h3>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Process audio in seconds on our cloud platform. Play directly inside your web console or download local MP3 files.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Testimonials */}
      <section className="max-w-6xl mx-auto w-full px-4 py-16 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Loved by Creators Worldwide</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Hear how podcasters, course authors, and developers save hundreds of hours with VoiceFlow.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div onMouseMove={handleCardMouseMove} className="interactive-glow-card p-6 flex flex-col justify-between">
            <p className="text-gray-300 text-sm leading-relaxed italic">
              "The Sinhala and Tamil natural engines are mind-blowing. Our e-learning courses feel completely native and clear now."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                SP
              </div>
              <div>
                <h4 className="text-white text-xs font-semibold">Suresh Perera</h4>
                <p className="text-[10px] text-gray-500">CTO, EduLanka Ltd.</p>
              </div>
            </div>
          </div>
          <div onMouseMove={handleCardMouseMove} className="interactive-glow-card p-6 flex flex-col justify-between border-primary/20">
            <p className="text-gray-300 text-sm leading-relaxed italic">
              "We synthesize hours of audiobook content daily. The speed customization and WAV export saves us a massive amount of post-production work."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-xs text-secondary">
                AM
              </div>
              <div>
                <h4 className="text-white text-xs font-semibold">Alice Miller</h4>
                <p className="text-[10px] text-gray-500">Narrator, NovelAudio</p>
              </div>
            </div>
          </div>
          <div onMouseMove={handleCardMouseMove} className="interactive-glow-card p-6 flex flex-col justify-between">
            <p className="text-gray-300 text-sm leading-relaxed italic">
              "Setting up the API took less than 15 minutes. High bitrate MP3 outputs stream instantly to our customer dashboard."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-xs text-purple-400">
                DK
              </div>
              <div>
                <h4 className="text-white text-xs font-semibold">Devin Kumar</h4>
                <p className="text-[10px] text-gray-500">Founder, Saasify App</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" className="max-w-6xl mx-auto w-full px-4 py-16 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Flexible Plans for Everyone</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Get started with a free tier or scale up for high-volume audio creations.</p>
          
          {/* Billing Switcher */}
          <div className="inline-flex items-center bg-white/5 border border-white/10 p-1.5 rounded-full mt-8">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                billingPeriod === 'monthly'
                  ? 'bg-primary text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                billingPeriod === 'yearly'
                  ? 'bg-primary text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="text-[9px] bg-secondary text-white px-1.5 py-0.5 rounded-full font-bold uppercase">Save 20%</span>
            </button>
          </div>

          {/* Volume Calculator Slider */}
          <div className="max-w-xl mx-auto mt-10 p-5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-4">
            <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-gray-400">
              <span>Estimated Monthly Characters:</span>
              <span className="text-primary font-bold text-base">
                {priceSliderVal === 0 && "10,000"}
                {priceSliderVal === 1 && "100,000"}
                {priceSliderVal === 2 && "250,000"}
                {priceSliderVal === 3 && "1,000,000"}
                {priceSliderVal === 4 && "2,500,000"}
                {priceSliderVal === 5 && "5,000,000+"}
              </span>
            </div>
            
            <input 
              type="range" min="0" max="5" step="1"
              value={priceSliderVal}
              onChange={(e) => setPriceSliderVal(parseInt(e.target.value))}
              className="w-full accent-primary bg-black/40 h-2 rounded-lg appearance-none cursor-pointer"
            />
            
            <div className="flex justify-between text-[10px] text-gray-500 font-semibold uppercase tracking-wider font-mono">
              <span>10k</span>
              <span>100k</span>
              <span>250k</span>
              <span>1M</span>
              <span>2.5M</span>
              <span>5M+</span>
            </div>

            <div className="h-px bg-white/5 pt-1"></div>
            
            <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
              <span>Approximate narration time:</span>
              <span className="text-secondary font-bold font-mono">
                {priceSliderVal === 0 && "~10 minutes"}
                {priceSliderVal === 1 && "~1.7 hours"}
                {priceSliderVal === 2 && "~4.2 hours"}
                {priceSliderVal === 3 && "~16.7 hours"}
                {priceSliderVal === 4 && "~41.7 hours"}
                {priceSliderVal === 5 && "~83.3+ hours"}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {/* Free Plan */}
          <div onMouseMove={handleCardMouseMove} className={`interactive-glow-card p-8 flex flex-col justify-between relative border transition-all duration-300 ${
            priceSliderVal <= 1 ? 'border-primary shadow-xl shadow-primary/5 scale-[1.02] opacity-100' : 'border-white/5 opacity-50 hover:opacity-80'
          }`}>
            <div>
              <h3 className="text-lg font-bold text-gray-300 mb-2 font-display">Free Starter</h3>
              <p className="text-xs text-gray-500 mb-6">Perfect for evaluating speech quality.</p>
              
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  {priceSliderVal === 0 ? "$0" : "$9"}
                </span>
                <span className="text-sm text-gray-500">
                  {priceSliderVal === 0 ? "/ forever" : billingPeriod === 'monthly' ? "/ month" : "/ month (billed annually)"}
                </span>
              </div>

              <div className="h-px bg-white/5 mb-6"></div>

              <ul className="space-y-3.5 mb-8 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span className={priceSliderVal === 0 ? "text-white font-semibold" : ""}>10,000 characters / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span className={priceSliderVal === 1 ? "text-white font-semibold" : ""}>100,000 characters / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span>Access standard voices</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span>MP3 high quality downloads</span>
                </li>
                <li className={`flex items-center gap-2 ${priceSliderVal === 0 ? 'opacity-40' : ''}`}>
                  <Check size={16} className="text-primary shrink-0" />
                  <span>{priceSliderVal === 0 ? "No commercial license" : "Commercial license included"}</span>
                </li>
              </ul>
            </div>

            <Link to="/register" className="btn-secondary w-full text-center py-3 text-sm flex justify-center font-bold">
              {priceSliderVal === 0 ? "Sign Up Free" : "Select Starter Plan"}
            </Link>
          </div>

          {/* Pro Plan (Glowing/Popular) */}
          <div onMouseMove={handleCardMouseMove} className={`interactive-glow-card p-8 border-2 flex flex-col justify-between relative shadow-xl transition-all duration-300 ${
            priceSliderVal === 2 || priceSliderVal === 3
              ? 'border-primary bg-gradient-to-b from-primary/5 to-surface/60 shadow-primary/10 scale-[1.02] opacity-100'
              : 'border-white/5 opacity-50 hover:opacity-80'
          }`}>
            <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-primary to-secondary text-white text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full shadow-md">
              Most Popular
            </span>

            <div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Professional</h3>
              <p className="text-xs text-gray-400 mb-6">Ideal for video creators and publishers.</p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  {priceSliderVal === 2
                    ? (billingPeriod === 'monthly' ? '$19' : '$15')
                    : (billingPeriod === 'monthly' ? '$49' : '$39')
                  }
                </span>
                <span className="text-sm text-gray-500">/ month</span>
              </div>

              <div className="h-px bg-white/5 mb-6"></div>

              <ul className="space-y-3.5 mb-8 text-sm text-gray-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-secondary shrink-0" />
                  <span className={priceSliderVal === 2 ? "text-white font-bold" : ""}>250,000 characters / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-secondary shrink-0" />
                  <span className={priceSliderVal === 3 ? "text-white font-bold" : ""}>1,000,000 characters / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-secondary shrink-0" />
                  <span>Access all premium neural voices</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-secondary shrink-0" />
                  <span>WAV/MP3 export options</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-secondary shrink-0" />
                  <span>Commercial rights included</span>
                </li>
              </ul>
            </div>

            <Link to="/register" className="btn-primary w-full text-center py-3 text-sm flex justify-center font-bold shadow-lg shadow-primary/20">
              Get Started Now
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div onMouseMove={handleCardMouseMove} className={`interactive-glow-card p-8 flex flex-col justify-between relative border transition-all duration-300 ${
            priceSliderVal >= 4 ? 'border-primary shadow-xl shadow-primary/5 scale-[1.02] opacity-100' : 'border-white/5 opacity-50 hover:opacity-80'
          }`}>
            <div>
              <h3 className="text-lg font-bold text-gray-300 mb-2 font-display">Enterprise</h3>
              <p className="text-xs text-gray-500 mb-6">Custom scaling for production apps.</p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  {priceSliderVal === 4
                    ? (billingPeriod === 'monthly' ? '$79' : '$63')
                    : (billingPeriod === 'monthly' ? '$149' : '$119')
                  }
                </span>
                <span className="text-sm text-gray-500">/ month</span>
              </div>

              <div className="h-px bg-white/5 mb-6"></div>

              <ul className="space-y-3.5 mb-8 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span className={priceSliderVal === 4 ? "text-white font-semibold" : ""}>2.5 Million characters / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span className={priceSliderVal === 5 ? "text-white font-semibold" : ""}>5 Million characters / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span>Custom voice cloning model</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span>Dedicated API access & SLA</span>
                </li>
              </ul>
            </div>

            <Link to="/register" className="btn-secondary w-full text-center py-3 text-sm flex justify-center font-bold">
              {priceSliderVal === 5 ? "Contact Sales" : "Select Enterprise Plan"}
            </Link>
          </div>
        </div>

        {/* Toggle Detailed Comparison */}
        <div className="text-center mt-12">
          <button
            onClick={() => setShowCompareTable(!showCompareTable)}
            className="btn-secondary text-sm font-semibold inline-flex items-center space-x-2 px-6 py-3 hover:border-primary/50 transition-all duration-300"
          >
            <span>{showCompareTable ? "Hide Detailed Comparison" : "Compare All Features"}</span>
            <ChevronDown size={16} className={`transition-transform duration-300 ${showCompareTable ? 'rotate-180 text-primary' : ''}`} />
          </button>
        </div>

        {/* Collapsible Comparison Table */}
        <AnimatePresence>
          {showCompareTable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-8 w-full"
            >
              <div className="glass-panel p-6 border border-white/5 overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-sm min-w-[650px]">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider text-xs">
                      <th className="py-4 px-3">Feature</th>
                      <th className="py-4 px-3">Free Starter</th>
                      <th className="py-4 px-3 text-primary">Professional</th>
                      <th className="py-4 px-3 text-secondary">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                    <tr>
                      <td className="py-4 px-3 font-semibold text-white">Monthly Character Limit</td>
                      <td className="py-4 px-3">Up to 100k</td>
                      <td className="py-4 px-3 text-white">250k - 1 Million</td>
                      <td className="py-4 px-3 text-white font-bold">2.5 Million - 5M+</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-3 font-semibold text-white">Voice Selection</td>
                      <td className="py-4 px-3">Standard Only</td>
                      <td className="py-4 px-3">All Premium Neural</td>
                      <td className="py-4 px-3">Custom Cloned & Premium</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-3 font-semibold text-white">Voice Cloning</td>
                      <td className="py-4 px-3">❌ Not Supported</td>
                      <td className="py-4 px-3">1 Custom Voice Profile</td>
                      <td className="py-4 px-3">Unlimited Custom Clones</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-3 font-semibold text-white">Commercial Rights</td>
                      <td className="py-4 px-3">❌ Personal Use Only</td>
                      <td className="py-4 px-3">✓ Full Rights Included</td>
                      <td className="py-4 px-3">✓ Full Rights Included</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-3 font-semibold text-white">API Access</td>
                      <td className="py-4 px-3">❌ Unavailable</td>
                      <td className="py-4 px-3">✓ Standard Rate Limit</td>
                      <td className="py-4 px-3">✓ Dedicated High-Priority</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-3 font-semibold text-white">Export Quality</td>
                      <td className="py-4 px-3">128kbps MP3</td>
                      <td className="py-4 px-3">320kbps MP3 / WAV</td>
                      <td className="py-4 px-3">Uncompressed Studio WAV</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-3 font-semibold text-white">Priority Queue</td>
                      <td className="py-4 px-3">Standard</td>
                      <td className="py-4 px-3">Fast (GPU Priority)</td>
                      <td className="py-4 px-3">Instantaneous (Dedicated Node)</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-3 font-semibold text-white">Customer Support</td>
                      <td className="py-4 px-3">Community Discord</td>
                      <td className="py-4 px-3">24/7 Email</td>
                      <td className="py-4 px-3">SLA / Phone Support / AM</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto w-full px-4 py-16 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">Still have queries? Find quick answers related to our speech platforms.</p>
          
          {/* FAQ Search Bar */}
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={faqSearchQuery}
              onChange={(e) => setFaqSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search size={16} className="absolute left-3.5 top-3 text-gray-500" />
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredFaqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onMouseMove={handleCardMouseMove}
                className="interactive-glow-card border border-white/5 overflow-hidden transition-all duration-300"
              >
                <button
                  id={`faq-btn-${index}`}
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <span className="font-semibold text-white text-base md:text-lg">{faq.q}</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform duration-300 ${
                      expandedFaq === index ? 'rotate-180 text-primary' : ''
                    }`} 
                  />
                </button>

                <motion.div 
                  initial={false}
                  animate={{ height: expandedFaq === index ? "auto" : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 text-gray-400 text-sm md:text-base leading-relaxed bg-black/10 border-t border-white/5">
                    {faq.a}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredFaqs.length === 0 && (
            <p className="text-center text-gray-500 text-sm italic py-4">No matching questions found.</p>
          )}
        </div>
      </section>

      {/* Glowing CTA Footer Banner */}
      <section className="max-w-6xl mx-auto w-full px-4 py-16 mb-8">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 p-8 md:p-12 text-center bg-gradient-to-tr from-surface/90 to-primary/10 shadow-[0_20px_50px_rgba(99,102,241,0.1)]">
          <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-float"></div>
          <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-[100px] animate-float-delayed"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Ready to Give Your Text <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                A Premium Voice?
              </span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              Join thousands of creators producing high-quality voices for their audience. No credit card required.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" id="footer-cta-start" className="btn-primary w-full sm:w-auto text-lg px-8 py-3.5 flex items-center justify-center space-x-2">
                <span>Start Generating Now</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" id="footer-cta-login" className="btn-secondary w-full sm:w-auto text-lg px-8 py-3.5 font-bold">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
