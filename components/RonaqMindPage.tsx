import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { BackIcon } from './icons/BackIcon';
import { Surah, Reciter } from '../types';
import PsychologicalCounselor from './PsychologicalCounselor';
import { CounselorIcon } from './icons/CounselorIcon';
import VoiceRecitationAnalysis from './VoiceRecitationAnalysis';
import { VoiceAnalysisIcon } from './icons/VoiceAnalysisIcon';
import DailyRonaq from './DailyRonaq';

// Inline Icons for subsections to keep changes minimal
const QuranAssistantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5m-7.5 3h7.5M12 6.75h.008v.008H12V6.75zm-3.375 0h.008v.008h-.008V6.75zm-3.375 0h.008v.008H5.25V6.75zM12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>;
const TafsirIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const SummaryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const ReflectionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>;

const DailyRonaqIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" /></svg>;

type SubSection = 'menu' | 'assistant' | 'tafsir' | 'summary' | 'reflection' | 'counselor' | 'analysis' | 'daily';

interface TafsirResult {
    shortExplanation: string;
    fullTafsir: string;
    sourceCitation: string;
    lessons: string[];
    asbabNuzul?: string;
    fiqhInsight?: string;
}

interface SurahSummaryResult {
    surahOverview: string;
    mainThemes: string[];
    lessonsAndReflections: string;
    verifiedSources: string;
}

interface ReflectionResult {
    ayahText: string;
    ayahNumber: string;
    reflection: string;
    source: string;
}


const subSections = [
    { id: 'daily', title: 'رونقك اليوم', icon: <DailyRonaqIcon />, description: 'آية أو اقتباس أو تأمل يومي يُنشأ خصيصًا لك.' },
    { id: 'assistant', title: 'المساعد الذكي للقرآن', icon: <QuranAssistantIcon />, description: 'اسأل أسئلة متعلقة بالقرآن واحصل على إجابات ذكية.' },
    { id: 'tafsir', title: 'المساعد الذكي لتفسير القرآن', icon: <TafsirIcon />, description: 'تفسير فوري لأي آية باستخدام Gemini.' },
    { id: 'summary', title: 'ملخص السور', icon: <SummaryIcon />, description: 'احصل على ملخص قصير ومنظم لكل سورة.' },
    { id: 'reflection', title: 'رحلة التدبر', icon: <ReflectionIcon />, description: 'تأملات يومية متجددة مع إمكانية الحفظ والمشاركة.' },
    { id: 'counselor', title: 'المستشار النفسي', icon: <CounselorIcon />, description: 'مستشارك النفسي بالذكاء الاصطناعي.' },
    { id: 'analysis', title: 'التحليل الصوتي للتلاوة', icon: <VoiceAnalysisIcon />, description: 'تحليل تجويد الشيخ عبد الباسط ومقارنة تلاوتك.' },
];

const QuranAssistant: React.FC<{onBack: () => void}> = ({onBack}) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAsk = async () => {
        if (!question.trim() || !process.env.API_KEY) {
            setError("يرجى كتابة سؤال والتأكد من توفر مفتاح API.");
            return;
        };
        setIsLoading(true);
        setError('');
        setAnswer('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: question,
                config: {
                    systemInstruction: 'أنت مساعد ذكي وعالم متخصص في علوم القرآن الكريم والفقه الإسلامي. مهمتك هي الإجابة على أسئلة المستخدم بدقة وموضوعية باللغة العربية الفصحى. يجب أن يتضمن كل جواب قسمًا للمصادر في نهايته بعنوان "📚 المصادر". المصادر المسموح بها فقط هي: القرآن الكريم (مع ذكر اسم السورة ورقم الآية)، الحديث الشريف (مع ذكر النص والمصدر مثل صحيح البخاري أو مسلم)، مراجع الفقه (عندما يكون السؤال فقهيًا, بالإشارة إلى مذاهب الأئمة الأربعة: أبو حنيفة، مالك، الشافعي، أحمد بن حنبل)، وتفسير ابن كثير. يجب أن يكون كل جزء من الإجابة مدعومًا بمصدر واضح من هذه القائمة.'
                }
            });
            setAnswer(response.text);
        } catch (e) {
            console.error(e);
            setError('حدث خطأ أثناء الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة</span></button>
            <div className="bg-card p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">المساعد الذكي للقرآن</h3>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="اكتب سؤالك هنا... مثلاً: ما هي قصة أصحاب الكهف؟"
                    className="w-full h-32 p-3 bg-background border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    rows={4}
                />
                <button onClick={handleAsk} disabled={isLoading} className="w-full mt-4 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition">
                    {isLoading ? 'جاري التفكير...' : 'اسأل'}
                </button>
                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                {answer && (
                    <div className="mt-6 border-t border-border-color pt-4">
                        <h4 className="font-bold mb-2">الإجابة:</h4>
                        <div className="bg-background p-4 rounded-lg whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: answer.replace(/📚 المصادر:/g, '<br><strong class="font-bold text-lg mt-4 block">📚 المصادر:</strong>') }}></div>
                    </div>
                )}
            </div>
        </div>
    );
}

