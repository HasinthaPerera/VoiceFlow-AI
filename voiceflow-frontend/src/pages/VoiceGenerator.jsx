import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, Square, Download, Settings2, Loader2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { ttsApi, BASE_URL } from '../api';

export default function VoiceGenerator() {
  const location = useLocation();
  const stateDefaults = location.state || {};
  const savedDefaults = JSON.parse(localStorage.getItem('voiceflow_tts_defaults') || '{}');
  
  const [text, setText] = useState(stateDefaults.text || '');
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

  const audioRef = useRef(null);
  const MAX_CHARS = 5000;

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

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

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
      const data = await ttsApi.generate(text, language, voice, speed, pitch);
      // data.audio_url is a relative path like /api/tts/audio/<filename>
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
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `voiceflow_${Date.now()}.mp3`;
    a.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Text copied to clipboard');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Hidden audio element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Left Column - Main Editor */}
      <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
        <div className="glass-panel p-6 flex-1 flex flex-col relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Text to Speech Editor</h2>
            <div className="flex space-x-2">
              <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors">
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="flex-1 w-full bg-transparent resize-none outline-none text-gray-200 placeholder-gray-600 text-lg leading-relaxed custom-scrollbar"
            maxLength={MAX_CHARS}
          />

          <div className="absolute bottom-6 right-6 text-sm text-gray-500 font-medium">
            <span className={text.length > MAX_CHARS * 0.9 ? 'text-red-400' : ''}>
              {text.length}
            </span>
            <span> / {MAX_CHARS}</span>
          </div>
        </div>

        {/* Audio Player (Visible when ready) */}
        {audioUrl && (
          <div className="glass-panel p-4 flex items-center justify-between border border-primary/20 bg-primary/5 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
              </button>
              <div>
                <h4 className="text-white font-medium text-sm">Generated Audio</h4>
                <div className="text-xs text-gray-400 mt-1">{formatTime(currentTime)} / {formatTime(duration)}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Live waveform visualizer */}
              <div className="hidden sm:flex items-center space-x-1 mr-4 h-6">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-primary/60 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
                    style={{ height: `${20 + Math.sin(i * 0.8) * 12}px`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <button onClick={handleDownload} className="btn-secondary flex items-center space-x-2 py-2 px-4 text-sm">
                <Download size={16} />
                <span>Download MP3</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Controls */}
      <div className="space-y-6">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-white/5">
            <Settings2 className="text-primary" />
            <h3 className="text-lg font-semibold text-white">Voice Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field appearance-none"
              >
                <option value="english">English (US)</option>
                <option value="sinhala">Sinhala</option>
                <option value="tamil">Tamil</option>
                <option value="hindi">Hindi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Voice Type</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="input-field appearance-none"
              >
                <option value="natural">Natural AI Voice (Recommended)</option>
                <option value="male">Standard Male</option>
                <option value="female">Standard Female</option>
                <option value="robotic">Robotic / Synthetic</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">Speed</label>
                <span className="text-xs text-primary font-mono">{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range" min="0.5" max="2" step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-primary bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">Pitch</label>
                <span className="text-xs text-primary font-mono">{pitch.toFixed(1)}</span>
              </div>
              <input
                type="range" min="0.5" max="2" step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-primary bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary w-full py-4 mt-6 text-lg shadow-primary/30 flex justify-center items-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Generating Speech...
              </>
            ) : (
              'Generate Voice'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
