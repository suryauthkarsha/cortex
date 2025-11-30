import React from 'react';

interface JellyPearlButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}

export function JellyPearlButton({ children, onClick, className = '', ...props }: JellyPearlButtonProps) {
  return (
    <button className={`jelly-pearl-button ${className}`} onClick={onClick} {...props}>
      <div className="jelly-pearl-wrap">
        <p>
          <span className="jelly-icon-wrapper">
            <span className="jelly-icon-1">✧</span>
            <span className="jelly-icon-2">✦</span>
          </span>
          {children}
        </p>
      </div>
    </button>
  );
}
