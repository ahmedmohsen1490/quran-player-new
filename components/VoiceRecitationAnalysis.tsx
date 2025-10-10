import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Surah, Reciter, RecitationAnalysis } from '../types';
import { BackIcon } from './icons/BackIcon';
import { PlayIcon } from './icons/PlayIcon';
import { recitationAnalysisData } from '../data/recitationAnalysisData';

const EVERYAYAH_RECITER_ID = 'Abdul_Basit_Mujawwad_128kbps';

const pad = (num: number, size: number): string => {
    let s = num.toString();
    while (s.length < size) s = "0" + s;
    return s;
};

const abdulBasitReciter: Reciter = {
  identifier: EVERYAYAH_RECITER_ID,
  name: 'الشيخ عبد الباسط عبد الصمد (مجود)',
  englishName: 'Abdel Basit Abdel Samad (Mujawwad)',
  rawName: 'عبدالباسط عبدالصمد',
  style: 'Mujawwad',
};


const VoiceRecitationAnalysis: React.FC<{ onBack: () => void; surahs: Surah[] }> = ({ onBack, surahs }) => {
    const availableSurahs = useMemo(() => {
        const availableIds = [...new Set(recitationAnalysisData.map(d => d.surahId))];
        return surahs.filter(s => availableIds.includes(s.id)).sort((a,b) => a.id - b.id);
    }, [surahs]);

    const [selectedSurahId, setSelectedSurahId] = useState(() => availableSurahs[0]?.id.toString() || '1');
    
    const availableAyahNumbers = useMemo(() => {
        const surahId = parseInt(selectedSurahId, 10);
        return recitationAnalysisData
            .filter(d => d.surahId === surahId)
            .map(d => d.ayahNumber)
            .sort((a, b) => a - b);
    }, [selectedSurahId]);

    const [ayahNumber, setAyahNumber] = useState(() => availableAyahNumbers[0]?.toString() || '1');

    const [ayahText, setAyahText] = useState('');
    const [sheikhAudioUrl, setSheikhAudioUrl] = useState('');
    const audioPlayerRef = useRef<HTMLAudioElement>(null);

    const [analysisData, setAnalysisData] = useState<RecitationAnalysis | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const firstAvailableAyah = availableAyahNumbers[0]?.toString() || '1';
        setAyahNumber(firstAvailableAyah);
        setShowAnalysis(false);
        setAnalysisData(null);
    }, [selectedSurahId, availableAyahNumbers]);

     useEffect(() => {
        const surahId = parseInt(selectedSurahId);
        const ayahNum = parseInt(ayahNumber);

        const data = recitationAnalysisData.find(d => d.surahId === surahId && d.ayahNumber === ayahNum);
        
        if (data) {
            setAyahText(data.text);
            const surahPadded = pad(surahId, 3);
            const ayahPadded = pad(ayahNum, 3);
            const audioUrl = `https://everyayah.com/data/${abdulBasitReciter.identifier}/${surahPadded}${ayahPadded}.mp3`;
            setSheikhAudioUrl(audioUrl);
            setShowAnalysis(false);
            setAnalysisData(null);
            setError('');
        }
    }, [selectedSurahId, ayahNumber]);

    const handlePlaySheikhRecitation = () => {
        if (sheikhAudioUrl && audioPlayerRef.current) {
            audioPlayerRef.current.play().catch(() => setError('فشل تشغيل صوت الشيخ.'));
        }
    };
    
    const handleShowAnalysis = () => {
        setIsLoadingAnalysis(true);
        setError('');
        setAnalysisData(null);
        setShowAnalysis(false);

        const surahId = parseInt(selectedSurahId);
        const ayahNum = parseInt(ayahNumber);

        setTimeout(() => {
            const data = recitationAnalysisData.find(d => d.surahId === surahId && d.ayahNumber === ayahNum);
            if (data) {
                setAnalysisData(data);
                setShowAnalysis(true);
            } else {
                // This case should ideally not be reached due to UI filtering
                setError("التحليل التجويدي لهذه الآية غير متوفر في قاعدة البيانات حاليًا");
            }
            setIsLoadingAnalysis(false);
        }, 300);
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة</span></button>
            <div className="bg-card p-6 rounded-xl shadow-lg space-y-6">
                <h3 className="text-xl font-bold font-tajawal">دراسة التجويد</h3>
                
                {/* Ayah Selection */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="vr-surah" className="block text-sm font-medium text-text-primary mb-1">السورة</label>
                            <select id="vr-surah" value={selectedSurahId} onChange={e => setSelectedSurahId(e.target.value)} className="w-full p-3 bg-background border border-border-color rounded-lg">
                                {availableSurahs.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="vr-ayah" className="block text-sm font-medium text-text-primary mb-1">الآية</label>
                            <select id="vr-ayah" value={ayahNumber} onChange={e => setAyahNumber(e.target.value)} className="w-full p-3 bg-background border border-border-color rounded-lg" disabled={availableAyahNumbers.length === 0}>
                                {availableAyahNumbers.map(n => <option key={n} value={n}>آية {n}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-background rounded-lg text-center font-amiri-quran text-2xl leading-loose min-h-[6rem] flex items-center justify-center">
                        {ayahText ? <p>{ayahText}</p> : <p className="text-sm text-text-secondary font-sans">اختر سورة وآية لعرضها.</p>}
                    </div>
                </div>

                <audio ref={audioPlayerRef} src={sheikhAudioUrl} className="hidden" preload="auto" />

                {/* Analysis Section */}
                <div className="border-t border-border-color pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onClick={handlePlaySheikhRecitation} disabled={!sheikhAudioUrl} className="flex items-center justify-center gap-2 w-full bg-primary/20 text-primary font-bold py-3 px-4 rounded-lg hover:bg-primary/30 disabled:opacity-50 transition">
                            <PlayIcon className="w-6 h-6"/>
                            <span>استمع لتلاوة الشيخ</span>
                        </button>
                        <button onClick={handleShowAnalysis} disabled={isLoadingAnalysis || !ayahText} className="w-full bg-primary/20 text-primary font-bold py-3 px-4 rounded-lg hover:bg-primary/30 disabled:opacity-50 transition">
                            {isLoadingAnalysis ? '...' : 'تحليل أحكام التجويد'}
                        </button>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

                    {showAnalysis && analysisData && (
                        <div className="mt-4 bg-background p-4 rounded-lg space-y-3 animate-fade-in">
                             <h4 className="text-lg font-bold font-tajawal mb-3 text-center">أحكام التجويد في الآية</h4>
                            {analysisData.tajweedAnalysis.map((rule, i) => (
                                <div key={i} className="border-b border-border-color/30 pb-2 last:border-b-0 last:pb-0">
                                    <p className="font-semibold text-text-primary">🔹 <strong>{rule.word}</strong>: {rule.rule}</p>
                                    <p className="text-sm text-text-secondary mr-4">{rule.explanation}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceRecitationAnalysis;