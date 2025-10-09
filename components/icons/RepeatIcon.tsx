import React from 'react';

export const RepeatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 11a8.1 8.1 0 00-15.5 2m.5-6H20v5h-5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 4l5 5-5 5" />
  </svg>
);
