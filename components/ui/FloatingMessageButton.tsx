import React from 'react';
import { FiMessageCircle } from 'react-icons/fi';

interface FloatingMessageButtonProps {
  onClick?: () => void;
}

export default function FloatingMessageButton({ onClick }: FloatingMessageButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
      aria-label="Open chat"
    >
      <FiMessageCircle size={24} />
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
    </button>
  );
}
