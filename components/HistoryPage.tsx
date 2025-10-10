import React, { useState, useEffect } from 'react';
import { siraTopics, sahaba, islamicBattles, dailyWisdoms, rashidunCaliphs, muslimScholars } from '../data/historyData';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SiraIcon } from './icons/SiraIcon';
import { SahabaIcon } from './icons/SahabaIcon';
import { BattlesIcon } from './icons/BattlesIcon';
import { CaliphIcon } from './icons/CaliphIcon';
import { ScholarIcon } from './icons/ScholarIcon';


// --- ICONS ---
const WisdomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 12l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 18l-1.035.259a3.375 3.375 0 00-2.456 2.456L18 21.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 18l1.035-.259a3.375 3.375 0 002.456-2.456L18 12z" /></svg>;


const WisdomOfTheDay: React.FC = () => {
    const [wisdom, setWisdom] = useState<{ quote: string; source: string } | null>(null);

    useEffect(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const selectedWisdom = dailyWisdoms[dayOfYear % dailyWisdoms.length];
        setWisdom(selectedWisdom);
    }, []);

    if (!wisdom) return null;

    return (
        <div className="bg-primary/10 border-l-4 border-primary text-primary p-4 rounded-r-lg mb-8 shadow-md">
            <div className="flex items-center">
                <WisdomIcon />
                <div>
                    <h3 className="font-bold">حكمة اليوم</h3>
                    <p className="mt-1 text-text-primary italic">"{wisdom.quote}"</p>
                    <p className="text-xs text-text-secondary text-left mt-1">- {wisdom.source}</p>
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-t-lg transition-all font-semibold border-b-4 ${
    isActive ? 'bg-card border-primary text-primary' : 'bg-transparent border-transparent text-text-secondary hover:bg-card/50'
  }`}>
    {icon}
    <span className="text-xs sm:text-sm">{label}</span>
  </button>
);

type Tab = 'sira' | 'sahaba' | 'battles' | 'caliphs' | 'scholars';

const HistoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('sira');
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setExpandedItem(prev => (prev === id ? null : id));
    };
    
    const renderSira = () => (
      <div className="space-y-4">
        {siraTopics.map(topic => (
          <div key={topic.title} className="bg-card rounded-lg shadow-sm border border-border-color overflow-hidden">
            <button onClick={() => toggleItem(topic.title)} className="w-full text-right p-4 flex justify-between items-center">
              <h3 className="font-bold text-text-primary">{topic.title}</h3>
              <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform ${expandedItem === topic.title ? 'rotate-180' : ''}`} />
            </button>
            {expandedItem === topic.title && (
              <div className="p-4 border-t border-border-color bg-background">
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{topic.fullContent}</p>
                <p className="text-xs text-text-secondary/70 mt-3 pt-2 border-t border-dashed border-border-color/50 text-left">{topic.source}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
    
    const renderSahaba = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sahaba.map(companion => (
          <div key={companion.name} className="bg-card rounded-lg shadow-sm border border-border-color">
            <div className="p-4">
                <h3 className="font-bold text-lg text-text-primary">{companion.name}</h3>
                <p className="text-sm text-text-secondary mt-1">{companion.preview}</p>
            </div>
            {expandedItem === companion.name && (
                <div className="p-4 border-t border-border-color bg-background">
                    <div className="whitespace-pre-wrap text-text-secondary text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: companion.fullContent.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary">$1</strong>') }}></div>
                    <p className="text-xs text-text-secondary/70 mt-3 pt-2 border-t border-dashed border-border-color/50 text-left">{companion.source}</p>
                </div>
            )}
            <div className="p-2 border-t border-border-color text-center">
                 <button onClick={() => toggleItem(companion.name)} className="text-xs font-bold text-primary hover:underline">
                    {expandedItem === companion.name ? 'عرض أقل' : 'اقرأ المزيد'}
                </button>
            </div>
          </div>
        ))}
      </div>
    );

    const renderBattles = () => (
        <div className="space-y-4">
            {islamicBattles.map(battle => (
                <div key={battle.name} className="bg-card rounded-lg shadow-sm border border-border-color overflow-hidden">
                    <button onClick={() => toggleItem(battle.name)} className="w-full text-right p-4 flex justify-between items-center">
                        <h3 className="font-bold text-text-primary">{battle.name} <span className="text-sm font-normal text-text-secondary">({battle.date})</span></h3>
                        <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform ${expandedItem === battle.name ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedItem === battle.name && (
                        <div className="p-4 border-t border-border-color bg-background space-y-3">
                            <div><strong className="text-text-primary">السبب:</strong> <span className="text-text-secondary">{battle.reason}</span></div>
                            <div><strong className="text-text-primary">المشاركون:</strong> <span className="text-text-secondary">{battle.participants}</span></div>
                            <div><strong className="text-text-primary">الأحداث:</strong> <p className="text-text-secondary whitespace-pre-wrap leading-relaxed mt-1">{battle.events}</p></div>
                            <div><strong className="text-text-primary">النتائج:</strong> <p className="text-text-secondary whitespace-pre-wrap leading-relaxed mt-1">{battle.results}</p></div>
                             <div><strong className="text-text-primary">قصص مميزة:</strong> <p className="text-text-secondary whitespace-pre-wrap leading-relaxed mt-1">{battle.stories}</p></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderCaliphs = () => (
      <div className="space-y-4">
        {rashidunCaliphs.map(caliph => (
          <div key={caliph.name} className="bg-card rounded-lg shadow-sm border border-border-color overflow-hidden">
            <button onClick={() => toggleItem(caliph.name)} className="w-full text-right p-4 flex justify-between items-center">
                <h3 className="font-bold text-text-primary">{caliph.name} <span className="text-sm font-normal text-text-secondary">({caliph.period})</span></h3>
                <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform ${expandedItem === caliph.name ? 'rotate-180' : ''}`} />
            </button>
            {expandedItem === caliph.name && (
              <div className="p-4 border-t border-border-color bg-background">
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{caliph.keyEvents}</p>
                <p className="text-xs text-text-secondary/70 mt-3 pt-2 border-t border-dashed border-border-color/50 text-left">{caliph.source}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );

    const renderScholars = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {muslimScholars.map(scholar => (
          <div key={scholar.name} className="bg-card rounded-lg shadow-sm border border-border-color p-4">
            <h3 className="font-bold text-lg text-text-primary">{scholar.name}</h3>
            <p className="text-sm font-semibold text-primary mt-1">{scholar.field}</p>
            <p className="text-text-secondary text-sm leading-relaxed mt-2">{scholar.contribution}</p>
            <p className="text-xs text-text-secondary/70 mt-3 pt-2 border-t border-dashed border-border-color/50 text-left">{scholar.source}</p>
          </div>
        ))}
      </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 animate-fade-in">
            <WisdomOfTheDay />

            <div className="bg-card/50 rounded-lg p-1 mb-6 flex items-center gap-1 shadow-inner overflow-x-auto">
                <TabButton icon={<SiraIcon />} label="السيرة" isActive={activeTab === 'sira'} onClick={() => { setActiveTab('sira'); setExpandedItem(null); }} />
                <TabButton icon={<SahabaIcon />} label="الصحابة" isActive={activeTab === 'sahaba'} onClick={() => { setActiveTab('sahaba'); setExpandedItem(null); }} />
                <TabButton icon={<BattlesIcon />} label="الغزوات" isActive={activeTab === 'battles'} onClick={() => { setActiveTab('battles'); setExpandedItem(null); }} />
                <TabButton icon={<CaliphIcon className="h-6 w-6" />} label="الخلفاء" isActive={activeTab === 'caliphs'} onClick={() => { setActiveTab('caliphs'); setExpandedItem(null); }} />
                <TabButton icon={<ScholarIcon className="h-6 w-6" />} label="العلماء" isActive={activeTab === 'scholars'} onClick={() => { setActiveTab('scholars'); setExpandedItem(null); }} />
            </div>

            <div className="animate-fade-in">
                {activeTab === 'sira' && renderSira()}
                {activeTab === 'sahaba' && renderSahaba()}
                {activeTab === 'battles' && renderBattles()}
                {activeTab === 'caliphs' && renderCaliphs()}
                {activeTab === 'scholars' && renderScholars()}
            </div>
        </div>
    );
};

export default HistoryPage;