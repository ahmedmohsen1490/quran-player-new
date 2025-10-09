import React, { useState, useEffect, useMemo } from 'react';
import { BackIcon } from '../icons/BackIcon';
import { kidsStories, kidsGames, kidsDhikr, kidsFlashcardSets } from '../../data/kidsData';
import { KidsProgress, KidsStory, KidsGame, KidsDhikr, FlashcardSet, KidsQuizQuestion, KidsMatchingPair, KidProfile } from '../../types';

// Import existing icons
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PlayIcon } from '../icons/PlayIcon';

// Simple icons for sub-sections
const StoryIcon = () => <span className="text-4xl">📚</span>;
const GameIcon = () => <span className="text-4xl">🎲</span>;
const DhikrIcon = () => <span className="text-4xl">🤲</span>;
const FlashcardIcon = () => <span className="text-4xl">📇</span>;

const SoundIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
);

type View = 'menu' | 'stories' | 'story_detail' | 'games' | 'game_detail' | 'dhikr' | 'flashcards' | 'flashcard_set';

const kidFriendlyColors = {
  'bg-sky-100': 'bg-sky-100',
  'bg-green-100': 'bg-green-100',
  'bg-yellow-100': 'bg-yellow-100',
  'bg-pink-100': 'bg-pink-100',
};

// A simple hook to manage state in localStorage
const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(error);
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

const useProfileProgress = (profileId: number | null) => {
    const key = profileId ? `kidsProgress_${profileId}` : 'kidsProgress_guest';
    const [progress, setProgress] = usePersistentState<KidsProgress>(key, {
        storiesCompleted: [],
        gamesCorrectAnswers: {},
        dhikrCompleted: [],
        flashcardsCompleted: [],
    });
    
    useEffect(() => {
        if (profileId === null) {
            setProgress({ storiesCompleted: [], gamesCorrectAnswers: {}, dhikrCompleted: [], flashcardsCompleted: [] });
        }
    }, [profileId, setProgress]);

    return [progress, setProgress] as const;
};

const getVisibleContent = <T extends { ageGroup: '3-5' | '6-8' | '9-12' }>(allItems: T[], age: number): T[] => {
    const visibleAgeGroups: string[] = [];
    if (age <= 5) {
        visibleAgeGroups.push('3-5');
    } else if (age >= 6 && age <= 8) {
        visibleAgeGroups.push('3-5', '6-8');
    } else if (age >= 9) {
        visibleAgeGroups.push('6-8', '9-12');
    }
    return allItems.filter(item => visibleAgeGroups.includes(item.ageGroup));
};

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const speak = (text: string) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    } else {
        alert('متصفحك لا يدعم نطق النصوص.');
    }
};

