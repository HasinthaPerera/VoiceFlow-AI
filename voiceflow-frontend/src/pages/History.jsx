import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Download, Search, Calendar, Clock, Trash2, Loader2, 
  ChevronDown, ChevronUp, Copy, Check, RotateCcw, RotateCw, 
  Volume2, VolumeX, ExternalLink, RefreshCw, SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { historyApi, BASE_URL } from '../api';

export default function History() {
  const navigate = useNavigate();

  // History State
  const [historyData, setHistoryData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters State
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterVoice, setFilterVoice] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Bottom Audio Player State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const audioRef = useRef(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await historyApi.getAll(search);
      setHistoryData(data.items || []);
    } catch (err) {
      toast.error('Could not load history. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search]);

  // Audio Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // ─── Playback Handlers ──────────────────────────────────────────────────────

  const handlePlayToggle = (item) => {
    if (!item.audio_url) return;
    const fullUrl = `${BASE_URL}${item.audio_url}`;

    // Case 1: Toggling play/pause on the same track
    if (currentTrack && currentTrack.id === item.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(err => {
          toast.error("Playback failed.");
          console.error(err);
        });
        setIsPlaying(true);
      }
      return;
    }

    // Case 2: Playing a new track
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(fullUrl);
    audioRef.current = audio;
    audio.volume = isMuted ? 0 : volume;
    audio.playbackRate = playbackSpeed;
    
    setCurrentTrack(item);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(item.duration || 0);

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.play().catch(err => {
      toast.error("Playback failed. File might be missing.");
      console.error(err);
      setIsPlaying(false);
      setCurrentTrack(null);
    });
  };

  const handleSeek = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleSkip = (seconds) => {
    if (audioRef.current) {
      let newTime = audioRef.current.currentTime + seconds;
      if (newTime < 0) newTime = 0;
      if (newTime > duration) newTime = duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // ─── Content Handlers ───────────────────────────────────────────────────────

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this speech synthesis history entry?')) return;
    
    try {
      await historyApi.delete(id);
      toast.success('History entry deleted.');
      setHistoryData((prev) => prev.filter((item) => item.id !== id));
      
      // If deleted track is currently playing, stop and reset player
      if (currentTrack && currentTrack.id === id) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleExpandRow = (id, e) => {
    if (e) e.stopPropagation();
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCopyText = (text, id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Text copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReuseText = (item, e) => {
    if (e) e.stopPropagation();
    navigate('/dashboard/generate', {
      state: {
        text: item.text,
        title: item.title,
        language: item.language,
        voice: item.voice,
        speed: item.speed,
        pitch: item.pitch
      }
    });
  };

  const formatDuration = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ─── Client Filtering & Sorting ────────────────────────────────────────────

  const processedData = historyData
    .filter((item) => {
      const langMatch = filterLanguage === 'all' || item.language.toLowerCase() === filterLanguage.toLowerCase();
      const voiceMatch = filterVoice === 'all' || item.voice.toLowerCase() === filterVoice.toLowerCase();
      return langMatch && voiceMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'chars_high') return (b.char_count || 0) - (a.char_count || 0);
      if (sortBy === 'chars_low') return (a.char_count || 0) - (b.char_count || 0);
      if (sortBy === 'duration_long') return (b.duration || 0) - (a.duration || 0);
      if (sortBy === 'duration_short') return (a.duration || 0) - (b.duration || 0);
      return 0;
    });

  const totalClips = processedData.length;
  const totalChars = processedData.reduce((acc, item) => acc + (item.char_count || 0), 0);
  const totalDuration = processedData.reduce((acc, item) => acc + (item.duration || 0), 0);
  const avgClipSize = totalClips ? Math.round(totalChars / totalClips) : 0;

  return (
    <div className="space-y-6 pb-28">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">History</h1>
          <p className="text-gray-400">View, audit, play, and configure your historical generated audios.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="input-field pl-10 bg-surface border-white/5"
            placeholder="Search title or text contents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Metrics Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glow-card p-5 border border-white/5 flex flex-col justify-between items-center text-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono">Clips Generated</span>
          <span className="text-2xl font-black text-white font-mono mt-1">{totalClips}</span>
          <span className="text-[10px] text-primary font-semibold mt-1">Total Audio Tracks</span>
        </div>
        <div className="glow-card p-5 border border-white/5 flex flex-col justify-between items-center text-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono">Chars Processed</span>
          <span className="text-2xl font-black text-white font-mono mt-1">{totalChars.toLocaleString()}</span>
          <span className="text-[10px] text-secondary font-semibold mt-1">Total Synthesized Chars</span>
        </div>
        <div className="glow-card p-5 border border-white/5 flex flex-col justify-between items-center text-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono">Total Duration</span>
          <span className="text-2xl font-black text-white font-mono mt-1">{formatDuration(totalDuration)}</span>
          <span className="text-[10px] text-blue-400 font-semibold mt-1">Hours/Mins of Audio</span>
        </div>
        <div className="glow-card p-5 border border-white/5 flex flex-col justify-between items-center text-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono">Average Clip Size</span>
          <span className="text-2xl font-black text-white font-mono mt-1">{avgClipSize.toLocaleString()}</span>
          <span className="text-[10px] text-green-400 font-semibold mt-1">Avg Chars per Request</span>
        </div>
      </div>

      {/* Advanced Filters Area */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-400 text-xs font-semibold uppercase tracking-wider self-start sm:self-center">
          <SlidersHorizontal size={14} className="text-primary" />
          <span>Filters & sorting</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
          {/* Language filter */}
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="input-field py-1.5 px-3 text-xs w-full sm:w-36 appearance-none bg-[#13131a]"
          >
            <option value="all">Languages: All</option>
            <option value="english">English</option>
            <option value="sinhala">Sinhala</option>
            <option value="tamil">Tamil</option>
            <option value="hindi">Hindi</option>
          </select>

          {/* Voice type filter */}
          <select
            value={filterVoice}
            onChange={(e) => setFilterVoice(e.target.value)}
            className="input-field py-1.5 px-3 text-xs w-full sm:w-36 appearance-none bg-[#13131a]"
          >
            <option value="all">Voices: All</option>
            <option value="natural">Natural AI</option>
            <option value="male">Standard Male</option>
            <option value="female">Standard Female</option>
            <option value="robotic">Robotic</option>
          </select>

          {/* Sorting filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field py-1.5 px-3 text-xs w-full sm:w-40 appearance-none bg-[#13131a]"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="chars_high">Sort: Characters (High)</option>
            <option value="chars_low">Sort: Characters (Low)</option>
            <option value="duration_long">Sort: Duration (Long)</option>
            <option value="duration_short">Sort: Duration (Short)</option>
          </select>

          {/* Refresh statistics list button */}
          <button
            onClick={fetchHistory}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Reload History"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main History Table/Dashboard */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mr-3 text-primary" size={24} />
            Loading history generations...
          </div>
        ) : processedData.length === 0 ? (
          <div className="text-center py-20 text-gray-500 space-y-2">
            <p className="text-lg font-medium text-white/80">No generations match the criteria.</p>
            <p className="text-sm">Try relaxing your search query or reset filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/3 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={processedData.length > 0 && selectedIds.length === processedData.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(processedData.map(item => item.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="accent-primary rounded bg-black/40 border border-white/10 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 font-semibold w-12"></th>
                  <th className="p-4 font-semibold">Title / Text Contents</th>
                  <th className="p-4 font-semibold hidden md:table-cell">Speech Settings</th>
                  <th className="p-4 font-semibold hidden sm:table-cell">Details & Date</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processedData.map((item) => {
                  const isExpanded = expandedIds.includes(item.id);
                  const isCurrentPlaying = currentTrack && currentTrack.id === item.id;
                  return (
                    <>
                      <tr 
                        key={item.id} 
                        onClick={(e) => toggleExpandRow(item.id, e)}
                        className={`hover:bg-white/3 transition-colors cursor-pointer group select-none ${
                          selectedIds.includes(item.id) ? 'bg-primary/5 hover:bg-primary/10' : ''
                        } ${isExpanded ? 'bg-white/3 border-b-transparent' : ''}`}
                      >
                        {/* Checkbox cell */}
                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => {
                              setSelectedIds(prev => 
                                prev.includes(item.id) 
                                  ? prev.filter(x => x !== item.id) 
                                  : [...prev, item.id]
                              );
                            }}
                            className="accent-primary rounded bg-black/40 border border-white/10 w-4 h-4 cursor-pointer"
                          />
                        </td>

                        {/* Play button cell */}
                        <td className="p-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayToggle(item);
                            }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isCurrentPlaying && isPlaying
                                ? 'bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/10'
                                : 'bg-white/5 text-gray-400 hover:bg-primary hover:text-white border border-white/5 hover:border-transparent'
                            }`}
                          >
                            {isCurrentPlaying && isPlaying ? (
                              <Pause size={14} fill="currentColor" />
                            ) : (
                              <Play size={14} fill="currentColor" className="ml-0.5" />
                            )}
                          </button>
                        </td>

                        {/* Title and truncated text preview */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <h4 className="text-white font-semibold text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                              {item.title || "Untitled Synthesis"}
                              {isCurrentPlaying && (
                                <span className="flex items-center space-x-0.5 h-3 ml-1">
                                  {[...Array(4)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-0.5 bg-primary rounded-full ${isPlaying ? 'animate-wave-bar' : ''}`}
                                      style={{ 
                                        height: '100%', 
                                        animationDelay: `${i * 0.15}s`,
                                        transformOrigin: 'bottom',
                                        animationDuration: '1s'
                                      }}
                                    />
                                  ))}
                                </span>
                              )}
                            </h4>
                            <p className="text-gray-400 text-xs truncate max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-lg font-normal">
                              {item.text}
                            </p>
                          </div>
                        </td>

                        {/* Languages / Voice settings badges */}
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-3xs font-bold bg-white/5 border border-white/5 text-gray-300 capitalize">
                              {item.language}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-3xs font-bold bg-primary/10 border border-primary/10 text-primary capitalize">
                              {item.voice} voice
                            </span>
                          </div>
                        </td>

                        {/* Date and character stats */}
                        <td className="p-4 hidden sm:table-cell">
                          <div className="space-y-1 text-xs text-gray-400">
                            <div className="flex items-center space-x-1.5">
                              <Calendar size={12} className="text-gray-500" />
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 font-mono text-3xs text-gray-500">
                              <span>{item.char_count.toLocaleString()} chars</span>
                              <span>•</span>
                              <span>{formatDuration(item.duration)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Actions buttons */}
                        <td className="p-4">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Reuse Shortcut */}
                            <button
                              onClick={(e) => handleReuseText(item, e)}
                              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all duration-300 hidden md:block"
                              title="Reuse configuration"
                            >
                              <ExternalLink size={14} />
                            </button>

                            {/* Download Anchor */}
                            {item.audio_url && (
                              <a
                                href={`${BASE_URL}${item.audio_url}`}
                                download={`voiceflow_${item.id}.mp3`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all duration-300"
                                title="Download audio"
                              >
                                <Download size={14} />
                              </a>
                            )}

                            {/* Delete Entry */}
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg border border-white/5 hover:border-red-500/10 transition-all duration-300"
                              title="Delete entry"
                            >
                              <Trash2 size={14} />
                            </button>

                            {/* Toggle Details Chevron */}
                            <button
                              onClick={(e) => toggleExpandRow(item.id, e)}
                              className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable row contents */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <tr className="bg-white/1 border-b border-white/5">
                            <td colSpan={6} className="p-0">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 space-y-4">
                                  {/* Title details */}
                                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Generated Text Inspection</span>
                                    <span className="text-2xs text-gray-500">Clip ID: #{item.id}</span>
                                  </div>

                                  {/* Textbox block */}
                                  <div className="relative">
                                    <pre className="p-4 rounded-xl bg-black/40 border border-white/5 font-sans text-gray-300 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto select-text">
                                      {item.text}
                                    </pre>
                                    <button
                                      onClick={(e) => handleCopyText(item.text, item.id, e)}
                                      className="absolute top-3 right-3 p-2 bg-surface hover:bg-white/10 text-gray-400 hover:text-white rounded-lg border border-white/5 shadow-md transition-all duration-300"
                                      title="Copy text"
                                    >
                                      {copiedId === item.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </button>
                                  </div>

                                  {/* Parameters badges */}
                                  <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap gap-2 text-2xs text-gray-400">
                                      <div className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg">
                                        Speed: <span className="font-mono text-white font-bold">{item.speed.toFixed(1)}x</span>
                                      </div>
                                      <div className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg">
                                        Pitch: <span className="font-mono text-white font-bold">{item.pitch.toFixed(1)}</span>
                                      </div>
                                      <div className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg">
                                        Size: <span className="font-mono text-white font-bold">{item.char_count.toLocaleString()} chars</span>
                                      </div>
                                      <div className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg">
                                        Duration: <span className="font-mono text-white font-bold">{formatDuration(item.duration)}</span>
                                      </div>
                                    </div>

                                    {/* Action Links */}
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={(e) => handleReuseText(item, e)}
                                        className="btn-primary py-1.5 px-4 text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-primary/20"
                                      >
                                        <ExternalLink size={12} />
                                        <span>Re-use text in Editor</span>
                                      </button>
                                      {item.audio_url && (
                                        <a
                                          href={`${BASE_URL}${item.audio_url}`}
                                          download={`voiceflow_${item.id}.mp3`}
                                          className="btn-secondary py-1.5 px-4 text-xs font-semibold flex items-center space-x-1.5 bg-white/5 hover:bg-white/10"
                                        >
                                          <Download size={12} />
                                          <span>Download MP3</span>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 80, opacity: 0, x: '-50%' }}
            className="fixed bottom-6 left-[50%] bg-[#121218] border border-primary/30 rounded-full px-6 py-3.5 shadow-[0_20px_50px_rgba(99,102,241,0.25)] flex items-center gap-6 z-50 text-sm font-semibold select-none min-w-[320px] sm:min-w-[420px]"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold font-mono">
                {selectedIds.length}
              </span>
              <span className="text-gray-400">Selected</span>
            </div>
            
            <div className="w-px h-6 bg-white/10"></div>
            
            <div className="flex items-center gap-3">
              {/* Bulk Download */}
              <button
                onClick={() => {
                  toast.success(`Starting download of ${selectedIds.length} audio files...`);
                  selectedIds.forEach((id, idx) => {
                    const item = historyData.find(x => x.id === id);
                    if (item && item.audio_url) {
                      setTimeout(() => {
                        const link = document.createElement('a');
                        link.href = `${BASE_URL}${item.audio_url}`;
                        link.setAttribute('download', `voiceflow_${item.id}.mp3`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }, idx * 400);
                    }
                  });
                }}
                className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Download Selected</span>
                <span className="sm:hidden">Download</span>
              </button>

              {/* Bulk Delete */}
              <button
                onClick={async () => {
                  if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected entries?`)) return;
                  try {
                    await historyApi.bulkDelete(selectedIds);
                    toast.success('Selected entries deleted.');
                    setHistoryData(prev => prev.filter(item => !selectedIds.includes(item.id)));
                    setSelectedIds([]);
                    if (currentTrack && selectedIds.includes(currentTrack.id)) {
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current = null;
                      }
                      setCurrentTrack(null);
                      setIsPlaying(false);
                    }
                  } catch (err) {
                    toast.error('Bulk deletion failed.');
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-white bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full hover:bg-red-500 hover:border-transparent transition-colors"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Delete Selected</span>
                <span className="sm:hidden">Delete</span>
              </button>

              {/* Deselect All */}
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-gray-500 hover:text-gray-300 px-2.5 py-1.5 transition-colors ml-1"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Persistent Bottom Audio Player */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 md:left-64 bg-surface/95 border-t border-white/10 backdrop-blur-xl p-4 shadow-2xl z-40"
          >
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Left Side: Track Details */}
              <div className="flex items-center space-x-3 w-full md:w-1/4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-primary/10">
                  <Mic2Icon size={16} />
                </div>
                <div className="min-w-0">
                  <h5 className="text-white text-sm font-semibold truncate">{currentTrack.title || "Untitled Synthesis"}</h5>
                  <p className="text-gray-400 text-2xs truncate capitalize">{currentTrack.voice} voice • {currentTrack.language}</p>
                </div>
              </div>

              {/* Center Side: Controls & Seek Bar */}
              <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
                <div className="flex items-center space-x-4">
                  {/* Skip Back 10s */}
                  <button 
                    onClick={() => handleSkip(-10)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Skip backward 10s"
                  >
                    <RotateCcw size={16} />
                  </button>

                  {/* Play/Pause toggle */}
                  <button
                    onClick={() => handlePlayToggle(currentTrack)}
                    className="w-10 h-10 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-lg"
                  >
                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                  </button>

                  {/* Skip Forward 10s */}
                  <button 
                    onClick={() => handleSkip(10)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Skip forward 10s"
                  >
                    <RotateCw size={16} />
                  </button>
                </div>

                {/* Progress bar slider */}
                <div className="flex items-center space-x-3 w-full">
                  <span className="text-3xs font-mono text-gray-500 w-8 text-right">{formatDuration(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="flex-1 accent-primary bg-white/10 h-1 rounded appearance-none cursor-pointer"
                  />
                  <span className="text-3xs font-mono text-gray-500 w-8">{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Right Side: Volume & Actions */}
              <div className="flex items-center justify-end space-x-3 w-full md:w-1/4">
                {/* Volume icon & Mute */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="text-gray-400 hover:text-white transition-colors"
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

                {/* Playback speed selector */}
                <div className="flex items-center">
                  <select
                    value={playbackSpeed}
                    onChange={(e) => {
                      const speed = parseFloat(e.target.value);
                      setPlaybackSpeed(speed);
                      if (audioRef.current) {
                        audioRef.current.playbackRate = speed;
                      }
                    }}
                    className="bg-black/50 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-bold font-mono"
                    title="Playback Speed"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="0.8">0.8x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.2">1.2x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2.0">2.0x</option>
                  </select>
                </div>

                {/* Separator */}
                <div className="w-px h-6 bg-white/10 hidden sm:block"></div>

                {/* Close Bottom Player */}
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current = null;
                    }
                    setCurrentTrack(null);
                    setIsPlaying(false);
                  }}
                  className="px-2.5 py-1 text-2xs font-semibold text-gray-400 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Mini-helper for local mic icon to avoid missing references
function Mic2Icon({ size }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="lucide lucide-mic-2"
    >
      <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/>
      <circle cx="17" cy="7" r="5"/>
    </svg>
  );
}
