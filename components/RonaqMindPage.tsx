import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { BackIcon } from './icons/BackIcon';
import { Surah, Reciter } from '../types';
import PsychologicalCounselor from './PsychologicalCounselor';
import { CounselorIcon } from './icons/CounselorIcon';
import VoiceRecitationAnalysis from './VoiceRecitationAnalysis';
import { VoiceAnalysisIcon } from './icons/VoiceAnalysisIcon';
import DailyRonaq from './DailyRonaq';
import QuranAssistant from './QuranAssistant';
import { DailyRonaqIcon } from './icons/DailyRonaqIcon';
import { QuranAssistantIcon } from './icons/QuranAssistantIcon';
import { SummaryIcon } from './icons/SummaryIcon';


type SubSection = 'menu' | 'assistant' | 'summary' | 'counselor' | 'analysis' | 'daily';

interface InfoPoint {
  point: string;
  source: string;
}

interface SurahSummaryResult {
  surahOverview: string;
  themesAndTopics: InfoPoint[];
  storiesAndEvents: InfoPoint[];
  shariahRulings: InfoPoint[];
  practicalLessons: InfoPoint[];
}

const subSections = [
    { id: 'daily', title: 'رونقك اليوم', icon: <DailyRonaqIcon className="w-10 h-10" />, description: 'آية أو اقتباس أو تأمل يومي يُنشأ خصيصًا لك.' },
    { id: 'assistant', title: 'المرجع القرآني الشامل', icon: <QuranAssistantIcon className="w-10 h-10" />, description: 'تفسير وأحكام وأحاديث متعلقة بكل آية.' },
    { id: 'summary', title: 'ملخص السور', icon: <SummaryIcon className="w-10 h-10" />, description: 'احصل على ملخص قصير ومنظم لكل سورة.' },
    { id: 'counselor', title: 'المستشار النفسي', icon: <CounselorIcon className="w-10 h-10" />, description: 'مستشارك النفسي بالذكاء الاصطناعي.' },
    { id: 'analysis', title: 'دراسة التجويد', icon: <VoiceAnalysisIcon className="w-10 h-10" />, description: 'تعلم أحكام التجويد لكل آية مع شرح مفصل.' },
];

