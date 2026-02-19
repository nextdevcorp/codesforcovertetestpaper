import React, { useState, useEffect } from 'react';
import {
  Upload,
  Copy,
  Check,
  AlertCircle,
  ClipboardList,
  Trash2,
  Moon,
  Zap,
  ZapOff,
  ExternalLink,
  History,
  Info,
  Settings,
  Code,
  Layers
} from 'lucide-react';

const App = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [output, setOutput] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoClear, setAutoClear] = useState(true);
  const [history, setHistory] = useState([]);
  const [copyStatus, setCopyStatus] = useState(null);
  const [mode, setMode] = useState('physics'); // 'physics' or 'ict'

  const cleanHtml = (html) => {
    if (!html) return "";
    let text = html;
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<p[^>]*>/gi, '');
    text = text.replace(/<[^>]*>?/gm, '');

    const entities = {
      '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'",
      '&lt;': '<', '&gt;': '>', '&ldquo;': '"', '&rdquo;': '"',
      '&lsquo;': "'", '&rsquo;': "'", '&ndash;': '-', '&mdash;': '—'
    };
    Object.keys(entities).forEach(key => {
      text = text.replace(new RegExp(key, 'g'), entities[key]);
    });
    return text.trim();
  };

  const formatChapterName = (rawName) => {
    if (!rawName) return "অন্যান্য";
    let name = cleanHtml(rawName);

    if (mode === 'physics') {
      // Physics Mapping Based on User Requirements
      
      // Paper 2
      if (name.includes('তাপগতিবিদ্যা')) return "Chapter 01: তাপগতিবিদ্যা";
      if (name.includes('স্থির তড়িৎ') || name.includes('স্থির তড়িৎ')) return "Chapter 02: স্থির তড়িৎ";
      if (name.includes('চলতড়িৎ') || name.includes('চলতড়িৎ')) return "Chapter 03: চলতড়িৎ";
      if (name.includes('ভৌত আলোকবিজ্ঞান')) return "Chapter 07: ভৌত আলোকবিজ্ঞান";
      if (name.includes('আধুনিক পদার্থবিজ্ঞান')) return "Chapter 08: আধুনিক পদার্থবিজ্ঞানের সূচনা";
      if (name.includes('পরমাণুর মডেল') || name.includes('নিউক্লিয়ার')) return "Chapter 09: পরমাণুর মডেল এবং নিউক্লিয়ার পদার্থবিজ্ঞান";
      if (name.includes('অর্ধ-পরিবাহী') || name.includes('ইলেকট্রনিক্স') || name.includes('সেমিকন্ডাক্টর')) return "Chapter 10: সেমিকন্ডাক্টর ও ইলেকট্রনিক্স";
      
      // Paper 1
      if (name.includes('আদর্শ গ্যাস')) return "Chapter 10: আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব";
      if (name.includes('ভেক্টর')) return "Chapter 02: ভেক্টর";
      // **FIXED**: Using a more robust check for "Newton"
      if (name.includes('নিউটন') || name.includes('Newtonian')) return "Chapter 04: নিউটোনিয়ান বলবিদ্যা";
      if (name.includes('কাজ-শক্তি') || name.includes('কাজ, শক্তি')) return "Chapter 05: কাজ, শক্তি ও ক্ষমতা";
      if (name.includes('মহাকর্ষ')) return "Chapter 06: মহাকর্ষ ও অভিকর্ষ";
      if (name.includes('গাঠনিক ধর্ম')) return "Chapter 07: পদার্থের গাঠনিক ধর্ম";
      if (name.includes('পর্যাবৃত্ত গতি')) return "Chapter 08: পর্যাবৃত্ত গতি";
      if (name.includes('ভৌত জগৎ') || name.includes('পরিমাপ')) return "Chapter 01: ভৌত জগৎ ও পরিমাপ";
    } else {
      // ICT Mapping
      const ictMapping = {
        '1': '১. তথ্য ও যোগাযোগ প্রযুক্তি : বিশ্ব ও বাংলাদেশ প্রেক্ষিত',
        '2': '২. কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং',
        '3': '৩. সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস',
        '4': '৪. ওয়েব ডিজাইন পরিচিতি এবং HTML',
        '5': '৫. প্রোগ্রামিং ভাষা',
        '6': '৬. ডেটাবেজ ম্যানেজমেন্ট সিস্টেম'
      };
      const match = name.match(/(?:Chapter|অধ্যায়|অধ্যায়)\s*(\d+)/i);
      if (match && ictMapping[match[1]]) return ictMapping[match[1]];
      
      if (name.includes('বিশ্ব ও বাংলাদেশ')) return ictMapping['1'];
      if (name.includes('কমিউনিকেশন')) return ictMapping['2'];
      if (name.includes('সংখ্যা পদ্ধতি')) return ictMapping['3'];
      if (name.includes('ওয়েব') || name.includes('HTML')) return ictMapping['4'];
      if (name.includes('প্রোগ্রামিং')) return ictMapping['5'];
      if (name.includes('ডেটাবেজ')) return ictMapping['6'];
    }

    return name;
  };

  const handleConversion = (data) => {
    try {
      setError('');
      const sourceQuestions = data.questions || (Array.isArray(data) ? data : []);
      
      if (sourceQuestions.length === 0) throw new Error("কোন ডাটা পাওয়া যায়নি।");

      const formattedArray = sourceQuestions.map(item => {
        const chapterName = formatChapterName(item.chapter_name || item.chapter);
        const qMap = {};
        
        if (item.questions && Array.isArray(item.questions)) {
          item.questions.forEach(q => {
            if (q.type) {
              const type = q.type.toLowerCase();
              qMap[type] = {
                q: cleanHtml(q.question),
                a: cleanHtml(q.answer)
              };
            }
          });
        }

        return {
          chapter: chapterName,
          stimulus: cleanHtml(item.context || item.stimulus || ""),
          q_a: qMap['a']?.q || "",
          ans_a: qMap['a']?.a || "",
          q_b: qMap['b']?.q || "",
          ans_b: qMap['b']?.a || "",
          q_c: qMap['c']?.q || "",
          ans_c: qMap['c']?.a || "",
          q_d: qMap['d']?.q || "",
          ans_d: qMap['d']?.a || ""
        };
      });

      setOutput(formattedArray);
      
      const firstItem = sourceQuestions[0];
      const boardName = firstItem?.source?.board || firstItem?.board || firstItem?.board_name || "Unknown Source";
      
      setHistory(prev => [{
        id: Date.now(),
        board: `[${mode.toUpperCase()}] ${boardName}`,
        data: formattedArray,
        count: formattedArray.length,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, ...prev]);
      
      if (autoClear) setJsonInput('');
    } catch (err) {
      setError("ত্রুটি: " + err.message);
    }
  };

  const processText = (text) => {
    if (!text.trim()) return;
    try {
      const rawData = JSON.parse(text);
      handleConversion(rawData);
    } catch (err) {
      setError("ভুল JSON ফরম্যাট। পুনরায় চেক করুন।");
    }
  };

  const handleCopy = (data, id = null) => {
    const text = JSON.stringify(data, null, 2);
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      if (id) {
        setCopyStatus(id);
        setTimeout(() => setCopyStatus(null), 1500);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans text-slate-200">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Bar */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.15)]">
              <Layers className="text-indigo-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                QB FORMATTER <span className="text-indigo-500 uppercase">{mode}</span>
              </h1>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">v2.4 • Fixed Newtonian Mapping</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mr-2">
               <button 
                onClick={() => setMode('physics')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${mode === 'physics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >Physics</button>
               <button 
                onClick={() => setMode('ict')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${mode === 'ict' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >ICT</button>
            </div>

            <button 
              onClick={() => setAutoClear(!autoClear)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border uppercase ${
                autoClear 
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              {autoClear ? <Zap size={14} fill="currentColor" /> : <ZapOff size={14} />}
              Auto-Clear
            </button>

            <button 
              onClick={() => processText(jsonInput)} 
              disabled={!jsonInput.trim()}
              className="text-[11px] font-bold bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)] uppercase tracking-wider"
            >
              Convert
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-500 flex items-center gap-2">
                  <ClipboardList size={14} className="text-indigo-400" />
                  {mode === 'physics' ? 'Physics JSON' : 'ICT JSON'} Input
                </label>
                <button 
                  onClick={() => setJsonInput('')}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-600 hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <textarea
                className="w-full h-48 p-4 text-xs font-mono bg-slate-950 border border-slate-800/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 focus:outline-none resize-none text-indigo-300 transition-all placeholder:text-slate-800"
                placeholder='পাস্ট করুন এখানে...'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
            </section>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {output && (
              <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-slate-800/40 px-5 py-3 flex justify-between items-center border-b border-slate-800">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    Cleaned Output ({output.length} Items)
                  </span>
                  <button 
                    onClick={() => handleCopy(output)} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-[11px] transition-all uppercase ${
                      copied ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.3)]' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />} 
                    Copy Array
                  </button>
                </div>
                <div className="p-4 bg-slate-950 h-64 overflow-auto custom-scrollbar">
                  <pre className="text-indigo-400/90 text-[10px] font-mono leading-relaxed">
                    {JSON.stringify(output, null, 2)}
                  </pre>
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col h-full min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <History size={16} className="text-amber-500" />
                  History
                </h2>
                {history.length > 0 && (
                  <button 
                    onClick={() => setHistory([])}
                    className="text-[10px] font-bold text-slate-600 hover:text-red-400 transition-colors uppercase"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {history.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl opacity-40">
                    <History size={24} className="mb-2" />
                    <p className="text-[10px] uppercase font-bold tracking-widest text-center">Empty</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleCopy(item.data, item.id)}
                      className="group flex items-center justify-between bg-slate-950/50 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 cursor-pointer transition-all active:scale-[0.97] relative"
                    >
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="text-[11px] font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {item.board}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-slate-600">
                            {item.timestamp}
                          </span>
                          <span className="text-[9px] font-bold text-indigo-500/70">
                            {item.count} items
                          </span>
                        </div>
                      </div>
                      
                      {copyStatus === item.id && (
                        <div className="absolute inset-0 bg-indigo-600 rounded-xl flex items-center justify-center animate-in fade-in duration-200">
                           <Check size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

export default App;
