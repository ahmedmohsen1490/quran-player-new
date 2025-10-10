import React from 'react';

export const CaliphIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6.375c0-1.02.422-1.97 1.127-2.673L9 6.625l4.873 4.872c.705.704 1.127 1.653 1.127 2.673V21M3 3h12M3 3l5.034 5.034" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 21v-4.5a3 3 0 013-3h3" />
    </svg>
);