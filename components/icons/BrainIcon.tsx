import React from 'react';

export const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" opacity="0.5"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25a3 3 0 100-6 3 3 0 000 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.21 15.79a3 3 0 10-4.42-4.42 3 3 0 004.42 4.42z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.21 15.79a3 3 0 10-4.42-4.42 3 3 0 004.42 4.42z" />
    </svg>
);
