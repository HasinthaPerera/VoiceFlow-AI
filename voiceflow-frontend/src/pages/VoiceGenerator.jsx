import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Play, Square, Download, Settings2, Loader2, Copy, Check, 
  Trash2, Clipboard, Volume2, VolumeX, RotateCcw, Bookmark, 
  Sparkles, User, Cpu, Repeat, Info, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ttsApi, BASE_URL } from '../api';

const PRESETS = [
  {
    name: 'Audiobook Narration',
    titleLabel: 'Narration Sample',
    text: 'Welcome to this audio guide. Today we will explore how neural speech synthesizers produce lifelike human speech. With advances in machine learning, synthesizers can replicate tone, pitch, and human inflections with incredible accuracy, opening new frontiers for accessibility, entertainment, and interactive experiences.'
  },
  {
    name: 'Marketing Promo',
    titleLabel: 'Promo Voiceover',
    text: 'Are you ready to transform your brand? Unlock premium audio generation and stun your audience with VoiceFlow AI! Craft hyper-realistic voiceovers in seconds, choose from multiple styles, adjust parameters to perfection, and download high-quality files instantly. Get started today!'
  },
  {
    name: 'Voicemail Greeting',
    titleLabel: 'Business Voicemail',
    text: 'Thank you for calling Customer Support. All of our agents are currently busy assisting other clients. Your call is very important to us. Please leave your name, phone number, and a brief message after the tone, and we will return your call as soon as possible. Have a wonderful day!'
  }
];

const LANGUAGES = [
  { value: 'english', label: 'English', flag: '🇺🇸', sub: 'US Accent' },
  { value: 'sinhala', label: 'Sinhala', flag: '🇱🇰', sub: 'Native' },
  { value: 'tamil', label: 'Tamil', flag: '🇱🇰', sub: 'Phonetic' },
  { value: 'hindi', label: 'Hindi', flag: '🇮🇳', sub: 'Standard' }
];

const VOICES = [
  { value: 'natural', label: 'Natural AI', icon: Sparkles, desc: 'Premium neural voice' },
  { value: 'male', label: 'Std Male', icon: User, desc: 'Australian male tone' },
  { value: 'female', label: 'Std Female', icon: User, desc: 'British female tone' },
  { value: 'robotic', label: 'Robotic', icon: Cpu, desc: 'Synthetic style' }
];