const SmartTafsir: React.FC<{ onBack: () => void; surahs: Surah[] }> = ({ onBack, surahs }) => {
    const [selectedSurahId, setSelectedSurahId] = useState('1');
    const [ayahNumber, setAyahNumber] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [verseText, setVerseText] = useState('');
    const [result, setResult] = useState<TafsirResult | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const selectedSurahInfo = surahs.find(s => s.id === parseInt(selectedSurahId));
    const ayahsCount = selectedSurahInfo ? selectedSurahInfo.numberOfAyahs : 0;
    const ayahOptions = Array.from({ length: ayahsCount }, (_, i) => i + 1);
    
    useEffect(() => {
        // Reset ayah number when surah changes
        setAyahNumber('1');
    }, [selectedSurahId]);

    const handleShowTafsir = async () => {
        const surah = surahs.find(s => s.id === parseInt(selectedSurahId));
        if (!surah) {
            setError('الرجاء اختيار سورة صحيحة.');
            return;
        }
        const ayahNum = parseInt(ayahNumber);
        if (isNaN(ayahNum) || ayahNum <= 0 || ayahNum > surah.numberOfAyahs) {
            setError(`الرجاء إدخال رقم آية صحيح لسورة ${surah.name} (بين 1 و ${surah.numberOfAyahs}).`);
            return;
        }
        if (!process.env.API_KEY) {
            setError("مفتاح API غير متوفر. هذه الميزة معطلة.");
            return;
        }

        setIsLoading(true);
        setError('');
        setResult(null);
        setVerseText('');
        setIsExpanded(false);

        try {
            // 1. Fetch verse text
            const verseResponse = await fetch(`https://api.quran.com/api/v4/verses/by_key/${selectedSurahId}:${ayahNum}?language=ar&fields=text_uthmani`);
            if (!verseResponse.ok) throw new Error('فشل في جلب نص الآية.');
            const verseData = await verseResponse.json();
            if (!verseData.verses || verseData.verses.length === 0) {
                // Fallback to AI if API fails
                setVerseText(''); // Let the AI generate it
            } else {
                 const fetchedVerseText = verseData.verses[0].text_uthmani;
                 setVerseText(fetchedVerseText);
            }

            // 2. Call Gemini for Tafsir
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Provide a detailed analysis for Surah ${surah.name}, Ayah ${ayahNum}.`;
             const systemInstruction = "أنت عالم متخصص في تفسير القرآن. مهمتك هي تقديم تفسير متكامل لآية قرآنية باللغة العربية الفصحى المبسطة. يجب أن يكون ردك كائن JSON صالح تمامًا يلتزم بالمخطط المحدد. إذا لم يتم توفير نص الآية، قم بتوليده من معرفتك. يجب أن تكون المصادر حصريًا من: تفسير ابن كثير، الطبري، القرطبي، والجلالين. بالنسبة للأحكام الفقهية، يجب ذكر آراء الأئمة الأربعة (الشافعي، أبو حنيفة، مالك، أحمد بن حنبل). يجب أن تكون الاستشهادات بالمصادر دقيقة. قم بملء جميع حقول JSON المطلوبة.";

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    shortExplanation: { type: Type.STRING, description: 'شرح موجز للآية في 3-5 أسطر بلغة عربية فصحى مبسطة.' },
                    fullTafsir: { type: Type.STRING, description: 'تفسير كامل ومفصل للآية، يدمج المعلومات من التفاسير المعتبرة (ابن كثير، الطبري، القرطبي، الجلالين).' },
                    sourceCitation: { type: Type.STRING, description: 'قائمة بالمصادر المذكورة المستخدمة في التفسير الكامل. مثال: "المصادر: تفسير ابن كثير، تفسير الطبري".' },
                    lessons: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'قائمة من 2 إلى 4 نقاط موجزة تلخص الدروس المستفادة والعبر العملية من الآية.'
                    },
                    asbabNuzul: { type: Type.STRING, description: 'سبب نزول الآية إن وجد وموثق في المصادر المعتمدة. إذا لم يوجد، اكتب "لم يرد سبب نزول خاص لهذه الآية في المصادر المعتمدة.".' },
                    fiqhInsight: { type: Type.STRING, description: 'الأحكام الفقهية المستنبطة من الآية إن وجدت، مع الإشارة إلى أقوال الأئمة الأربعة. إذا لم تكن آية أحكام، اكتب "هذه الآية لا تتضمن أحكامًا فقهية مباشرة.".' }
                },
                required: ['shortExplanation', 'fullTafsir', 'sourceCitation', 'lessons', 'asbabNuzul', 'fiqhInsight']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { systemInstruction, responseMimeType: "application/json", responseSchema },
            });

            const parsedResult: TafsirResult = JSON.parse(response.text);
            setResult(parsedResult);

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'حدث خطأ أثناء جلب التفسير. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderResult = () => {
        if (!result) return null;

        return (
            <div className="mt-6 border-t border-border-color pt-4 animate-fade-in space-y-4">
                {/* Verse */}
                <div>
                    <h4 className="font-bold text-lg mb-2 text-primary">نص الآية ورقمها الكامل</h4>
                    <div className="bg-background p-4 rounded-lg font-amiri-quran text-2xl leading-loose text-center">
                        <p>{verseText}</p>
                        <p className="text-sm font-sans mt-2 text-text-secondary">({selectedSurahInfo?.name}, الآية {ayahNumber})</p>
                    </div>
                </div>

                {/* Short Explanation */}
                <div>
                    <h4 className="font-bold text-lg mb-2 text-primary">ملخص موجز</h4>
                    <p className="bg-background p-4 rounded-lg whitespace-pre-wrap leading-relaxed">
                        {result.shortExplanation}
                    </p>
                </div>
                
                <div className="text-center">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary font-semibold hover:underline">
                        {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفسير الكامل'}
                    </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="space-y-4 animate-fade-in">
                        {/* Full Tafsir */}
                        <div>
                            <h4 className="font-bold text-lg mb-2 text-primary">التفسير الكامل بالتفصيل</h4>
                            <div className="bg-background p-4 rounded-lg whitespace-pre-wrap leading-relaxed">
                                <p>{result.fullTafsir}</p>
                            </div>
                        </div>

                         {/* Sources */}
                        <div>
                             <h4 className="font-bold text-lg mb-2 text-primary">قائمة بالمصادر المذكورة</h4>
                             <p className="bg-background p-4 rounded-lg text-sm text-text-secondary">
                                {result.sourceCitation}
                            </p>
                        </div>
                        
                        {/* Lessons */}
                        <div>
                            <h4 className="font-bold text-lg mb-2 text-primary">الدروس المستفادة</h4>
                            <ul className="bg-background p-4 rounded-lg space-y-2 list-disc list-inside">
                                {result.lessons.map((lesson, i) => <li key={i}>{lesson}</li>)}
                            </ul>
                        </div>
                        
                        {/* Asbab Nuzul */}
                        {result.asbabNuzul && !result.asbabNuzul.includes("لم يرد") && (
                             <div>
                                <h4 className="font-bold text-lg mb-2 text-primary">سبب النزول</h4>
                                <p className="bg-background p-4 rounded-lg whitespace-pre-wrap leading-relaxed">
                                    {result.asbabNuzul}
                                </p>
                            </div>
                        )}

                        {/* Fiqh Insight */}
                         {result.fiqhInsight && !result.fiqhInsight.includes("لا تتضمن") && (
                             <div>
                                <h4 className="font-bold text-lg mb-2 text-primary">الأحكام الفقهية</h4>
                                <p className="bg-background p-4 rounded-lg whitespace-pre-wrap leading-relaxed">
                                    {result.fiqhInsight}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة</span></button>
            <div className="bg-card p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">المساعد الذكي لتفسير القرآن</h3>
                <p className="text-text-secondary mb-4">اختر أي آية في القرآن الكريم لعرض تفسيرها المفصل من مصادر موثوقة.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                        <label htmlFor="surah-select" className="block text-sm font-medium text-text-primary mb-1">السورة</label>
                        <select
                            id="surah-select"
                            value={selectedSurahId}
                            onChange={(e) => setSelectedSurahId(e.target.value)}
                            className="w-full p-3 bg-background border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        >
                            {surahs.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ayah-select" className="block text-sm font-medium text-text-primary mb-1">رقم الآية</label>
                         <select
                            id="ayah-select"
                            value={ayahNumber}
                            onChange={(e) => setAyahNumber(e.target.value)}
                            className="w-full p-3 bg-background border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        >
                            {ayahOptions.map(num => <option key={num} value={num}>{num}</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={handleShowTafsir} disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition">
                    {isLoading ? 'جاري جلب التفسير...' : 'عرض التفسير'}
                </button>
                
                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                
                {isLoading && (
                    <div className="text-center mt-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-text-secondary">يرجى الانتظار...</p>
                    </div>
                )}

                {renderResult()}
            </div>
        </div>
    );
};

const SurahSummary: React.FC<{ onBack: () => void; surahs: Surah[] }> = ({ onBack, surahs }) => {
    const [selectedSurahId, setSelectedSurahId] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<SurahSummaryResult | null>(null);

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
            const systemInstruction = `You are an expert Islamic scholar specializing in Tafsir (Qur'anic exegesis). Your task is to generate a complete, verified summary for any selected Surah in a simple and easy-to-understand style. Each generated summary must strictly come from trusted Islamic sources, including: Tafsir Ibn Kathir, Tafsir Al-Tabari, Tafsir Al-Qurtubi, Tafsir Al-Sa'di, and Al-Jalalayn. If any verse in the Surah involves Islamic rulings (Ahkam), you may reference explanations from the Four Imams (Abu Hanifa, Malik, Al-Shafi’i, Ahmad ibn Hanbal) when clearly related to the context. Do not invent or assume interpretations; summaries must reflect authentic Islamic scholarship only. Your output MUST be a valid JSON object matching the provided schema, with all content in clear, formal Arabic.`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    surahOverview: { type: Type.STRING, description: 'A brief introduction about the Surah’s theme, time of revelation (Makki/Madani), and number of verses.' },
                    mainThemes: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: '3–5 concise bullet points summarizing the Surah’s main ideas.'
                    },
                    lessonsAndReflections: { type: Type.STRING, description: 'Key moral and spiritual lessons derived from the Surah.' },
                    verifiedSources: { type: Type.STRING, description: 'A list of all tafsir references used for this summary (e.g., "تفسير ابن كثير, تفسير السعدي").' }
                },
                required: ['surahOverview', 'mainThemes', 'lessonsAndReflections', 'verifiedSources']
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
                        {/* Surah Overview */}
                        <div>
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-primary"><span>🔹</span> لمحة عامة عن السورة</h4>
                            <p className="bg-background p-4 rounded-lg whitespace-pre-wrap leading-relaxed">{result.surahOverview}</p>
                        </div>

                        {/* Main Themes */}
                        <div>
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-primary"><span>📘</span> المواضيع الرئيسية</h4>
                            <ul className="bg-background p-4 rounded-lg space-y-2 list-disc list-inside pr-4">
                                {result.mainThemes.map((theme, i) => <li key={i}>{theme}</li>)}
                            </ul>
                        </div>

                        {/* Lessons & Reflections */}
                        <div>
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-primary"><span>💡</span> الدروس والعبر</h4>
                            <p className="bg-background p-4 rounded-lg whitespace-pre-wrap leading-relaxed">{result.lessonsAndReflections}</p>
                        </div>

                        {/* Verified Sources */}
                        <div>
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-primary"><span>📚</span> المصادر المعتمدة</h4>
                            <p className="bg-background p-4 rounded-lg text-sm text-text-secondary">{result.verifiedSources}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReflectionJourney: React.FC<{ onBack: () => void; surahs: Surah[] }> = ({ onBack, surahs }) => {
    const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
    const [reflection, setReflection] = useState<ReflectionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const generateReflection = async (surah: Surah, excludeAyah?: string) => {
        if (!process.env.API_KEY) {
            setError("مفتاح API غير متوفر. هذه الميزة معطلة.");
            return;
        }

        setIsLoading(true);
        setError('');
        setReflection(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Select an insightful Ayah from Surah ${surah.name} and provide a reflection.${excludeAyah ? ` Exclude Ayah number ${excludeAyah}.` : ''}`;
            const systemInstruction = `You are a wise and eloquent Islamic scholar specializing in Tadabbur (deep reflection) of the Qur'an. Your task is to select a single, insightful Ayah from a given Surah and provide a brief, profound reflection upon it. Your reflection must be inspired by and consistent with trusted classical Tafsir sources like Ibn Kathir, Al-Tabari, and Al-Qurtubi. Your output must be a valid JSON object, and all text must be in clear, beautiful, formal Arabic. Do not include any text outside the JSON object.`;
            
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    ayahText: { type: Type.STRING, description: 'The full Arabic text of the chosen Ayah in Uthmani script.' },
                    ayahNumber: { type: Type.STRING, description: 'The number of the chosen Ayah.' },
                    reflection: { type: Type.STRING, description: 'A short, eloquent reflection (Tadabbur) on the Ayah, approximately 2-4 sentences.' },
                    source: { type: Type.STRING, description: 'The primary source of inspiration for the reflection. Example: "المصدر: مستوحى من تفسير ابن كثير".' }
                },
                required: ['ayahText', 'ayahNumber', 'reflection', 'source']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { systemInstruction, responseMimeType: "application/json", responseSchema },
            });
            
            const parsedResult: ReflectionResult = JSON.parse(response.text);
            setReflection(parsedResult);
        } catch (e) {
            console.error(e);
            setError('حدث خطأ أثناء إنشاء التدبر. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSurahSelect = (surah: Surah) => {
        setSelectedSurah(surah);
        generateReflection(surah);
    };

    if (!selectedSurah) {
        // Surah Selection View
        return (
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة</span></button>
                <h2 className="text-2xl font-bold text-text-primary mb-4">اختر سورة لبدء رحلة التدبر</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {surahs.map(surah => (
                        <button key={surah.id} onClick={() => handleSurahSelect(surah)} className="p-3 rounded-lg bg-card hover:bg-border-color transition-colors text-right">
                            <span className="text-sm font-mono text-text-secondary">{surah.id}</span>
                            <p className="font-semibold font-amiri-quran text-lg text-text-primary">{surah.name}</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    // Reflection View
    return (
        <div>
            <button onClick={() => { setSelectedSurah(null); setReflection(null); }} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-tajawal"><BackIcon className="w-5 h-5" /><span>اختر سورة أخرى</span></button>
            <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-primary mb-4 font-amiri-quran">{selectedSurah.name}</h2>
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                        <p className="mt-4 text-text-secondary">جاري إعداد التدبر...</p>
                    </div>
                )}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {reflection && !isLoading && (
                    <div className="animate-fade-in space-y-6">
                        <div>
                            <p className="font-amiri-quran text-2xl md:text-3xl text-text-primary leading-loose text-center p-4 border border-border-color rounded-lg bg-background">
                                {reflection.ayahText}
                                <span className="font-sans text-base align-middle mx-2 p-1 text-primary">({reflection.ayahNumber})</span>
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-text-primary mb-2">تأمل:</h3>
                            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{reflection.reflection}</p>
                        </div>
                        <div className="border-t border-border-color pt-3 text-xs text-text-secondary">
                            <p>{reflection.source}</p>
                        </div>
                    </div>
                )}
                 <div className="mt-8 text-center">
                    <button 
                        onClick={() => generateReflection(selectedSurah, reflection?.ayahNumber)}
                        disabled={isLoading}
                        className="bg-primary/20 text-primary font-bold py-2 px-6 rounded-md hover:bg-primary/30 disabled:opacity-50 transition"
                    >
                        {isLoading ? '...' : 'تدبر تالي'}
                    </button>
                </div>
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
                        className="bg-card/70 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center text-center hover:bg-card transform hover:-translate-y-1 transition-all duration-300 aspect-square group"
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
            case 'assistant': return <QuranAssistant onBack={() => setView('menu')} />;
            case 'tafsir': return <SmartTafsir onBack={() => setView('menu')} surahs={surahs} />;
            case 'summary': return <SurahSummary onBack={() => setView('menu')} surahs={surahs} />;
            case 'reflection': return <ReflectionJourney onBack={() => setView('menu')} surahs={surahs} />;
            case 'counselor': return <PsychologicalCounselor onBack={() => setView('menu')} />;
            case 'analysis': return <VoiceRecitationAnalysis onBack={() => setView('menu')} surahs={surahs} reciters={reciters} />;
            case 'daily': return <DailyRonaq onBack={() => setView('menu')} />;
            default: return renderMenu();
        }
    };

    const hasGradientBackground = view === 'menu' || view === 'counselor' || view === 'analysis' || view === 'daily' || view === 'assistant' || view === 'tafsir' || view === 'summary';

    return (
        <div 
            className="min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 animate-fade-in" 
            style={!hasGradientBackground ? { backgroundColor: 'var(--color-background)' } : { background: 'radial-gradient(circle, var(--color-background) 0%, var(--color-background-end) 100%)' }}
        >
            <div className="max-w-6xl mx-auto">
                {renderSubSection()}
            </div>
        </div>
    );
};

export default RonaqMindPage;