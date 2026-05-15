import { Play, Download, Search, Calendar, Clock, MoreVertical } from 'lucide-react';

export default function History() {
  const historyData = [
    { id: 1, title: 'Project Presentation Intro', text: 'Welcome everyone to our final presentation...', language: 'English', voice: 'Natural AI', date: '2024-05-15', duration: '0:45' },
    { id: 2, title: 'Tutorial Voiceover Sinhala', text: 'අද අපි කතා කරන්න යන්නේ...', language: 'Sinhala', voice: 'Female', date: '2024-05-14', duration: '2:15' },
    { id: 3, title: 'Advertisement Audio', text: 'Looking for the best quality products?', language: 'English', voice: 'Male', date: '2024-05-12', duration: '0:30' },
    { id: 4, title: 'Tamil Announcement', text: 'அனைவருக்கும் வணக்கம்...', language: 'Tamil', voice: 'Natural AI', date: '2024-05-10', duration: '1:10' },
    { id: 5, title: 'Hindi Story Intro', text: 'एक समय की बात है...', language: 'Hindi', voice: 'Female', date: '2024-05-08', duration: '3:20' },
  ];

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
          />
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-sm border-b border-white/5">
                <th className="p-4 font-medium">Title / Text Preview</th>
                <th className="p-4 font-medium hidden md:table-cell">Language & Voice</th>
                <th className="p-4 font-medium hidden sm:table-cell">Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {historyData.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center space-x-4">
                      <button className="w-10 h-10 rounded-full bg-primary/10 text-primary flex flex-shrink-0 items-center justify-center hover:bg-primary hover:text-white transition-colors">
                        <Play size={16} fill="currentColor" className="ml-1" />
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
                      <span className="text-white text-sm">{item.language}</span>
                      <span className="text-gray-500 text-xs">{item.voice}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="flex items-center text-gray-400 text-sm space-x-2">
                      <Calendar size={14} />
                      <span>{item.date}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="flex items-center text-gray-500 text-xs mr-4 hidden xl:flex">
                        <Clock size={12} className="mr-1" /> {item.duration}
                      </div>
                      <button className="p-2 text-gray-400 hover:text-primary transition-colors tooltip" title="Download">
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
