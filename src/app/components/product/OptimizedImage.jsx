"use client";
import React from 'react';
import Image from 'next/image';

const OptimizedImage = ({
  src,
  alt = '',
  width = 300,
  height = 300,
  className = '',
  ...props
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src || '/images/placeholder-product.png'}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        onError={(e) => {
          e.target.src = '/images/placeholder-product.png';
        }}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
