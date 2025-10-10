import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MuazzinSettings, PrayerTimes, Muazzin as MuazzinType } from '../types';
import { locations } from '../data/locations';
import { CALCULATION_METHODS, MUAZZIN_LIST } from '../constants';
import { SettingsIcon } from './icons/SettingsIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SpeakerOnIcon } from './icons/SpeakerOnIcon';
import { SpeakerOffIcon } from './icons/SpeakerOffIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';

const prayerNames: { [key: string]: string } = {
  Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
};

const COUNTRY_METHOD_MAP: { [key: string]: number } = {
  "Egypt": 3,
  "Saudi Arabia": 4,
  "United Arab Emirates": 15,
  "United States": 2,
  "Canada": 2,
  "United Kingdom": 1,
  "Australia": 1,
  "Pakistan": 5,
  "India": 5,
  "Indonesia": 1,
  "Malaysia": 1,
  "Kuwait": 8,
  "Qatar": 9,
};

const MinusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);


const Muazzin: React.FC<{ settings: MuazzinSettings, onSettingsChange: (settings: MuazzinSettings) => void }> = ({ settings, onSettingsChange }) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [countdown, setCountdown] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<any>(settings);
  const [playingMuazzinUrl, setPlayingMuazzinUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<number>();

   useEffect(() => {
    if (isSettingsOpen) {
      // On open, convert numbers to strings for the input fields
      const stringifiedTune = Object.entries(settings.tune).reduce((acc, [key, val]) => {
        acc[key] = val === 0 ? '' : String(val); // show empty for 0
        return acc;
      }, {} as Record<string, string>);

      setLocalSettings({ ...settings, tune: stringifiedTune });
    }
  }, [isSettingsOpen, settings]);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { city, country, method, school, tune } = settings;

        // The API expects 8 tune values in order: Imsak, Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, Midnight.
        const fullTune = {
          Imsak: 0, Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0, Midnight: 0,
          ...tune
        };

        const tuneString = `${fullTune.Imsak},${fullTune.Fajr},${fullTune.Sunrise},${fullTune.Dhuhr},${fullTune.Asr},${fullTune.Maghrib},${fullTune.Isha},${fullTune.Midnight}`;
        
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}&school=${school}&tune=${tuneString}`);
        const data = await response.json();

        if (data.code !== 200 || !data.data.timings) {
          throw new Error(data.data || 'Failed to fetch prayer times.');
        }
        
        const { Fajr, Dhuhr, Asr, Maghrib, Isha } = data.data.timings;
        setPrayerTimes({ Fajr, Dhuhr, Asr, Maghrib, Isha });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    if (settings.city && settings.country) {
      fetchPrayerTimes();
    } else {
        setIsLoading(false);
        setError("الرجاء تحديد الموقع في الإعدادات.");
    }
  }, [settings]);

  useEffect(() => {
    const updateNextPrayer = () => {
      if (!prayerTimes) return;

      const now = new Date();
      let next: { name: string; time: string; date: Date } | null = null;
      const sortedPrayers = Object.entries(prayerTimes)
        .filter(([name]) => prayerNames[name])
        .map(([name, time]) => {
          const [hours, minutes] = (time as string).split(':').map(Number);
          const prayerDate = new Date();
          prayerDate.setHours(hours, minutes, 0, 0);
          return { name: prayerNames[name], time: time as string, date: prayerDate };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      for (const prayer of sortedPrayers) {
        if (prayer.date > now) {
          next = prayer;
          break;
        }
      }

      if (!next && sortedPrayers.length > 0) {
        const firstPrayerTomorrow = sortedPrayers[0];
        firstPrayerTomorrow.date.setDate(firstPrayerTomorrow.date.getDate() + 1);
        next = firstPrayerTomorrow;
      }
      
      setNextPrayer(next ? { name: next.name, time: next.time } : null);
      
      if (next) {
        const diff = next.date.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      } else {
        setCountdown('');
      }
    };
    
    updateNextPrayer();
    timerRef.current = window.setInterval(updateNextPrayer, 1000);
    return () => clearInterval(timerRef.current);
  }, [prayerTimes]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => setPlayingMuazzinUrl(null);
    audio.addEventListener('ended', onEnded);

    return () => {
        audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const handleSettingsSave = () => {
    const finalSettings = { ...localSettings };
    // Sanitize tune values back to numbers
    const numericTune = Object.entries(finalSettings.tune).reduce((acc, [key, val]) => {
        acc[key] = parseInt(String(val), 10) || 0;
        return acc;
    }, {} as Record<string, number>);

    onSettingsChange({ ...finalSettings, tune: numericTune });
    setIsSettingsOpen(false);
  };
  
  const countryNames = useMemo(() => Object.keys(locations).sort(), []);
  const cityNames = useMemo(() => locations[localSettings.country]?.sort() || [], [localSettings.country]);

  const handleTestMuazzin = (url: string) => {
    if (audioRef.current) {
      if (playingMuazzinUrl === url) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setPlayingMuazzinUrl(null);
      } else {
        audioRef.current.src = url;
        audioRef.current.play().catch(console.error);
        setPlayingMuazzinUrl(url);
      }
    }
  };
  
  const handleTuneChange = (prayer: string, change: number) => {
    setLocalSettings(s => {
        const currentTune = parseInt(s.tune?.[prayer] || '0', 10);
        const newValue = currentTune + change;
        return { ...s, tune: { ...s.tune, [prayer]: newValue === 0 ? '' : String(newValue) } };
    });
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-4 animate-fade-in">
        <audio ref={audioRef} />
        <div className="flex justify-between items-center mb-3">
            <div>
                 <h3 className="text-lg font-bold text-text-primary">المؤذن</h3>
                 <p className="text-sm text-text-secondary">{settings.city}, {settings.country}</p>
            </div>
            <button onClick={() => setIsSettingsOpen(p => !p)} className="p-2 rounded-full text-text-secondary hover:bg-border-color">
                <SettingsIcon className="w-6 h-6"/>
            </button>
        </div>

        {isSettingsOpen && (
             <div className="animate-fade-in space-y-4 mb-4 border-t border-border-color pt-4">
                 <div>
                    <h4 className="font-semibold text-text-primary mb-2">الموقع والتوقيت</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <select 
                            value={localSettings.country} 
                            onChange={e => {
                                const newCountry = e.target.value;
                                const newMethod = COUNTRY_METHOD_MAP[newCountry] || 1;
                                setLocalSettings(s => ({...s, country: newCountry, city: '', method: newMethod }))
                            }} 
                            className="w-full bg-background border border-border-color rounded-md py-2 px-3 text-sm"
                        >
                             {countryNames.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                         <select value={localSettings.city} onChange={e => setLocalSettings(s => ({...s, city: e.target.value}))} disabled={!localSettings.country} className="w-full bg-background border border-border-color rounded-md py-2 px-3 text-sm">
                             <option value="">اختر المدينة</option>
                             {cityNames.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={localSettings.school} onChange={e => setLocalSettings(s => ({...s, school: Number(e.target.value) as 0|1}))} className="w-full bg-background border border-border-color rounded-md py-2 px-3 text-sm col-span-2">
                             <option value={0}>توقيت العصر (شافعي/مالكي/حنبلي)</option>
                             <option value={1}>توقيت العصر (حنفي)</option>
                        </select>
                    </div>
                 </div>
                 <div>
                    <h4 className="font-semibold text-text-primary mb-2">تعديل دقيق للأوقات (بالدقائق)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center text-sm">
                      {Object.keys(prayerNames).map(key => (
                        <div key={key}>
                          <label htmlFor={`tune-${key}`} className="font-medium text-text-secondary">{prayerNames[key]}</label>
                          <div className="flex items-center justify-center mt-1 bg-background border border-border-color rounded-lg w-full mx-auto">
                            <button
                                onClick={() => handleTuneChange(key, -1)}
                                className="p-2 text-text-secondary hover:text-primary rounded-l-lg hover:bg-border-color transition-colors"
                                aria-label={`Decrease minutes for ${prayerNames[key]}`}
                            >
                                <MinusIcon className="w-4 h-4" />
                            </button>
                            <input
                                id={`tune-${key}`}
                                type="text"
                                value={localSettings.tune?.[key] || ''}
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || value === '-' || /^-?\d*$/.test(value)) {
                                       setLocalSettings(s => ({ ...s, tune: { ...s.tune, [key]: value } }));
                                    }
                                }}
                                className="w-full p-2 text-center bg-transparent border-x border-border-color focus:outline-none focus:ring-1 focus:ring-primary/50"
                                placeholder=""
                            />
                             <button
                                onClick={() => handleTuneChange(key, 1)}
                                className="p-2 text-text-secondary hover:text-primary rounded-r-lg hover:bg-border-color transition-colors"
                                aria-label={`Increase minutes for ${prayerNames[key]}`}
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">الأذان</h4>
                    <div className="space-y-2">
                        {MUAZZIN_LIST.map(muazzin => (
                            <div key={muazzin.id} className="flex items-center justify-between p-2 bg-background rounded-md">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" name="muazzin" value={muazzin.id} checked={localSettings.muazzinId === muazzin.id} onChange={() => setLocalSettings(s => ({...s, muazzinId: muazzin.id}))} className="form-radio text-primary focus:ring-primary"/>
                                    {muazzin.name}
                                </label>
                                <button onClick={() => handleTestMuazzin(muazzin.audioUrl)} className="p-1 rounded-full text-primary hover:bg-primary/10">
                                  {playingMuazzinUrl === muazzin.audioUrl ? <StopIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={handleSettingsSave} className="w-full bg-primary text-white font-bold py-2 rounded-md hover:opacity-90 mt-2">حفظ الإعدادات</button>
             </div>
        )}

        {isLoading && <p className="text-center text-sm text-text-secondary py-4">...جاري تحميل أوقات الصلاة</p>}
        {error && <p className="text-center text-sm text-red-500 py-4">{error}</p>}
        {prayerTimes && !isLoading && !error && (
            <>
                 {nextPrayer && (
                    <div className="text-center my-3 p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm text-primary">الصلاة التالية: <strong>{nextPrayer.name}</strong></p>
                        <p className="text-2xl font-bold font-mono text-primary tracking-wider">{countdown}</p>
                    </div>
                )}
                <div className="grid grid-cols-5 gap-2 text-center border-t border-border-color pt-3">
                    {Object.entries(prayerTimes).map(([key, value]) => (
                        <div key={key} className={nextPrayer?.name === prayerNames[key] ? 'p-1 bg-primary/20 rounded-md' : 'p-1'}>
                            <p className="font-semibold text-text-primary text-sm">{prayerNames[key]}</p>
                            <p className="text-xs text-text-secondary font-mono">{value}</p>
                        </div>
                    ))}
                </div>
            </>
        )}
    </div>
  );
};

export default Muazzin;
