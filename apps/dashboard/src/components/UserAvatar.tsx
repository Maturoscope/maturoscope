'use client';

import React from 'react';
import Image from 'next/image';
interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar = ({ src, alt = 'User Avatar', size = 'md', className = '' }: UserAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const fallbackInitial = alt.charAt(0).toUpperCase();

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="rounded-full object-cover border-2 border-gray-200"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold border-2 border-gray-200`}>
          {fallbackInitial}
        </div>
      )}
    </div>
  );
};
