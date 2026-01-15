
import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from './constants';
import { Dosha, ChatMessage, AssessmentResult, Language, ImageValidationResult } from './types';
import { translateAllQuestions, getMultimodalAssessment, validateImageQuality } from './geminiService';

const LANGUAGES: Language[] = ['English', 'Hindi'];

type TranslatedQuestion = { text: string; options: { label: string; text: string }[] };

const App: React.FC = () => {
  const [step, setStep] = useState<'START' | 'LANG' | 'IMAGE' | 'QUIZ' | 'RESULT'>('START');
  const [language, setLanguage] = useState<Language>('English');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allTranslatedQuestions, setAllTranslatedQuestions] = useState<TranslatedQuestion[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isValidatingImage, setIsValidatingImage] = useState(false);
  const [imageQualityFeedback, setImageQualityFeedback] = useState<ImageValidationResult | null>(null);
  
  const [scores, setScores] = useState<{ [key in Dosha]?: number }>({
    [Dosha.VATA]: 0,
    [Dosha.PITTA]: 0,
    [Dosha.KAPHA]: 0,
  });
  const [userAnswers, setUserAnswers] = useState<{ category: string; answer: string }[]>([]);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isGeneratingResult, setIsGeneratingResult] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (step === 'QUIZ' && allTranslatedQuestions.length > 0) {
      const q = allTranslatedQuestions[currentQuestionIndex];
      setMessages(prev => [...prev, { role: 'model', text: q.text }]);
    }
  }, [currentQuestionIndex, step, allTranslatedQuestions]);

  const handleLanguageSelect = async (lang: Language) => {
    setLanguage(lang);
    setStep('IMAGE');
    setGlobalError(null);
    
    setIsTranslating(true);
    try {
      const translations = await translateAllQuestions(QUESTIONS, lang);
      setAllTranslatedQuestions(translations);
    } catch (err) {
      console.error("Language translation failed:", err);
      // Fallback is handled within translateAllQuestions to return English
    } finally {
      setIsTranslating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImageBase64(base64);
        setImageQualityFeedback(null);
        setIsValidatingImage(true);
        try {
          const validation = await validateImageQuality(base64);
          setImageQualityFeedback(validation);
        } catch (err) {
          console.error("Image validation failed:", err);
        } finally {
          setIsValidatingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionSelect = async (optionIdx: number) => {
    if (allTranslatedQuestions.length === 0) return;
    const originalQ = QUESTIONS[currentQuestionIndex];
    const originalOpt = originalQ.options[optionIdx];
    const transQ = allTranslatedQuestions[currentQuestionIndex];
    const transOpt = transQ.options[optionIdx];

    setScores(prev => ({
      ...prev,
      [originalOpt.dosha]: (prev[originalOpt.dosha] || 0) + 1
    }));
    setUserAnswers(prev => [...prev, { category: originalQ.category, answer: originalOpt.text }]);
    setMessages(prev => [...prev, { role: 'user', text: transOpt.text }]);

    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < QUESTIONS.length) {
      setCurrentQuestionIndex(nextIdx);
    } else {
      finalize();
    }
  };

  const finalize = async () => {
    setIsGeneratingResult(true);
    setStep('RESULT');
    setGlobalError(null);
    try {
      const finalResult = await getMultimodalAssessment(language, scores, userAnswers, imageBase64 || undefined);
      setResult(finalResult);
    } catch (err: any) {
      console.error("Finalization error:", err);
      const errStr = JSON.stringify(err);
      const isQuota = errStr.includes("429") || err?.status === 429 || errStr.includes("RESOURCE_EXHAUSTED");
      setGlobalError(isQuota 
        ? "The API quota has been exhausted. This usually means too many requests were made in a short time. Please wait a minute and try again."
        : "An unexpected disturbance occurred during the analysis. Please try again.");
    } finally {
      setIsGeneratingResult(false);
    }
  };

  const reset = () => {
    setStep('START');
    setGlobalError(null);
    setCurrentQuestionIndex(0);
    setScores({ [Dosha.VATA]: 0, [Dosha.PITTA]: 0, [Dosha.KAPHA]: 0 });
    setUserAnswers([]);
    setResult(null);
    setMessages([]);
    setImageBase64(null);
    setImageQualityFeedback(null);
    setAllTranslatedQuestions([]);
  };

  const totalScore = (scores[Dosha.VATA] || 0) + (scores[Dosha.PITTA] || 0) + (scores[Dosha.KAPHA] || 0);
  const getPct = (d: Dosha) => totalScore > 0 ? Math.round(((scores[d] || 0) / totalScore) * 100) : 0;

  const isVataDominant = getPct(Dosha.VATA) >= 35;
  const isPittaDominant = getPct(Dosha.PITTA) >= 35;
  const isKaphaDominant = getPct(Dosha.KAPHA) >= 35;

  if (step === 'START') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8f9f5]">
        <div className="max-w-xl w-full glass p-12 rounded-[3rem] shadow-2xl text-center border-[#e1e5d5]">
          <div className="mb-10 flex flex-col items-center">
            <div className="w-28 h-28 bg-[#1B4332] rounded-full flex items-center justify-center text-[#FEFAE0] text-6xl mb-6 shadow-xl shadow-emerald-900/10">
              <i className="fa-solid fa-om"></i>
            </div>
            <h1 className="text-5xl font-serif font-bold text-[#1B4332] tracking-tight">Prakriti Assessment</h1>
            <p className="text-[#BC6C25] font-medium tracking-[0.2em] mt-2 uppercase text-xs">A Path to Swastha (Holistic Well-being)</p>
          </div>
          <p className="text-[#5b6e58] mb-12 leading-relaxed text-lg italic">
            "Unlock the profound wisdom of your unique biological constitution through Darsana (observation) and Prashna (inquiry)."
          </p>
          <button 
            onClick={() => setStep('LANG')}
            className="w-full py-5 bg-[#1B4332] hover:bg-[#081c15] text-[#FEFAE0] rounded-3xl font-bold text-xl transition-all shadow-xl hover:translate-y-[-4px]"
          >
            Seek Your Nature
          </button>
        </div>
      </div>
    );
  }

  if (step === 'LANG') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8f9f5]">
        <div className="max-w-md w-full glass p-10 rounded-[3rem] shadow-xl border-[#e1e5d5]">
          <h2 className="text-3xl font-serif font-bold text-[#1B4332] mb-8 text-center">Select Your Vani (Language)</h2>
          <div className="grid grid-cols-2 gap-4">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => handleLanguageSelect(lang)}
                className="py-5 px-2 border-2 border-[#e1e5d5] rounded-2xl font-semibold transition-all hover:bg-[#fefae0] text-[#1B4332]"
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'IMAGE') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8f9f5]">
        <div className="max-w-2xl w-full glass p-10 rounded-[3rem] shadow-2xl border-[#e1e5d5]">
          <h2 className="text-3xl font-serif font-bold text-[#1B4332] mb-2 text-center">Darsana</h2>
          <p className="text-center text-[#BC6C25] font-medium text-sm mb-10 tracking-widest uppercase">Traditional Facial Analysis</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
              <h3 className="font-bold text-[#1B4332] text-sm uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-eye"></i> Visual Guidelines
              </h3>
              <ul className="space-y-4 text-sm text-[#5b6e58] leading-relaxed">
                <li className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-[#FEFAE0] text-[#BC6C25] flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">1</span>
                  Ensure skin is Shuddha (pure/clean).
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-[#FEFAE0] text-[#BC6C25] flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">2</span>
                  Optimal natural light is preferred.
                </li>
              </ul>
              
              {imageQualityFeedback && (
                <div className={`p-4 rounded-2xl text-xs animate-in slide-in-from-left duration-500 ${imageQualityFeedback.isValid ? 'bg-emerald-50 text-emerald-800' : 'bg-orange-50 text-orange-800'}`}>
                  <b>Vaidya's Insight:</b><br/>
                  {imageQualityFeedback.feedback}
                </div>
              )}
            </div>

            <div className="relative group aspect-square rounded-[2rem] border-4 border-[#FEFAE0] overflow-hidden bg-stone-100 flex items-center justify-center shadow-inner">
              {imageBase64 ? (
                <img src={imageBase64} alt="Preview" className={`w-full h-full object-cover transition-opacity duration-700 ${isValidatingImage ? 'opacity-30' : 'opacity-100'}`} />
              ) : (
                <div className="text-center p-6">
                  <i className="fa-solid fa-camera text-4xl text-[#e1e5d5] mb-2"></i>
                  <p className="text-[10px] uppercase font-bold text-[#e1e5d5] tracking-widest">Awaiting Vision</p>
                </div>
              )}
              {isValidatingImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-5 bg-[#BC6C25] text-[#FEFAE0] rounded-2xl font-bold hover:bg-[#a65d1d] transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-image"></i> {imageBase64 ? 'Refine Vision' : 'Capture Image for Darsana'}
            </button>
            
            {imageBase64 && (
              <button 
                disabled={isValidatingImage}
                onClick={() => setStep('QUIZ')}
                className="w-full py-5 bg-[#1B4332] text-[#FEFAE0] rounded-2xl font-bold hover:bg-[#081c15] transition-all shadow-xl disabled:opacity-50"
              >
                Proceed to Prashna
              </button>
            )}

            <button 
              onClick={() => { setImageBase64(null); setStep('QUIZ'); }}
              className="w-full py-3 text-[#5b6e58] font-medium text-xs hover:text-[#1B4332] transition-colors"
            >
              Proceed with Prashna (Inquiry) only
            </button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        </div>
      </div>
    );
  }

  if (step === 'QUIZ') {
    const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
    const currentTransQ = allTranslatedQuestions[currentQuestionIndex];

    // Check if we are stuck in translation or if it failed and returned nothing
    if (isTranslating && allTranslatedQuestions.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9f5]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-serif font-bold text-[#1B4332] italic">Preparing the sacred Prashnavali...</h2>
            <p className="text-xs text-[#BC6C25] mt-4 opacity-70">If the Vaidya takes too long, we will proceed in English.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9f5]">
        <header className="glass py-6 px-8 border-b border-[#e1e5d5] flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1B4332] rounded-2xl flex items-center justify-center text-[#FEFAE0] shadow-lg">
              <i className="fa-solid fa-leaf text-xl"></i>
            </div>
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#1B4332]">Prashnavali</h2>
              <p className="text-[10px] text-[#BC6C25] font-bold uppercase tracking-[0.2em]">{language} Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:block w-48 h-2 bg-[#e1e5d5] rounded-full overflow-hidden">
              <div className="h-full bg-[#1B4332] transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <button onClick={reset} className="text-[#e1e5d5] hover:text-red-800 transition-colors">
              <i className="fa-solid fa-circle-xmark text-2xl"></i>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 max-w-4xl mx-auto w-full">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative max-w-[85%] p-6 rounded-3xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                msg.role === 'user' 
                  ? 'bg-[#1B4332] text-[#FEFAE0] rounded-tr-none' 
                  : 'bg-white text-[#1B4332] rounded-tl-none border border-[#e1e5d5]'
              }`}>
                <p className="leading-relaxed text-lg font-medium">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </main>

        <footer className="p-6 md:p-10 bg-white border-t border-[#e1e5d5]">
          {currentTransQ && (
            <div className="max-w-2xl mx-auto grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-bold text-[#BC6C25] uppercase tracking-[0.3em]">Step {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
              </div>
              {currentTransQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className="w-full text-left p-6 rounded-2xl border-2 border-[#f8f9f5] bg-[#f8f9f5] hover:border-[#BC6C25] hover:bg-[#fefae0] transition-all font-semibold text-[#1B4332] group active:scale-95 flex items-center shadow-sm"
                >
                  <span className="w-10 h-10 rounded-xl bg-white group-hover:bg-[#BC6C25] group-hover:text-white flex items-center justify-center mr-6 font-serif text-xl transition-all shadow-sm">
                    {opt.label}
                  </span>
                  {opt.text}
                </button>
              ))}
            </div>
          )}
        </footer>
      </div>
    );
  }

  if (step === 'RESULT') {
    if (globalError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9f5] p-6">
          <div className="max-w-md w-full glass p-10 rounded-[3rem] text-center border-t-8 border-red-500 shadow-xl">
             <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-6"></i>
             <h2 className="text-2xl font-serif font-bold text-[#1B4332] mb-4">Service Interrupted</h2>
             <p className="text-[#5b6e58] mb-8 leading-relaxed italic">{globalError}</p>
             <div className="flex flex-col gap-3">
                <button 
                  onClick={finalize}
                  className="w-full py-4 bg-[#1B4332] text-white rounded-2xl font-bold transition-transform hover:scale-105"
                >
                  Retry Analysis
                </button>
                <button 
                  onClick={reset}
                  className="w-full py-3 text-[#BC6C25] font-bold text-sm uppercase tracking-widest"
                >
                  Go Back to Start
                </button>
             </div>
          </div>
        </div>
      );
    }

    if (isGeneratingResult || !result) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9f5]">
          <div className="text-center">
            <div className="w-24 h-24 border-8 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto mb-10 shadow-2xl"></div>
            <h2 className="text-3xl font-serif font-bold text-[#1B4332]">Vaidya is Synthesizing Your Prakriti...</h2>
            <p className="text-[#BC6C25] font-medium mt-4 tracking-widest uppercase text-sm animate-pulse">Mapping the Mahabhutas</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f8f9f5] p-4 md:p-12">
        <div className="max-w-6xl mx-auto glass p-8 md:p-16 rounded-[4rem] shadow-2xl border-t-[12px] border-[#1B4332] relative overflow-hidden">
          
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
            <div className="flex-1">
              <span className="bg-[#FEFAE0] text-[#BC6C25] px-6 py-2 rounded-full text-xs font-bold tracking-[0.4em] uppercase mb-6 inline-block shadow-sm">Pradhana Prakriti</span>
              <h1 className="text-7xl font-serif font-bold text-[#1B4332] leading-none mb-6">{result.prakritiType}</h1>
              
              <div className="flex flex-col gap-6 mb-8">
                 <p className="text-[#5b6e58] font-medium text-sm uppercase tracking-widest">Tridosha Composition</p>
                 <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-sky-50 rounded-2xl border border-sky-100 shadow-sm transition-transform hover:scale-105">
                        <i className="fa-solid fa-wind text-sky-400 text-xl"></i>
                        <div>
                            <p className="text-[10px] text-sky-600 font-bold uppercase">Vata</p>
                            <p className="text-xl font-serif font-bold text-sky-900">{getPct(Dosha.VATA)}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-orange-50 rounded-2xl border border-orange-100 shadow-sm transition-transform hover:scale-105">
                        <i className="fa-solid fa-fire text-orange-600 text-xl"></i>
                        <div>
                            <p className="text-[10px] text-orange-600 font-bold uppercase">Pitta</p>
                            <p className="text-xl font-serif font-bold text-orange-900">{getPct(Dosha.PITTA)}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm transition-transform hover:scale-105">
                        <i className="fa-solid fa-droplet text-indigo-700 text-xl"></i>
                        <div>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase">Kapha</p>
                            <p className="text-xl font-serif font-bold text-indigo-900">{getPct(Dosha.KAPHA)}%</p>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
            {imageBase64 && (
              <div className="w-56 h-56 rounded-[3rem] overflow-hidden border-[8px] border-[#FEFAE0] shadow-2xl rotate-3 shrink-0">
                <img src={imageBase64} alt="Darsana" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <section className="bg-[#FEFAE0] p-10 rounded-[3rem] border-l-8 border-[#BC6C25] shadow-sm relative overflow-hidden group">
                <div className="absolute top-[-20px] right-[-20px] opacity-[0.03] text-[12rem] text-[#1B4332] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                  <i className="fa-solid fa-om"></i>
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1B4332] mb-6 flex items-center gap-3">
                  <i className="fa-solid fa-scroll text-[#BC6C25]"></i> Vaidya's Synthesis (Tattva & Guna)
                </h3>
                <p className="text-[#1B4332] leading-relaxed text-xl italic opacity-90 relative z-10">{result.explanation}</p>
                {result.detectedFacialFeatures && result.detectedFacialFeatures.length > 0 && (
                  <div className="mt-10 relative z-10">
                    <p className="text-[10px] font-bold text-[#BC6C25] uppercase tracking-[0.3em] mb-4">Darsana: Observed Facial Gunas</p>
                    <div className="flex flex-wrap gap-3">
                      {result.detectedFacialFeatures.map((feat, i) => (
                        <span key={i} className="bg-white/80 px-5 py-2 rounded-2xl text-sm font-bold text-[#1B4332] border border-[#e1e5d5] shadow-sm">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Conditional Dosha Wisdom Sections */}
              {isVataDominant && (
                <section className="bg-sky-50 p-10 rounded-[3rem] border border-sky-100 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-1000">
                  <h3 className="text-3xl font-serif font-bold text-sky-900 mb-8 flex items-center gap-4">
                    <i className="fa-solid fa-wind text-sky-400"></i> The Vata Tattva (Ether & Air)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-sky-600 uppercase tracking-[0.3em] mb-3">Swarupa (Characteristics)</p>
                        <p className="text-sm text-sky-800 leading-relaxed italic">
                          Vata is the primary moving force. It is <b>Laghu</b> (Light), <b>Shita</b> (Cold), <b>Ruksha</b> (Dry), and <b>Khara</b> (Rough). 
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-6 bg-white/80 rounded-3xl border border-sky-100 shadow-inner">
                        <p className="text-[10px] font-bold text-sky-600 uppercase tracking-[0.3em] mb-3">Vikriti (Imbalances)</p>
                        <ul className="text-xs text-sky-900 space-y-2">
                          <li><i className="fa-solid fa-circle-exclamation text-sky-300 mr-2"></i> Chinta (Anxiety)</li>
                          <li><i className="fa-solid fa-circle-exclamation text-sky-300 mr-2"></i> Nidranasha (Insomnia)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {isPittaDominant && (
                <section className="bg-orange-50 p-10 rounded-[3rem] border border-orange-100 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-1000">
                  <h3 className="text-3xl font-serif font-bold text-orange-900 mb-8 flex items-center gap-4">
                    <i className="fa-solid fa-fire text-orange-600"></i> The Pitta Tattva (Fire & Water)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-[0.3em] mb-3">Swarupa (Characteristics)</p>
                        <p className="text-sm text-orange-800 leading-relaxed italic">
                          Pitta governs metabolism. It is <b>Usna</b> (Hot), <b>Tikshna</b> (Sharp), and <b>Laghu</b> (Light).
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-6 bg-white/80 rounded-3xl border border-orange-100 shadow-inner">
                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-[0.3em] mb-3">Vikriti (Imbalances)</p>
                        <ul className="text-xs text-orange-900 space-y-2">
                          <li><i className="fa-solid fa-circle-exclamation text-orange-300 mr-2"></i> Krodha (Anger)</li>
                          <li><i className="fa-solid fa-circle-exclamation text-orange-300 mr-2"></i> Amlapitta (Acidity)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {isKaphaDominant && (
                <section className="bg-indigo-50 p-10 rounded-[3rem] border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-1000">
                  <h3 className="text-3xl font-serif font-bold text-indigo-900 mb-8 flex items-center gap-4">
                    <i className="fa-solid fa-droplet text-indigo-600"></i> The Kapha Tattva (Earth & Water)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] mb-3">Swarupa (Characteristics)</p>
                        <p className="text-sm text-indigo-800 leading-relaxed italic">
                          Kapha provides structure. It is <b>Guru</b> (Heavy), <b>Shita</b> (Cold), and <b>Snigdha</b> (Oily).
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-6 bg-white/80 rounded-3xl border border-indigo-100 shadow-inner">
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] mb-3">Vikriti (Imbalances)</p>
                        <ul className="text-xs text-indigo-900 space-y-2">
                          <li><i className="fa-solid fa-circle-exclamation text-indigo-300 mr-2"></i> Alasya (Lethargy)</li>
                          <li><i className="fa-solid fa-circle-exclamation text-indigo-300 mr-2"></i> Sthoulya (Weight Gain)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#e1e5d5]">
                  <h4 className="font-serif font-bold text-2xl text-[#1B4332] mb-6 flex items-center gap-3">
                    <i className="fa-solid fa-dna text-[#BC6C25]"></i> Prakriti Lakshana (Traits)
                  </h4>
                  <ul className="space-y-4">
                    {result.keyTraits.map((t, i) => (
                      <li key={i} className="flex gap-4 text-[#5b6e58] font-medium text-sm leading-relaxed">
                        <i className="fa-solid fa-seedling text-[#BC6C25] mt-1 shrink-0"></i> {t}
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#e1e5d5]">
                  <h4 className="font-serif font-bold text-2xl text-[#1B4332] mb-6 flex items-center gap-3">
                    <i className="fa-solid fa-sun text-[#BC6C25]"></i> Dinacharya & Vihara (Routine)
                  </h4>
                  <ul className="space-y-4">
                    {result.lifestyleAdvice.map((t, i) => (
                      <li key={i} className="flex gap-4 text-[#5b6e58] font-medium text-sm leading-relaxed">
                        <i className="fa-solid fa-spa text-[#1B4332] mt-1 shrink-0"></i> {t}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="bg-[#1B4332] text-[#FEFAE0] p-10 rounded-[4rem] shadow-2xl sticky top-32 border-b-[16px] border-[#BC6C25]">
                <h4 className="text-3xl font-serif font-bold mb-10 flex items-center gap-4">
                  <i className="fa-solid fa-mortar-pestle text-[#BC6C25]"></i> Pathya-Apathya (Diet)
                </h4>
                <div className="space-y-6 relative z-10">
                  {result.dietaryAdvice.map((t, i) => (
                    <div key={i} className="flex items-start gap-5 p-5 bg-white/5 rounded-3xl hover:bg-white/10 transition-all group">
                      <div className="w-3 h-3 rounded-full bg-[#BC6C25] mt-2 shrink-0"></div>
                      <p className="text-base font-medium leading-tight">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <footer className="mt-24 pt-12 border-t border-[#e1e5d5] text-center">
            <button 
              onClick={reset}
              className="px-20 py-6 bg-[#1B4332] text-[#FEFAE0] rounded-full font-bold text-xl shadow-2xl hover:-translate-y-2 transition-all"
            >
              Restart Discovery
            </button>
          </footer>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
