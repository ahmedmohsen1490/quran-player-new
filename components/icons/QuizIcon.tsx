import React from 'react';

export const QuizIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-3.5 3.5M12 3l3.5 3.5M2 12h20" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 14.364A5.002 5.002 0 013 18.25m14.728-3.886a5.002 5.002 0 00-2.636 3.886" />
    </svg>
);
