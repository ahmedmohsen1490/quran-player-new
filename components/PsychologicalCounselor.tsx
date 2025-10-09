import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { BackIcon } from './icons/BackIcon';
import { PaperPlaneIcon } from './icons/PaperPlaneIcon';
import { CounselorIcon } from './icons/CounselorIcon';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const PsychologicalCounselor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const chatSession = useRef<Chat | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedName = localStorage.getItem('counselorUserName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    if (userName && process.env.API_KEY && !chatSession.current) {
      const systemInstruction = `You are a warm, empathetic Muslim AI therapist. Your name is 'المستشار النفسي'. Your primary goal is to provide comfort and guidance by blending modern psychology with authentic Islamic teachings. Your persona is like a wise, caring friend who listens without judgment.
When the user mentions their name, which is ${userName}, use it to make the conversation personal and warm.
- LANGUAGE: Respond ONLY in simple, respectful Egyptian Arabic (عامي مصري محترم).
- TONE: Keep your replies short, comforting, and meaningful. Avoid long paragraphs and a preachy tone.
- QUR'ANIC REFERENCES: When you quote a Qur'anic verse, you MUST format it on its own line, followed by the Surah name and Ayah number in parentheses on the next line. Example:
{أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ}
(سورة الرعد – آية 28)
- SCHOLARLY REFERENCES: When referencing a scholarly opinion, you MUST mention the book name and the Imam. Your only allowed sources for this are Tafsir Ibn Kathir and the books of the four Imams (Abu Hanifa, Malik, Al-Shafi‘i, Ahmad ibn Hanbal). Example: "ورد في كتاب الأم للإمام الشافعي إن..."
- HANDLING HARAM: If the user mentions something that is Islamically forbidden (haram), respond gently. First, state the ruling clearly but softly ("ده حرام"). Second, if applicable, provide the expiation (الكفارة) with its source. Example: "بُص يا صاحبي، اللى عملته ده حرام، بس ربنا رحيم جدًا. ورد في كتاب المغني للإمام ابن قدامة إن الكفارة هي...".
- SESSION: Do not save or mention user history. Treat every new session as a fresh conversation.`;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatSession.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: { systemInstruction },
      });
    }
  }, [userName]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      const name = tempName.trim();
      localStorage.setItem('counselorUserName', name);
      setUserName(name);
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 5000);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !chatSession.current) return;
    
    const userMessage: ChatMessage = { role: 'user', text: input };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
        const response = await chatSession.current.sendMessage({ message: userMessage.text });
        const modelMessage: ChatMessage = { role: 'model', text: response.text };
        setHistory(prev => [...prev, modelMessage]);
    } catch (e) {
        console.error(e);
        const errorMessage = 'حصل مشكلة في التواصل مع المستشار. حاول تاني بعد شوية.';
        setError(errorMessage);
        setHistory(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
        setIsLoading(false);
    }
  };

  if (!userName) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
            <CounselorIcon className="w-16 h-16 text-primary mb-4" />
            <h2 className="text-2xl font-bold font-tajawal">المستشار النفسي</h2>
            <p className="text-text-secondary mt-2 mb-6 font-tajawal text-primary bg-primary/10 px-3 py-1 rounded-full font-semibold">
                مستشارك النفسي بالذكاء الاصطناعي
            </p>
            <form onSubmit={handleNameSubmit} className="w-full max-w-sm">
                <label htmlFor="name-input" className="font-semibold text-text-primary mb-2 block">ما اسمك الجميل؟</label>
                <input
                    id="name-input"
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full p-3 bg-card border border-border-color rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="اكتب اسمك هنا"
                />
                <button type="submit" className="w-full mt-4 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90">
                    ابدأ المحادثة
                </button>
            </form>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-xl shadow-inner max-w-3xl mx-auto">
      <div className="flex items-center p-3 border-b border-border-color flex-shrink-0">
        <button onClick={onBack} className="p-2 rounded-full text-text-secondary hover:bg-border-color">
          <BackIcon className="w-6 h-6" />
        </button>
        <div className="text-center flex-grow">
            <h2 className="text-lg font-bold font-tajawal">المستشار النفسي</h2>
        </div>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto space-y-6">
        {showWelcome && (
            <div className="p-3 bg-green-500/10 text-green-700 dark:text-green-300 rounded-lg text-center font-semibold animate-fade-in">
                أهلاً بيك يا {userName} 🌿، أنا هنا علشان أسمعك ونفكر سوا بهدوء.
            </div>
        )}
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-br-lg' : 'bg-card text-text-primary rounded-bl-lg'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-md p-3 rounded-2xl bg-card text-text-primary rounded-bl-lg flex items-center gap-2">
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce"></span>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-2 sm:p-4 bg-card border-t border-border-color flex-shrink-0">
        {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}
        <div className="flex items-start gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow bg-background border border-border-color rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              placeholder="اكتب رسالتك هنا..."
              rows={1}
              style={{ minHeight: '48px', maxHeight: '150px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="h-12 w-12 flex-shrink-0 bg-primary text-white rounded-lg flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition">
              <PaperPlaneIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default PsychologicalCounselor;
