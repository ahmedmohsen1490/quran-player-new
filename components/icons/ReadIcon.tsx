import React from 'react';

export const ReadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h1.5a6 6 0 016 6v0a6 6 0 01-6 6H3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 4.5h-1.5a6 6 0 00-6 6v0a6 6 0 006 6H21" />
    </svg>
);
