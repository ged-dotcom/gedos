import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Card } from '../components/Card';
import { Copy, BrainCircuit, Loader2 } from 'lucide-react';
import { getStorage, Note, formatDate } from '../lib/storage';

// Helper function to handle text truncation within this file
const truncate = (str: string, length: number = 100) => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
};

export default function BrainExport() {
    const [mounted, setMounted] = useState(false);
    const [fullDump, setFullDump] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const generateDump = async () => {
            // Await all cloud/local data fetches
            const mission = await getStorage('gedos-mission-v1.6', { primary: '', movingForward: '', ifWorked: '' });
            const nextAction = await getStorage('gedos-next-action', '');
            const compass = await getStorage('gedos-compass', '');
            const priorities = await getStorage('gedos-priorities', []);
            const ideas = await getStorage('gedos-ideas', []);
            const journals = await getStorage('gedos-journal', {} as Record<string, string>);
            const history = await getStorage('gedos-history', []);
            const allNotes = await getStorage('gedos_notes_v1', []);

            // Notes Logic - Now works because allNotes is no longer a Promise
            const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
            const weekNotes = allNotes.filter((n: Note) => new Date(n.createdAt).getTime() > weekStart);

            const projCounts = weekNotes.reduce((acc: any, n: Note) => {
                acc[n.project] = (acc[n.project] || 0) + 1;
                return acc;
            }, {});

            const typeCounts = weekNotes.reduce((acc: any, n: Note) => {
                acc[n.type] = (acc[n.type] || 0) + 1;
                return acc;
            }, {});

            const noteList = weekNotes.map((n: Note) =>
                `[${formatDate(n.createdAt)}] (${n.project}/${n.type}) ${truncate(n.text, 60)}`
            ).join('\n');

            // Journal Logic
            const sortedJournalDates = Object.keys(journals).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
            const latestJournal = sortedJournalDates.length > 0 ? journals[sortedJournalDates[0]] : "(none)";

            // Momentum Logic
            const todayStr = new Date().toLocaleDateString();
            const completedToday = priorities.filter((p: any) =>
                p.completed && p.completedAt && new Date(p.completedAt).toLocaleDateString() === todayStr
            ).length;
            const remaining = priorities.filter((p: any) => !p.completed).length;

            // Strict AI Format
            const output = `GedOS Brain Dump — ${formatDate(new Date())}

PRIMARY MISSION:
${mission.primary || "(none)"}

MOVE FORWARD:
${mission.movingForward || "(none)"}

IF THIS WEEK WORKED, I WOULD HAVE:
${mission.ifWorked || "(none)"}

NEXT ACTION:
${nextAction || "(none)"}

FOUNDER COMPASS:
${compass || "(none)"}

TOP PRIORITIES:
${priorities.map((p: any) => `${p.completed ? '[x]' : '[ ]'} ${p.text}`).join('\n') || "(none)"}

COMPLETIONS TODAY:
${completedToday} completed today
${remaining} remaining

NOTES (Last 7 Days):
${noteList || "(none)"}

NOTES SUMMARY:
${weekNotes.length} total • by project: ${Object.entries(projCounts).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'} • by type: ${Object.entries(typeCounts).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}

IDEA INBOX:
${ideas.map((i: any) => `[${i.date}] ${i.text}`).join('\n') || "(none)"}

DAILY JOURNAL (Latest):
${latestJournal}

WEEKLY REVIEWS (Most Recent First):
${history.slice(0, 5).map((h: any) =>
                `[${h.date}]
Wins: ${truncate(h.wins)}
Challenges: ${truncate(h.challenges)}
Lessons: ${truncate(h.lessons)}
Ideas: ${truncate(h.ideas)}
Direction: ${truncate(h.direction)}
Spiritual: ${truncate(h.spiritual)}`
            ).join('\n\n') || "(none)"}`;

            setFullDump(output);
            setMounted(true);
        };

        generateDump();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullDump);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!mounted) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="text-[#CC5500] animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 selection:bg-[#CC5500]/30">
            <Navbar />
            <main className="max-w-4xl mx-auto p-8 space-y-12">
                <div className="flex justify-between items-end animate-in fade-in slide-in-from-bottom-4 transition-all duration-700">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tighter italic">
                            <BrainCircuit className="text-[#CC5500]" size={28} /> AI Export
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">
                            Structured data for LLM context
                        </p>
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="bg-[#CC5500] text-white px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all hover:bg-[#e65f00] hover:scale-105 active:scale-95 shadow-xl shadow-[#CC5500]/20"
                    >
                        {copied ? 'Copied to Clipboard' : 'Copy for AI Context'}
                    </button>
                </div>

                <Card>
                    <div className="relative group">
                        <pre className="text-[11px] font-mono text-zinc-500 whitespace-pre-wrap leading-relaxed h-[65vh] overflow-y-auto custom-scrollbar p-4 bg-zinc-950/20 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                            {fullDump}
                        </pre>
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/20" />
                    </div>
                </Card>
            </main>
        </div>
    );
}