import React, { useState } from 'react';
import { BackIcon } from './icons/BackIcon';
import { CounselorIcon } from './icons/CounselorIcon';
import { counselorData } from '../data/counselorData';
import { CounselorTopic } from '../types';

// Helper component for content sections
const ContentSection: React.FC<{ title: string; text: string; source: string; }> = ({ title, text, source }) => (
    <div className="p-4 bg-background rounded-lg border border-border-color">
        <h4 className="font-bold text-lg text-primary mb-2">{title}</h4>
        <p className="whitespace-pre-wrap leading-relaxed text-text-secondary">{text}</p>
        <p className="text-xs text-text-secondary/70 mt-3 pt-2 border-t border-dashed border-border-color/50 text-left">
            المصدر: {source}
        </p>
    </div>
);


const PsychologicalCounselor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedTopic, setSelectedTopic] = useState<CounselorTopic | null>(null);

    if (selectedTopic) {
        // Content View
        return (
            <div className="animate-fade-in">
                <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-tajawal">
                    <BackIcon className="w-5 h-5" />
                    <span>العودة للاختيار</span>
                </button>
                <div className="bg-card p-6 rounded-xl shadow-lg space-y-6">
                    <div className="text-center">
                        <span className="text-6xl">{selectedTopic.icon}</span>
                        <h2 className="text-3xl font-bold text-text-primary mt-2">{selectedTopic.title}</h2>
                        <p className="text-text-secondary mt-2 max-w-prose mx-auto">{selectedTopic.content.introduction}</p>
                    </div>

                    <ContentSection 
                        title="💡 منظور علم النفس"
                        text={selectedTopic.content.psychological.text}
                        source={selectedTopic.content.psychological.source}
                    />

                    <ContentSection 
                        title="🌿 هداية روحانية"
                        text={selectedTopic.content.spiritual.text}
                        source={selectedTopic.content.spiritual.source}
                    />

                    <ContentSection 
                        title="👟 خطوات عملية"
                        text={selectedTopic.content.practical.text}
                        source={selectedTopic.content.practical.source}
                    />
                </div>
            </div>
        );
    }

    // Selection View
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center animate-fade-in">
             <button onClick={onBack} className="absolute top-20 right-6 md:top-24 md:right-10 p-2 rounded-full text-text-secondary hover:bg-border-color">
                <BackIcon className="w-6 h-6" />
            </button>
            <CounselorIcon className="w-16 h-16 text-primary mb-4" />
            <h2 className="text-3xl font-bold font-tajawal">المستشار النفسي</h2>
            <p className="text-text-secondary mt-2 mb-8 font-tajawal max-w-md mx-auto">
                دليلك للتوازن النفسي والروحي. اختر ما تشعر به الآن لنبدأ رحلة السكينة معًا.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                {counselorData.map(topic => (
                    <button 
                        key={topic.id} 
                        onClick={() => setSelectedTopic(topic)}
                        className="p-4 bg-card rounded-lg shadow-md flex flex-col items-center justify-center aspect-square hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                    >
                        <span className="text-4xl">{topic.icon}</span>
                        <span className="font-bold text-lg mt-2 font-tajawal text-text-primary">{topic.title}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PsychologicalCounselor;