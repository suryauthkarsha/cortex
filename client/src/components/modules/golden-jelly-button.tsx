import React from 'react';

interface GoldenJellyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  kbd?: string;
  className?: string;
  [key: string]: any;
}

export function GoldenJellyButton({ children, onClick, kbd, className = '', ...props }: GoldenJellyButtonProps) {
  return (
    <button className={`btn btn-primary ${className}`} onClick={onClick} {...props}>
      <span className="btn-txt">{children}</span>
      {kbd && <kbd className="btn-kbd">{kbd}</kbd>}
    </button>
  );
}
