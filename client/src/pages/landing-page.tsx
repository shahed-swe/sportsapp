import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';

// Import screenshots (will be replaced with actual full-size screenshots)
import homeScreenshot from '@assets/image_1754382026747.png';
import feedScreenshot from '@assets/image_1754382314732.png';
import cricketScreenshot from '@assets/image_1754382387047.png';
import newsScreenshot from '@assets/image_1754382421558.png';
import tryoutsScreenshot from '@assets/image_1754382472098.png';
import drillsScreenshot from '@assets/image_1754382494571.png';

interface LandingSlide {
  id: number;
  image: string;
  title: string;
  description: string;
}

const slides: LandingSlide[] = [
  {
    id: 1,
    image: homeScreenshot,
    title: 'Home',
    description: 'Ultimate sports network hub where athletes and fans unite to share and grow together.'
  },
  {
    id: 2,
    image: feedScreenshot,
    title: 'Feed',
    description: 'Share your sports journey, interact with community, and earn points for engagement.'
  },
  {
    id: 3,
    image: cricketScreenshot,
    title: 'Cricket Coaching',
    description: 'AI-powered video analysis improves your batting and bowling with personalized feedback.'
  },
  {
    id: 4,
    image: newsScreenshot,
    title: 'Sports News',
    description: 'Latest sports updates from around the world with priority Indian sports coverage.'
  },
  {
    id: 5,
    image: tryoutsScreenshot,
    title: 'Tryouts',
    description: 'Apply for sports tryouts, showcase your skills, and get discovered by talent scouts.'
  },
  {
    id: 6,
    image: drillsScreenshot,
    title: 'Do Drills & Earn',
    description: 'Upload drill videos across multiple sports and earn points for approved submissions.'
  }
];



export default function LandingPage(): React.JSX.Element {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 4500); // 4.5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  };

  const handleSignupClick = () => {
    setLocation('/auth');
  };

  return (
    <div className="landing-page min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-green-800 relative overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      {/* Main Container */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 pt-16 pb-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-2" 
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            <span className="text-white">SPORTS</span>
            <span className="text-yellow-300">APP</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-blue-100 font-medium mb-1"
          >
            The Ultimate Sports Community
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl font-bold tracking-wide flex items-center justify-center gap-2 relative"
          >
            {/* Stars decoration */}
            <span className="absolute -left-8 text-yellow-300 animate-pulse">✨</span>
            <span className="absolute -right-8 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }}>✨</span>
            <span className="absolute -top-2 -left-4 text-yellow-200 text-sm animate-bounce" style={{ animationDelay: '1s' }}>⭐</span>
            <span className="absolute -top-2 -right-4 text-yellow-200 text-sm animate-bounce" style={{ animationDelay: '1.5s' }}>⭐</span>
            
            <DollarSign className="h-5 w-5 text-yellow-400 animate-pulse" />
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
              Earn money for likes
            </span>
          </motion.div>
        </div>

        {/* Carousel Container */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-8 pb-8 mt-4">
          <div className="w-full max-w-4xl">
            {/* Main Carousel */}
            <div className="relative h-[50vh] md:h-[60vh] bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <img
                    src={slides[currentIndex].image}
                    alt={slides[currentIndex].title}
                    className="w-full h-full object-contain p-6"
                  />
                  
                  {/* Overlay Content */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pb-6 pt-12 px-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-center"
                    >
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {slides[currentIndex].title}
                      </h2>
                      <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-2xl mx-auto line-clamp-2">
                        {slides[currentIndex].description}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-slate-900/40 via-blue-900/40 to-green-800/40 hover:from-slate-800/50 hover:via-blue-800/50 hover:to-green-700/50 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group shadow-lg"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
                }}
              >
                <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))' }} />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-slate-900/40 via-blue-900/40 to-green-800/40 hover:from-slate-800/50 hover:via-blue-800/50 hover:to-green-700/50 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group shadow-lg"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
                }}
              >
                <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))' }} />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-3 mb-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-12 h-3 bg-gradient-to-r from-blue-400 to-green-400 rounded-full' 
                      : 'w-3 h-3 bg-white/40 hover:bg-white/60 rounded-full'
                  }`}
                />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-1 mb-8">
              <motion.div
                className="h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.5, ease: "linear" }}
                key={currentIndex}
              />
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Button
                  onClick={handleSignupClick}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold py-4 px-12 text-xl rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Signup to SportsApp
                </Button>
                <p className="text-white/80 mt-4 text-lg">
                  Join thousands of athletes and sports fans today
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}