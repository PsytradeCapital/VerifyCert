import React from 'react';

interface SkeletonLoaderProps {
  lines?: number;
  height?: string;
  className?: string;
}

export default function SkeletonLoader({ 
  lines = 3, 
  height = 'h-4', 
  className = '' 
}: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-300 rounded ${height} mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-300 rounded-lg h-48 mb-4" />
      <div className="space-y-2">
        <div className="bg-gray-300 rounded h-4 w-full" />
        <div className="bg-gray-300 rounded h-4 w-3/4" />
        <div className="bg-gray-300 rounded h-4 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="animate-pulse flex space-x-4">
          <div className="bg-gray-300 rounded-full h-10 w-10" />
          <div className="flex-1 space-y-2 py-1">
            <div className="bg-gray-300 rounded h-4 w-3/4" />
            <div className="bg-gray-300 rounded h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}