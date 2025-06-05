import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import splashAnimationMobile from '../SplashScreen.json';
import splashAnimationDesktop from '../SplashScreenDesktop.json';
import { isMobileDevice } from '../utils/deviceUtils';
// Removed Leaf import - using logo image instead

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());
  const [isVisible, setIsVisible] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Progressive animation stages for desktop with smoother timings
    if (!isMobile) {
      const timers: NodeJS.Timeout[] = [];
      
      // Stage 1: Background and particles - immediate
      timers.push(setTimeout(() => setAnimationStage(1), 0));
      
      // Stage 2: Logo appears - smoother entry at 300ms
      timers.push(setTimeout(() => setAnimationStage(2), 300));
      
      // Stage 3: Text fades in - overlap with logo at 800ms
      timers.push(setTimeout(() => setAnimationStage(3), 800));
      
      // Stage 4: Loading indicator - gentle appearance at 1400ms
      timers.push(setTimeout(() => setAnimationStage(4), 1400));
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [isMobile]);

  useEffect(() => {
    // Fallback timer in case animation doesn't complete
    const fallbackTimer = setTimeout(() => {
      handleComplete();
    }, 4500); // 4.5 seconds fallback

    return () => clearTimeout(fallbackTimer);
  }, []);

  const handleComplete = () => {
    // Add a smooth delay before hiding to ensure natural transition
    setTimeout(() => {
      setIsVisible(false);
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, 600); // Wait for fade out
      }
    }, 400);
  };

  if (!isVisible) {
    return null;
  }

  // Fallback UI if Lottie fails to load
  if (hasError) {
    return (
      <div 
        className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="TanaMind Logo" 
            className="w-32 h-32 mb-6 animate-pulse"
            onError={() => {
              // If logo fails to load, use a simple div
              const logoElement = document.querySelector('.splash-logo-fallback');
              if (logoElement) {
                logoElement.innerHTML = '<div class="w-32 h-32 bg-green-600 rounded-full"></div>';
              }
            }}
          />
          <h1 className="text-3xl font-bold text-green-600 mb-2">TanaMind</h1>
          <p className="text-gray-600 mb-8">Smart Plant Watering System</p>
          <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full w-1/3 bg-green-600 rounded-full"
              style={{
                animation: 'slideLoading 1.5s infinite ease-in-out'
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile splash screen - use existing animation as is
  if (isMobile) {
    return (
      <div 
        className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-full h-full max-w-screen-2xl max-h-screen mx-auto">
          <Lottie
            animationData={splashAnimationMobile}
            loop={false}
            autoplay={true}
            onComplete={handleComplete}
            onError={() => setHasError(true)}
            className="w-full h-full"
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice'
            }}
          />
        </div>
      </div>
    );
  }

  // Desktop splash screen - natural and smooth
  return (
    <div 
      className={`fixed inset-0 z-[9999] transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 40%, #e6f7ed 70%, #dcfce7 100%)'
      }}
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Soft gradient orbs */}
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 25s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            transform: animationStage >= 1 ? 'scale(1)' : 'scale(0.8)',
            transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(74, 222, 128, 0.25) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 30s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse',
            animationDelay: '2s',
            transform: animationStage >= 1 ? 'scale(1)' : 'scale(0.8)',
            transition: 'transform 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s'
          }}
        />
        
        {/* Subtle background animation with fade */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-2000 ${
          animationStage >= 1 ? 'opacity-10' : 'opacity-0'
        }`}>
          <Lottie
            animationData={splashAnimationDesktop}
            loop={false}
            autoplay={true}
            className="w-full h-full"
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice'
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Logo */}
        <div className={`transition-all duration-1500 cubic-bezier(0.34, 1.56, 0.64, 1) transform ${
          animationStage >= 2 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-12 scale-90'
        }`}>
          <div className="relative mb-12">
            {/* Soft glow behind logo with pulse */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 60%)',
                filter: 'blur(30px)',
                transform: animationStage >= 2 ? 'scale(1.8)' : 'scale(1.2)',
                opacity: animationStage >= 2 ? 0.4 : 0,
                transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: animationStage >= 2 ? 'subtlePulse 4s ease-in-out infinite' : 'none'
              }}
            />
            
            {/* Logo container with enhanced shadow */}
            <div className="relative bg-white rounded-full p-6 shadow-2xl"
                 style={{
                   boxShadow: animationStage >= 2 
                     ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(34, 197, 94, 0.1)' 
                     : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                 }}>
              <img 
                src="/src/logo.png" 
                alt="TanaMind Logo"
                className="w-20 h-20 object-contain transition-all duration-[2000ms] ease-out"
                style={{
                  animation: animationStage >= 2 ? 'organic-breathe 8s cubic-bezier(0.4, 0, 0.2, 1) infinite' : 'none',
                  transform: animationStage >= 2 ? 'scale(1)' : 'scale(0.8)',
                  filter: animationStage >= 2 ? 'brightness(1)' : 'brightness(0.9)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Brand text */}
        <div className={`transition-all duration-1800 cubic-bezier(0.25, 0.46, 0.45, 0.94) ${
          animationStage >= 3 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-6'
        }`}
             style={{
               transitionDelay: animationStage >= 3 ? '200ms' : '0ms'
             }}>
          <h1 className="text-5xl md:text-6xl font-bold text-[#0B9444] mb-4"
              style={{
                letterSpacing: animationStage >= 3 ? '0.02em' : '0em',
                transition: 'letter-spacing 1s ease-out'
              }}>
            <span className="inline-block" style={{
              transform: animationStage >= 3 ? 'translateX(0)' : 'translateX(-10px)',
              opacity: animationStage >= 3 ? 1 : 0,
              transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}>Tana</span>
            <span className="inline-block" style={{
              transform: animationStage >= 3 ? 'translateX(0)' : 'translateX(10px)',
              opacity: animationStage >= 3 ? 1 : 0,
              transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s'
            }}>Mind</span>
          </h1>
          
          <p className="text-lg text-gray-600 font-medium tracking-wide text-center overflow-hidden">
            {['S', 'M', 'A', 'R', 'T', ' ', 'P', 'L', 'A', 'N', 'T', ' ', 'C', 'A', 'R', 'E'].map((letter, index) => (
              <span 
                key={index} 
                className="inline-block"
                style={{
                  transform: animationStage >= 3 ? 'translateY(0)' : 'translateY(20px)',
                  opacity: animationStage >= 3 ? 1 : 0,
                  transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${300 + index * 30}ms`
                }}
              >
                {letter}
              </span>
            ))}
          </p>
        </div>

        {/* Loading indicator */}
        <div className={`mt-16 transition-all duration-1500 cubic-bezier(0.25, 0.46, 0.45, 0.94) ${
          animationStage >= 4 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-8 scale-75'
        }`}>
          <div className="flex items-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-green-500 rounded-full transition-all duration-300"
                style={{
                  animation: animationStage >= 4 ? 'organic-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                  animationDelay: `${i * 0.15}s`,
                  transform: animationStage >= 4 ? 'scale(1)' : 'scale(0)'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS for natural animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }

        @keyframes organic-breathe {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          25% {
            transform: scale(1.05);
            filter: brightness(1.05);
          }
          50% {
            transform: scale(1.02);
            filter: brightness(1.02);
          }
          75% {
            transform: scale(1.07);
            filter: brightness(1.03);
          }
        }

        @keyframes organic-rotate {
          0% {
            transform: rotate(0deg) scale(1);
          }
          20% {
            transform: rotate(3deg) scale(1.02);
          }
          40% {
            transform: rotate(-2deg) scale(1);
          }
          60% {
            transform: rotate(2deg) scale(1.01);
          }
          80% {
            transform: rotate(-3deg) scale(0.99);
          }
          100% {
            transform: rotate(0deg) scale(1);
          }
        }

        @keyframes gentle-rotate {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(5deg) scale(1.05);
          }
          50% {
            transform: rotate(0deg) scale(1);
          }
          75% {
            transform: rotate(-5deg) scale(1.05);
          }
        }

        @keyframes organic-pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }

        @keyframes subtlePulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1.8);
          }
          50% {
            opacity: 0.6;
            transform: scale(2);
          }
        }

        @keyframes gentle-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes slideLoading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;