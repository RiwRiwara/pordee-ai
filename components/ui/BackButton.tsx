'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

const BackButton = ({ href, label, className = '' }: BackButtonProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      isIconOnly={!label}
      variant="light"
      className={`${className} flex items-center justify-center`}
      onPress={handleBack}
      aria-label="Go back"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="h-5 w-5"
      >
        <path 
          fillRule="evenodd" 
          d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" 
          clipRule="evenodd" 
        />
      </svg>
      {label && <span className="ml-1">{label}</span>}
    </Button>
  );
};

export default BackButton;
