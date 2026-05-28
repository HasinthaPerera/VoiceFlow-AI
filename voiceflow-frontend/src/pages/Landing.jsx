import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic2, PlayCircle, Settings2, Download, Zap, Play, Square, 
  Volume2, Sparkles, Languages, Check, ArrowRight, Star, 
  Shield, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Landing() {
  // SEO Page Title
  useEffect(() => {
    document.title = "VoiceFlow AI - Transform Text into Lifelike Speech";
  }, []);

  // --- Interactive Playground State ---
  const [demoText, setDemoText] = useState('Welcome to VoiceFlow AI. Experience the future of natural speech synthesis.');
  const [demoLang, setDemoLang] = useState('english');
  const [demoSpeed, setDemoSpeed] = useState(1.0);
  const [demoPitch, setDemoPitch] = useState(1.0);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [isDemoSynthesizing, setIsDemoSynthesizing] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState(0);

  const demoPresets = [
    { text: "Welcome to VoiceFlow AI. Experience the future of natural speech synthesis.", label: "Welcome" },
    { text: "Create engaging audiobooks in seconds with studio-quality narrations.", label: "Audiobooks" },
    { text: "Improve retention in e-learning courses with friendly and articulate voiceovers.", label: "E-Learning" },
    { text: "බොහෝම ස්තූතියි VoiceFlow භාවිතා කිරීම පිළිබඳව. ඔබගේ නිර්මාණ අදම අරඹන්න.", label: "Sinhala", lang: "sinhala" },
    { text: "ভয়েসফ্লো এআই-তে আপনাকে স্বাগতম। আপনার লেখার জন্য সেরা ভয়েস তৈরি করুন।", label: "Bengali", lang: "hindi" } // Fallback to Hindi-style BCP
  ];

  // --- Voice Showcase State ---
  const [activeCategory, setActiveCategory] = useState('All');
  const [playingVoiceId, setPlayingVoiceId] = useState(null);

  const categories = ['All', 'Podcast', 'Audiobooks', 'Corporate', 'E-Learning', 'Entertainment'];

  const sampleVoices = [
    { id: 'emma', name: 'Emma', lang: 'English (US)', category: 'Podcast', gender: 'Female', desc: 'Warm, conversational, and perfect for storytelling.', text: 'Hey there! Welcome back to another episode. Today we are exploring the impact of AI on design.' },
    { id: 'arthur', name: 'Arthur', lang: 'English (UK)', category: 'Audiobooks', gender: 'Male', desc: 'Deep, theatrical, and ideal for classic narrations.', text: 'It was a cold, bright day in April, and the clocks were striking thirteen.' },
    { id: 'amara', name: 'Amara', lang: 'Hindi (IN)', category: 'E-Learning', gender: 'Female', desc: 'Clear, informative, and engaging for lessons.', text: 'नमस्ते! आज के पाठ में आपका स्वागत है। चलिए शुरू करते हैं।' },
    { id: 'arjun', name: 'Arjun', lang: 'Tamil (IN)', category: 'Corporate', gender: 'Male', desc: 'Professional, articulate, and trustworthy.', text: 'அனைவருக்கும் வணக்கம். இன்றைய கூட்டத்திற்கு உங்களை வரவேற்கிறோம்.' },
    { id: 'nimal', name: 'Nimal', lang: 'Sinhala (LK)', category: 'Entertainment', gender: 'Male', desc: 'Energetic, expressive, and perfect for promos.', text: 'ආයුබෝවන්! VoiceFlow AI වෙත ඔබව සාදරයෙන් පිළිගන්නවා. ඔබේ නිර්මාණ අදම අරඹන්න.' },
    { id: 'priya', name: 'Priya', lang: 'English (IN)', category: 'E-Learning', gender: 'Female', desc: 'Gentle, friendly, and great for tutorial voiceovers.', text: 'Welcome to this training session. Let us go through the dashboard step-by-step.' }
  ];

  const filteredVoices = activeCategory === 'All' 
    ? sampleVoices 
    : sampleVoices.filter(v => v.category === activeCategory);

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

  // --- TTS player execution ---
  const speakText = (text, lang, speed = 1, pitch = 1, onStart, onEnd) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Web Speech Synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel(); // cancel any active reading

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map internal lang tags to BCP-47 locales
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

    // Try finding matching voice
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
      onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayDemo = () => {
    if (!demoText.trim()) {
      toast.error('Please enter some text to speak');
      return;
    }

    if (isDemoPlaying) {
      window.speechSynthesis.cancel();
      setIsDemoPlaying(false);
      return;
    }

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

  // Ensure speech cuts off if component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // --- Pricing State ---
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  // --- FAQ State ---
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    { q: "How natural do the voices sound?", a: "VoiceFlow AI uses industry-leading neural synthesis technology to recreate human-like cadence, phrasing, and inflections. The natural voices adjust their emotion and tone based on context." },
    { q: "Which languages are supported out of the box?", a: "Currently, we fully support English (US & UK), Sinhala, Tamil, and Hindi. We are actively developing additional language models to launch soon." },
    { q: "Can I download and use the generated audio commercially?", a: "Yes, absolutely! All generations on our Pro and Enterprise plans grant you full commercial usage rights for videos, social media ads, podcasts, and audiobooks." },
    { q: "How does the local try-out demo differ from the real backend service?", a: "The homepage demo runs on your browser's local SpeechSynthesis engine. Once you register and log in, the real dashboard connects to our cloud GPU-accelerated deep-learning clusters which sound substantially more lifelike and expressive." }
  ];

  return (
    <div className="flex-1 flex flex-col items-center bg-grid-pattern relative">
      {/* Decorative Gradient Blobs */}
      <div className="absolute top-[10%] left-[5%] w-[35rem] h-[35rem] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-float"></div>
      <div className="absolute top-[40%] right-[5%] w-[40rem] h-[40rem] bg-secondary/10 rounded-full blur-[180px] pointer-events-none -z-10 animate-float-delayed"></div>

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
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary border-2 border-background flex items-center justify-center text-[10px] text-white font-bold font-mono">
                  {['U', 'M', 'K', 'S'][i]}
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="glass-panel p-6 border border-white/10 shadow-[0_20px_50px_rgba(99,102,241,0.15)] relative overflow-hidden"
          >
            {/* Ambient glows behind mockup */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"></div>
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 text-xs text-gray-500">
              <span className="font-semibold text-gray-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
                tts_editor_v2.0.sh
              </span>
              <span>Cloud Status: Ready</span>
            </div>

            {/* Simulated text area */}
            <div className="bg-black/20 rounded-xl p-4 min-h-[140px] border border-white/5 text-sm text-gray-300 leading-relaxed mb-4 font-mono relative">
              <span className="text-primary font-bold">&gt; </span>
              Voice synthesis translates raw text characters into mathematical wave frequencies, resulting in highly articulation-rich and smooth speech...
              <div className="absolute bottom-2 right-2 text-[10px] text-gray-600">146 chars</div>
            </div>

            {/* Slider Mockups */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Speed Multiplier</span>
                <span className="font-mono text-secondary">1.0x</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full w-[33%] bg-gradient-to-r from-primary to-secondary"></div>
                <div className="absolute top-0 left-[33%] w-3 h-3 rounded-full bg-white -translate-y-0.5 shadow"></div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-gray-400">Voice Inflection (Pitch)</span>
                <span className="font-mono text-primary">1.2</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full w-[50%] bg-gradient-to-r from-primary to-secondary"></div>
                <div className="absolute top-0 left-[50%] w-3 h-3 rounded-full bg-white -translate-y-0.5 shadow"></div>
              </div>
            </div>

            {/* Audio Wave Visualizer Panel */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform duration-300">
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                </button>
                <div>
                  <h4 className="text-xs text-white font-medium">preview_track_9.wav</h4>
                  <p className="text-[10px] text-gray-500">Duration: 4.8s</p>
                </div>
              </div>

              {/* Animated visualizer bars */}
              <div className="flex items-end gap-1 h-6">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <div 
                    key={num}
                    className={`w-0.75 sm:w-1 bg-gradient-to-t from-primary to-secondary rounded-full animate-wave-bar wave-height-${num}`}
                    style={{ animationDelay: `${num * 0.15}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

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
          className="glass-panel p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
        >
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
                      className="w-full bg-black/45 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none"
                    >
                      <option value="english">English (US)</option>
                      <option value="sinhala">Sinhala (Sri Lanka)</option>
                      <option value="tamil">Tamil (India/SL)</option>
                      <option value="hindi">Hindi (India)</option>
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

          {/* Soundwave Visualizer bottom strip */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-4">
            <span className="text-xs text-gray-500 font-medium">Output:</span>
            <div className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-black/20 rounded-lg px-4 overflow-hidden relative border border-white/5">
              {isDemoPlaying ? (
                <>
                  <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                  {[...Array(28)].map((_, i) => {
                    const h = [25, 60, 40, 80, 50, 75, 30, 90, 60, 35, 70, 45, 85, 55, 30, 65, 40, 75, 50, 90, 60, 35, 75, 45, 85, 50, 60, 30][i % 28];
                    return (
                      <div
                        key={i}
                        className="w-1 bg-primary rounded-full animate-wave-bar"
                        style={{ 
                          height: `${h}%`,
                          animationDelay: `${i * 0.05}s`,
                          animationDuration: `${0.8 + (i % 5) * 0.15}s`
                        }}
                      />
                    );
                  })}
                </>
              ) : (
                <div className="text-xs text-gray-600 font-mono italic">Audio is idle. Press Play to start.</div>
              )}
            </div>
            <Volume2 size={16} className={isDemoPlaying ? 'text-primary animate-bounce' : 'text-gray-600'} />
          </div>
        </motion.div>
      </section>

      {/* Voice Showcase Library Section */}
      <section id="voices" className="max-w-7xl mx-auto w-full px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Explore the Voice Library</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Listen to samples of professional voices tailored for different industries and content types.</p>
          
          {/* Category tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-primary to-secondary text-white border-transparent shadow-lg shadow-primary/20'
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Voices Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredVoices.map((voice) => (
              <motion.div
                key={voice.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`glass-panel p-5 border transition-all duration-300 relative ${
                  playingVoiceId === voice.id 
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-white/5 hover:border-white/20'
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
                      <p className="text-xs text-gray-500 font-medium">{voice.lang} • {voice.gender}</p>
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

                {/* Animated voice wave visualizer */}
                {playingVoiceId === voice.id && (
                  <div className="h-4 flex items-end gap-0.5 bg-black/25 rounded p-1">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary rounded-full animate-wave-bar flex-1"
                        style={{ 
                          height: `${20 + Math.sin(i * 1.2) * 60}%`, 
                          animationDelay: `${i * 0.08}s` 
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Bento Grid Feature Cards */}
      <section className="max-w-7xl mx-auto w-full px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Engineered for Quality</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Advanced voice intelligence combined with professional utilities to accelerate your audio creation.</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[220px]">
          {/* Card 1: Large Box - Neural Synthesis */}
          <div className="md:col-span-2 md:row-span-2 glass-panel p-8 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-500"></div>
            
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <Zap size={24} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Premium Neural Voice Synthesis</h3>
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
          <div className="glass-panel p-6 border border-white/5 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Languages size={20} />
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Native Support</span>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Multilingual Support</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Generate high-quality voices natively in English, Sinhala, Tamil, and Hindi.
              </p>
            </div>
          </div>

          {/* Card 3: Regular Box - Control parameters */}
          <div className="glass-panel p-6 border border-white/5 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Settings2 size={20} />
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Granular UI</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">Fine-tune Controls</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Adjust speed rates and sound pitch keys. Sculpt standard voices to sound enthusiastic, calm, or quick.
              </p>
            </div>
          </div>

          {/* Card 4: Full Row on Mobile, 1 span in bento - Exports */}
          <div className="glass-panel p-6 border border-white/5 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <Download size={20} />
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Formats</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">Instant MP3 Export</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Render and download your files in high bitrate MP3 instantly. High-speed delivery straight to your browser downloads folder.
              </p>
            </div>
          </div>

          {/* Card 5: Large Box - Dashboard Mockup Details */}
          <div className="md:col-span-2 glass-panel p-6 border border-white/5 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/15 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Shield size={20} />
              </div>
              <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold">Cloud Synced</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">Secure History & Dashboard management</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
                Every file generated is cataloged in your user database. Never lose track of your work. Copy, download, or review your audio log histories anytime, anywhere, with an administration control interface.
              </p>
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
          {/* Connector Line for Desktop */}
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
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {/* Free Plan */}
          <div className="glass-panel p-8 border border-white/5 flex flex-col justify-between relative">
            <div>
              <h3 className="text-lg font-bold text-gray-300 mb-2">Free Starter</h3>
              <p className="text-xs text-gray-500 mb-6">Perfect for evaluating speech quality.</p>
              
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-sm text-gray-500">/ forever</span>
              </div>

              <div className="h-px bg-white/5 mb-6"></div>

              <ul className="space-y-3.5 mb-8 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span>10,000 characters / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span>Access standard voices</span>
                </li>
                <li className="flex items-center gap-2 flex-1">
                  <Check size={16} className="text-primary shrink-0" />
                  <span>MP3 high quality downloads</span>
                </li>
                <li className="flex items-center gap-2 opacity-40">
                  <Check size={16} className="text-primary shrink-0" />
                  <span className="line-through">Commercial usage license</span>
                </li>
              </ul>
            </div>

            <Link to="/register" className="btn-secondary w-full text-center py-3 text-sm flex justify-center font-bold">
              Sign Up Free
            </Link>
          </div>

          {/* Pro Plan (Glowing/Popular) */}
          <div className="glass-panel p-8 border-2 border-primary bg-gradient-to-b from-primary/5 via-surface/60 to-surface/60 flex flex-col justify-between relative shadow-xl shadow-primary/10">
            <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-primary to-secondary text-white text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full shadow-md">
              Most Popular
            </span>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">Professional</h3>
              <p className="text-xs text-gray-400 mb-6">Ideal for video creators and publishers.</p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  {billingPeriod === 'monthly' ? '$19' : '$15'}
                </span>
                <span className="text-sm text-gray-500">/ month</span>
              </div>

              <div className="h-px bg-white/5 mb-6"></div>

              <ul className="space-y-3.5 mb-8 text-sm text-gray-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-secondary shrink-0" />
                  <span>250,000 characters / month</span>
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
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-secondary shrink-0" />
                  <span>Priority support lines</span>
                </li>
              </ul>
            </div>

            <Link to="/register" className="btn-primary w-full text-center py-3 text-sm flex justify-center font-bold shadow-lg shadow-primary/20">
              Get Started Now
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="glass-panel p-8 border border-white/5 flex flex-col justify-between relative">
            <div>
              <h3 className="text-lg font-bold text-gray-300 mb-2">Enterprise</h3>
              <p className="text-xs text-gray-500 mb-6">Custom scaling for production apps.</p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  {billingPeriod === 'monthly' ? '$99' : '$79'}
                </span>
                <span className="text-sm text-gray-500">/ month</span>
              </div>

              <div className="h-px bg-white/5 mb-6"></div>

              <ul className="space-y-3.5 mb-8 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span>Unlimited characters</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span>Custom voice cloning model</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span>Dedicated API access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />
                  <span>SLA uptime guarantee</span>
                </li>
              </ul>
            </div>

            <Link to="/register" className="btn-secondary w-full text-center py-3 text-sm flex justify-center font-bold">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto w-full px-4 py-16 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Still have queries? Find quick answers related to our speech platforms.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="glass-panel border border-white/5 overflow-hidden transition-all duration-300"
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

              <div 
                className={`transition-all duration-300 ease-in-out ${
                  expandedFaq === index 
                    ? 'max-h-[200px] border-t border-white/5 opacity-100' 
                    : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <div className="p-6 text-gray-400 text-sm md:text-base leading-relaxed bg-black/10">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Glowing CTA Footer Banner */}
      <section className="max-w-6xl mx-auto w-full px-4 py-16 mb-8">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 p-8 md:p-12 text-center bg-gradient-to-tr from-surface/90 to-primary/10 shadow-[0_20px_50px_rgba(99,102,241,0.1)]">
          {/* Animated decorative ring background */}
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
