import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { generalQuizQuestions } from '../data/quizData';
import { fiqhTopics, LEVEL_TITLES } from '../data/fiqhQuizData';
import { GeneralProgress, FiqhProgress, QuizQuestion, FiqhTopic } from '../types';
import { BackIcon } from './icons/BackIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

type QuizView = 'home' | 'general' | 'fiqh_topics' | 'fiqh_quiz';

const THEME_COLORS = {
  blue: {
    bg: 'bg-blue-500', text: 'text-blue-500', ring: 'ring-blue-500', bgHover: 'hover:bg-blue-600',
    lightBg: 'bg-blue-500/10', lightText: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500', bgHover: 'hover:bg-green-600',
    lightBg: 'bg-green-500/10', lightText: 'text-green-600 dark:text-green-400'
  },
  amber: {
    bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-500', bgHover: 'hover:bg-amber-600',
    lightBg: 'bg-amber-500/10', lightText: 'text-amber-600 dark:text-amber-400'
  },
  sky: {
    bg: 'bg-sky-500', text: 'text-sky-500', ring: 'ring-sky-500', bgHover: 'hover:bg-sky-600',
    lightBg: 'bg-sky-500/10', lightText: 'text-sky-600 dark:text-sky-400'
  },
  slate: {
    bg: 'bg-slate-500', text: 'text-slate-500', ring: 'ring-slate-500', bgHover: 'hover:bg-slate-600',
    lightBg: 'bg-slate-500/10', lightText: 'text-slate-600 dark:text-slate-400'
  }
};

