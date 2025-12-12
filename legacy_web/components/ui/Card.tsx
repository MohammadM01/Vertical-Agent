import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md ${noPadding ? '' : 'p-6'} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </div>
  );
};