const SurahSummary: React.FC<{ onBack: () => void; surahs: Surah[] }> = ({ onBack, surahs }) => {
    const [selectedSurahId, setSelectedSurahId] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<SurahSummaryResult | null>(null);

    const InfoSection: React.FC<{ title: string; icon: string; items: InfoPoint[] }> = ({ title, icon, items }) => {
        if (!items || items.length === 0) return null;
        return (
            <div>
                <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-primary"><span>{icon}</span> {title}</h4>
                <div className="bg-background p-4 rounded-lg space-y-4">
                    {items.map((item, i) => (
                        <div key={i} className="border-b border-border-color/50 pb-3 last:border-b-0 last:pb-0">
                            <p className="leading-relaxed">{item.point}</p>
                            <p className="text-xs text-text-secondary/80 mt-1 font-mono text-left">المصدر: {item.source}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const handleGenerateSummary = async () => {
        const surah = surahs.find(s => s.id === parseInt(selectedSurahId));
        if (!surah) {
            setError('الرجاء اختيار سورة صحيحة.');
            return;
        }
        if (!process.env.API_KEY) {
            setError("مفتاح API غير متوفر. هذه الميزة معطلة.");
            return;
        }

        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Generate a complete, verified summary for Surah ${surah.name}.`;
            const systemInstruction = `You are an expert Islamic scholar specializing in the thematic analysis of the Qur'an. Your task is to generate a detailed summary for a selected Surah. Do NOT provide a verse-by-verse Tafsir. Instead, focus on the overarching concepts. Your output MUST be a valid JSON object matching the provided schema, with all content in clear, formal Arabic. For each piece of information in the arrays (themes, stories, rulings, lessons), you MUST cite a specific, authentic source. The ONLY allowed sources are: 'تفسير ابن كثير', 'كتب الأئمة الأربعة' (you can specify the school, e.g., 'كتب الشافعية'), 'القرآن الكريم', 'صحيح البخاري', or 'صحيح مسلم'. Do not use any other sources. If a section like 'shariahRulings' has no relevant points for a particular Surah, return an empty array for it.`;

            const infoPointSchema = {
                type: Type.OBJECT,
                properties: {
                    point: { type: Type.STRING, description: 'The information point in Arabic.' },
                    source: { type: Type.STRING, description: 'The specific source, e.g., "تفسير ابن كثير", "صحيح البخاري", "كتب المالكية".' }
                },
                required: ['point', 'source']
            };

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    surahOverview: { type: Type.STRING, description: 'A brief introduction about the Surah’s theme, time of revelation (Makki/Madani), and number of verses. Source: General Tafsir knowledge.' },
                    themesAndTopics: { type: Type.ARRAY, items: infoPointSchema, description: 'Key themes and topics addressed in the Surah.' },
                    storiesAndEvents: { type: Type.ARRAY, items: infoPointSchema, description: 'Significant stories and events mentioned in the Surah.' },
                    shariahRulings: { type: Type.ARRAY, items: infoPointSchema, description: 'Important Shariah rulings (أحكام شرعية) derived from the Surah. If none, return an empty array.' },
                    practicalLessons: { type: Type.ARRAY, items: infoPointSchema, description: 'Practical lessons and insights for a Muslim\'s daily life.' }
                },
                required: ['surahOverview', 'themesAndTopics', 'storiesAndEvents', 'shariahRulings', 'practicalLessons']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { systemInstruction, responseMimeType: "application/json", responseSchema },
            });
            
            const parsedResult: SurahSummaryResult = JSON.parse(response.text);
            setResult(parsedResult);
        } catch (e) {
            console.error(e);
            setError('حدث خطأ أثناء إنشاء الملخص. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة</span></button>
            <div className="bg-card p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">ملخص السور</h3>
                <p className="text-text-secondary mb-4">اختر سورة للحصول على ملخص شامل وموثق لمواضيعها ودروسها المستفادة.</p>
                
                <div className="flex items-end gap-4 mb-4">
                    <div className="flex-grow">
                        <label htmlFor="surah-summary-select" className="block text-sm font-medium text-text-primary mb-1">اختر السورة</label>
                        <select
                            id="surah-summary-select"
                            value={selectedSurahId}
                            onChange={(e) => setSelectedSurahId(e.target.value)}
                            className="w-full p-3 bg-background border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        >
                            {surahs.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleGenerateSummary} disabled={isLoading} className="bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition h-fit">
                        {isLoading ? '...' : 'إنشاء'}
                    </button>
                </div>

                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

                {isLoading && (
                    <div className="text-center mt-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-text-secondary">جاري إنشاء الملخص من المصادر الموثوقة...</p>
                    </div>
                )}

                {result && (
                     <div className="mt-6 border-t border-border-color pt-4 animate-fade-in space-y-6">
                        <div>
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-primary"><span>🔹</span> لمحة عامة عن السورة</h4>
                            <p className="bg-background p-4 rounded-lg whitespace-pre-wrap leading-relaxed">{result.surahOverview}</p>
                        </div>

                        <InfoSection title="المواضيع والمحاور" icon="📘" items={result.themesAndTopics} />
                        <InfoSection title="القصص والأحداث" icon="📜" items={result.storiesAndEvents} />
                        <InfoSection title="الأحكام الشرعية" icon="⚖️" items={result.shariahRulings} />
                        <InfoSection title="الدروس العملية" icon="💡" items={result.practicalLessons} />
                    </div>
                )}
            </div>
        </div>
    );
};

const RonaqMindPage: React.FC<{ surahs: Surah[]; reciters: Reciter[] }> = ({ surahs, reciters }) => {
    const [view, setView] = useState<SubSection>('menu');

    const renderMenu = () => (
         <>
            <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-bold text-text-primary font-serif tracking-wider">Ronaq Mind</h1>
                <p className="text-lg text-text-secondary mt-2 font-amiri-quran">"حيث يلتقى الجمال بالذكاء"</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subSections.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id as SubSection)}
                        className="bg-card/70 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center text-center hover:bg-card transform hover:-translate-y-1 transition-all duration-300 aspect-square group"
                    >
                        <div className="text-primary group-hover:scale-110 transition-transform">{item.icon}</div>
                        <h2 className="text-sm sm:text-base font-bold text-text-primary mt-3 font-tajawal">{item.title}</h2>
                    </button>
                ))}
            </div>
        </>
    );

    const renderSubSection = () => {
        switch (view) {
            case 'assistant': return <QuranAssistant onBack={() => setView('menu')} surahs={surahs} />;
            case 'summary': return <SurahSummary onBack={() => setView('menu')} surahs={surahs} />;
            case 'counselor': return <PsychologicalCounselor onBack={() => setView('menu')} />;
            case 'analysis': return <VoiceRecitationAnalysis onBack={() => setView('menu')} surahs={surahs} reciters={reciters} />;
            case 'daily': return <DailyRonaq onBack={() => setView('menu')} />;
            default: return renderMenu();
        }
    };

    const hasGradientBackground = view === 'menu';

    return (
        <div 
            className="min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 animate-fade-in" 
            style={!hasGradientBackground ? { backgroundColor: 'var(--color-background)' } : {}}
        >
            <div className="max-w-6xl mx-auto">
                {renderSubSection()}
            </div>
        </div>
    );
};

export default RonaqMindPage;
