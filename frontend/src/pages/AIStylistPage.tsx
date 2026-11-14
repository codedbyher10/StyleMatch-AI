import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Send, User, Copy, Pencil, Check, X, Mic, Lightbulb, Sparkle } from 'lucide-react';

interface ChatMessageState {
  role: 'user' | 'assistant';
  content: string;
}

// 🎨 Vibrant Luxury Theme Colors for Outfit Boxes
const OUTFIT_BOX_THEMES = [
  {
    boxBorder: 'border-violet-500/40 hover:border-violet-400/60',
    boxBg: 'bg-gradient-to-b from-violet-950/40 via-zinc-900/90 to-zinc-950/95',
    boxGlow: 'shadow-[0_4px_25px_rgba(138,43,226,0.15)]',
    titleBadge: 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(138,43,226,0.2)]',
    itemRow: 'bg-violet-500/10 border-violet-500/20 text-violet-100 hover:bg-violet-500/20',
    dotColor: 'bg-violet-400',
    accentText: 'text-violet-300'
  },
  {
    boxBorder: 'border-emerald-500/40 hover:border-emerald-400/60',
    boxBg: 'bg-gradient-to-b from-emerald-950/40 via-zinc-900/90 to-zinc-950/95',
    boxGlow: 'shadow-[0_4px_25px_rgba(16,185,129,0.15)]',
    titleBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    itemRow: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100 hover:bg-emerald-500/20',
    dotColor: 'bg-emerald-400',
    accentText: 'text-emerald-300'
  },
  {
    boxBorder: 'border-rose-500/40 hover:border-rose-400/60',
    boxBg: 'bg-gradient-to-b from-rose-950/40 via-zinc-900/90 to-zinc-950/95',
    boxGlow: 'shadow-[0_4px_25px_rgba(244,63,94,0.15)]',
    titleBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    itemRow: 'bg-rose-500/10 border-rose-500/20 text-rose-100 hover:bg-rose-500/20',
    dotColor: 'bg-rose-400',
    accentText: 'text-rose-300'
  },
  {
    boxBorder: 'border-amber-500/40 hover:border-amber-400/60',
    boxBg: 'bg-gradient-to-b from-amber-950/40 via-zinc-900/90 to-zinc-950/95',
    boxGlow: 'shadow-[0_4px_25px_rgba(245,158,11,0.15)]',
    titleBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    itemRow: 'bg-amber-500/10 border-amber-500/20 text-amber-100 hover:bg-amber-500/20',
    dotColor: 'bg-amber-400',
    accentText: 'text-amber-300'
  },
  {
    boxBorder: 'border-cyan-500/40 hover:border-cyan-400/60',
    boxBg: 'bg-gradient-to-b from-cyan-950/40 via-zinc-900/90 to-zinc-950/95',
    boxGlow: 'shadow-[0_4px_25px_rgba(6,182,212,0.15)]',
    titleBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    itemRow: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-100 hover:bg-cyan-500/20',
    dotColor: 'bg-cyan-400',
    accentText: 'text-cyan-300'
  }
];

// Helper: Cleans duplicate words
function cleanDuplicateWords(text: string): string {
  if (!text) return '';
  let res = text.replace(/\b([A-Za-z]+)\s+Classic\s+\1\b/gi, 'Classic $1');
  res = res.replace(/\b([A-Za-z]+ [A-Za-z]+)\s+\1\b/gi, '$1');
  res = res.replace(/\b([A-Za-z]+)\s+\1\b/gi, '$1');
  return res;
}

// Helper: Cleans garment item text by removing all ** and stray bullets
function cleanGarmentItemText(text: string): string {
  if (!text) return '';
  let cleaned = cleanDuplicateWords(text);
  cleaned = cleaned.replace(/\*\*/g, '').replace(/^[\*\-•\s]+/, '').replace(/[\*\-•\s]+$/, '').trim();
  return cleaned;
}

