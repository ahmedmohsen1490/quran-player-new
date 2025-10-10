import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { AudioIcon } from './icons/AudioIcon';
import { ReadIcon } from './icons/ReadIcon';
import { KidsIcon } from './icons/KidsIcon';
import { BrainIcon } from './icons/BrainIcon';
import { HistoryIcon } from './icons/HistoryIcon';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureHighlight: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  detailedDescription: string;
}> = ({ icon, title, description, detailedDescription }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="py-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-primary mt-1">{icon}</div>
        <div>
          <h4 className="font-bold text-text-primary">{title}</h4>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
      </div>
      <div className="mt-2 pr-12 text-right">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="text-xs font-bold text-primary hover:underline"
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'عرض أقل' : 'اعرف المزيد'}
        </button>
      </div>
      {isExpanded && (
        <div className="mt-2 pr-12">
          <div className="p-3 bg-background rounded-md border border-border-color text-sm text-text-secondary animate-fade-in">
            <p className="leading-relaxed">{detailedDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
};


const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] animate-fade-in p-4" 
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-heading"
    >
      <div 
        className="bg-card rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="text-center">
            <SparklesIcon className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 id="welcome-heading" className="text-2xl sm:text-3xl font-bold text-text-primary mb-3 font-tajawal">أهلاً بك في رونق!</h2>
            <p className="text-text-secondary mb-6 font-tajawal">يسعدنا انضمامك لرحلة إيمانية ملهمة. اكتشف جمال القرآن وحلاوة الإيمان مع مجموعة من الأدوات التي صممناها خصيصًا لك.</p>
        </div>
        
        <div className="divide-y divide-border-color/70 border-t border-b border-border-color py-2 my-6">
            <FeatureHighlight 
                icon={<AudioIcon className="w-8 h-8"/>}
                title="أنصت واستمع"
                description="مكتبة ضخمة من القرّاء، مع ميزة البحث الذكي عن الآيات بالصوت، وتفسير مفصل لكل آية تستمع إليها."
                detailedDescription="استمتع بتلاوات عطرة لأشهر قرّاء العالم الإسلامي. يمكنك تحميل السور للاستماع بدون إنترنت، حفظ آياتك المفضلة كعلامات مرجعية، وعرض التفسير الميسر لكل آية أثناء الاستماع. استخدم ميزة 'البحث الذكي' للعثور على أي آية بمجرد ذكر موضوعها."
            />
             <FeatureHighlight 
                icon={<ReadIcon className="w-8 h-8"/>}
                title="اقرأ وتدبر"
                description="تجربة قراءة مريحة للمصحف، مع إحصائيات تتبع تقدمك، وأسباب نزول الآيات لتزيدك فهمًا وتدبرًا."
                detailedDescription="اقرأ القرآن الكريم من مصحف المدينة النبوية بتصميم يحاكي الواقع. تتبع تقدمك في القراءة، تابع آخر صفحة وصلت إليها، وادخل في 'تحدي ختم القرآن' لتلتزم بورد يومي. يمكنك أيضًا تحميل نصوص السور للقراءة دون اتصال، واستكشاف أسباب نزول الآيات لفهم أعمق."
            />
             <FeatureHighlight 
                icon={<KidsIcon className="w-8 h-8"/>}
                title="عالم الطفل"
                description="مساحة آمنة وممتعة للأطفال، مليئة بالقصص والألعاب التعليمية والأذكار المناسبة لأعمارهم."
                detailedDescription="عالم مصمم خصيصًا للأطفال لتعلم الإسلام بمتعة. يحتوي على قصص مصورة للأنبياء، ألعاب تفاعلية لاختبار معلوماتهم، بطاقات تعليمية للحروف وأسماء الله الحسنى، وأذكار يومية سهلة الحفظ. يتغير تصميم القسم بالكامل ليتناسب مع عمر وجنس طفلك."
            />
            <FeatureHighlight 
                icon={<HistoryIcon className="w-8 h-8"/>}
                title="اعرف تاريخك"
                description="رحلة عبر الزمن لاستكشاف السيرة النبوية، قصص الصحابة، الغزوات، وتاريخ الخلفاء والعلماء."
                detailedDescription="تاريخنا الإسلامي مليء بالدروس والعبر. في هذا القسم، يمكنك قراءة السيرة النبوية بشكل مبسط، والتعرف على حياة كبار الصحابة والخلفاء الراشدين، واستعراض أهم المعارك الفاصلة في تاريخ الإسلام، والاطلاع على إسهامات علمائنا العظماء."
            />
             <FeatureHighlight 
                icon={<BrainIcon className="w-8 h-8"/>}
                title="Ronaq Mind"
                description="استكشف أدواتنا المتقدمة: ملخصات السور، المستشار النفسي، دراسة التجويد، والمزيد من الميزات الذكية."
                detailedDescription="هذا هو قسمنا المبتكر الذي يستخدم الذكاء الاصطناعي لخدمة القرآن. احصل على ملخصات فورية لمواضيع أي سورة، استشر 'المستشار النفسي' ليقدم لك هداية روحانية وعملية، تعلم أحكام التجويد لكل آية، واحصل على 'رونقك اليومي' من آية أو حكمة ملهمة."
            />
        </div>

        <div className="text-center">
          <button 
            onClick={onClose} 
            className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-transform hover:scale-105"
          >
            ابدأ رحلتك
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;