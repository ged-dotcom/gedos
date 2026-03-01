import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ChevronDown, ChevronUp, Trash2, Calendar, Loader2 } from 'lucide-react';
import { getStorage, setStorage } from '../lib/storage';

export default function History() {
    const [mounted, setMounted] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        const initHistory = async () => {
            // Await the cloud fetch for your history logs
            const savedHistory = await getStorage('gedos-history', []);
            setHistory(savedHistory);
            setMounted(true);
        };
        initHistory();
    }, []);

    const deleteEntry = async (id: number) => {
        if (!confirm("Delete this review permanently?")) return;

        const updated = history.filter(h => h.id !== id);
        setHistory(updated);

        // Ensure the deletion syncs to the cloud
        await setStorage('gedos-history', updated);
    };

    if (!mounted) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="text-[#CC5500] animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 pb-20 selection:bg-[#CC5500]/30">
            <Navbar />
            <main className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-12 tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                    Review History
                </h1>

                <div className="space-y-6">
                    {history.length === 0 ? (
                        <div className="text-zinc-700 text-[10px] uppercase tracking-[0.3em] border border-dashed border-zinc-900 rounded-3xl p-20 text-center font-bold">
                            No history found. Your growth will be documented here.
                        </div>
                    ) : (
                        history.map((entry) => (
                            <div
                                key={entry.id}
                                className={`border transition-all duration-300 rounded-2xl overflow-hidden ${expandedId === entry.id
                                        ? 'border-[#CC5500]/40 bg-zinc-900/40 shadow-2xl shadow-[#CC5500]/5'
                                        : 'border-white/5 bg-zinc-950/40 hover:border-white/10'
                                    }`}
                            >
                                <div
                                    className="p-6 flex justify-between items-center cursor-pointer group"
                                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg transition-colors ${expandedId === entry.id ? 'bg-[#CC5500]/20' : 'bg-zinc-900'}`}>
                                            <Calendar size={14} className={expandedId === entry.id ? 'text-[#CC5500]' : 'text-zinc-500'} />
                                        </div>
                                        <span className={`font-bold text-sm tracking-tight transition-colors ${expandedId === entry.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                            Week of {entry.date}
                                        </span>
                                    </div>
                                    <div className="flex gap-6 items-center">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                                            className="text-zinc-800 hover:text-red-500 transition-colors p-2"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="p-1">
                                            {expandedId === entry.id
                                                ? <ChevronUp size={18} className="text-[#CC5500]" />
                                                : <ChevronDown size={18} className="text-zinc-700" />
                                            }
                                        </div>
                                    </div>
                                </div>

                                {expandedId === entry.id && (
                                    <div className="p-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
                                        {[
                                            { l: 'Wins', v: entry.wins },
                                            { l: 'Challenges', v: entry.challenges },
                                            { l: 'Lessons', v: entry.lessons },
                                            { l: 'Ideas', v: entry.ideas },
                                            { l: 'Direction', v: entry.direction },
                                            { l: 'Spiritual', v: entry.spiritual },
                                        ].map(field => (
                                            <div key={field.l} className="space-y-3">
                                                <h4 className="text-[#CC5500] text-[9px] font-bold uppercase tracking-[0.25em] flex items-center gap-2">
                                                    <span className="w-1 h-1 rounded-full bg-[#CC5500]" />
                                                    {field.l}
                                                </h4>
                                                <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed pl-3 border-l border-zinc-800">
                                                    {field.v || 'No reflections recorded.'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}