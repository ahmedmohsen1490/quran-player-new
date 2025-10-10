import React, { useState, useEffect, useMemo } from 'react';
import { MuazzinSettings, AzkarSettings, Surah } from '../types';
import { InfoIcon } from './icons/InfoIcon';
import { TrashIcon } from './icons/TrashIcon';
import { locations } from '../data/locations';
import { CALCULATION_METHODS } from '../constants';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    azkarSettings: AzkarSettings;
    onAzkarSettingsChange: (settings: AzkarSettings) => void;
    surahs: Surah[];
    downloadedTafsir: Set<number>;
    onDeleteTafsir: (surahId: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
    isOpen, onClose,
    azkarSettings, onAzkarSettingsChange, surahs,
    downloadedTafsir, onDeleteTafsir
}) => {
    const [showBatteryInfo, setShowBatteryInfo] = useState(false);
    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
    
    useEffect(() => {
      if (isOpen) {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            setShowNotificationPrompt(true);
        } else {
            setShowNotificationPrompt(false);
        }
      }
    }, [isOpen]);

    const handleToggleAzkarReminders = () => {
        const newIsEnabled = !azkarSettings.isEnabled;
        if (newIsEnabled) {
            if (typeof Notification === 'undefined') {
                alert('هذا المتصفح لا يدعم الإشعارات.');
                return;
            }
            if (Notification.permission === 'granted') {
                onAzkarSettingsChange({ ...azkarSettings, isEnabled: true });
                setShowBatteryInfo(true);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        onAzkarSettingsChange({ ...azkarSettings, isEnabled: true });
                        setShowBatteryInfo(true);
                        setShowNotificationPrompt(false);
                    } else {
                        alert('لتمكين الإشعارات، يرجى منح الإذن.');
                    }
                });
            } else {
                alert('تم حظر الإشعارات. يرجى تفعيلها من إعدادات المتصفح.');
            }
        } else {
            onAzkarSettingsChange({ ...azkarSettings, isEnabled: false });
        }
    };

    const handleRequestNotificationPermission = () => {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission().then(() => {
                setShowNotificationPrompt(false);
            });
        }
    };
    
    const downloadedContentSurahs = useMemo(() => {
        return surahs.filter(surah => downloadedTafsir.has(surah.id));
    }, [surahs, downloadedTafsir]);


    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
                <div className="bg-card rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-text-primary">الإعدادات</h2>
                        <button onClick={onClose} className="text-text-secondary text-3xl leading-none hover:text-text-primary">&times;</button>
                    </div>
                    
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

                        {showNotificationPrompt && (
                            <div className="p-3 bg-blue-500/10 text-blue-800 dark:text-blue-300 rounded-lg flex items-start gap-3 animate-fade-in">
                                <InfoIcon className="w-5 h-5 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold">تفعيل التنبيهات</p>
                                    <p className="text-xs mt-1">للاستفادة من تنبيهات الصلاة والأذكار، يرجى تمكين الإشعارات.</p>
                                    <button
                                        onClick={handleRequestNotificationPermission}
                                        className="mt-2 text-xs font-bold bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-md hover:bg-blue-300 dark:hover:bg-blue-800"
                                    >
                                        تمكين الإشعارات
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="p-3 bg-background rounded-lg space-y-3">
                            <h3 className="font-medium text-text-primary">إعدادات التنبيهات</h3>
                            <div className="flex items-center justify-between">
                                <label htmlFor="azkar-toggle" className="text-sm text-text-primary">تنبيهات الأذكار</label>
                                <button
                                    role="switch"
                                    aria-checked={azkarSettings.isEnabled}
                                    onClick={handleToggleAzkarReminders}
                                    className={`${azkarSettings.isEnabled ? 'bg-primary' : 'bg-border-color'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                >
                                    <span className={`${azkarSettings.isEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                </button>
                            </div>
                            {azkarSettings.isEnabled && (
                                <div className="flex items-center justify-between animate-fade-in pl-2">
                                    <label htmlFor="azkar-frequency" className="text-xs text-text-secondary">التكرار</label>
                                    <select 
                                        id="azkar-frequency"
                                        value={azkarSettings.frequency}
                                        onChange={(e) => onAzkarSettingsChange({ ...azkarSettings, frequency: Number(e.target.value)})}
                                        className="bg-card border border-border-color text-text-primary text-xs rounded-md focus:ring-primary focus:border-primary block p-1"
                                    >
                                        <option value={1}>كل ساعة</option>
                                        <option value={3}>كل 3 ساعات</option>
                                        <option value={12}>مرتين يوميًا</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-3 bg-background rounded-lg space-y-3">
                            <h3 className="font-medium text-text-primary">إدارة المحتوى المحمّل</h3>
                            <div className="max-h-40 overflow-y-auto space-y-2">
                                {downloadedContentSurahs.length > 0 ? downloadedContentSurahs.map(surah => (
                                    <div key={surah.id} className="p-2 bg-card rounded">
                                        <span className="text-sm font-amiri-quran font-semibold">{surah.name}</span>
                                        <div className="pl-4 mt-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-text-secondary">تفسير</span>
                                                <button 
                                                    onClick={() => onDeleteTafsir(surah.id)}
                                                    className="text-red-500 hover:text-red-700 p-1 rounded-full"
                                                    aria-label={`Delete tafsir for ${surah.name}`}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-text-secondary text-center p-4">لا يوجد محتوى محمّل.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <button
                            onClick={onClose}
                            className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:opacity-90 focus:outline-none"
                        >
                            تم
                        </button>
                    </div>
                </div>
            </div>
            {showBatteryInfo && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60]" onClick={() => setShowBatteryInfo(false)}>
                    <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-sm m-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <InfoIcon className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-3">تنبيه هام</h3>
                        <p className="text-sm text-text-secondary mb-5">
                            لضمان وصول إشعارات الأذكار بانتظام، قد تحتاج إلى استثناء التطبيق من إعدادات توفير البطارية على جهازك.
                        </p>
                        <button
                            onClick={() => setShowBatteryInfo(false)}
                            className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:opacity-90 w-full"
                        >
                            حسنًا، فهمت
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Settings;