import React from 'react';

export const AudioWaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
            {`
                .wave-bar1 { animation: wave 1.2s linear infinite; animation-delay: 0s; }
                .wave-bar2 { animation: wave 1.2s linear infinite; animation-delay: 0.2s; }
                .wave-bar3 { animation: wave 1.2s linear infinite; animation-delay: 0.4s; }
                .wave-bar4 { animation: wave 1.2s linear infinite; animation-delay: 0.6s; }
                @keyframes wave {
                    0% { transform: scaleY(0.3); }
                    20% { transform: scaleY(1); }
                    40% { transform: scaleY(0.3); }
                    100% { transform: scaleY(0.3); }
                }
            `}
        </style>
        <rect className="wave-bar1" x="4" y="6" width="2" height="12" rx="1" fill="currentColor" style={{ transformOrigin: 'center' }}/>
        <rect className="wave-bar2" x="9" y="6" width="2" height="12" rx="1" fill="currentColor" style={{ transformOrigin: 'center' }}/>
        <rect className="wave-bar3" x="14" y="6" width="2" height="12" rx="1" fill="currentColor" style={{ transformOrigin: 'center' }}/>
        <rect className="wave-bar4" x="19" y="6" width="2" height="12" rx="1" fill="currentColor" style={{ transformOrigin: 'center' }}/>
    </svg>
);
