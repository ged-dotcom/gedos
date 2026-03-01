import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ChevronDown, ChevronUp, Trash2, Calendar } from 'lucide-react';
import { getStorage, setStorage } from '../lib/storage';

export default function History() {
    const [history, setHistory] = useState<any[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        setHistory(getStorage('gedos-history', []));
    }, []);

    const deleteEntry = (id: number) => {
        if (!confirm("Delete this review permanently?")) return;
        const updated = history.filter(h => h.id !== id);
        setHistory(updated);
        setStorage('gedos-history', updated);
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 pb-20">
            <Navbar />
            <main className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-8 tracking-tighter">Review History</h1>
                <div className="space-y-4">
                    {history.length === 0 && (
                        <div className="text-zinc-700 text-sm italic border border-dashed border-zinc-900 rounded-2xl p-12 text-center">
                            No history found. Your growth will be documented here.
                        </div>
                    )}
                    {history.map((entry) => (
                        <div key={entry.id} className="border border-white/5 bg-zinc-900/20 rounded-2xl overflow-hidden transition-all hover:border-white/10">
                            <div
                                className="p-6 flex justify-between items-center cursor-pointer"
                                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <Calendar size={14} className="text-[#CC5500]" />
                                    <span className="font-medium text-zinc-200">{entry.date}</span>
                                </div>
                                <div className="flex gap-6 items-center">
                                    <button onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }} className="text-zinc-800 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                    {expandedId === entry.id ? <ChevronUp size={20} className="text-zinc-500" /> : <ChevronDown size={20} className="text-zinc-500" />}
                                </div>
                            </div>

                            {expandedId === entry.id && (
                                <div className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 mt-2 animate-in slide-in-from-top-2 duration-300">
                                    {[
                                        { l: 'Wins', v: entry.wins },
                                        { l: 'Challenges', v: entry.challenges },
                                        { l: 'Lessons', v: entry.lessons },
                                        { l: 'Ideas', v: entry.ideas },
                                        { l: 'Direction', v: entry.direction },
                                        { l: 'Spiritual', v: entry.spiritual },
                                    ].map(field => (
                                        <div key={field.l} className="space-y-2">
                                            <h4 className="text-[#CC5500] text-[9px] font-bold uppercase tracking-[0.2em]">{field.l}</h4>
                                            <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">{field.v || '—'}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}