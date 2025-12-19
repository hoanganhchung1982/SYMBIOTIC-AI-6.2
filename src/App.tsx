
import React, { useState, useRef } from 'react';
import { 
  Camera, Image as ImageIcon, Mic, Send, ChevronLeft, Zap, 
  Loader2, BrainCircuit, XCircle, PlusCircle, CheckCircle2, 
  Sparkles, ArrowRight 
} from 'lucide-react';
import { Subject, ModuleTab, AIResponse } from './types';
import { SUBJECT_CONFIG, TAB_CONFIG } from './constants';
import { generateStudyContent } from './services/geminiService';
import MermaidChart from './components/MermaidChart';

const App: React.FC = () => {
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState<ModuleTab>(ModuleTab.SPEED);
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showMcqAnswer, setShowMcqAnswer] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    });
  };

  const handleSubjectSelect = (subj: Subject) => {
    if (subj === Subject.TIME) { alert("Nhật ký học tập đang phát triển!"); return; }
    setCurrentSubject(subj);
    resetState();
  };

  const resetState = () => {
    setAiResponse(null); setCapturedImage(null); setInputText('');
    setShowResult(false); setIsCameraActive(false); setSelectedOption(null);
    setShowMcqAnswer(false); setActiveTab(ModuleTab.SPEED);
  };

  const handleStartCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { setIsCameraActive(false); alert("Không thể mở camera."); }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      setCapturedImage(canvasRef.current.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraActive(false);
  };

  const handleSubmit = async () => {
    if (!currentSubject || (!inputText && !capturedImage)) return;
    setIsAiLoading(true);
    try {
      let finalImage = capturedImage || undefined;
      if (finalImage) finalImage = await compressImage(finalImage);
      const result = await generateStudyContent(currentSubject, inputText || "Hãy phân tích bài học này", finalImage);
      setAiResponse(result);
      setShowResult(true);
    } catch (err) { 
      alert("AI đang bận, vui lòng thử lại."); 
    } finally { 
      setIsAiLoading(false); 
    }
  };

  if (!currentSubject) return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center gap-10 bg-slate-50">
      <div className="text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-5xl font-black text-slate-800 tracking-tighter">Symbiotic <span className="text-indigo-600">AI</span></h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-3">Multi Agent Learning System</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
        {(Object.keys(SUBJECT_CONFIG) as Subject[]).map((subj) => {
          const cfg = SUBJECT_CONFIG[subj];
          return (
            <button key={subj} onClick={() => handleSubjectSelect(subj)} className={`flex flex-col items-center justify-center aspect-square rounded-[3rem] p-6 transition-all hover:scale-105 hover:rotate-2 shadow-2xl bg-gradient-to-br ${cfg.gradient} text-white group`}>
              <div className="bg-white/20 p-5 rounded-3xl mb-4 group-hover:scale-110 transition-transform">{cfg.icon}</div>
              <span className="font-black uppercase tracking-wider text-xs">{cfg.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const config = SUBJECT_CONFIG[currentSubject];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <header className={`p-5 flex items-center justify-between text-white bg-gradient-to-r ${config.gradient} shadow-lg sticky top-0 z-50 backdrop-blur-md`}>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentSubject(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><ChevronLeft className="w-6 h-6" /></button>
          <h2 className="font-black uppercase tracking-tight text-lg">{config.label}</h2>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Symbiotic AI V6
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 pb-40">
        {!showResult && !isAiLoading ? (
          <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl"><BrainCircuit className="w-5 h-5" /></div>
              Phòng học thông minh
            </h3>
            
            {isCameraActive && (
              <div className="relative mb-8 rounded-[2.5rem] overflow-hidden bg-black aspect-video shadow-2xl border-4 border-white">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <button onClick={captureFrame} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"><Camera className="w-7 h-7 text-slate-900" /></button>
              </div>
            )}

            {capturedImage && !isCameraActive && (
              <div className="relative mb-8 max-w-sm mx-auto group">
                <img src={capturedImage} className="rounded-[2rem] border-4 border-white shadow-2xl w-full" />
                <button onClick={() => setCapturedImage(null)} className="absolute -top-3 -right-3 bg-rose-500 text-white p-3 rounded-full shadow-xl border-4 border-white hover:scale-110 transition-all"><XCircle className="w-5 h-5"/></button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-8">
              <button onClick={handleStartCamera} className="py-6 bg-slate-50 rounded-[2rem] flex flex-col items-center gap-2 border-2 border-slate-100 hover:bg-white hover:border-indigo-200 transition-all group"><Camera className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors"/><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Máy ảnh</span></button>
              <button onClick={() => fileInputRef.current?.click()} className="py-6 bg-slate-50 rounded-[2rem] flex flex-col items-center gap-2 border-2 border-slate-100 hover:bg-white hover:border-emerald-200 transition-all group"><ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors"/><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Tải lên</span><input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload=(ev)=>setCapturedImage(ev.target?.result as string); r.readAsDataURL(f); }}} /></button>
              <button onClick={() => alert("Ghi âm sắp ra mắt")} className="py-6 bg-slate-50 rounded-[2rem] flex flex-col items-center gap-2 border-2 border-slate-100 hover:bg-white hover:border-rose-200 transition-all group"><Mic className="w-6 h-6 text-slate-400 group-hover:text-rose-600 transition-colors"/><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Giọng nói</span></button>
            </div>

            <textarea value={inputText} onChange={(e)=>setInputText(e.target.value)} placeholder="Nhập câu hỏi hoặc dán đề bài tại đây..." className="w-full p-8 bg-slate-50 rounded-[2.5rem] min-h-[180px] focus:outline-none border-2 border-slate-100 focus:border-indigo-300 transition-all text-slate-700 font-medium placeholder:text-slate-400 mb-8" />
            <div className="flex justify-center">
              <button onClick={handleSubmit} disabled={!inputText && !capturedImage} className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"><Sparkles className="w-5 h-5 text-yellow-300"/> Thực hiện phân tích</button>
            </div>
          </div>
        ) : isAiLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-[50px] rounded-full animate-pulse"></div>
              <div className="relative bg-white p-10 rounded-full shadow-2xl border border-indigo-50">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-black text-slate-800 tracking-tight">Symbiotic Agents</h4>
              <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-2 animate-pulse">Đang hệ thống hóa kiến thức bài học...</p>
            </div>
          </div>
        ) : aiResponse && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Analysis Result Card */}
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="grid grid-cols-5 gap-1.5 p-3 bg-slate-50/50 border-b border-slate-100">
                {(Object.keys(TAB_CONFIG) as ModuleTab[]).map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => { setActiveTab(tab); setSelectedOption(null); setShowMcqAnswer(false); }} 
                    className={`flex flex-col items-center py-3 px-1 rounded-[1.5rem] transition-all border ${activeTab === tab ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' : 'text-slate-400 hover:text-indigo-600 border-transparent hover:bg-white'}`}
                  >
                    <span className="mb-1.5">{TAB_CONFIG[tab].icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">{TAB_CONFIG[tab].label}</span>
                  </button>
                ))}
              </div>

              <div className="p-8 md:p-14 min-h-[400px]">
                {activeTab === ModuleTab.SPEED ? (
                  <div className="space-y-12 animate-in fade-in duration-500">
                    <div className="bg-indigo-50/50 p-10 rounded-[2.5rem] border-2 border-indigo-100 relative overflow-hidden group">
                      <Zap className="absolute -right-8 -bottom-8 w-40 h-40 text-indigo-500/10 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black text-indigo-600 uppercase mb-4 block tracking-[0.3em]">Kết quả</span>
                      <p className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">Đáp án: {aiResponse.speed.answer}</p>
                    </div>
                    <div className="pt-8 border-t border-slate-50">
                      <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest mb-6 flex items-center gap-3">
                        <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                        Luyện tập tương tự
                      </h4>
                      <p className="font-medium text-lg text-slate-700 mb-8 leading-relaxed">{aiResponse.speed.similar.question}</p>
                      <div className="grid gap-3">
                        {aiResponse.speed.similar.options.map((o, i) => (
                          <button 
                            key={i} 
                            onClick={() => { setSelectedOption(i); setShowMcqAnswer(true); }} 
                            disabled={showMcqAnswer} 
                            className={`p-4 rounded-2xl text-left font-medium text-base border transition-all flex items-center gap-4 ${
                              showMcqAnswer 
                                ? (i === aiResponse.speed.similar.correctIndex 
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-bold' 
                                    : (selectedOption === i ? 'bg-rose-50 border-rose-400 text-rose-700' : 'opacity-40 grayscale border-transparent')) 
                                : 'bg-slate-50 border-slate-100 hover:border-indigo-300 hover:bg-white'
                            }`}
                          >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${
                              showMcqAnswer && i === aiResponse.speed.similar.correctIndex ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400'
                            }`}>{String.fromCharCode(65+i)}</span>
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="scientific-text whitespace-pre-line animate-in slide-in-from-left-6 duration-500">
                    <div className="flex items-center gap-3 mb-8 opacity-40">
                      <div className="h-px flex-1 bg-slate-300"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{activeTab} Agents</span>
                      <div className="h-px flex-1 bg-slate-300"></div>
                    </div>
                    {(aiResponse as any)[activeTab]}
                  </div>
                )}
              </div>
            </div>

            {/* Mindmap - Always Shown Below Results */}
            <MermaidChart chart={aiResponse.mermaid} />

            <div className="flex justify-center pb-12">
              <button 
                onClick={resetState} 
                className="flex items-center gap-4 px-12 py-7 bg-white text-indigo-600 font-black rounded-[2.5rem] shadow-xl border-2 border-indigo-50 hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                <PlusCircle className="w-6 h-6" />
                Câu hỏi tiếp theo
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for prompt clarification */}
      {showResult && !isAiLoading && (
        <div className="fixed bottom-8 left-0 right-0 px-6 z-40 pointer-events-none">
          <div className="max-w-4xl mx-auto flex justify-end pointer-events-auto">
             <div className="bg-white p-2 rounded-full shadow-2xl border border-slate-100 flex items-center gap-3 overflow-hidden animate-in slide-in-from-right-12 duration-500">
               <input type="text" placeholder="Hỏi thêm về bài tập..." className="bg-transparent pl-6 py-3 font-medium text-sm focus:outline-none w-0 focus:w-64 transition-all duration-500" />
               <button className="bg-indigo-600 p-4 rounded-full text-white shadow-lg hover:rotate-12 transition-transform">
                 <Send className="w-6 h-6" />
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
