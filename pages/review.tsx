import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Card } from '../components/Card';
import { StickyNote, CheckSquare, Square } from 'lucide-react';
import { getStorage, setStorage, Note, formatDate } from '../lib/storage';

export default function Review() {
    const [formData, setFormData] = useState<Record<string, string>>({ wins: '', challenges: '', lessons: '', ideas: '', direction: '', spiritual: '' });
    const [recentNotes, setRecentNotes] = useState<Note[]>([]);
    const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const allNotes = getStorage('gedos_notes_v1', []);
        const last7Days = allNotes.filter((n: Note) => (new Date().getTime() - new Date(n.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000);
        setRecentNotes(last7Days);
    }, []);

    const toggleNote = (id: string) => setSelectedNotes(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const insertNotes = (targetField: string) => {
        const notesToInsert = recentNotes.filter(n => selectedNotes.includes(n.id));
        if (notesToInsert.length === 0) return;
        const body = notesToInsert.map(n => `[${formatDate(n.createdAt)}] (${n.type}/${n.project}) ${n.text}`).join('\n'); // Date + Tags
        setFormData(prev => ({ ...prev, [targetField]: (prev[targetField] || '') + (prev[targetField] ? '\n\n' : '') + body }));
        setSelectedNotes([]);
    };

    const getCounts = () => {
        const counts = recentNotes.reduce((acc: any, n) => { acc[n.type] = (acc[n.type] || 0) + 1; return acc; }, {});
        return Object.entries(counts).map(([type, count]) => `${type}: ${count}`).join(' • ');
    };

    const sections = [
        { key: 'wins', label: 'What went well this week?' },
        { key: 'challenges', label: "What didn't go well?" },
        { key: 'lessons', label: 'What did I learn?' },
        { key: 'ideas', label: 'What ideas came this week?' },
        { key: 'direction', label: 'What direction do I feel pulled toward?' },
        { key: 'spiritual', label: 'What has God been showing me?' },
    ];

    return (
        <div className="min-h-screen bg-black text-zinc-100 pb-32">
            <Navbar />
            <main className="max-w-4xl mx-auto p-6 space-y-12">
                <section>
                    <Card title="Weekly Kickstart" description={`${recentNotes.length} notes this week • ${getCounts()}`}>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar border-b border-white/5 mb-6">
                            {recentNotes.map(note => (
                                <div key={note.id} onClick={() => toggleNote(note.id)} className="flex items-start gap-4 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors">
                                    <div className="mt-0.5 text-[#CC5500]">{selectedNotes.includes(note.id) ? <CheckSquare size={16} /> : <Square size={16} className="opacity-20" />}</div>
                                    <div className="flex-1 overflow-hidden text-[10px] space-y-1">
                                        <div className="flex gap-2 font-bold uppercase tracking-widest">
                                            <span className="text-zinc-600 font-mono tracking-tighter">{formatDate(note.createdAt)}</span>
                                            <span className="text-[#CC5500]/50">({note.type} / {note.project})</span>
                                        </div>
                                        <p className="text-zinc-400 truncate">{note.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {sections.map(s => <button key={s.key} onClick={() => insertNotes(s.key)} className="px-3 py-1.5 rounded bg-zinc-900 border border-white/5 text-[9px] uppercase font-bold tracking-widest hover:border-[#CC5500] transition-all">Insert into {s.key}</button>)}
                        </div>
                    </Card>
                </section>
                <section className="space-y-8">
                    {sections.map(s => (
                        <div key={s.key} className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold italic">{s.label}</label>
                            <textarea className="w-full bg-zinc-900/30 border border-white/5 rounded-2xl p-4 focus:border-[#CC5500] outline-none h-32 text-sm text-zinc-300 resize-none leading-relaxed transition-all" value={formData[s.key]} onChange={(e) => setFormData({ ...formData, [s.key]: e.target.value })} />
                        </div>
                    ))}
                    <button onClick={() => { const h = getStorage('gedos-history', []); setStorage('gedos-history', [{ ...formData, id: Date.now(), date: formatDate(new Date()) }, ...h]); setFormData({ wins: '', challenges: '', lessons: '', ideas: '', direction: '', spiritual: '' }); setSaved(true); setTimeout(() => setSaved(false), 3000); }} className="w-full bg-[#CC5500] py-4 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all hover:bg-[#e65f00]">{saved ? '✓ Saved' : 'Complete Weekly Review'}</button>
                </section>
            </main>
        </div>
    );
}