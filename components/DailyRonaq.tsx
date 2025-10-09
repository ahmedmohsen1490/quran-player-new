import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { BackIcon } from './icons/BackIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CopyIcon } from './icons/CopyIcon';
import { QuranIcon } from './icons/QuranIcon';
import { HadithIcon } from './icons/HadithIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface DailyContent {
  contentType: 'آية قرآنية' | 'حديث شريف';
  text: string;
  source: string;
  takeaway: string;
}

const DailyRonaq: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [content, setContent] = useState<DailyContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const generateContent = useCallback(async () => {
        if (!process.env.API_KEY) {
            setError("مفتاح API غير متوفر. هذه الميزة معطلة.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = "أنت عالم إسلامي حكيم. مهمتك هي إنشاء قطعة إلهامية يومية. يمكن أن تكون إما آية قرآنية عشوائية أو حديثًا صحيحًا عشوائيًا من صحيح البخاري أو صحيح مسلم. قدم النص ونوعه ('آية قرآنية' أو 'حديث شريف') ومصدره. بعد ذلك، وبناءً على هذا النص فقط، قدم رسالة ملهمة وموجزة (جملة أو جملتان). يجب أن يكون ردك فقط كائن JSON صالح يتوافق مع المخطط المقدم. يجب أن تكون الاستجابة بأكملها باللغة العربية الفصحى.";

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    contentType: { type: Type.STRING, description: "إما 'آية قرآنية' أو 'حديث شريف'." },
                    text: { type: Type.STRING, description: "النص العربي الكامل للآية أو الحديث." },
                    source: { type: Type.STRING, description: "المصدر (مثال: 'سورة البقرة, الآية 255', 'صحيح البخاري, حديث رقم 1234')." },
                    takeaway: { type: Type.STRING, description: "رسالة ملهمة قصيرة (1-2 جملة) بناءً على النص." }
                },
                required: ["contentType", "text", "source", "takeaway"]
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: "أنشئ قطعة إلهامية يومية جديدة.",
                config: { systemInstruction, responseMimeType: "application/json", responseSchema },
            });

            const parsedResult: DailyContent = JSON.parse(response.text);
            setContent(parsedResult);
            localStorage.setItem('dailyRonaqContent', JSON.stringify(parsedResult));
            const now = Date.now();
            localStorage.setItem('dailyRonaqLastUpdated', now.toString());
        } catch (e) {
            console.error(e);
            setError('حدث خطأ أثناء إنشاء المحتوى اليومي. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        const cachedContent = localStorage.getItem('dailyRonaqContent');
        const cachedTimestamp = localStorage.getItem('dailyRonaqLastUpdated');
        const oneHour = 60 * 60 * 1000;

        if (cachedContent && cachedTimestamp && (Date.now() - parseInt(cachedTimestamp, 10)) < oneHour) {
            setContent(JSON.parse(cachedContent));
            setIsLoading(false);
        } else {
            generateContent();
        }

        const interval = setInterval(() => {
            generateContent();
        }, oneHour);

        return () => clearInterval(interval);
    }, [generateContent]);

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
                            <p className="text-xs text-text-secondary/70 mt-2 italic">~ تم إنشاؤها بواسطة الذكاء الاصطناعي</p>
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