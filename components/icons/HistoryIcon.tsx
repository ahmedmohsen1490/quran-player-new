import React from 'react';

export const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 21V10.875A4.125 4.125 0 018.625 6.75h6.75c2.278 0 4.125 1.847 4.125 4.125V21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-6.375a3.375 3.375 0 013.375-3.375h.001c1.862 0 3.374 1.512 3.374 3.375V21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3.75" />
    </svg>
);
