import React from 'react';

export const CounselorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c.243 0 .482-.017.716-.05M12 21c-.243 0-.482-.017-.716-.05M3.284 14.253A9.004 9.004 0 0112 3c4.968 0 9 4.032 9 9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v.05m0-16.05a9 9 0 00-5.716 1.747M12 3a9 9 0 015.716 1.747" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75a.75.75 0 010-1.5.75.75 0 010 1.5zm4.5 0a.75.75 0 010-1.5.75.75 0 010 1.5z" />
    </svg>
);