// Formats inline bold text for general paragraphs and tips
function renderBoldText(text: string, accentColor = 'text-violet-300') {
  const cleaned = cleanDuplicateWords(text);
  const parts = cleaned.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={`font-semibold ${accentColor}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.replace(/\*\*/g, '');
  });
}

type ParsedBlock =
  | { type: 'text'; content: string }
  | { type: 'outfit_box'; title: string; items: string[] }
  | { type: 'stylist_tip'; content: string };

function parseStylistResponse(rawContent: string): ParsedBlock[] {
  let text = rawContent;

  text = text.replace(/(###[^\n*]+)\s*\*\s*/g, '$1\n\n* ');
  text = text.replace(/([^\n])\s*\*\s*([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]|\b(?:Top|Shirt|Jeans|Pants|Shoes|Sneakers|Jacket|Coat)\b)/gu, '$1\n* $2');
  text = text.replace(/^(###\s*)?(Stylist Secret|Fashion Secret|Style Tip):?\s*/gim, 'Quick tip: ');

  const lines = text.split('\n');
  const blocks: ParsedBlock[] = [];
  let currentOutfit: { title: string; items: string[] } | null = null;
  let textLines: string[] = [];

  const flushText = () => {
    if (textLines.length > 0) {
      const joined = textLines.join('\n').trim();
      if (joined) {
        blocks.push({ type: 'text', content: joined });
      }
      textLines = [];
    }
  };

  const flushOutfit = () => {
    if (currentOutfit && currentOutfit.items.length > 0) {
      blocks.push({
        type: 'outfit_box',
        title: currentOutfit.title || 'Curated Look',
        items: currentOutfit.items
      });
      currentOutfit = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      if (textLines.length > 0) flushText();
      continue;
    }

    if (/^(Quick tip|Styling tip|Pro tip|Tip|💡\s*Quick tip):/i.test(rawLine)) {
      flushOutfit();
      flushText();
      const tipContent = rawLine.replace(/^(Quick tip|Styling tip|Pro tip|Tip|💡\s*Quick tip):\s*/i, '').trim();
      blocks.push({ type: 'stylist_tip', content: tipContent });
      continue;
    }

    const isHeading = /^#{1,4}\s+|^\*?\*?(Day\s*\d+|Look\s*\d+|Outfit\s*\d+|Option\s*\d+)/i.test(rawLine);
    if (isHeading && !rawLine.startsWith('* 👕') && !rawLine.startsWith('* 👖') && !rawLine.startsWith('* 👟')) {
      flushOutfit();
      flushText();
      const cleanTitle = rawLine.replace(/^[#\*\_\s]+|[#\*\_\s]+$/g, '').trim();
      currentOutfit = { title: cleanTitle, items: [] };
      continue;
    }

    if (/^[\*\-•]/.test(rawLine)) {
      flushText();
      const cleanItem = rawLine.replace(/^[\*\-•]\s*/, '').trim();
      if (!currentOutfit) {
        currentOutfit = { title: '✨ Curated Outfit Look', items: [] };
      }
      currentOutfit.items.push(cleanItem);
      continue;
    }

    if (currentOutfit) {
      flushOutfit();
    }
    textLines.push(rawLine);
  }

  flushOutfit();
  flushText();

  return blocks;
}

function OutfitBoxCard({ title, items, index }: { title: string; items: string[]; index: number }) {
  const theme = OUTFIT_BOX_THEMES[index % OUTFIT_BOX_THEMES.length];
  const cleanTitle = cleanDuplicateWords(title).replace(/\*\*/g, '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={`rounded-2xl border p-4 md:p-5 ${theme.boxBorder} ${theme.boxBg} ${theme.boxGlow} backdrop-blur-xl transition-all my-3`}
    >
      <div className="flex items-center gap-2 pb-3 border-b border-white/10">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${theme.titleBadge} flex items-center gap-1.5`}>
          <Sparkle className="w-3.5 h-3.5 fill-current" />
          {cleanTitle}
        </span>
      </div>

      <div className="grid gap-2 mt-3.5">
        {items.map((item, itemIdx) => {
          const itemText = cleanGarmentItemText(item);

          return (
            <div
              key={itemIdx}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${theme.itemRow} transition-all shadow-sm`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor} shrink-0`} />
              <span className="text-white text-sm font-medium leading-relaxed">
                {itemText}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function FormattedStylistMessage({ content }: { content: string }) {
  const blocks = parseStylistResponse(content);
  let outfitCounter = 0;

  return (
    <div className="space-y-3.5 text-sm leading-relaxed">
      {blocks.map((block, i) => {
        if (block.type === 'text') {
          return (
            <p key={i} className="text-white/90 leading-relaxed">
              {renderBoldText(block.content)}
            </p>
          );
        }

        if (block.type === 'outfit_box') {
          const currentIdx = outfitCounter;
          outfitCounter++;
          return (
            <OutfitBoxCard
              key={i}
              title={block.title}
              items={block.items}
              index={currentIdx}
            />
          );
        }

        if (block.type === 'stylist_tip') {
          return (
            <div
              key={i}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 my-3 shadow-[0_4px_20px_rgba(245,158,11,0.1)]"
            >
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5 border border-amber-500/30">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  Stylist Secret
                </span>
                <p className="text-white/90 text-sm leading-relaxed">
                  {renderBoldText(block.content, 'text-amber-200')}
                </p>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export default function AIStylistPage() {
  const [messages, setMessages] = useState<ChatMessageState[]>(() => {
    const savedHistory = sessionStorage.getItem('stylematch_chat_history');
    if (savedHistory) {
      return JSON.parse(savedHistory);
    }
    return [
      { 
        role: 'assistant', 
        content: "Hello darling! I'm Aria, your personal fashion consultant. I've analyzed your wardrobe inventory. What event, vibe, or aesthetic shall we curate today? ✨"
      }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('stylematch_chat_history', JSON.stringify(messages));
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech-to-text is not supported by your current browser. Please try testing on Google Chrome or Safari!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend?: string, customHistory?: ChatMessageState[]) => {
    const query = textToSend || input;
    if (!query.trim()) return;
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const baseHistory = customHistory || messages;
    const updatedMessages = [...baseHistory, { role: 'user' as const, content: query }];
    
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setIsTyping(true);

    const token = sessionStorage.getItem('stylematch_token') || localStorage.getItem('stylematch_token');
    try {
      const historyPayload = baseHistory.slice(1).filter(
        msg => !msg.content.includes("tangled") && !msg.content.includes("trouble connecting")
      ).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await fetch('http://127.0.0.1:8000/api/stylist/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: query,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error('API server failed to respond.');
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      console.error("❌ CHAT FAILED:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "I apologize, darling, but I am having trouble connecting to my styling database right now. Please verify your connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleStartEdit = (index: number, content: string) => {
    setEditingIndex(index);
    setEditText(content);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
  };

  const handleSaveEdit = async (index: number) => {
    if (!editText.trim()) return;
    const truncatedHistory = messages.slice(0, index);
    setEditingIndex(null);
    await handleSend(editText, truncatedHistory);
  };

  const prompts = [
    "What should I wear today?",
    "Style my denim jacket",
    "Date night outfit idea",
    "Packing list for 3 days in Paris"
  ];

  return (
    // EXTENDED BOTTOM HEIGHT: Stretches down to utilize the lower screen space
    <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col gap-2.5 px-1 md:px-2 pb-1 overflow-hidden">
      
      {/* Luxury Aria Header Box */}
      <div className="glass-card rounded-2xl px-5 py-3 md:px-6 md:py-3.5 border border-white/10 flex items-center justify-between shrink-0 shadow-[0_8px_32px_rgba(0,0,0,0.35)] bg-zinc-950/70 backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-violet-400/60 shadow-[0_0_20px_rgba(138,43,226,0.6)] bg-gradient-to-tr from-violet-950 via-violet-600 to-fuchsia-500 flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-medium text-base md:text-lg text-white tracking-wide">
                Aria · AI Couture Consultant
              </h1>
              
              {/* Active Badge with Glowing Green Animation */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </span>
                <span className="tracking-wide">Active</span>
              </div>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Trained on 500,000+ runway looks & color harmony theory
            </p>
          </div>
        </div>
      </div>

      {/* Main Expansive Chat Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-h-0 glass-panel rounded-2xl md:rounded-3xl border border-white/10 flex flex-col overflow-hidden relative group shadow-2xl bg-zinc-950/50 backdrop-blur-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        {/* Messages Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-5 relative z-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3.5 max-w-[92%] md:max-w-[80%] group ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-md mt-0.5 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-600 border border-violet-400/40 text-white' 
                  : 'bg-gradient-to-tr from-violet-900 via-violet-600 to-fuchsia-500 text-white border border-violet-400/50 shadow-[0_0_12px_rgba(138,43,226,0.6)]'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              {/* Dynamic Bubble Container */}
              <div className={`flex flex-col gap-1 ${
                msg.role === 'user' ? 'items-end' : 'w-full'
              }`}>
                {editingIndex === i ? (
                  <div className="p-3 bg-zinc-900/90 border border-violet-500/50 rounded-2xl flex items-center gap-2 min-w-[280px]">
                    <input 
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(i)}
                      className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                    />
                    <button onClick={() => handleSaveEdit(i)} className="p-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={handleCancelEdit} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/60">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className={`transition-all break-words ${
                    msg.role === 'user' 
                      ? 'w-fit max-w-full px-4 py-2.5 md:px-5 md:py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-normal rounded-tr-sm shadow-[0_4px_18px_rgba(124,58,237,0.3)] border border-violet-400/30 text-sm leading-relaxed' 
                      : 'w-full p-4 md:p-5 rounded-2xl bg-zinc-900/85 border border-white/10 backdrop-blur-xl text-white/90 rounded-tl-sm shadow-[0_4px_25px_rgba(0,0,0,0.5)]'
                  }`}>
                    {msg.role === 'user' ? (
                      <span>{msg.content}</span>
                    ) : (
                      <FormattedStylistMessage content={msg.content} />
                    )}
                  </div>
                )}

                {/* Actions */}
                {editingIndex !== i && (
                  <div className={`flex gap-2 px-1 transition-opacity duration-200 mt-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <button 
                      onClick={() => handleCopyText(msg.content)}
                      className="text-white/40 hover:text-violet-300 transition-colors p-1"
                      title="Copy text"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {msg.role === 'user' && (
                      <button 
                        onClick={() => handleStartEdit(i, msg.content)}
                        className="text-white/40 hover:text-violet-300 transition-colors p-1"
                        title="Edit message"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3.5 max-w-[85%]"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-900 to-violet-600 text-white border border-violet-400/50 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(138,43,226,0.6)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 rounded-tl-sm flex items-center gap-2">
                <span className="text-xs text-white/60 font-medium mr-1">Aria is curating your look...</span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 md:p-3.5 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-2 mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {prompts.map((p) => (
              <motion.button 
                key={p} 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/20 transition duration-200"
              >
                {p}
              </motion.button>
            ))}
          </div>
          
          <div className="relative flex items-center bg-zinc-900/90 border border-white/15 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/30 rounded-full px-4 py-2 transition-all shadow-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Aria to style an item, weather, or event..."
              className="w-full bg-transparent text-white text-xs md:text-sm placeholder-white/40 focus:outline-none pr-3"
            />
            
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                type="button"
                onClick={toggleListening}
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition border ${
                  isListening 
                    ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
                title="Speak"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100 transition shadow-[0_0_12px_rgba(124,58,237,0.5)]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}