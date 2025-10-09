
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { siraTopics, sahaba, islamicBattles } from '../data/historyData';
import { HistoryTopic, Companion, Battle } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { BrainIcon } from './icons/BrainIcon';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  level?: number;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onClick, level = 0 }) => {
  const levelStyles = [
    { bg: 'bg-card', hoverBg: 'hover:bg-border-color/50', border: 'border-b border-border-color' }, // level 0
    { bg: 'bg-background', hoverBg: 'hover:bg-border-color/30', border: 'border-t border-border-color' }, // level 1
    { bg: 'bg-card', hoverBg: 'hover:bg-border-color/50', border: 'border-t border-border-color/50' }, // level 2
  ];
  const style = levelStyles[level % levelStyles.length];

  return (
    <div className={`${style.border}`}>
      <button
        onClick={onClick}
        className={`w-full flex justify-between items-center text-right p-4 transition-colors ${style.bg} ${style.hoverBg}`}
      >
        <h3 className={`font-semibold ${level > 0 ? 'text-base' : 'text-lg'} text-text-primary`}>{title}</h3>
        <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className={`p-4 ${style.bg} animate-fade-in`}>
          <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const LifeAdviceBox: React.FC = () => {
    const [advice, setAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAdvice = async () => {
            if (!process.env.API_KEY) {
                setAdvice("نصيحة اليوم: تفاءل بالخير تجده. (مفتاح API غير متوفر)");
                setIsLoading(false);
                return;
            }
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: "Generate a single, short, inspirational piece of life advice in Arabic based on an event from the life of Prophet Muhammad ﷺ or one of the Ten Companions Promised Paradise. The advice should be practical and end with a reference to the person it's based on (e.g., '- من حياة النبي ﷺ' or '- من سيرة عمر بن الخطاب'). The response should be a single string, no JSON, no markdown.",
                });
                setAdvice(response.text.trim());
            } catch (err) {
                setError('فشل في جلب نصيحة اليوم.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdvice();
    }, []);

    return (
        <div className="bg-primary/10 border-l-4 border-primary text-primary p-4 rounded-r-lg mb-8 shadow-md">
            <div className="flex items-center">
                <BrainIcon className="w-8 h-8 mr-4 flex-shrink-0" />
                <div>
                    <h3 className="font-bold">درس من حياة العظماء</h3>
                    {isLoading && <p className="animate-pulse">جاري تحميل الحكمة...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isLoading && !error && <p className="mt-1 text-text-primary">{advice}</p>}
                </div>
            </div>
        </div>
    );
};


const HistoryPage: React.FC = () => {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const [expandedSira, setExpandedSira] = useState<Record<string, boolean>>({});
    const [expandedSahaba, setExpandedSahaba] = useState<Record<string, boolean>>({});

    const toggleSection = (id: string) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSiraTopic = (title: string) => {
        setExpandedSira(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const toggleSahabi = (name: string) => {
        setExpandedSahaba(prev => ({ ...prev, [name]: !prev[name] }));
    };


    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 animate-fade-in">
             <LifeAdviceBox />

            <div className="rounded-lg shadow-lg overflow-hidden border border-border-color">
                <AccordionItem
                    title="السيرة النبوية"
                    isOpen={!!openSections['sira']}
                    onClick={() => toggleSection('sira')}
                >
                    <div className="space-y-3 -m-4">
                        {siraTopics.map(topic => (
                             <div key={topic.title} className="p-4 border-b border-border-color/50 last:border-b-0">
                                <h4 className="text-base font-bold text-text-primary mb-2">{topic.title}</h4>
                                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                                    {expandedSira[topic.title] ? topic.fullContent : topic.preview}
                                </p>
                                {expandedSira[topic.title] && (
                                    <p className="text-xs text-text-secondary/80 mt-3 pt-2 border-t border-dashed border-border-color">
                                        {topic.source}
                                    </p>
                                )}
                                <div className="text-left mt-2">
                                    <button
                                        onClick={() => toggleSiraTopic(topic.title)}
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        {expandedSira[topic.title] ? 'عرض أقل' : 'عرض المزيد'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </AccordionItem>
                
                <AccordionItem
                    title="صحابة الرسول"
                    isOpen={!!openSections['sahaba']}
                    onClick={() => toggleSection('sahaba')}
                >
                    <div className="space-y-3 -m-4">
                        {sahaba.map(companion => (
                            <div key={companion.name} className="p-4 border-b border-border-color/50 last:border-b-0">
                                <h4 className="text-base font-bold text-text-primary mb-2">{companion.name}</h4>
                                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                                    {expandedSahaba[companion.name] ? companion.fullContent : companion.preview}
                                </p>
                                {expandedSahaba[companion.name] && (
                                    <p className="text-xs text-text-secondary/80 mt-3 pt-2 border-t border-dashed border-border-color">
                                        {companion.source}
                                    </p>
                                )}
                                <div className="text-left mt-2">
                                    <button
                                        onClick={() => toggleSahabi(companion.name)}
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        {expandedSahaba[companion.name] ? 'عرض أقل' : 'عرض المزيد'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </AccordionItem>

                 <AccordionItem
                    title="الغزوات الإسلامية"
                    isOpen={!!openSections['battles']}
                    onClick={() => toggleSection('battles')}
                >
                     {islamicBattles.map(battle => (
                         <AccordionItem
                            key={battle.name}
                            title={battle.name}
                            isOpen={!!openSections[battle.name]}
                            onClick={() => toggleSection(battle.name)}
                            level={1}
                        >
                            <div className="space-y-4">
                                <p><strong>التاريخ بالهجري والميلادي:</strong> {battle.date}</p>
                                <p><strong>سبب الغزوة:</strong> {battle.reason}</p>
                                <p><strong>عدد المشاركين من المسلمين والكفار:</strong> {battle.participants}</p>
                                <div><h4 className="font-semibold text-text-primary">أحداث المعركة بالتفصيل:</h4><p>{battle.events}</p></div>
                                <div><h4 className="font-semibold text-text-primary">نتائج وتأثير الغزوة:</h4><p>{battle.results}</p></div>
                                <div><h4 className="font-semibold text-text-primary">قصص مميزة مرتبطة بالغزوة:</h4><p>{battle.stories}</p></div>
                            </div>
                        </AccordionItem>
                    ))}
                </AccordionItem>
            </div>
        </div>
    );
};

export default HistoryPage;