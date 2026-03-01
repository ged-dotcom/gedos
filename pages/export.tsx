import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Card } from '../components/Card';
import { Copy, BrainCircuit } from 'lucide-react';
import { getStorage, Note, formatDate, truncate } from '../lib/storage';

export default function BrainExport() {
    const [fullDump, setFullDump] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const mission = getStorage('gedos-mission-v1.6', { primary: '', movingForward: '', ifWorked: '' });
        const nextAction = getStorage('gedos-next-action', '');
        const compass = getStorage('gedos-compass', '');
        const priorities = getStorage('gedos-priorities', []);
        const ideas = getStorage('gedos-ideas', []);
        const journals = getStorage('gedos-journal', {} as Record<string, string>);
        const history = getStorage('gedos-history', []);
        const allNotes = getStorage('gedos_notes_v1', []);

        // Notes Logic
        const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const weekNotes = allNotes.filter((n: Note) => new Date(n.createdAt).getTime() > weekStart);
        const projCounts = weekNotes.reduce((acc: any, n: Note) => { acc[n.project] = (acc[n.project] || 0) + 1; return acc; }, {});
        const typeCounts = weekNotes.reduce((acc: any, n: Note) => { acc[n.type] = (acc[n.type] || 0) + 1; return acc; }, {});
        const noteList = weekNotes.map((n: Note) => `[${formatDate(n.createdAt)}] (${n.project}/${n.type}) ${truncate(n.text)}`).join('\n');

        // Journal Logic - Deterministic latest
        const sortedJournalDates = Object.keys(journals).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const latestJournal = sortedJournalDates.length > 0 ? journals[sortedJournalDates[0]] : "(none)";

        // Momentum Logic
        const todayStr = new Date().toLocaleDateString();
        const completedToday = priorities.filter((p: any) => p.completed && p.completedAt && new Date(p.completedAt).toLocaleDateString() === todayStr).length;
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
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullDump);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Navbar />
            <main className="max-w-4xl mx-auto p-8 space-y-12">
                <div className="flex justify-between items-end animate-in fade-in slide-in-from-bottom-4 transition-all">
                    <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tighter"><BrainCircuit className="text-[#CC5500]" /> AI Export</h1>
                    <button onClick={copyToClipboard} className="bg-[#CC5500] text-white px-8 py-3 rounded-full font-bold text-xs uppercase transition-all hover:bg-[#e65f00] shadow-xl shadow-[#CC5500]/20">
                        {copied ? 'Copied.' : 'Copy for AI'}
                    </button>
                </div>
                <Card><pre className="text-[11px] font-mono text-zinc-500 whitespace-pre-wrap leading-relaxed h-[65vh] overflow-y-auto custom-scrollbar p-2">{fullDump}</pre></Card>
            </main>
        </div>
    );
}