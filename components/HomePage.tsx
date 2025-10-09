import React from 'react';
import Statistics from './Statistics';
import ChallengeBanner from './ChallengeBanner';
import PrayerTimes from './PrayerTimes';
import { ListeningStats, QuranChallenge, PrayerSettings } from '../types';
import { AudioIcon } from './icons/AudioIcon';
import { ReadIcon } from './icons/ReadIcon';
import { QuizIcon } from './icons/QuizIcon';
import { RevelationIcon } from './icons/RevelationIcon';
import { KidsIcon } from './icons/KidsIcon';
import { BrainIcon } from './icons/BrainIcon';
import { HistoryIcon } from './icons/HistoryIcon';


type Page = 'home' | 'audio' | 'reading' | 'quiz' | 'asbab' | 'kids' | 'ronaq_mind' | 'history';

interface HomePageProps {
    onNavigate: (page: Page) => void;
    stats: ListeningStats;
    challenge: QuranChallenge | null;
    prayerSettings: PrayerSettings | null;
    remindersEnabled: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, stats, challenge, prayerSettings, remindersEnabled }) => {
    
    const navItems = [
        { page: 'audio', label: 'أنصت', icon: <AudioIcon className="w-10 h-10 mb-3 text-primary" /> },
        { page: 'reading', label: 'اقرأ', icon: <ReadIcon className="w-10 h-10 mb-3 text-primary" /> },
        { page: 'asbab', label: 'تدبر', icon: <RevelationIcon className="w-10 h-10 mb-3 text-primary" /> },
        { page: 'quiz', label: 'فقه وحكمة', icon: <QuizIcon className="w-10 h-10 mb-3 text-primary" /> },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 animate-fade-in">
            <div className="space-y-6">
                <ChallengeBanner challenge={challenge} />
                <Statistics stats={stats} />
                <PrayerTimes prayerSettings={prayerSettings} remindersEnabled={remindersEnabled} />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            onClick={() => onNavigate(item.page as Page)}
                            className="bg-card rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center hover:bg-border-color transform hover:-translate-y-1 transition-all duration-200"
                        >
                            {item.icon}
                            <h2 className="text-lg font-bold text-text-primary">{item.label}</h2>
                        </button>
                    ))}
                </div>

                <div className="pt-4">
                     <button
                        onClick={() => onNavigate('history' as Page)}
                        className="bg-card rounded-xl shadow-md p-6 w-full flex flex-col items-center justify-center text-center hover:bg-border-color transform hover:-translate-y-1 transition-all duration-200"
                    >
                        <HistoryIcon className="w-12 h-12 mb-3 text-primary" />
                        <h2 className="text-xl font-bold text-text-primary">اعرف تاريخك</h2>
                        <p className="text-sm text-text-secondary mt-1">السيرة النبوية، الصحابة، والغزوات</p>
                    </button>
                </div>

                <div className="pt-4">
                     <button
                        onClick={() => onNavigate('ronaq_mind' as Page)}
                        className="bg-card rounded-xl shadow-md p-6 w-full flex flex-col items-center justify-center text-center hover:bg-border-color transform hover:-translate-y-1 transition-all duration-200"
                    >
                        <BrainIcon className="w-12 h-12 mb-3 text-primary" />
                        <h2 className="text-xl font-bold text-text-primary">Ronaq Mind</h2>
                        <p className="text-sm text-text-secondary mt-1">حيث يلتقى الجمال بالذكاء</p>
                    </button>
                </div>

                <div className="pt-4">
                     <button
                        onClick={() => onNavigate('kids' as Page)}
                        className="bg-card rounded-xl shadow-md p-6 w-full flex flex-col items-center justify-center text-center hover:bg-border-color transform hover:-translate-y-1 transition-all duration-200"
                    >
                        <KidsIcon className="w-12 h-12 mb-3 text-primary" />
                        <h2 className="text-xl font-bold text-text-primary">عالم الطفل</h2>
                        <p className="text-sm text-text-secondary mt-1">مغامرات قرآنية وتعاليم إسلامية شيقة</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;