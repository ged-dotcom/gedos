import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, LayoutDashboard, StickyNote, ClipboardCheck, History, Share } from 'lucide-react';

export default function Navbar() {
    const router = useRouter();
    const [seconds, setSeconds] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: any = null;
        if (isActive && seconds > 0) {
            interval = setInterval(() => setSeconds((s) => s - 1), 1000);
        } else if (seconds === 0) {
            clearInterval(interval);
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const navLinks = [
        { name: 'Home', href: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Notes', href: '/notes', icon: <StickyNote size={18} /> },
        { name: 'Review', href: '/review', icon: <ClipboardCheck size={18} /> },
        { name: 'History', href: '/history', icon: <History size={18} /> },
        { name: 'AI', href: '/export', icon: <Share size={18} /> },
    ];

    return (
        <>
            <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex justify-between items-center py-4 px-6 max-w-7xl mx-auto">
                    <div className="text-xl font-bold tracking-tighter text-[#CC5500]">GedOS</div>
                    <div className="hidden md:flex gap-6">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={`text-[10px] uppercase tracking-widest transition-colors ${router.pathname === link.href ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 px-3 py-1.5 rounded-full">
                        <div className={`text-xs font-mono font-bold tracking-widest ${isActive ? 'text-[#CC5500] animate-pulse' : 'text-zinc-400'}`}>{formatTime(seconds)}</div>
                        <div className="flex gap-2 border-l border-white/10 pl-2">
                            <button onClick={() => setIsActive(!isActive)} className="text-zinc-500">{isActive ? <Pause size={12} /> : <Play size={12} />}</button>
                            <button onClick={() => { setIsActive(false); setSeconds(25 * 60); }} className="text-zinc-500"><RotateCcw size={12} /></button>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/5 px-6 py-3 flex justify-between items-center z-50">
                {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={`flex flex-col items-center gap-1 ${router.pathname === link.href ? 'text-[#CC5500]' : 'text-zinc-600'}`}>
                        {link.icon}<span className="text-[9px] uppercase tracking-tighter font-bold">{link.name}</span>
                    </Link>
                ))}
            </div>
        </>
    );
}