const QuizComponent: React.FC<{
  questions: QuizQuestion[],
  progress: { correctAnswers: number; answeredQuestionIds: number[] },
  updateProgress: (isCorrect: boolean, questionId: number) => void,
  title: string,
  themeColor: keyof typeof THEME_COLORS,
}> = ({ questions, progress, updateProgress, title, themeColor }) => {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);
  
  const theme = THEME_COLORS[themeColor];

  useEffect(() => {
    if (isAnswered) return; // Do not fetch a new question while showing feedback for the current one.

    const unansweredQuestions = questions.filter(q => !progress.answeredQuestionIds.includes(q.id));
    if (unansweredQuestions.length > 0) {
      // Select a random question from the unanswered pool
      setCurrentQuestion(unansweredQuestions[Math.floor(Math.random() * unansweredQuestions.length)]);
    } else {
      setCurrentQuestion(null); // All questions answered
    }
  }, [questions, progress.answeredQuestionIds, isAnswered]);

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;
    setIsAnswered(true);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    updateProgress(isCorrect, currentQuestion.id);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowDetailed(false);
  };

  if (!currentQuestion) {
    return (
      <div className="bg-card p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">
          مبارك!
        </h2>
        <p className="text-text-primary text-lg mb-2">لقد أتممت جميع الأسئلة في هذا القسم.</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-lg font-bold ${theme.lightText}`}>{title}</h3>
        <div className="text-sm font-mono bg-background px-3 py-1 rounded-md">
          <span className={`font-bold ${theme.text}`}>{progress.correctAnswers}</span> إجابات صحيحة
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-text-secondary mb-2">
          سؤال جديد
        </p>
        <h2 className="text-xl font-semibold text-text-primary leading-relaxed">
          {currentQuestion.question}
        </h2>
      </div>

      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, index) => {
          const isCorrect = option === currentQuestion.correctAnswer;
          const isSelected = option === selectedAnswer;
          let buttonClass = 'bg-background hover:bg-border-color';
          if (isAnswered) {
            if (isCorrect) {
              buttonClass = 'bg-green-500/20 text-green-700 dark:text-green-400 border-2 border-green-500';
            } else if (isSelected) {
              buttonClass = 'bg-red-500/20 text-red-700 dark:text-red-400 border-2 border-red-500';
            }
          } else if (isSelected) {
            buttonClass = `${theme.lightBg} ring-2 ${theme.ring}`;
          }
          return (
            <button key={index} onClick={() => !isAnswered && setSelectedAnswer(option)} disabled={isAnswered}
              className={`w-full text-right p-4 rounded-lg text-text-primary transition-all duration-200 ${buttonClass}`}>
              {option}
            </button>
          );
        })}
      </div>
      
      {isAnswered && (
        <div className="bg-background p-4 rounded-lg mb-6 animate-fade-in">
          <p className="text-sm font-semibold text-primary mb-1">توضيح:</p>
          <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{showDetailed ? currentQuestion.detailedExplanation : currentQuestion.shortExplanation}</p>
          <div className="text-left mt-2">
            <button onClick={() => setShowDetailed(!showDetailed)} className="text-xs font-semibold text-primary hover:underline">
              {showDetailed ? 'عرض الشرح المختصر' : 'عرض الشرح المفصل'}
            </button>
          </div>
          <p className="text-xs text-text-secondary mt-3 pt-2 border-t border-border-color">
            <span className="font-semibold">المصدر:</span> {currentQuestion.reference}
          </p>
        </div>
      )}

      <div className="text-center">
        {isAnswered ? (
          <button onClick={handleNextQuestion} className={`w-full text-white font-bold py-3 px-4 rounded-md ${theme.bg} ${theme.bgHover}`}>
            السؤال التالي
          </button>
        ) : (
          <button onClick={handleAnswerSubmit} disabled={!selectedAnswer}
            className={`w-full text-white font-bold py-3 px-4 rounded-md ${theme.bg} ${theme.bgHover} disabled:opacity-50`}>
            تأكيد الإجابة
          </button>
        )}
      </div>
    </div>
  );
};


const QuizPage: React.FC = () => {
  const [view, setView] = useState<QuizView>('home');
  const [selectedTopic, setSelectedTopic] = useState<FiqhTopic | null>(null);
  
  const [generalProgress, setGeneralProgress] = useState<GeneralProgress>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('generalQuizProgress') : null;
    return saved ? JSON.parse(saved) : { correctAnswers: 0, answeredQuestionIds: [] };
  });

  const [fiqhProgress, setFiqhProgress] = useState<FiqhProgress>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('fiqhQuizProgress') : null;
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('generalQuizProgress', JSON.stringify(generalProgress));
  }, [generalProgress]);

  useEffect(() => {
    localStorage.setItem('fiqhQuizProgress', JSON.stringify(fiqhProgress));
  }, [fiqhProgress]);
  
  const handleUpdateGeneralProgress = useCallback((isCorrect: boolean, questionId: number) => {
    setGeneralProgress(prev => ({
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        answeredQuestionIds: [...prev.answeredQuestionIds, questionId],
    }));
  }, []);

  const handleUpdateFiqhProgress = useCallback((isCorrect: boolean, questionId: number) => {
    if (!selectedTopic) return;
    const topicId = selectedTopic.id;
    setFiqhProgress(prev => {
        const currentTopicProgress = prev[topicId] || { correctAnswers: 0, answeredQuestionIds: [] };
        return {
            ...prev,
            [topicId]: {
                correctAnswers: currentTopicProgress.correctAnswers + (isCorrect ? 1 : 0),
                answeredQuestionIds: [...currentTopicProgress.answeredQuestionIds, questionId]
            }
        };
    });
  }, [selectedTopic]);

  const fiqhStats = useMemo(() => {
    const totalQuestions = fiqhTopics.reduce((acc, topic) => acc + topic.questions.length, 0);
    // FIX: Operator '+' cannot be applied to types 'unknown' and 'number'.
    // Explicitly typing `progress` resolves the type inference issue with `Object.values`.
    // This also resolves the cascading type error for `totalCorrect` on the following lines.
    const totalCorrect = (Object.values(fiqhProgress) as GeneralProgress[]).reduce((acc, progress) => acc + progress.correctAnswers, 0);
    const completedSections = fiqhTopics.filter(topic => fiqhProgress[topic.id]?.answeredQuestionIds.length === topic.questions.length).length;
    const overallProgress = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    return { overallProgress, completedSections };
  }, [fiqhProgress]);


  const renderContent = () => {
    switch(view) {
      case 'general':
        return (
          <>
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4">
                <BackIcon className="w-5 h-5" /><span>العودة</span>
            </button>
            <QuizComponent 
              questions={generalQuizQuestions}
              progress={generalProgress}
              updateProgress={handleUpdateGeneralProgress}
              title="أسئلة إسلامية عامة"
              themeColor="blue"
            />
          </>
        );
      case 'fiqh_topics':
        return (
          <>
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4">
                <BackIcon className="w-5 h-5" /><span>العودة</span>
            </button>
            <div className="bg-card p-4 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3 text-center">تقدمك في الفقه</h3>
              <div className="flex justify-around items-center">
                  <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{fiqhStats.overallProgress}%</p>
                      <p className="text-sm text-text-secondary">التقدم الإجمالي</p>
                  </div>
                  <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{fiqhStats.completedSections} <span className="text-base">/ {fiqhTopics.length}</span></p>
                      <p className="text-sm text-text-secondary">قسم مكتمل</p>
                  </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fiqhTopics.map(topic => {
                    const progress = fiqhProgress[topic.id] || { correctAnswers: 0, answeredQuestionIds: [] };
                    const level = Math.floor(progress.correctAnswers / 20);
                    const levelTitle = LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)];
                    const isCompleted = progress.answeredQuestionIds.length === topic.questions.length;
                    const theme = THEME_COLORS[topic.color];
                    return (
                        <div key={topic.id} onClick={() => { setSelectedTopic(topic); setView('fiqh_quiz'); }}
                            className="bg-card p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-md flex items-center justify-center text-2xl ${theme.lightBg}`}>{topic.icon}</div>
                                    <div>
                                        <h4 className="font-bold text-text-primary">{topic.title}</h4>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${theme.lightBg} ${theme.lightText}`}>{levelTitle}</span>
                                    </div>
                                </div>
                                {isCompleted && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-text-secondary mb-1">
                                    <span>مستوى {level + 1}</span>
                                    <span>{progress.correctAnswers} إجابة صحيحة</span>
                                </div>
                                <div className="w-full bg-border-color rounded-full h-2">
                                    <div className={`h-2 rounded-full ${theme.bg}`} style={{ width: `${(progress.correctAnswers % 20 / 20) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
          </>
        );
      case 'fiqh_quiz':
        return selectedTopic && (
          <>
            <button onClick={() => setView('fiqh_topics')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4">
                <BackIcon className="w-5 h-5" /><span>أقسام الفقه</span>
            </button>
            <QuizComponent 
              questions={selectedTopic.questions}
              progress={fiqhProgress[selectedTopic.id] || { correctAnswers: 0, answeredQuestionIds: [] }}
              updateProgress={handleUpdateFiqhProgress}
              title={selectedTopic.title}
              themeColor={selectedTopic.color}
            />
          </>
        );
      case 'home':
      default:
        return (
          <div className="space-y-6">
            <div onClick={() => setView('general')} className="bg-card p-6 rounded-lg shadow-md cursor-pointer hover:bg-border-color transition-colors">
                <h3 className="text-xl font-bold text-text-primary mb-2">أسئلة إسلامية عامة</h3>
                <p className="text-text-secondary">اختبر معلوماتك في مختلف جوانب الدين الإسلامي في رحلة معرفية لا تنتهي.</p>
                <div className="mt-4 text-sm font-mono bg-background px-3 py-1 rounded-md inline-block">
                    <span className="font-bold text-primary">{generalProgress.correctAnswers}</span> إجابة صحيحة
                </div>
            </div>
            <div onClick={() => setView('fiqh_topics')} className="bg-card p-6 rounded-lg shadow-md cursor-pointer hover:bg-border-color transition-colors">
                <h3 className="text-xl font-bold text-text-primary mb-2">أسئلة فقهية متخصصة</h3>
                <p className="text-text-secondary">تعمق في أبواب الفقه، وتابع تقدمك في كل قسم على حدة، وارتقِ في مستويات العلم.</p>
                 <div className="mt-4 text-sm font-mono bg-background px-3 py-1 rounded-md inline-block">
                    <span className="font-bold text-primary">{fiqhStats.overallProgress}%</span> تقدم إجمالي
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 animate-fade-in">
      {renderContent()}
    </div>
  );
};

export default QuizPage;