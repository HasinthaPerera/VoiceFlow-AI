import { useState, useEffect } from 'react';
import { Play, Download, Search, Calendar, Clock, MoreVertical, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { historyApi, ttsApi, BASE_URL } from '../api';

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const audioRefs = {};

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

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await historyApi.delete(id);
      toast.success('Deleted');
      setHistoryData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const formatDuration = (secs) => {
    if (!secs) return '--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePlay = (item) => {
    if (!item.audio_url) return;
    const fullUrl = `${BASE_URL}${item.audio_url}`;
    if (playingId === item.id) {
      // Pause
      if (audioRefs[item.id]) audioRefs[item.id].pause();
      setPlayingId(null);
    } else {
      // Stop any current
      Object.values(audioRefs).forEach((a) => a && a.pause());
      setPlayingId(item.id);
      const audio = new Audio(fullUrl);
      audioRefs[item.id] = audio;
      audio.play();
      audio.onended = () => setPlayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">History</h1>
          <p className="text-gray-400">Manage and download your previously generated voices.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="input-field pl-10 bg-surface"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="animate-spin mr-3" size={24} />
            Loading history...
          </div>
        ) : historyData.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No generations yet.</p>
            <p className="text-sm mt-1">Go to the Generator tab to create your first voice!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-sm border-b border-white/5">
                  <th className="p-4 font-medium">Title / Text Preview</th>
                  <th className="p-4 font-medium hidden md:table-cell">Language &amp; Voice</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Date</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {historyData.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handlePlay(item)}
                          className="w-10 h-10 rounded-full bg-primary/10 text-primary flex flex-shrink-0 items-center justify-center hover:bg-primary hover:text-white transition-colors"
                        >
                          {playingId === item.id ? (
                            <div className="w-3 h-3 bg-current rounded-sm" />
                          ) : (
                            <Play size={16} fill="currentColor" className="ml-1" />
                          )}
                        </button>
                        <div>
                          <h4 className="text-white font-medium">{item.title}</h4>
                          <p className="text-gray-500 text-sm truncate max-w-[200px] lg:max-w-[300px]">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="text-white text-sm capitalize">{item.language}</span>
                        <span className="text-gray-500 text-xs capitalize">{item.voice}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex items-center text-gray-400 text-sm space-x-2">
                        <Calendar size={14} />
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="flex items-center text-gray-500 text-xs mr-4 hidden xl:flex">
                          <Clock size={12} className="mr-1" /> {formatDuration(item.duration)}
                        </div>
                        {item.audio_url && (
                          <a
                            href={`${BASE_URL}${item.audio_url}`}
                            download={`voiceflow_${item.id}.mp3`}
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                            title="Download"
                          >
                            <Download size={18} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
