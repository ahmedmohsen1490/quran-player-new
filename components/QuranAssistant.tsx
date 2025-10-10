import React, { useState, useEffect } from 'react';
import { Surah, AyahReference } from '../types';
import { BackIcon } from './icons/BackIcon';
import { quranicReferenceData } from '../data/quranicReferenceData';
import * as db from '../db';

// Icons for content sections
const TafsirIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const AhkamIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.102A2.25 2.25 0 016 3.852h12a2.25 2.25 0 012.25 2.25v1.05l-4.28 4.28a.75.75 0 01-1.06 0L12 9.39l-2.47 2.47a.75.75 0 01-1.06 0L4.2 11.134a.75.75 0 010-1.06l4.28-4.28H3.75z" transform="scale(1 1) translate(0 2)" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 15.75h18" /></svg>;
const HadithIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;


const QuranAssistant: React.FC<{ onBack: () => void; surahs: Surah[] }> = ({ onBack, surahs }) => {
    const [selectedSurahId, setSelectedSurahId] = useState('1');
    const [selectedAyahNumber, setSelectedAyahNumber] = useState('1');
    const [result, setResult] = useState<AyahReference | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const selectedSurahInfo = surahs.find(s => s.id === parseInt(selectedSurahId));
    const ayahsCount = selectedSurahInfo ? selectedSurahInfo.numberOfAyahs : 0;
    const ayahOptions = Array.from({ length: ayahsCount }, (_, i) => i + 1);

    useEffect(() => {
        setSelectedAyahNumber('1');
        setResult(null);
        setError('');
    }, [selectedSurahId]);

    const handleSearch = async () => {
        setError('');
        setResult(null);
        setIsLoading(true);

        const surahId = parseInt(selectedSurahId);
        const ayahNumber = parseInt(selectedAyahNumber);

        try {
            // Step 1: Check static data first
            const staticSurahData = quranicReferenceData.find(s => s.surahId === surahId);
            if (staticSurahData) {
                const staticAyahData = staticSurahData.ayahs.find(a => a.ayahNumber === ayahNumber);
                if (staticAyahData) {
                    setResult(staticAyahData);
                    setIsLoading(false);
                    return;
                }
            }

            // Step 2: Check IndexedDB cache
            const cachedData = await db.getReferenceAyah(surahId, ayahNumber);
            if (cachedData) {
                setResult(cachedData);
                setIsLoading(false);
                return;
            }

            // Step 3: Fetch from API
            const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahId}:${ayahNumber}/editions/quran-uthmani,ar.muyassar`);
            if (!response.ok) {
                throw new Error('فشل في جلب البيانات من الإنترنت. يرجى التحقق من اتصالك.');
            }
            const data = await response.json();
            if (data.code !== 200 || data.data.length < 2) {
                throw new Error('لم يتم العثور على بيانات لهذه الآية في المصدر.');
            }

            const newResult: AyahReference = {
                ayahNumber: ayahNumber,
                text: data.data[0].text,
                tafseer: {
                    text: data.data[1].text,
                    source: data.data[1].edition.name,
                },
                tajweed: {
                    text: "تحليل التجويد التفصيلي لهذه الآية يتطلب بحثًا متخصصًا.",
                    source: "عام",
                },
                hadith: [],
            };

            // Step 4: Save to cache and set result
            await db.addReferenceAyah(surahId, ayahNumber, newResult);
            setResult(newResult);

        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('حدث خطأ غير متوقع.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة</span></button>
            <div className="bg-card p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-2">المرجع القرآني الشامل</h3>
                <p className="text-sm text-text-secondary mb-4">اختر سورة وآية لعرض التفسير والأحاديث المتعلقة بها من مصادر موثوقة.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-2">
                        <label htmlFor="ref-surah" className="block text-sm font-medium text-text-primary mb-1">السورة</label>
                        <select id="ref-surah" value={selectedSurahId} onChange={(e) => setSelectedSurahId(e.target.value)}
                            className="w-full p-3 bg-background border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition">
                            {surahs.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ref-ayah" className="block text-sm font-medium text-text-primary mb-1">الآية</label>
                        <select id="ref-ayah" value={selectedAyahNumber} onChange={(e) => setSelectedAyahNumber(e.target.value)}
                            className="w-full p-3 bg-background border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition">
                            {ayahOptions.map(num => <option key={num} value={num}>{num}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleSearch} disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50">
                            {isLoading ? 'جاري البحث...' : 'بحث'}
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                
                {isLoading && (
                     <div className="text-center mt-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-text-secondary text-sm">جاري جلب البيانات...</p>
                    </div>
                )}

                {result && (
                    <div className="mt-6 border-t border-border-color pt-4 animate-fade-in space-y-6">
                        {/* Ayah Text */}
                        <div className="bg-background p-4 rounded-lg font-amiri-quran text-2xl leading-loose text-center">
                            <p>{result.text}</p>
                        </div>

                        {/* Tafseer */}
                        <div className="p-4 border border-border-color rounded-lg">
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-primary"><TafsirIcon /> <span>{result.tafseer.source || 'التفسير'}</span></h4>
                            <p className="whitespace-pre-wrap leading-relaxed text-text-secondary">{result.tafseer.text}</p>
                        </div>
                        
                        {/* Hadith */}
                        {result.hadith && result.hadith.length > 0 && (
                             <div className="p-4 border border-border-color rounded-lg">
                                <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-primary"><HadithIcon /> <span>أحاديث ذات صلة</span></h4>
                                <div className="space-y-4">
                                {result.hadith.map((h, index) => (
                                    <div key={index} className="border-t border-border-color/50 pt-2 first:border-t-0">
                                        <p className="italic text-text-secondary">"{h.text}"</p>
                                        <p className="text-xs text-right mt-1 font-mono text-primary/80">{h.source}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuranAssistant;