export default function VoiceGenerator() {
  const location = useLocation();
  const stateDefaults = location.state || {};
  const savedDefaults = JSON.parse(localStorage.getItem('voiceflow_tts_defaults') || '{}');
  
  const [text, setText] = useState(stateDefaults.text || '');
  const [title, setTitle] = useState(stateDefaults.title || '');
  const [language, setLanguage] = useState(stateDefaults.language || savedDefaults.language || 'english');
  const [voice, setVoice] = useState(stateDefaults.voice || savedDefaults.voice || 'natural');
  const [speed, setSpeed] = useState(
    stateDefaults.speed !== undefined 
      ? stateDefaults.speed 
      : (savedDefaults.speed !== undefined ? savedDefaults.speed : 1)
  );
  const [pitch, setPitch] = useState(
    stateDefaults.pitch !== undefined 
      ? stateDefaults.pitch 
      : (savedDefaults.pitch !== undefined ? savedDefaults.pitch : 1)
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Player Console Settings
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const audioRef = useRef(null);
  const MAX_CHARS = 5000;

  // Real-time Text statistics
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estDuration = Math.round((wordCount / (150 * (speed || 1))) * 60);

  // ─── Sync audio events ───────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);

    // Apply active player settings on load
    audio.loop = isLooping;
    audio.volume = isMuted ? 0 : volume;
    audio.playbackRate = playbackRate;

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  // Synchronize audio properties dynamically
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ─── Generate ────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text first');
      return;
    }

    setIsGenerating(true);
    setAudioUrl(null);
    setIsPlaying(false);

    try {
      const data = await ttsApi.generate(text, language, voice, speed, pitch, title.trim() || undefined);
      const fullUrl = `${BASE_URL}${data.audio_url}`;
      setAudioUrl(fullUrl);
      toast.success('Voice generated successfully!');
      window.dispatchEvent(new Event('tts_generated'));
    } catch (err) {
      toast.error(err.message || 'Failed to generate voice. Is the backend running?');
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Playback ────────────────────────────────────────────────────────────
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => toast.error('Playback failed. Check audio device.'));
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${title.trim() ? title.trim().toLowerCase().replace(/\s+/g, '_') : 'voiceflow'}_${Date.now()}.mp3`;
    a.click();
  };

  const handleCopy = () => {
    if (!text.trim()) {
      toast.error('Editor is empty');
      return;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Text copied to clipboard');
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(prev => prev ? `${prev}\n${clipboardText}` : clipboardText);
        toast.success('Text pasted from clipboard');
      } else {
        toast.error('No text found in clipboard');
      }
    } catch (err) {
      toast.error('Unable to read clipboard. Please paste using Ctrl+V');
    }
  };

  const handleClear = () => {
    if (!text.trim()) return;
    if (confirm('Are you sure you want to clear the editor?')) {
      setText('');
      toast.success('Editor cleared');
    }
  };

  const handleSaveDefaults = () => {
    const defaults = { language, voice, speed, pitch };
    localStorage.setItem('voiceflow_tts_defaults', JSON.stringify(defaults));
    toast.success('Current voice configurations saved as default!');
  };

  return (
    <div className="space-y-6 h-full pb-8">
      {/* Hidden audio element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="text-primary animate-pulse" />
            Voice Generator
          </h1>
          <p className="text-gray-400 text-sm mt-1">Convert text to lifelike voiceovers using advanced neural models.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Main Editor & Presets */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Title Box */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-white/5">
              <Info size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Audio Title</h3>
            </div>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this voice synthesis a title (e.g., Tutorial Intro)..."
                className="input-field bg-white/5 border-white/10 pr-10 focus:border-primary focus:ring-primary/20"
              />
              {title && (
                <button
                  onClick={() => setTitle('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Main Editor Textbox */}
          <div className="glass-panel p-6 flex flex-col relative min-h-[350px]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-md">TTS Editor</span>
              <div className="flex space-x-1.5">
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                  title="Copy Text"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={handlePaste}
                  className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                  title="Paste Clipboard"
                >
                  <Clipboard size={16} />
                </button>
                <button
                  onClick={handleClear}
                  className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors border border-white/5"
                  title="Clear Editor"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="flex-1 w-full bg-transparent resize-none outline-none text-gray-200 placeholder-gray-600 text-lg leading-relaxed custom-scrollbar min-h-[220px]"
              maxLength={MAX_CHARS}
            />

            {/* Stats row */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <div>
                  Words: <span className="text-white font-semibold">{wordCount}</span>
                </div>
                <div>
                  Est. Duration: <span className="text-primary font-semibold font-mono">~{estDuration}s</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span className={text.length > MAX_CHARS * 0.9 ? 'text-red-400 font-bold animate-pulse' : text.length > MAX_CHARS * 0.8 ? 'text-orange-400 font-semibold' : 'text-gray-300'}>
                  {text.length.toLocaleString()}
                </span>
                <span>/ {MAX_CHARS.toLocaleString()}</span>
              </div>
            </div>

            {/* Character limit Progress Line */}
            <div className="w-full bg-white/5 h-1 mt-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  text.length > MAX_CHARS * 0.9 
                    ? 'bg-red-500' 
                    : text.length > MAX_CHARS * 0.8 
                      ? 'bg-orange-500' 
                      : 'bg-gradient-to-r from-primary to-secondary'
                }`}
                style={{ width: `${(text.length / MAX_CHARS) * 100}%` }}
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="glass-panel p-5">
            <div className="flex items-center space-x-2 mb-3">
              <FileText size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Text Templates</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setText(preset.text);
                    if (!title) {
                      setTitle(preset.titleLabel);
                    }
                    toast.success(`Loaded "${preset.name}" preset`);
                  }}
                  className="p-3 text-left bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/20 rounded-xl transition-all duration-200 group"
                >
                  <h4 className="text-xs font-semibold text-white group-hover:text-primary transition-colors">{preset.name}</h4>
                  <p className="text-gray-400 text-3xs mt-1 line-clamp-2 leading-relaxed">{preset.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Audio Player Console */}
          <AnimatePresence>
            {audioUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.4 }}
                className="glass-panel p-5 border border-primary/20 bg-primary/5 space-y-4"
              >
                {/* Audio Details & Wave visualizer */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <h4 className="text-white font-semibold text-sm">
                      {title.trim() ? title.trim() : 'Generated Audio Voiceover'}
                    </h4>
                    <div className="flex items-center space-x-2 text-2xs text-gray-400 capitalize">
                      <span className="bg-primary/15 text-primary px-2 py-0.5 rounded font-semibold">{language}</span>
                      <span>•</span>
                      <span>{voice} voice</span>
                    </div>
                  </div>

                  {/* Enhanced Responsive animated Soundwave */}
                  <div className="flex items-center space-x-1 h-8 px-3.5 bg-white/5 rounded-xl border border-white/5">
                    {[...Array(14)].map((_, i) => {
                      const baseHeight = 12 + Math.sin(i * 0.8) * 8;
                      return (
                        <div
                          key={i}
                          className={`w-0.5 bg-primary rounded-full transition-all duration-300 ${isPlaying ? 'animate-wave-bar' : 'opacity-40'}`}
                          style={{ 
                            height: isPlaying ? `${baseHeight}px` : '3px',
                            animationDelay: `${i * 0.08}s`,
                            animationDuration: '0.9s',
                            transformOrigin: 'bottom'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Timeline Progress Bar */}
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center space-x-3 w-full">
                    <span className="text-xs font-mono text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => {
                        const newTime = parseFloat(e.target.value);
                        if (audioRef.current) {
                          audioRef.current.currentTime = newTime;
                        }
                        setCurrentTime(newTime);
                      }}
                      className="flex-1 accent-primary bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer hover:bg-white/20 transition-all"
                    />
                    <span className="text-xs font-mono text-gray-400 w-10">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Actions and Controls Grid */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
                  
                  {/* Left group: Play/Pause, Loop */}
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                      title={isPlaying ? "Stop" : "Play"}
                    >
                      {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                    </button>

                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className={`p-2 rounded-lg border transition-all duration-200 ${
                        isLooping 
                          ? 'bg-primary/20 text-primary border-primary/30' 
                          : 'bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10'
                      }`}
                      title="Loop Playback"
                    >
                      <Repeat size={14} className={isLooping ? 'animate-pulse' : ''} />
                    </button>
                  </div>

                  {/* Center group: Volume and Speed Rate */}
                  <div className="flex items-center space-x-5">
                    {/* Volume Mute & Slider */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          if (isMuted) setIsMuted(false);
                        }}
                        className="w-16 sm:w-20 accent-primary bg-white/10 h-1 rounded appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Dynamic Playback Rate */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-3xs text-gray-500 font-mono">Rate:</span>
                      <select
                        value={playbackRate}
                        onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                        className="bg-white/5 border border-white/10 text-xs text-gray-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer bg-[#13131a]"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="0.8">0.8x</option>
                        <option value="1.0">1.0x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2.0">2.0x</option>
                      </select>
                    </div>
                  </div>

                  {/* Right group: Download */}
                  <button onClick={handleDownload} className="btn-secondary flex items-center space-x-2 py-2 px-4 text-xs font-semibold">
                    <Download size={14} />
                    <span>Download MP3</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column - Voice Settings & Parameters */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-white/5">
              <Settings2 className="text-primary animate-spin" style={{ animationDuration: '8s' }} size={20} />
              <h3 className="text-lg font-semibold text-white">Voice Configurations</h3>
            </div>

            {/* Language Selector Card Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Language</label>
              <div className="grid grid-cols-2 gap-2.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value)}
                    className={`p-3 text-left border rounded-xl transition-all duration-300 ${
                      language === lang.value
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5 text-white'
                        : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-xs font-semibold">{lang.label}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 leading-tight">{lang.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Type Selector Card Grid */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Voice Type</label>
              <div className="grid grid-cols-2 gap-2.5">
                {VOICES.map((v) => {
                  const Icon = v.icon;
                  return (
                    <button
                      key={v.value}
                      onClick={() => setVoice(v.value)}
                      className={`p-3 text-left border rounded-xl transition-all duration-300 ${
                        voice === v.value
                          ? 'bg-secondary/10 border-secondary shadow-lg shadow-secondary/5 text-white'
                          : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon size={14} className={voice === v.value ? 'text-secondary' : 'text-gray-400'} />
                        <span className="text-xs font-semibold">{v.label}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 leading-tight">{v.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders Area */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              
              {/* Speed Slider */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Speed (Tempo)</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-primary font-mono font-semibold">{speed.toFixed(1)}x</span>
                    {speed !== 1.0 && (
                      <button
                        onClick={() => setSpeed(1.0)}
                        className="text-gray-500 hover:text-white transition-colors"
                        title="Reset to 1.0x"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range" min="0.5" max="2" step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-primary bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Pitch Slider */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pitch (Frequency)</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-primary font-mono font-semibold">{pitch.toFixed(1)}</span>
                    {pitch !== 1.0 && (
                      <button
                        onClick={() => setPitch(1.0)}
                        className="text-gray-500 hover:text-white transition-colors"
                        title="Reset to 1.0"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range" min="0.5" max="2" step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-primary bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Persistent Settings Saving */}
            <div className="pt-2">
              <button
                onClick={handleSaveDefaults}
                className="w-full btn-secondary flex items-center justify-center space-x-2 py-2.5 text-xs hover:border-primary/40 hover:bg-white/10"
              >
                <Bookmark size={13} />
                <span>Save configurations as default</span>
              </button>
            </div>

            {/* Generate Trigger Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary w-full py-4 mt-4 text-lg shadow-lg hover:shadow-primary/30 flex justify-center items-center gap-2 group transition-all duration-300"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Generating Speech...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="group-hover:animate-pulse" />
                  <span>Generate Voice</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
