import React, { useState, useEffect } from 'react';
import { BackIcon } from './icons/BackIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CopyIcon } from './icons/CopyIcon';
import { QuranIcon } from './icons/QuranIcon';
import { HadithIcon } from './icons/HadithIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { dailyRonaqContent } from '../data/dailyRonaqData';
import { DailyContent } from '../types';

const DailyRonaq: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [content, setContent] = useState<DailyContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        try {
            const lastIndexStr = localStorage.getItem('dailyRonaqLastIndex');
            const lastIndex = lastIndexStr ? parseInt(lastIndexStr, 10) : -1;

            const newIndex = (lastIndex + 1) % dailyRonaqContent.length;

            setContent(dailyRonaqContent[newIndex]);
            localStorage.setItem('dailyRonaqLastIndex', newIndex.toString());
        } catch (e) {
            setError('حدث خطأ أثناء تحميل المحتوى.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleCopy = () => {
        if (!content) return;
        const textToCopy = `"${content.text}"\n(${content.source})\n\nرسالة اليوم:\n"${content.takeaway}"\n\n~ رونقك اليوم من تطبيق رونق`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const handleShare = () => {
        if (!content || !navigator.share) return;
        const textToShare = `"${content.text}"\n(${content.source})\n\nرسالة اليوم:\n"${content.takeaway}"\n\n~ رونقك اليوم من تطبيق رونق`;
        navigator.share({
            title: 'رونقك اليوم',
            text: textToShare,
        }).catch(err => console.error('Share failed:', err));
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة</span></button>
            <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-center text-primary mb-6 font-tajawal">رونقك اليوم</h2>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                        <p className="mt-4 text-text-secondary">جاري إعداد رونقك اليومي...</p>
                    </div>
                )}
                
                {error && <p className="text-red-500 text-center">{error}</p>}

                {content && !isLoading && (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex items-center gap-3 text-text-primary">
                            {content.contentType === 'آية قرآنية' ? <QuranIcon className="w-8 h-8"/> : <HadithIcon className="w-8 h-8"/>}
                            <h3 className="text-xl font-semibold">{content.contentType}</h3>
                        </div>

                        <div className="p-4 border border-border-color rounded-lg bg-background">
                            <p className="font-amiri-quran text-2xl md:text-3xl text-text-primary leading-loose text-center">
                                {content.text}
                            </p>
                            <p className="text-sm text-text-secondary text-center mt-3 font-mono">{content.source}</p>
                        </div>
                        
                        <div className="border-t-2 border-dashed border-border-color/50 my-6"></div>

                        <div>
                            <h3 className="font-bold text-lg text-primary mb-2">رسالة اليوم ✨:</h3>
                            <p className="text-text-secondary leading-relaxed">{content.takeaway}</p>
                        </div>

                        <div className="flex justify-center items-center gap-4 pt-4">
                            <button onClick={handleCopy} className="flex items-center gap-2 bg-background hover:bg-border-color text-text-primary font-semibold py-2 px-4 rounded-lg transition-colors">
                                {copied ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                                <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
                            </button>
                            {navigator.share && (
                                <button onClick={handleShare} className="flex items-center gap-2 bg-background hover:bg-border-color text-text-primary font-semibold py-2 px-4 rounded-lg transition-colors">
                                    <ShareIcon className="w-5 h-5" />
                                    <span>مشاركة</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyRonaq;
