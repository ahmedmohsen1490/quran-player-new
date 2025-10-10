import React from 'react';

export const VoiceAnalysisIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" opacity="0.3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 4.5l-7.5 7.5 7.5 7.5" opacity="0.3"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3m3 0h3m3 0h3m3 0h3" />
    </svg>
);
