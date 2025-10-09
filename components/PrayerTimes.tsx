import React, { useState, useEffect } from 'react';
import { PrayerSettings, PrayerTimes as PrayerTimesType } from '../types';

interface PrayerTimesProps {
  prayerSettings: PrayerSettings | null;
  remindersEnabled: boolean;
}

const prayerNames: { [key: string]: string } = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

const PrayerTimes: React.FC<PrayerTimesProps> = ({ prayerSettings, remindersEnabled }) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesType | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect for fetching prayer times data
  useEffect(() => {
    if (prayerSettings && prayerSettings.method !== undefined) {
      const fetchPrayerTimes = async () => {
        setIsLoading(true);
        setError(null);
        setPrayerTimes(null);
        try {
          const country = encodeURIComponent(prayerSettings.country);
          const city = encodeURIComponent(prayerSettings.region);
          const method = prayerSettings.method;

          const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${method}`);
          const data = await response.json();

          if (data.code !== 200 || !data.data.timings) {
            const errorMessage = data?.data || `Failed to fetch prayer times (status: ${data.status}).`;
            throw new Error(errorMessage);
          }
          
          const timings: PrayerTimesType = {
            Fajr: data.data.timings.Fajr,
            Dhuhr: data.data.timings.Dhuhr,
            Asr: data.data.timings.Asr,
            Maghrib: data.data.timings.Maghrib,
            Isha: data.data.timings.Isha,
          };

          setPrayerTimes(timings);
        } catch (err) {
          if(err instanceof Error) setError(err.message);
          else setError('An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPrayerTimes();
    }
  }, [prayerSettings]);

  // Effect for scheduling and cleaning up notifications
  useEffect(() => {
    if (prayerTimes && remindersEnabled && typeof window.Notification !== 'undefined' && Notification.permission === 'granted') {
      const now = new Date();
      const timeouts: number[] = [];

      Object.entries(prayerTimes).forEach(([name, time]) => {
        if (prayerNames[name]) {
          const [hours, minutes] = (time as string).split(':').map(Number);
          const prayerDate = new Date();
          prayerDate.setHours(hours, minutes, 0, 0);

          if (prayerDate > now) {
            const timeoutDuration = prayerDate.getTime() - now.getTime();
            const timeoutId = window.setTimeout(() => {
              new Notification('حي على الصلاة', {
                body: `حان الآن وقت صلاة ${prayerNames[name]}`,
                icon: 'https://i.imgur.com/1m8xN9N.png'
              });
            }, timeoutDuration);
            timeouts.push(timeoutId);
          }
        }
      });
      
      // Return a cleanup function to clear timeouts
      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [prayerTimes, remindersEnabled]);
  
  // Effect for calculating the next prayer time
  useEffect(() => {
    if (prayerTimes) {
      const now = new Date();
      let next: { name: string; time: string } | null = null;
      
      const sortedPrayers = Object.entries(prayerTimes)
        .filter(([name]) => prayerNames[name])
        .map(([name, time]) => {
            const timeString = time as string;
            const [hours, minutes] = timeString.split(':').map(Number);
            const prayerDate = new Date();
            prayerDate.setHours(hours, minutes, 0, 0);
            return { name, time: timeString, date: prayerDate };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      for (const prayer of sortedPrayers) {
        if (prayer.date > now) {
          next = { name: prayerNames[prayer.name], time: prayer.time };
          break;
        }
      }
      
      if (!next && sortedPrayers.length > 0) {
          next = { name: prayerNames[sortedPrayers[0].name], time: sortedPrayers[0].time };
      }

      setNextPrayer(next);
    }
  }, [prayerTimes]);

  if (!prayerSettings) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="bg-card rounded-lg shadow-md p-4 animate-fade-in">
        <h3 className="text-lg font-semibold text-text-primary mb-3 text-center">أوقات الصلاة</h3>
        {isLoading && <p className="text-center">...جاري التحميل</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {prayerTimes && !isLoading && !error && (
          <div>
            {nextPrayer && (
                <div className="text-center mb-4">
                    <p className="text-sm text-text-secondary">الصلاة التالية</p>
                    <p className="text-2xl font-bold text-primary">
                        {nextPrayer.name} في {nextPrayer.time}
                    </p>
                </div>
            )}
            <div className="grid grid-cols-5 gap-2 text-center border-t border-border-color pt-3">
              {Object.entries(prayerTimes)
                .filter(([key]) => prayerNames[key])
                .map(([key, value]) => (
                <div key={key}>
                  <p className="font-semibold text-text-primary">{prayerNames[key]}</p>
                  <p className="text-sm text-text-secondary">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerTimes;