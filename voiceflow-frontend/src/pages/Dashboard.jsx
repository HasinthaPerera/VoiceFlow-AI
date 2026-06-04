import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mic2, History, TrendingUp, Clock, Loader2, Play, Square, Sparkles, Lightbulb, ChevronRight } from 'lucide-react';
import { userApi, historyApi, getUser, BASE_URL } from '../api';

function AnimatedNumber({ value, isFloat = false }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = parseFloat(value) || 0;
    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); // easeOutQuad
      const current = start + (target - start) * ease;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {isFloat ? displayValue.toFixed(1) : Math.floor(displayValue).toLocaleString()}
    </span>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insightIndex, setInsightIndex] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const user = getUser();
  const audioRef = useRef(null);

  const insights = [
    "Tip: Adjust speed to 1.1x for a more natural, fast-paced educational narration.",
    "Insight: 72% of users select 'Natural AI Voice' for the best voice cadence and emotion.",
    "Hint: Using Sinhala or Tamil? Make sure to select the correct language option for proper phonetic synthesis.",
    "Pro-tip: If you need to generate longer paragraphs, use the Voice Generator history to download and stitch files together.",
    "System: You have saved over 4 hours of voice production this week!"
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, histData] = await Promise.all([
          userApi.getStats(),
          historyApi.getAll(''),
        ]);
        setStats(statsData);
        setRecentActivity((histData.items || []).slice(0, 3));
      } catch (_) {
        // Backend not running - use fallback zeros
        setStats({ characters_used: 0, character_limit: 100000, voices_generated: 0, hours_saved: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % insights.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlayActivity = (item) => {
    if (!item.audio_url) return;
    const fullUrl = `${BASE_URL}${item.audio_url}`;
    
    if (playingId === item.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(fullUrl);
      audioRef.current = audio;
      setPlayingId(item.id);
      audio.play().catch(err => {
        console.error("Audio playback failed", err);
        setPlayingId(null);
      });
      audio.onended = () => setPlayingId(null);
    }
  };

  const pct = stats ? Math.min((stats.characters_used / stats.character_limit) * 100, 100) : 0;
  
  // Chart calculation
  const usageData = [2100, 4300, 1200, 8900, 5400, 7800, stats?.characters_used ? (stats.characters_used % 12000) + 1000 : 3500];
  const chartHeight = 85; 
  const chartWidth = 500;
  const maxUsage = Math.max(...usageData, 1000);
  const points = usageData.map((val, idx) => {
    const x = (idx / (usageData.length - 1)) * chartWidth;
    const y = chartHeight - (val / maxUsage) * (chartHeight - 20) - 10;
    return { x, y };
  });
  
  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const fillD = `${pathD} L ${chartWidth} 100 L 0 100 Z`;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const statCards = stats
    ? [
        { 
          label: 'Characters Used', 
          value: stats.characters_used, 
          total: stats.character_limit.toLocaleString(), 
          icon: TrendingUp, 
          color: 'text-blue-500',
          isFloat: false
        },
        { 
          label: 'Voices Generated', 
          value: stats.voices_generated, 
          icon: Mic2, 
          color: 'text-primary',
          isFloat: false
        },
        { 
          label: 'Hours Saved', 
          value: stats.hours_saved, 
          icon: Clock, 
          color: 'text-green-500',
          isFloat: true
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Here's an overview of your usage.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl px-4 py-2 text-sm text-gray-300 font-medium">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <span>Premium Tier Account</span>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center text-gray-400 gap-3">
          <Loader2 className="animate-spin" size={20} /> Loading stats...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, idx) => (
            <div key={idx} className="glass-panel p-6 flex items-center justify-between hover:border-white/10 transition-colors duration-300">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    <stat.icon size={18} />
                  </div>
                  <span className="text-gray-400 font-medium text-sm">{stat.label}</span>
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  <AnimatedNumber value={stat.value} isFloat={stat.isFloat} />
                </h3>
                {stat.total && (
                  <p className="text-gray-500 text-xs font-mono">
                    Limit: {stat.total}
                  </p>
                )}
              </div>
              
              {/* Radial Progress Ring for Character limit */}
              {stat.label === 'Characters Used' && (
                <div className="relative flex items-center justify-center w-16 h-16 ml-4 flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      className="text-white/5"
                      strokeWidth="5"
                      stroke="currentColor"
                      fill="transparent"
                      r="24"
                      cx="32"
                      cy="32"
                    />
                    <circle
                      className="text-primary transition-all duration-1000 ease-out"
                      strokeWidth="5"
                      strokeDasharray={2 * Math.PI * 24} 
                      strokeDashoffset={2 * Math.PI * 24 - (pct / 100) * 2 * Math.PI * 24}
                      strokeLinecap="round"
                      stroke="url(#progressGradient)"
                      fill="transparent"
                      r="24"
                      cx="32"
                      cy="32"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-[10px] font-mono text-gray-300 font-bold">
                    {Math.round(pct)}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SVG Sparkline Usage Chart */}
      {!loading && (
        <div className="glass-panel p-6 hover:border-white/10 transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Usage Analytics</h2>
              <p className="text-sm text-gray-400 mt-0.5">Daily character generation trend (last 7 days)</p>
            </div>
            <div className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-gray-400 font-mono">
              Active Engine: Cloud Neural
            </div>
          </div>
          
          <div className="relative h-44 w-full bg-black/10 rounded-xl p-4 border border-white/5 flex flex-col justify-end">
            <div className="absolute inset-x-4 top-4 bottom-12">
              <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(99, 102, 241, 0.35)" />
                    <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Guide Lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                
                {/* Area Path */}
                <path
                  d={fillD}
                  fill="url(#chartGradient)"
                  className="transition-all duration-1000 ease-out"
                />
                
                {/* Line Path */}
                <path
                  d={pathD}
                  fill="transparent"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-1000 ease-out"
                />
                
                {/* Data points */}
                {points.map((p, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="#6366f1"
                      stroke="#fff"
                      strokeWidth="1.5"
                      className="hover:r-5 transition-all duration-200"
                    />
                  </g>
                ))}
              </svg>
            </div>
            
            {/* Axis labels */}
            <div className="flex justify-between text-xs text-gray-500 font-medium font-mono px-1">
              {days.map((day, i) => (
                <div key={i} className="text-center w-12">
                  <div>{day}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">{usageData[i].toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Quick Actions & Tips */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link 
                to="/dashboard/generate" 
                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 border border-white/5 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <Mic2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Generate New Voice</h3>
                    <p className="text-gray-400 text-sm">Convert text to lifelike speech</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </Link>
              <Link 
                to="/dashboard/history" 
                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 border border-white/5 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                    <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">View History</h3>
                    <p className="text-gray-400 text-sm">Access your previously generated audios</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </div>
          </div>

          {/* rotating tips/insights */}
          <div className="glass-panel p-5 bg-gradient-to-r from-surface/50 to-primary/5 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                <Lightbulb size={18} />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Dashboard Insights</span>
                <p className="text-gray-300 text-sm leading-relaxed transition-all duration-500 min-h-[40px]">
                  {insights[insightIndex]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity with inline player */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Generations</h2>
            <Link to="/dashboard/history" className="text-primary hover:text-primary/80 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No generations yet. Try generating your first voice!</p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => handlePlayActivity(item)}
                      className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center transition-all duration-300 ${
                        playingId === item.id 
                          ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                          : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white'
                      }`}
                      title={playingId === item.id ? 'Pause' : 'Play Preview'}
                    >
                      {playingId === item.id ? (
                        <Square size={14} fill="currentColor" />
                      ) : (
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">{item.title}</h4>
                      <p className="text-gray-500 text-xs capitalize truncate">{item.voice} • {item.language}</p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs flex-shrink-0 font-medium ml-2">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
