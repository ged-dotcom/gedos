import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Card } from '../components/Card';
import { Trash2, Edit3, Download, Upload, Search, Check } from 'lucide-react';
import { getStorage, setStorage, PROJECTS, NOTE_TYPES, Note, ProjectType, NoteCategory, generateId, formatDate } from '../lib/storage';

export default function NotesPage() {
    const [mounted, setMounted] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [text, setText] = useState('');
    const [selectedProject, setSelectedProject] = useState<ProjectType>("Inbox");
    const [selectedType, setSelectedType] = useState<NoteCategory>("Other");
    const [toast, setToast] = useState('');
    const [search, setSearch] = useState('');
    const [filterProject, setFilterProject] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [showThisWeek, setShowThisWeek] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        setMounted(true);
        setNotes(getStorage('gedos_notes_v1', []));
        const prefs = getStorage('gedos_notes_preferences', { project: "Inbox", type: "Other" }) as { project: ProjectType, type: NoteCategory };
        setSelectedProject(prefs.project);
        setSelectedType(prefs.type);
    }, []);

    const saveNote = (clearAfter = true) => {
        if (!text.trim()) return;
        const now = new Date().toISOString();
        const newNote: Note = {
            id: generateId(),
            text,
            project: selectedProject,
            type: selectedType,
            createdAt: now,
            updatedAt: now
        };
        const updated = [newNote, ...notes];
        setNotes(updated);
        setStorage('gedos_notes_v1', updated);
        setStorage('gedos_notes_preferences', { project: selectedProject, type: selectedType });
        if (clearAfter) setText('');
        setToast('Saved');
        setTimeout(() => setToast(''), 2000);
    };

    const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                const merged = [...notes];
                imported.notes.forEach((newNote: any) => {
                    const index = merged.findIndex(n => n.id === newNote.id);
                    const sanitized: Note = {
                        id: newNote.id || generateId(),
                        text: newNote.text || '',
                        project: newNote.project || 'Inbox',
                        type: newNote.type || 'Other',
                        createdAt: newNote.createdAt || new Date().toISOString(),
                        updatedAt: newNote.updatedAt || newNote.createdAt || new Date().toISOString()
                    };
                    if (index === -1) merged.push(sanitized);
                    else if (new Date(sanitized.updatedAt) > new Date(merged[index].updatedAt)) {
                        merged[index] = sanitized;
                    }
                });
                setNotes(merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                setStorage('gedos_notes_v1', merged);
                setToast('Imported');
            } catch (err) { setToast('Error'); }
        };
        reader.readAsText(file);
    };

    const filteredNotes = notes.filter(n => {
        const matchesSearch = n.text.toLowerCase().includes(search.toLowerCase());
        const matchesProject = filterProject === 'All' || n.project === filterProject;
        const matchesType = filterType === 'All' || n.type === filterType;
        const isThisWeek = !showThisWeek || (Date.now() - new Date(n.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000);
        return matchesSearch && matchesProject && matchesType && isThisWeek;
    });

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-black text-zinc-100 pb-32 selection:bg-[#CC5500]/30">
            <Navbar />
            {toast && <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#CC5500] text-white px-4 py-1 rounded-full text-[10px] font-bold z-50 animate-in fade-in zoom-in">{toast}</div>}
            <main className="max-w-4xl mx-auto p-6 space-y-8">
                <Card title="Quick Note">
                    <textarea
                        className="w-full bg-transparent border-none focus:ring-0 text-lg text-zinc-200 placeholder:text-zinc-600 h-32 resize-none"
                        placeholder="Dump anything — idea, task, insight, prayer..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveNote(); }}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-white/5">
                        <div className="flex gap-4">
                            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value as ProjectType)} className="bg-zinc-900 border-none rounded text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                                {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as NoteCategory)} className="bg-zinc-900 border-none rounded text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                                {NOTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => saveNote(false)} className="text-[10px] uppercase font-bold tracking-widest px-4 py-2 text-zinc-500 hover:text-white transition-colors">Save + New</button>
                            <button onClick={() => saveNote()} className="bg-[#CC5500] text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">Save Note</button>
                        </div>
                    </div>
                </Card>

                {/* Filters */}
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                            <input placeholder="Search notes..." className="w-full bg-zinc-900 border border-white/5 rounded-full pl-10 pr-4 py-2 text-xs outline-none focus:border-[#CC5500]/50" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <button onClick={() => setShowThisWeek(!showThisWeek)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border transition-all ${showThisWeek ? 'bg-[#CC5500] border-[#CC5500]' : 'border-zinc-800 text-zinc-500'}`}>This Week</button>
                    </div>

                    {/* Mobile Filters */}
                    <div className="md:hidden flex gap-2">
                        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="bg-zinc-900 border border-white/5 rounded-lg text-[10px] px-3 py-2 uppercase font-bold tracking-widest text-zinc-400 w-1/2">
                            <option value="All">All Projects</option>
                            {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-zinc-900 border border-white/5 rounded-lg text-[10px] px-3 py-2 uppercase font-bold tracking-widest text-zinc-400 w-1/2">
                            <option value="All">All Types</option>
                            {NOTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Desktop Filters */}
                    <div className="hidden md:flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[9px] uppercase font-bold text-zinc-600 w-12 tracking-widest">Project</span>
                            <button onClick={() => setFilterProject('All')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all border ${filterProject === 'All' ? 'border-[#CC5500] text-white bg-[#CC5500]/10' : 'border-white/5 text-zinc-500'}`}>All</button>
                            {PROJECTS.map(p => <button key={p} onClick={() => setFilterProject(p)} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all border ${filterProject === p ? 'border-[#CC5500] text-white bg-[#CC5500]/10' : 'border-white/5 text-zinc-500'}`}>{p}</button>)}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[9px] uppercase font-bold text-zinc-600 w-12 tracking-widest">Type</span>
                            <button onClick={() => setFilterType('All')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all border ${filterType === 'All' ? 'border-[#CC5500] text-white bg-[#CC5500]/10' : 'border-white/5 text-zinc-500'}`}>All</button>
                            {NOTE_TYPES.map(t => <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all border ${filterType === t ? 'border-[#CC5500] text-white bg-[#CC5500]/10' : 'border-white/5 text-zinc-500'}`}>{t}</button>)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredNotes.map(note => (
                        <div key={note.id} className="group bg-zinc-900/40 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
                            <div className="flex justify-between items-start mb-3 text-[8px] font-bold uppercase tracking-widest">
                                <div className="flex gap-2">
                                    <span className="bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">{note.project}</span>
                                    <span className="bg-[#CC5500]/10 text-[#CC5500] px-2 py-0.5 rounded">{note.type}</span>
                                    <span className="text-zinc-700 font-mono tracking-tighter pt-0.5 ml-2">{formatDate(note.createdAt)}</span>
                                </div>
                                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingId(note.id); setEditText(note.text); }} className="text-zinc-600 hover:text-white transition-colors"><Edit3 size={14} /></button>
                                    <button onClick={() => { if (confirm('Delete note?')) { const u = notes.filter(n => n.id !== note.id); setNotes(u); setStorage('gedos_notes_v1', u); } }} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            {editingId === note.id ? (
                                <div className="space-y-3">
                                    <textarea className="w-full bg-zinc-950 border border-[#CC5500]/30 rounded-lg p-3 text-sm text-zinc-300 h-24 outline-none" value={editText} onChange={(e) => setEditText(e.target.value)} />
                                    <button onClick={() => { const u = notes.map(n => n.id === note.id ? { ...n, text: editText, updatedAt: new Date().toISOString() } : n); setNotes(u); setStorage('gedos_notes_v1', u); setEditingId(null); }} className="bg-white text-black px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase">SaveChanges</button>
                                </div>
                            ) : (<p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{note.text}</p>)}
                        </div>
                    ))}
                </div>

                <section className="pt-12 border-t border-white/5 flex justify-between">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Data Safety</h3>
                    <div className="flex gap-4">
                        <label className="cursor-pointer flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-bold uppercase transition-colors"><Upload size={14} /> Import <input type="file" className="hidden" accept=".json" onChange={importJSON} /></label>
                        <button onClick={() => { const data = { version: "1.0", notes }; const blob = new Blob([JSON.stringify(data)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `gedos-notes-v1.7.json`; a.click(); }} className="flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-bold uppercase transition-colors"><Download size={14} /> Export</button>
                    </div>
                </section>
            </main>
        </div>
    );
}