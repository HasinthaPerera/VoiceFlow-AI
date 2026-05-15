import { Link } from 'react-router-dom';
import { Mic2, PlayCircle, Settings2, Download, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const features = [
    { icon: Mic2, title: 'Natural AI Voices', desc: 'Industry-leading AI voices that sound just like human speech.' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Generate high-quality audio in seconds, not minutes.' },
    { icon: Settings2, title: 'Fine-tune Control', desc: 'Adjust speed, pitch, and emotion for perfect delivery.' },
    { icon: Download, title: 'Export Anywhere', desc: 'Download as MP3 or WAV for use in any of your projects.' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center pt-20 pb-16 px-4">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center z-10 relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-[0_0_60px_rgba(99,102,241,0.5)] relative"
        >
          <Mic2 size={48} />
          {/* Animated rings */}
          <div className="absolute inset-0 border border-primary rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-[-20px] border border-secondary rounded-full animate-pulse opacity-10"></div>
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
        >
          Transform Text into <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Lifelike Speech
          </span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
        >
          Generate studio-quality voiceovers in seconds. Choose from hundreds of voices across 20+ languages for your videos, podcasts, and presentations.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <Link to="/register" className="btn-primary w-full sm:w-auto text-lg px-8 py-3 flex items-center justify-center space-x-2">
            <span>Start Generating Free</span>
            <PlayCircle size={20} />
          </Link>
          <a href="#features" className="btn-secondary w-full sm:w-auto text-lg px-8 py-3">
            View Features
          </a>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div id="features" className="max-w-7xl mx-auto mt-32 grid md:grid-cols-2 gap-8 z-10 w-full">
        {features.map((feature, idx) => (
          <motion.div 
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 + (idx * 0.1) }}
            className="glass-panel p-8 hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
              <feature.icon size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
