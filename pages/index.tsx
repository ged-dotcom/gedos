import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Card } from '../components/Card';
import { Trash2, CheckCircle2, Circle, Plus, Zap, Target } from 'lucide-react';
import { getStorage, setStorage, migrateMissionData, formatDate } from '../lib/storage';

// Unified Design Language Constants
const fieldBase = "w-full bg-zinc-950/40 border border-white/5 rounded-xl px-4 py-3 text-sm transition-all duration-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#CC5500]/20 focus:border-[#CC5500]/40";
const inputBase = `${fieldBase} h-12`;
const textareaBase = `${fieldBase} resize-none leading-relaxed`;

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [mission, setMission] = useState({ primary: '', movingForward: '', ifWorked: '' });
  const [nextAction, setNextAction] = useState('');
  const [compass, setCompass] = useState('');
  const [journal, setJournal] = useState<string>('');
  const [priorities, setPriorities] = useState<any[]>([]);
  const [newPriority, setNewPriority] = useState('');
  const [ideas, setIdeas] = useState<any[]>([]);
  const [newIdea, setNewIdea] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    migrateMissionData();
    setMounted(true);
    setMission(getStorage('gedos-mission-v1.6', { primary: '', movingForward: '', ifWorked: '' }));
    setNextAction(getStorage('gedos-next-action', ''));
    setCompass(getStorage('gedos-compass', ''));
    setPriorities(getStorage('gedos-priorities', []));
    setIdeas(getStorage('gedos-ideas', []));
    const today = new Date().toLocaleDateString();
    const savedJournal = getStorage('gedos-journal', {} as Record<string, string>);
    setJournal(savedJournal[today] || '');
  }, []);

  const updateMission = (updates: any) => {
    const updated = { ...mission, ...updates };
    setMission(updated);
    setStorage('gedos-mission-v1.6', updated);
  };

  const addPriority = () => {
    if (!newPriority.trim()) return;
    const updated = [...priorities, { id: Date.now(), text: newPriority.trim(), completed: false, createdAt: Date.now() }];
    setPriorities(updated);
    setStorage('gedos-priorities', updated);
    setNewPriority('');
  };

  const saveIdea = () => {
    if (!newIdea.trim()) return;
    const item = { id: Date.now(), text: newIdea.trim(), date: formatDate(new Date()) };
    const upd = [item, ...ideas];
    setIdeas(upd);
    setStorage('gedos-ideas', upd);
    setNewIdea('');
  };

  if (!mounted) return null;
  const todayStr = new Date().toLocaleDateString();
  const completedToday = priorities.filter(p => p.completed && p.completedAt && new Date(p.completedAt).toLocaleDateString() === todayStr).length;
  const remaining = priorities.filter(p => !p.completed).length;

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-20 selection:bg-[#CC5500]/30">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 mt-4 pb-32">

        {/* MISSION & NEXT ACTION */}
        <div className="md:col-span-8 order-1 space-y-8">
          <Card title="Primary Mission This Week">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 block mb-3 font-bold">Primary Mission</label>
                <input
                  value={mission.primary}
                  onChange={(e) => updateMission({ primary: e.target.value })}
                  placeholder="The one thing that makes everything else easier..."
                  className={`${inputBase} text-base font-bold text-white border-white/10 bg-zinc-900/40`}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 block mb-3 font-bold">What am I trying to move forward?</label>
                <textarea
                  value={mission.movingForward}
                  onChange={(e) => updateMission({ movingForward: e.target.value })}
                  placeholder="Specific focus areas (e.g., Landing page copy, email automation...)"
                  className={`${textareaBase} h-20 text-zinc-300`}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 block mb-3 font-bold">If this week worked, I would have:</label>
                <textarea
                  value={mission.ifWorked}
                  onChange={(e) => updateMission({ ifWorked: e.target.value })}
                  placeholder="• Deliverable one&#10;• Deliverable two&#10;• Deliverable three"
                  className={`${textareaBase} h-32 text-zinc-400`}
                />
              </div>
            </div>
          </Card>

          <Card title="Next Action" description="The single next move to maintain momentum.">
            <div className="relative group">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CC5500]/40 group-focus-within:text-[#CC5500] transition-colors" size={18} />
              <input
                value={nextAction}
                onChange={(e) => { setNextAction(e.target.value); setStorage('gedos-next-action', e.target.value); }}
                placeholder="The very next step is..."
                className={`${inputBase} pl-12 bg-[#CC5500]/5 border-[#CC5500]/10 text-[#CC5500] placeholder:text-[#CC5500]/30`}
              />
            </div>
          </Card>

          <Card title="Daily Journal (Brain Dump)">
            <textarea
              value={journal}
              onChange={(e) => {
                const today = new Date().toLocaleDateString();
                const all = getStorage('gedos-journal', {} as Record<string, string>);
                all[today] = e.target.value;
                setJournal(e.target.value);
                setStorage('gedos-journal', all);
              }}
              placeholder="Unfiltered thoughts, reflections, or spiritual direction..."
              className={`${textareaBase} h-64 bg-zinc-950/20`}
            />
          </Card>
        </div>

        {/* COMPASS & PRIORITIES */}
        <div className="md:col-span-4 order-2 space-y-8">
          <Card title="Founder Compass" description="Strategic direction for right now.">
            <textarea
              value={compass}
              onChange={(e) => { setCompass(e.target.value); setStorage('gedos-compass', e.target.value); }}
              placeholder="Clarity → Content → Authority"
              className={`${textareaBase} h-24 font-mono text-xs text-[#CC5500] bg-[#CC5500]/5 border-[#CC5500]/10`}
            />
          </Card>

          <Card title="Top Priorities">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Zap size={12} className="text-[#CC5500]" />
                  <span className="text-zinc-400">{completedToday} Done</span>
                </div>
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">• {remaining} Left</span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {priorities.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-[11px] text-zinc-600 italic">Add up to 3. Keep them sharp.</p>
                  </div>
                ) : (
                  priorities.map(p => (
                    <div key={p.id} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                      <button onClick={() => {
                        const upd = priorities.map(x => x.id === p.id ? { ...x, completed: !x.completed, completedAt: !x.completed ? Date.now() : null } : x);
                        setPriorities(upd); setStorage('gedos-priorities', upd);
                      }}>
                        {p.completed ? <CheckCircle2 size={18} className="text-[#CC5500]" /> : <Circle size={18} className="text-zinc-700 hover:text-zinc-500 transition-colors" />}
                      </button>
                      <span className={`text-xs flex-1 transition-all ${p.completed ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{p.text}</span>
                      <button onClick={() => {
                        const upd = priorities.filter(x => x.id !== p.id);
                        setPriorities(upd); setStorage('gedos-priorities', upd);
                      }} className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="relative flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <input
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPriority()}
                  placeholder="New priority..."
                  className={`${inputBase} pr-10`}
                />
                <button
                  onClick={addPriority}
                  className="absolute right-3 top-[calc(50%+8px)] -translate-y-1/2 p-1 text-zinc-500 hover:text-[#CC5500] transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </Card>

          <Card title="Idea Inbox">
            <div className="relative mb-6">
              <input
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveIdea()}
                placeholder="Capture idea..."
                className={inputBase}
              />
              <button onClick={saveIdea} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {ideas.map(i => (
                <div key={i.id} className="group bg-zinc-950/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] text-zinc-600 font-mono tracking-tighter uppercase">{i.date}</span>
                    <button
                      onClick={() => { const upd = ideas.filter(x => x.id !== i.id); setIdeas(upd); setStorage('gedos-ideas', upd); }}
                      className="opacity-0 group-hover:opacity-100 text-zinc-800 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{i.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}