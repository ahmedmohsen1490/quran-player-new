import React, { useState } from 'react';
import { asbabNuzulData } from '../data/asbabNuzulData';
import { SurahNuzul, NuzulStory } from '../types';
import { BackIcon } from './icons/BackIcon';

const StoryCard: React.FC<{ story: NuzulStory }> = ({ story }) => {
    const [isDetailed, setIsDetailed] = useState(false);

    return (
        <div className="bg-card p-4 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold text-primary mb-2">
                سبب نزول الآية: {story.ayahRange}
            </h4>
            <p className="text-text-secondary mb-3 whitespace-pre-wrap leading-relaxed">
                {isDetailed ? story.detailedVersion : story.shortSummary}
            </p>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-border-color">
                <p className="text-xs text-text-secondary">
                    <span className="font-semibold">المصدر:</span> {story.source}
                </p>
                <button 
                    onClick={() => setIsDetailed(!isDetailed)} 
                    className="text-xs font-semibold text-primary hover:underline"
                >
                    {isDetailed ? 'عرض الملخص' : 'عرض التفصيل'}
                </button>
            </div>
        </div>
    );
};

const AsbabNuzulPage: React.FC = () => {
    const [selectedSurah, setSelectedSurah] = useState<SurahNuzul | null>(null);

    if (selectedSurah) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 animate-fade-in">
                <button 
                    onClick={() => setSelectedSurah(null)}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"
                >
                    <BackIcon className="w-5 h-5" />
                    <span>كل السور</span>
                </button>
                <h2 className="text-3xl font-bold font-amiri-quran text-text-primary mb-6">
                    {selectedSurah.surahName}
                </h2>
                <div className="space-y-4">
                    {selectedSurah.stories.map((story, index) => (
                        <StoryCard key={index} story={story} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 animate-fade-in">
            <h2 className="text-xl font-bold text-text-primary mb-4">اختر سورة لتدبر أسباب نزولها</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {asbabNuzulData.map(item => (
                    <div
                        key={item.surahId}
                        onClick={() => setSelectedSurah(item)}
                        className="p-4 rounded-lg shadow-md bg-card hover:bg-border-color transition-all duration-200 flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center">
                            <span className="w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium ml-4 bg-background text-text-secondary">
                                {item.surahId}
                            </span>
                            <p className="font-semibold font-amiri-quran text-xl text-text-primary">
                                {item.surahName}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AsbabNuzulPage;