const StoriesView: React.FC<{ stories: KidsStory[]; progress: KidsProgress; onComplete: (storyId: number) => void; onBack: () => void; }> = ({ stories, progress, onComplete, onBack }) => {
    const [selectedStory, setSelectedStory] = useState<KidsStory | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleAnswer = (answer: string) => {
        if (isCorrect !== null) return;
        setSelectedAnswer(answer);
        const correct = answer === selectedStory?.question.correctAnswer;
        setIsCorrect(correct);
        if (correct) {
            onComplete(selectedStory!.id);
        }
    };
    
    const reset = () => {
        setSelectedStory(null);
        setSelectedAnswer(null);
        setIsCorrect(null);
    };

    if (selectedStory) {
        return (
            <div>
                <button onClick={reset} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة للقصص</span></button>
                <div className="bg-card p-6 rounded-lg shadow-lg">
                    <div className="text-6xl text-center mb-4">{selectedStory.illustration}</div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-primary font-tajawal">{selectedStory.title}</h3>
                        <button 
                            onClick={() => speak(selectedStory.title + ". " + selectedStory.content)} 
                            className="p-2 text-primary hover:bg-primary/10 rounded-full flex items-center gap-2"
                            aria-label="استمع للقصة"
                        >
                            <SoundIcon />
                            <span className="font-tajawal text-sm font-semibold hidden sm:inline">استمع للقصة</span>
                        </button>
                    </div>
                    <p className="text-text-primary whitespace-pre-line leading-relaxed font-tajawal text-lg mb-4">{selectedStory.content}</p>
                    <p className="bg-yellow-100 text-yellow-800 p-3 rounded-lg font-semibold font-tajawal">💡 الدرس المستفاد: {selectedStory.moral}</p>
                    <div className="mt-6 border-t border-border-color pt-4">
                        <h4 className="font-bold text-text-primary font-tajawal mb-3">سؤال عن القصة:</h4>
                        <p className="font-semibold text-text-primary font-tajawal mb-4">{selectedStory.question.text}</p>
                        <div className="space-y-2">
                            {selectedStory.question.options.map(opt => (
                                <button key={opt} onClick={() => handleAnswer(opt)}
                                    className={`w-full text-right p-3 rounded-lg font-tajawal transition-colors ${
                                        isCorrect !== null && opt === selectedStory.question.correctAnswer ? 'bg-green-200 ring-2 ring-green-500' : 
                                        isCorrect === false && selectedAnswer === opt ? 'bg-red-200 ring-2 ring-red-500' : 'bg-background hover:bg-border-color'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                        {isCorrect === true && <p className="text-green-600 font-bold text-center mt-4 font-tajawal">أحسنت! إجابة صحيحة!</p>}
                        {isCorrect === false && <p className="text-red-600 font-bold text-center mt-4 font-tajawal">حاول مرة أخرى!</p>}
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة للقائمة</span></button>
            <h2 className="text-2xl font-bold text-primary mb-4 font-tajawal">قصص القرآن المبسطة</h2>
            {stories.length > 0 ? (
              <div className="space-y-3">
                  {stories.map(story => (
                      <button key={story.id} onClick={() => setSelectedStory(story)} className="w-full text-right bg-card p-4 rounded-lg shadow-md flex justify-between items-center hover:shadow-lg transition-shadow">
                          <span className="font-bold text-lg font-tajawal text-text-primary">{story.title}</span>
                          {progress.storiesCompleted.includes(story.id) && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                      </button>
                  ))}
              </div>
            ) : (
              <p className="text-center text-text-secondary font-tajawal p-8 bg-card rounded-lg">لا توجد قصص مناسبة لهذا العمر حاليًا.</p>
            )}
        </div>
    );
};

const QuizGame: React.FC<{ game: KidsGame; progress: number[]; onComplete: (questionId: number) => void; }> = ({ game, progress, onComplete }) => {
    const [questionQueue, setQuestionQueue] = useState(() => 
        shuffleArray(game.questions?.filter(q => !progress.includes(q.id)) || [])
    );
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const currentQuestion = questionQueue[0];

    const handleAnswer = (answer: string) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
        setIsAnswered(true);
        if (currentQuestion && answer === currentQuestion.correctAnswer) {
            onComplete(currentQuestion.id);
        }
    };

    const handleNext = () => {
        setQuestionQueue(prevQueue => prevQueue.slice(1));
        setSelectedAnswer(null);
        setIsAnswered(false);
    };

    if (!currentQuestion) {
        return <div className="bg-card p-6 rounded-lg text-center font-tajawal"><h3 className="text-xl font-bold text-primary">رائع! لقد أكملت كل الأسئلة في هذه اللعبة.</h3></div>;
    }

    const totalQuestions = game.questions?.length || 0;
    const answeredInSession = (game.questions?.filter(q => !progress.includes(q.id)) || []).length - questionQueue.length;
    const currentQuestionNumber = progress.length + answeredInSession + 1;
    const isCorrect = isAnswered && selectedAnswer === currentQuestion.correctAnswer;

    return (
        <div className="bg-card p-6 rounded-lg shadow-lg font-tajawal">
            <p className="text-sm text-text-secondary mb-3">سؤال {currentQuestionNumber} / {totalQuestions}</p>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text-primary">{currentQuestion.question}</h3>
                <button onClick={() => speak(currentQuestion.question)} className="p-2 text-primary hover:bg-primary/10 rounded-full flex-shrink-0"><SoundIcon /></button>
            </div>
            <div className="space-y-3">
                {currentQuestion.options.map(opt => (
                    <button key={opt} onClick={() => handleAnswer(opt)} disabled={isAnswered}
                        className={`w-full text-right p-3 rounded-lg transition-colors ${
                            isAnswered && opt === currentQuestion.correctAnswer ? 'bg-green-200 ring-2 ring-green-500' :
                            isAnswered && selectedAnswer === opt ? 'bg-red-200 ring-2 ring-red-500' : 'bg-background hover:bg-border-color'
                        }`}
                    >{opt}</button>
                ))}
            </div>
            {isAnswered && (
                <div className="text-center mt-4 animate-fade-in">
                    <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg font-semibold font-tajawal text-right mb-4">
                        <p className="font-bold">💡 {isCorrect ? 'أحسنت! ✅' : 'معلومة مفيدة:'}</p>
                        <p>{currentQuestion.explanation}</p>
                    </div>
                    <button onClick={handleNext} className="mt-2 bg-primary text-white font-bold py-2 px-6 rounded-md">
                        {questionQueue.length > 1 ? 'السؤال التالي' : 'إنهاء اللعبة'}
                    </button>
                </div>
            )}
        </div>
    );
};


const MatchingGame: React.FC<{ game: KidsGame; progress: number[]; onComplete: (pairId: number) => void; }> = ({ game, progress, onComplete }) => {
    const pairs = useMemo(() => game.matchingPairs || [], [game]);
    const [items1] = useState(() => shuffleArray(pairs));
    const [items2] = useState(() => shuffleArray(pairs));
    const [selected1, setSelected1] = useState<KidsMatchingPair | null>(null);
    const [selected2, setSelected2] = useState<KidsMatchingPair | null>(null);
    const [matchedIds, setMatchedIds] = useState<number[]>(progress);
    const [incorrect, setIncorrect] = useState<boolean>(false);

    useEffect(() => {
        if (selected1 && selected2) {
            if (selected1.id === selected2.id) {
                setMatchedIds(ids => [...ids, selected1.id]);
                onComplete(selected1.id);
            } else {
                setIncorrect(true);
                setTimeout(() => setIncorrect(false), 800);
            }
            setSelected1(null);
            setSelected2(null);
        }
    }, [selected1, selected2, onComplete]);

    if(matchedIds.length === pairs.length){
         return <div className="bg-card p-6 rounded-lg text-center font-tajawal"><h3 className="text-xl font-bold text-primary">أحسنت! لقد طابقت كل البطاقات بنجاح.</h3></div>;
    }

    const getButtonClass = (item: KidsMatchingPair, isCol1: boolean) => {
        const isMatched = matchedIds.includes(item.id);
        const isSelected = (isCol1 && selected1?.id === item.id) || (!isCol1 && selected2?.id === item.id);
        if (isMatched) return 'bg-green-200 text-green-800 opacity-70';
        if (isSelected) return `ring-2 ring-primary ${incorrect ? 'bg-red-200' : 'bg-sky-200'}`;
        return 'bg-card hover:bg-border-color';
    };

    return (
        <div className="bg-card p-4 rounded-lg shadow-lg font-tajawal">
             <h3 className="text-xl font-bold text-center text-primary mb-4">طابق بين العمودين</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">{items1.map(p => <button key={`1-${p.id}`} onClick={() => !matchedIds.includes(p.id) && setSelected1(p)} disabled={matchedIds.includes(p.id)} className={`w-full p-3 rounded-lg shadow transition-all ${getButtonClass(p, true)}`}>{p.item1}</button>)}</div>
                <div className="space-y-3">{items2.map(p => <button key={`2-${p.id}`} onClick={() => !matchedIds.includes(p.id) && setSelected2(p)} disabled={matchedIds.includes(p.id)} className={`w-full p-3 rounded-lg shadow transition-all ${getButtonClass(p, false)}`}>{p.item2}</button>)}</div>
            </div>
        </div>
    );
};


const GamesView: React.FC<{ games: KidsGame[]; progress: Record<string, number[]>; onComplete: (gameId: string, questionId: number) => void; onBack: () => void; }> = ({ games, progress, onComplete, onBack }) => {
    const [selectedGame, setSelectedGame] = useState<KidsGame | null>(null);

    const handleSelectGame = (game: KidsGame) => {
        setSelectedGame(game);
    }
    
    if (selectedGame) {
        return (
            <div>
                 <button onClick={() => setSelectedGame(null)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة للألعاب</span></button>
                 {selectedGame.type === 'quiz' && <QuizGame game={selectedGame} progress={progress[selectedGame.id] || []} onComplete={(qId) => onComplete(selectedGame.id, qId)} />}
                 {selectedGame.type === 'matching' && <MatchingGame game={selectedGame} progress={progress[selectedGame.id] || []} onComplete={(pId) => onComplete(selectedGame.id, pId)} />}
            </div>
        )
    }

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة للقائمة</span></button>
            <h2 className="text-2xl font-bold text-primary mb-4 font-tajawal">الألعاب التعليمية</h2>
            {games.length > 0 ? (
                <div className="space-y-3">
                    {games.map(game => (
                        <button key={game.id} onClick={() => handleSelectGame(game)} className="w-full text-right bg-card p-4 rounded-lg shadow-md flex justify-between items-center hover:shadow-lg transition-shadow">
                            <span className="font-bold text-lg font-tajawal text-text-primary">{game.title}</span>
                             {(progress[game.id]?.length || 0) > 0 && 
                                <span className="text-xs font-mono bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    {progress[game.id]?.length} / {(game.questions?.length || game.matchingPairs?.length)}
                                </span>
                             }
                        </button>
                    ))}
                </div>
             ) : (
                <p className="text-center text-text-secondary font-tajawal p-8 bg-card rounded-lg">لا توجد ألعاب مناسبة لهذا العمر حاليًا.</p>
             )}
        </div>
    );
};

const DhikrView: React.FC<{ dhikrs: KidsDhikr[]; progress: string[]; onComplete: (dhikrId: string) => void; onBack: () => void; }> = ({ dhikrs, progress, onComplete, onBack }) => {
    return (
         <div>
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة للقائمة</span></button>
            <h2 className="text-2xl font-bold text-primary mb-4 font-tajawal">أذكار الطفل المسلم</h2>
            {dhikrs.length > 0 ? (
              <div className="space-y-3">
                  {dhikrs.map(dhikr => {
                      const isCompleted = progress.includes(dhikr.id);
                      return (
                          <div key={dhikr.id} className="bg-card p-4 rounded-lg shadow-md">
                              <h3 className="font-bold text-lg font-tajawal text-text-primary">{dhikr.title}</h3>
                              <p className="text-xl font-amiri-quran text-text-secondary my-3">{dhikr.dhikr}</p>
                              <p className="text-sm text-green-700 bg-green-100 p-2 rounded-md font-tajawal">💡 {dhikr.benefit}</p>
                               <div className="flex justify-end items-center gap-2 mt-3">
                                  <button onClick={() => speak(dhikr.dhikr)} className="p-2 text-primary hover:bg-primary/10 rounded-full" aria-label="استمع للذكر"><SoundIcon /></button>
                                  <button onClick={() => onComplete(dhikr.id)} disabled={isCompleted} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${isCompleted ? 'bg-green-200 text-green-800 cursor-not-allowed' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}>
                                      {isCompleted ? 'أتممت' : 'أتممت الذكر'}
                                  </button>
                              </div>
                          </div>
                      );
                  })}
              </div>
            ) : (
                <p className="text-center text-text-secondary font-tajawal p-8 bg-card rounded-lg">لا توجد أذكار مناسبة لهذا العمر حاليًا.</p>
            )}
        </div>
    );
};

const FlashcardsView: React.FC<{ setId: string; onBack: () => void; progress: boolean; onComplete: () => void; }> = ({ setId, onBack, progress, onComplete }) => {
    const set = kidsFlashcardSets.find(s => s.id === setId);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!set) return null;
    const card = set.cards[currentIndex];

    const nextCard = () => { setIsFlipped(false); setCurrentIndex(i => (i + 1) % set!.cards.length); }
    const prevCard = () => { setIsFlipped(false); setCurrentIndex(i => (i - 1 + set!.cards.length) % set!.cards.length); }
    
    useEffect(() => {
        if(isFlipped) {
            speak(card.back);
        } else {
            speak(card.front);
        }
    }, [isFlipped, card]);

    return (
        <div className="font-tajawal">
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"><BackIcon className="w-5 h-5" /><span>العودة للبطاقات</span></button>
             <h2 className="text-2xl font-bold text-primary mb-4 text-center">{set.title}</h2>

            <div className="perspective-1000">
                <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full h-48 sm:h-64 transition-transform duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
                    <div className="absolute w-full h-full backface-hidden bg-card rounded-xl shadow-lg flex items-center justify-center">
                        <p className="text-6xl font-amiri-quran">{card.front}</p>
                    </div>
                     <div className="absolute w-full h-full backface-hidden bg-primary text-white rounded-xl shadow-lg flex items-center justify-center rotate-y-180">
                        <p className="text-4xl font-tajawal">{card.back}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-6">
                <button onClick={prevCard} className="bg-card p-3 rounded-full shadow-md"> <BackIcon className="w-6 h-6" /></button>
                <span className="font-mono text-text-secondary">{currentIndex + 1} / {set.cards.length}</span>
                <button onClick={nextCard} className="bg-card p-3 rounded-full shadow-md"><BackIcon className="w-6 h-6 transform rotate-180" /></button>
            </div>
             <div className="mt-6 text-center">
                <button onClick={onComplete} disabled={progress} className={`px-6 py-3 text-lg font-bold rounded-md transition-colors ${progress ? 'bg-green-200 text-green-800 cursor-not-allowed' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}>
                    {progress ? 'أتقنت المجموعة ✓' : 'أتقنت هذه المجموعة'}
                </button>
            </div>
        </div>
    )
};

const ProfileManager: React.FC<{
  profiles: KidProfile[];
  onSelectProfile: (profile: KidProfile) => void;
  onAddProfile: (name: string, age: number) => void;
  onDeleteProfile: (profileId: number) => void;
}> = ({ profiles, onSelectProfile, onAddProfile, onDeleteProfile }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState<number | string>(5); // State can be string for empty input
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAge = Number(age);
        if (name.trim() && numAge >= 3 && numAge <= 12) {
            onAddProfile(name.trim(), numAge);
            setName('');
            setAge(5);
            setError('');
        } else {
            setError('الرجاء إدخال اسم صحيح وعمر بين 3 و 12 سنوات.');
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center items-center p-4 font-tajawal animate-fade-in">
            <h1 className="text-3xl font-bold text-primary mb-4">عالم الطفل</h1>
            <p className="text-text-secondary mb-8 text-center">اختر ملف طفلك أو أضف ملفًا جديدًا لبدء المغامرة!</p>

            <div className="w-full bg-card p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">ملفات الأطفال</h2>
                <div className="space-y-3 mb-6">
                    {profiles.length > 0 ? (
                        profiles.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-background p-3 rounded-md">
                                <button onClick={() => onSelectProfile(p)} className="flex-grow text-right hover:text-primary">
                                    <span className="font-bold">{p.name}</span>
                                    <span className="text-sm text-text-secondary mr-2">({p.age} سنوات)</span>
                                </button>
                                <button onClick={() => onDeleteProfile(p.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-text-secondary p-4">لا توجد ملفات. أضف ملفًا جديدًا.</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="border-t border-border-color pt-4">
                    <h2 className="text-xl font-bold mb-4">إضافة طفل جديد</h2>
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="اسم الطفل"
                            className="w-full p-3 bg-background border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        />
                        <div className="flex items-center gap-2">
                             <label htmlFor="age" className="font-semibold">العمر:</label>
                             <input
                                id="age"
                                type="number"
                                value={age}
                                onChange={e => setAge(e.target.value)}
                                min="3" max="12"
                                className="w-20 p-3 bg-background border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                            />
                            <span>سنوات</span>
                        </div>
                        <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition">إضافة</button>
                    </div>
                </form>
            </div>
             <div className="mt-8 p-4 bg-background border border-dashed border-border-color rounded-lg text-center text-sm">
                <p className="font-bold text-text-primary mb-1">💡 نصيحة بسيطة:</p>
                <p className="text-text-secondary">"يُفضل أن يستخدم الطفل الهاتف أو الجهاز اللوحي دائمًا في وجود أحد الوالدين، لضمان تجربة تعليمية آمنة وممتعة."</p>
            </div>
        </div>
    );
};


const KidsPage: React.FC = () => {
  const [view, setView] = useState<View>('menu');
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  const [profiles, setProfiles] = usePersistentState<KidProfile[]>('kidsProfiles', []);
  const [activeProfile, setActiveProfile] = usePersistentState<KidProfile | null>('kidsActiveProfile', null);

  const [progress, setProgress] = useProfileProgress(activeProfile?.id ?? null);
  const [bgColor, setBgColor] = usePersistentState<string>('kidsBgColor', 'bg-sky-100');
  
  const handleAddProfile = (name: string, age: number) => {
    const newProfile: KidProfile = { id: Date.now(), name, age };
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    setActiveProfile(newProfile); // Automatically select the new profile
  };

  const handleSelectProfile = (profile: KidProfile) => {
    setActiveProfile(profile);
  };

  const handleDeleteProfile = (profileId: number) => {
    if (window.confirm("هل أنت متأكد من حذف ملف هذا الطفل وكل تقدمه؟")) {
        setProfiles(profiles.filter(p => p.id !== profileId));
        localStorage.removeItem(`kidsProgress_${profileId}`);
        if (activeProfile?.id === profileId) {
            setActiveProfile(null);
        }
    }
  };

  const handleSwitchProfile = () => {
      setActiveProfile(null);
      setView('menu'); // Reset view when switching profiles
  };
  
  const visibleStories = useMemo(() => activeProfile ? getVisibleContent(kidsStories, activeProfile.age) : [], [activeProfile]);
  const visibleGames = useMemo(() => activeProfile ? getVisibleContent(kidsGames, activeProfile.age) : [], [activeProfile]);
  const visibleDhikrs = useMemo(() => activeProfile ? getVisibleContent(kidsDhikr, activeProfile.age) : [], [activeProfile]);
  const visibleFlashcardSets = useMemo(() => activeProfile ? getVisibleContent(kidsFlashcardSets, activeProfile.age) : [], [activeProfile]);

  const handleCompleteStory = (storyId: number) => setProgress(p => ({ ...p, storiesCompleted: Array.from(new Set([...p.storiesCompleted, storyId])) }));
  const handleCompleteGameQuestion = (gameId: string, questionId: number) => {
    setProgress(p => {
        const gameProgress = p.gamesCorrectAnswers[gameId] || [];
        return { ...p, gamesCorrectAnswers: {...p.gamesCorrectAnswers, [gameId]: Array.from(new Set([...gameProgress, questionId])) }}
    })
  };
  const handleCompleteDhikr = (dhikrId: string) => setProgress(p => ({ ...p, dhikrCompleted: Array.from(new Set([...p.dhikrCompleted, dhikrId]))}));
  const handleCompleteFlashcardSet = (setId: string) => setProgress(p => ({ ...p, flashcardsCompleted: Array.from(new Set([...p.flashcardsCompleted, setId])) }));

  const totalActivities = visibleStories.length + visibleGames.reduce((acc, game) => acc + (game.questions?.length || game.matchingPairs?.length || 0), 0) + visibleDhikrs.length + visibleFlashcardSets.length;
  const completedActivities = progress.storiesCompleted.length + Object.values(progress.gamesCorrectAnswers).reduce((acc, answers) => acc + answers.length, 0) + progress.dhikrCompleted.length + progress.flashcardsCompleted.length;
  const overallProgress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  if (!activeProfile) {
      return (
          <div className={`transition-colors duration-300 ${kidFriendlyColors[bgColor as keyof typeof kidFriendlyColors]}`}>
              <ProfileManager 
                  profiles={profiles}
                  onSelectProfile={handleSelectProfile}
                  onAddProfile={handleAddProfile}
                  onDeleteProfile={handleDeleteProfile}
              />
          </div>
      );
  }

  const renderMenu = () => (
    <>
        <div className="bg-card p-4 rounded-xl shadow-lg mb-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold font-tajawal text-primary">أهلاً بك, {activeProfile.name}!</h2>
                    <p className="text-text-secondary font-tajawal mt-1">مغامرات قرآنية وتعاليم إسلامية شيقة</p>
                </div>
                <button onClick={handleSwitchProfile} className="text-sm font-semibold bg-border-color text-text-primary px-3 py-2 rounded-md hover:bg-primary/20">تغيير الطفل</button>
            </div>
            <div className="mt-4">
                <h3 className="text-lg font-semibold text-text-primary mb-2 text-center font-tajawal">شريط التقدم</h3>
                <div className="w-full bg-border-color rounded-full h-4">
                    <div className="bg-primary h-4 rounded-full text-white text-xs flex items-center justify-center transition-all duration-500" style={{ width: `${overallProgress}%` }}>
                        {overallProgress > 10 ? `${overallProgress}%` : ''}
                    </div>
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setView('stories')} className="p-4 bg-card rounded-lg shadow-md flex flex-col items-center justify-center aspect-square hover:shadow-lg transition-shadow"><StoryIcon /><span className="font-bold mt-2 font-tajawal">قصص القرآن</span></button>
            <button onClick={() => setView('games')} className="p-4 bg-card rounded-lg shadow-md flex flex-col items-center justify-center aspect-square hover:shadow-lg transition-shadow"><GameIcon /><span className="font-bold mt-2 font-tajawal">ألعاب تعليمية</span></button>
            <button onClick={() => setView('dhikr')} className="p-4 bg-card rounded-lg shadow-md flex flex-col items-center justify-center aspect-square hover:shadow-lg transition-shadow"><DhikrIcon /><span className="font-bold mt-2 font-tajawal">أذكار الطفل</span></button>
            <button onClick={() => setView('flashcards')} className="p-4 bg-card rounded-lg shadow-md flex flex-col items-center justify-center aspect-square hover:shadow-lg transition-shadow"><FlashcardIcon /><span className="font-bold mt-2 font-tajawal">بطاقات تعليمية</span></button>
        </div>
        <div className="mt-6 text-center">
            <label className="text-sm text-text-secondary font-tajawal">اختر لون الخلفية:</label>
            <div className="flex justify-center gap-3 mt-2">
                {Object.keys(kidFriendlyColors).map(colorClass => (
                    <button key={colorClass} onClick={() => setBgColor(colorClass)} className={`w-8 h-8 rounded-full ${colorClass} border-2 ${bgColor === colorClass ? 'ring-2 ring-primary ring-offset-2' : 'border-border-color'}`}></button>
                ))}
            </div>
        </div>
    </>
  );

  const renderContent = () => {
    switch (view) {
        case 'stories': return <StoriesView stories={visibleStories} progress={progress} onComplete={handleCompleteStory} onBack={() => setView('menu')} />;
        case 'games': return <GamesView games={visibleGames} progress={progress.gamesCorrectAnswers} onComplete={handleCompleteGameQuestion} onBack={() => setView('menu')} />;
        case 'dhikr': return <DhikrView dhikrs={visibleDhikrs} progress={progress.dhikrCompleted} onComplete={handleCompleteDhikr} onBack={() => setView('menu')} />;
        case 'flashcards': return (
            <div>
                 <button onClick={() => setView('menu')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 font-tajawal"><BackIcon className="w-5 h-5" /><span>العودة للقائمة</span></button>
                 <h2 className="text-2xl font-bold text-primary mb-4 font-tajawal">البطاقات التعليمية</h2>
                 {visibleFlashcardSets.length > 0 ? (
                    <div className="space-y-3">
                        {visibleFlashcardSets.map(set => (
                            <button key={set.id} onClick={() => { setSelectedSetId(set.id); setView('flashcard_set'); }} className="w-full text-right bg-card p-4 rounded-lg shadow-md flex justify-between items-center hover:shadow-lg transition-shadow">
                                <span className="font-bold text-lg font-tajawal text-text-primary">{set.title}</span>
                                {progress.flashcardsCompleted.includes(set.id) && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                            </button>
                        ))}
                    </div>
                 ) : (
                    <p className="text-center text-text-secondary font-tajawal p-8 bg-card rounded-lg">لا توجد بطاقات مناسبة لهذا العمر حاليًا.</p>
                 )}
            </div>
        );
        case 'flashcard_set': return selectedSetId && <FlashcardsView setId={selectedSetId} onBack={() => setView('flashcards')} progress={progress.flashcardsCompleted.includes(selectedSetId)} onComplete={() => handleCompleteFlashcardSet(selectedSetId)} />;
        default: return renderMenu();
    }
  };

  return (
    <div className={`transition-colors duration-300 ${kidFriendlyColors[bgColor as keyof typeof kidFriendlyColors]}`}>
        <style>{`
            .perspective-1000 { perspective: 1000px; }
            .transform-style-3d { transform-style: preserve-3d; }
            .rotate-y-180 { transform: rotateY(180deg); }
            .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        `}</style>
        <div className="max-w-4xl mx-auto p-4 sm:p-6 min-h-screen animate-fade-in pb-8">
            {renderContent()}
        </div>
    </div>
  );
};

export default KidsPage;