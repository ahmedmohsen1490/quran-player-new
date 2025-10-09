import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Surah, Reciter } from '../types';
import { BackIcon } from './icons/BackIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';
import { PlayIcon } from './icons/PlayIcon';

interface SheikhAnalysisResult {
    tajweedRules: { rule: string; word: string; explanation: string; source: string }[];
    phoneticAnalysis: string;
}

interface UserAnalysisResult {
    recitedAyahMatches: boolean;
    similarityPercentage: number;
    overallFeedback: string;
    correctPoints: string[];
    improvementPoints: { word: string; mistake: string; suggestion: string }[];
}


interface VoiceRecitationAnalysisProps {
  onBack: () => void;
  surahs: Surah[];
  reciters: Reciter[]; // Prop is kept for signature consistency, but not used.
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const pureBase64 = base64String.split(',')[1];
      resolve(pureBase64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const pad = (num: number, size: number): string => {
    let s = num.toString();
    while (s.length < size) s = "0" + s;
    return s;
};

const EVERYAYAH_RECITER_ID = 'Abdul_Basit_Mujawwad_128kbps';

const abdulBasitReciter: Reciter = {
  identifier: EVERYAYAH_RECITER_ID,
  name: 'الشيخ عبد الباسط عبد الصمد (مجود)',
  englishName: 'Abdel Basit Abdel Samad (Mujawwad)',
  rawName: 'عبدالباسط عبدالصمد',
  style: 'Mujawwad',
};

const VoiceRecitationAnalysis: React.FC<VoiceRecitationAnalysisProps> = ({ onBack, surahs }) => {
    const [selectedSurahId, setSelectedSurahId] = useState('1');
    const [ayahNumber, setAyahNumber] = useState('1');
    const [selectedReciter] = useState<Reciter>(abdulBasitReciter);

    const [currentSurahAyahs, setCurrentSurahAyahs] = useState<any[]>([]);
    const [ayahText, setAyahText] = useState('');
    const [sheikhAudioUrl, setSheikhAudioUrl] = useState('');
    const audioPlayerRef = useRef<HTMLAudioElement>(null);

    const [sheikhAnalysis, setSheikhAnalysis] = useState<SheikhAnalysisResult | null>(null);
    const [userAnalysis, setUserAnalysis] = useState<UserAnalysisResult | null>(null);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const microphoneStreamRef = useRef<MediaStream | null>(null);

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const [error, setError] = useState('');

    const selectedSurah = surahs.find(s => s.id === parseInt(selectedSurahId));
    const ayahsCount = selectedSurah ? selectedSurah.numberOfAyahs : 0;
    const ayahOptions = Array.from({ length: ayahsCount }, (_, i) => i + 1);
    
    useEffect(() => {
        setAyahNumber('1');
    }, [selectedSurahId]);

     useEffect(() => {
        const fetchSurahAyahs = async () => {
            if (!selectedSurahId) return;
            setIsLoadingData(true);
            setError('');
            setCurrentSurahAyahs([]);
            setAyahText('');
            setSheikhAudioUrl('');
            setSheikhAnalysis(null);
            setUserAnalysis(null);

            try {
                const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${selectedSurahId}?language=ar&fields=text_uthmani`);
                if (!response.ok) {
                    throw new Error('فشل في جلب آيات السورة. قد يكون المصدر غير متاح.');
                }
                const data = await response.json();
                if (!data.verses || data.verses.length === 0) {
                    throw new Error('لم يتم العثور على آيات لهذه السورة.');
                }
                setCurrentSurahAyahs(data.verses);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع أثناء تحميل بيانات السورة.');
                setIsLoadingData(false);
            }
        };

        fetchSurahAyahs();
    }, [selectedSurahId]);

    useEffect(() => {
        if (currentSurahAyahs.length === 0) {
            if (selectedSurahId) setIsLoadingData(true);
            return;
        }

        const ayahIndex = parseInt(ayahNumber) - 1;
        if (ayahIndex >= 0 && ayahIndex < currentSurahAyahs.length) {
            const verse = currentSurahAyahs.find(a => a.verse_key === `${selectedSurahId}:${ayahNumber}`);
            if (verse) {
                setAyahText(verse.text_uthmani);

                const surahPadded = pad(parseInt(selectedSurahId), 3);
                const ayahPadded = pad(parseInt(ayahNumber), 3);
                const audioUrl = `https://everyayah.com/data/${selectedReciter.identifier}/${surahPadded}${ayahPadded}.mp3`;
                setSheikhAudioUrl(audioUrl);
                
                setSheikhAnalysis(null);
                setUserAnalysis(null);
                setError('');
            } else {
                 setError('رقم الآية المحدد غير صالح لهذه السورة.');
            }
        } else {
            setError('رقم الآية المحدد غير صالح.');
        }
        setIsLoadingData(false);
    }, [currentSurahAyahs, ayahNumber, selectedReciter.identifier, selectedSurahId]);


    const handlePlayRecitation = () => {
        if (sheikhAudioUrl && audioPlayerRef.current) {
            audioPlayerRef.current.play().catch(() => setError('فشل تشغيل الصوت.'));
        } else if (!isLoadingData) {
            setError('التلاوة غير متاحة حاليًا. يرجى المحاولة مرة أخرى.');
        }
    };

    const handleAnalyzeReciter = async () => {
        if (!ayahText || !process.env.API_KEY) {
            setError(process.env.API_KEY ? 'الرجاء انتظار تحميل بيانات الآية.' : 'مفتاح API غير متوفر.');
            return;
        }

        setIsLoadingAnalysis(true);
        setError('');
        setSheikhAnalysis(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `الآية: "${ayahText}". اسم السورة: ${selectedSurah?.name}.`;
            const systemInstruction = "أنت عالم خبير في التجويد. حلل نص الآية المقدمة وقدم تفصيلاً دقيقاً لقواعد التجويد التي يطبقها قارئ محترف (مجود). يجب أن يشمل التحليل المدود، الإدغام، الإخفاء، القلقلة، إلخ. اشرح لماذا يطبق القارئ كل حكم. يجب أن تستشهد بمصادر موثوقة مثل 'متن تحفة الأطفال' أو 'المقدمة الجزرية'. علق أيضاً على النبرة والنغمة. ردك يجب أن يكون كائن JSON صالح باللغة العربية. لا تضف أي نص خارج الـJSON.";
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    tajweedRules: { type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            rule: { type: Type.STRING }, word: { type: Type.STRING },
                            explanation: { type: Type.STRING }, source: { type: Type.STRING }
                        }, required: ['rule', 'word', 'explanation', 'source']
                    }},
                    phoneticAnalysis: { type: Type.STRING, description: 'تحليل للنبرة والنغمة وأداء القارئ.' }
                }, required: ['tajweedRules', 'phoneticAnalysis']
            };
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { systemInstruction, responseMimeType: "application/json", responseSchema } });
            setSheikhAnalysis(JSON.parse(response.text));
        } catch (e) {
            console.error(e);
            setError('حدث خطأ أثناء تحليل التلاوة.');
        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            microphoneStreamRef.current = stream;
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.ondataavailable = event => { audioChunksRef.current.push(event.data); };
            recorder.onstop = handleAnalyzeUserRecitation;
            recorder.start();
            setIsRecording(true);
            setUserAnalysis(null);
            setError('');
        } catch (err) {
            setError('لم يتم منح الإذن للميكروفون. يرجى تفعيله.');
        }
    };
    
    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        if (microphoneStreamRef.current) {
            microphoneStreamRef.current.getTracks().forEach(track => track.stop());
            microphoneStreamRef.current = null;
        }
        setIsRecording(false);
        setIsLoadingUser(true);
    };

    const handleAnalyzeUserRecitation = async () => {
        if (audioChunksRef.current.length === 0 || !process.env.API_KEY || !sheikhAudioUrl) return;
        
        try {
            const userAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const userAudioBase64 = await blobToBase64(userAudioBlob);
            
            const sheikhAudioResponse = await fetch(sheikhAudioUrl);
            if (!sheikhAudioResponse.ok) {
                throw new Error('فشل تحميل تلاوة الشيخ المرجعية.');
            }
            const sheikhAudioBlob = await sheikhAudioResponse.blob();
            const sheikhAudioBase64 = await blobToBase64(sheikhAudioBlob);
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = "أنت معلم تجويد خبير. سأعطيك نص آية، وتلاوة مرجعية للشيخ عبد الباسط (مجود)، وتسجيل لتلاوة طالب. قارن صوت الطالب بصوت الشيخ. قدم تقييمًا مفصلاً باللغة العربية. إذا كانت الآية مختلفة، اذكر 'الرجاء تلاوة نفس الآية المختارة'. ردك يجب أن يكون كائن JSON صالح.";
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    recitedAyahMatches: { type: Type.BOOLEAN },
                    similarityPercentage: { type: Type.NUMBER },
                    overallFeedback: { type: Type.STRING },
                    correctPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                    improvementPoints: { type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: { word: { type: Type.STRING }, mistake: { type: Type.STRING }, suggestion: { type: Type.STRING } }, required: ['word', 'mistake', 'suggestion']
                    }}
                }, required: ['recitedAyahMatches', 'similarityPercentage', 'overallFeedback', 'correctPoints', 'improvementPoints']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { text: `النص الأصلي للآية: "${ayahText}"` },
                    { text: "تلاوة الشيخ عبد الباسط (مجود):" },
                    { inlineData: { mimeType: sheikhAudioBlob.type, data: sheikhAudioBase64 } },
                    { text: "تلاوة المستخدم:" },
                    { inlineData: { mimeType: userAudioBlob.type, data: userAudioBase64 } }
                ],
                config: { systemInstruction, responseMimeType: "application/json", responseSchema }
            });

            setUserAnalysis(JSON.parse(response.text));
        } catch (e) {
            console.error(e);
            setError('حدث خطأ أثناء تحليل تلاوتك.');
        } finally {
            setIsLoadingUser(false);
        }
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة</span></button>
            <div className="bg-card p-6 rounded-xl shadow-lg space-y-6">
                <h3 className="text-xl font-bold font-tajawal">التحليل الصوتي للقراء</h3>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="vr-surah" className="block text-sm font-medium text-text-primary mb-1">اسم السورة</label>
                            <select id="vr-surah" value={selectedSurahId} onChange={e => setSelectedSurahId(e.target.value)} className="w-full p-3 bg-background border border-border-color rounded-lg">
                                {surahs.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="vr-ayah" className="block text-sm font-medium text-text-primary mb-1">رقم الآية</label>
                            <select id="vr-ayah" value={ayahNumber} onChange={e => setAyahNumber(e.target.value)} className="w-full p-3 bg-background border border-border-color rounded-lg">
                                {ayahOptions.map(n => <option key={n} value={n}>آية {n}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="vr-reciter" className="block text-sm font-medium text-text-primary mb-1">الشيخ</label>
                            <select
                                id="vr-reciter"
                                value={selectedReciter.identifier}
                                disabled
                                className="w-full p-3 bg-background border border-border-color rounded-lg text-text-secondary disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                <option value={selectedReciter.identifier}>{selectedReciter.name}</option> 
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onClick={handlePlayRecitation} disabled={isLoadingData || !sheikhAudioUrl} className="w-full bg-primary/20 text-primary font-bold py-3 px-4 rounded-lg hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            {isLoadingData ? 'جاري التحميل...' : 'تشغيل التلاوة'}
                        </button>
                        <button onClick={handleAnalyzeReciter} disabled={isLoadingData || isLoadingAnalysis || !ayahText} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            {isLoadingAnalysis ? 'جاري التحليل...' : 'تحليل التلاوة'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                </div>
                
                <audio ref={audioPlayerRef} src={sheikhAudioUrl} className="hidden" preload="auto" />

                {sheikhAnalysis && (
                    <div className="border-t border-border-color pt-6 animate-fade-in space-y-4">
                        <h4 className="text-lg font-bold font-tajawal">تحليل تلاوة الشيخ</h4>
                        <p className="font-amiri-quran text-xl bg-background p-3 rounded-lg text-center">{ayahText}</p>
                        <div className="bg-background p-4 rounded-lg space-y-2">
                            <h5 className="font-semibold">أحكام التجويد:</h5>
                            {sheikhAnalysis.tajweedRules?.map((rule, i) => <p key={i} className="text-sm">🔹 <strong>{rule.word}</strong>: {rule.rule} ({rule.explanation}) <em className="text-xs text-text-secondary">[{rule.source}]</em></p>)}
                        </div>
                        <div className="text-center pt-4">
                            <button onClick={isRecording ? handleStopRecording : handleStartRecording} disabled={isLoadingData || isLoadingUser || !sheikhAudioUrl} className={`px-8 py-3 font-bold rounded-full flex items-center justify-center gap-3 mx-auto transition-colors disabled:opacity-50 ${isRecording ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                {isRecording ? <><StopIcon className="w-6 h-6"/> إيقاف</> : isLoadingUser ? 'جاري التحليل...' : <><MicrophoneIcon className="w-6 h-6" /> اختبار التلاوة</>}
                            </button>
                        </div>
                    </div>
                )}

                {userAnalysis && (
                    <div className="border-t border-border-color pt-6 animate-fade-in space-y-4">
                        <h4 className="text-lg font-bold font-tajawal">تقرير تلاوتك</h4>
                        {!userAnalysis.recitedAyahMatches ? (
                            <p className="p-4 bg-red-500/10 text-red-700 rounded-lg text-center font-semibold">الرجاء تلاوة نفس الآية المختارة.</p>
                        ) : (
                            <>
                                <div className="text-center">
                                    <p className="text-sm text-text-secondary">نسبة التشابه</p>
                                    <p className="text-4xl font-bold text-primary">{userAnalysis.similarityPercentage}%</p>
                                    <div className="w-full bg-border-color rounded-full h-2.5 mt-2"><div className="bg-primary h-2.5 rounded-full" style={{ width: `${userAnalysis.similarityPercentage}%` }}></div></div>
                                </div>
                                <div className="bg-background p-4 rounded-lg">
                                    <h5 className="font-semibold">ملاحظات عامة:</h5>
                                    <p className="text-sm mt-2">{userAnalysis.overallFeedback}</p>
                                </div>
                                <div className="bg-green-500/10 p-4 rounded-lg">
                                    <h5 className="font-semibold text-green-800">نقاط القوة ✅:</h5>
                                    <ul className="list-disc list-inside text-sm mt-2 text-green-700 space-y-1">{userAnalysis.correctPoints?.map((p, i) => <li key={i}>{p}</li>)}</ul>
                                </div>
                                 <div className="bg-yellow-500/10 p-4 rounded-lg">
                                    <h5 className="font-semibold text-yellow-800">نقاط للتحسين 💡:</h5>
                                    <ul className="list-disc list-inside text-sm mt-2 text-yellow-700 space-y-1">{userAnalysis.improvementPoints?.map((p, i) => <li key={i}><strong>{p.word}</strong>: {p.suggestion}</li>)}</ul>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceRecitationAnalysis;