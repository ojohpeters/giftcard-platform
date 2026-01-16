"use client";
import React from 'react';
import { Zap } from 'lucide-react';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loading({ 
  fullScreen = false, 
  message,
  size = 'md' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 16,
    md: 32,
    lg: 48
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* MAIN LOADER */}
      <div className="relative">
        {/* OUTER ROTATING RING */}
        <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-2xl animate-spin`} style={{ 
          borderTopColor: '#2563eb',
          borderRightColor: '#2563eb',
          animationDuration: '1s'
        }} />
        
        {/* INNER PULSING SQUARE */}
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-blue-600 rounded-xl animate-pulse`} style={{
          animationDuration: '1.5s',
          transform: 'scale(0.6)',
          boxShadow: '0 0 20px rgba(37, 99, 235, 0.5)'
        }} />
        
        {/* CENTER ICON */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap 
            size={iconSizes[size]} 
            className="text-white animate-pulse" 
            fill="currentColor"
            style={{ animationDuration: '0.8s' }}
          />
        </div>
      </div>

      {/* LOADING TEXT */}
      {message && (
        <div className="text-center space-y-2">
          <p className="text-sm md:text-base font-black uppercase tracking-widest text-gray-900">
            {message}
          </p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      )}

      {/* BRUTALIST DECORATIVE ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-600/20 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-600/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-600/20 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        <div className="relative">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 md:py-20">
      <div className="relative">
        {content}
      </div>
    </div>
  );
}

// Alternative: Brutalist Block Loader
export function BrutalistLoader({ fullScreen = false, message }: { fullScreen?: boolean; message?: string }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* BRUTALIST BLOCKS ANIMATION */}
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-4 h-16 bg-blue-600 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            style={{
              animation: `brutalistPulse 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* BRAND TEXT */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white p-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-pulse">
          <Zap size={20} fill="currentColor" />
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl font-black uppercase tracking-tighter italic leading-none text-black">HiGc</span>
          <span className="text-blue-600 font-black text-2xl leading-none">.</span>
        </div>
      </div>

      {/* LOADING TEXT */}
      {message && (
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
          {message}
        </p>
      )}

      {/* ANIMATED DOTS */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 md:py-20">
      {content}
    </div>
  );
}

// Minimal inline loader
export function InlineLoader({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  };

  return (
    <div className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin inline-block`} />
  );
}

