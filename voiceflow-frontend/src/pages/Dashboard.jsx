import { Link } from 'react-router-dom';
import { Mic2, History, TrendingUp, Clock } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Characters Used', value: '12,450', total: '100,000', icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Voices Generated', value: '34', icon: Mic2, color: 'text-primary' },
    { label: 'Hours Saved', value: '12.5', icon: Clock, color: 'text-green-500' },
  ];

  const recentActivity = [
    { title: 'Welcome Audio', language: 'English', voice: 'Natural AI', time: '2 hours ago' },
    { title: 'Podcast Intro', language: 'Sinhala', voice: 'Male', time: '1 day ago' },
    { title: 'Explainer Video', language: 'Tamil', voice: 'Female', time: '3 days ago' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's an overview of your usage.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-panel p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 font-medium">
              {stat.label} {stat.total && <span className="text-gray-500 text-sm">/ {stat.total}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/dashboard/generate" className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Mic2 size={24} />
              </div>
              <div>
                <h3 className="text-white font-medium">Generate New Voice</h3>
                <p className="text-gray-400 text-sm">Convert text to lifelike speech</p>
              </div>
            </Link>
            <Link to="/dashboard/history" className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
              <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                <History size={24} />
              </div>
              <div>
                <h3 className="text-white font-medium">View History</h3>
                <p className="text-gray-400 text-sm">Access your previously generated audios</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Generations</h2>
            <Link to="/dashboard/history" className="text-primary hover:text-primary/80 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-gray-400">
                    <Mic2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">{activity.title}</h4>
                    <p className="text-gray-500 text-xs">{activity.voice} • {activity.language}</p>
                  </div>
                </div>
                <span className="text-gray-500 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
