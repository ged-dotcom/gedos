import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const Pomodoro = () => {
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

    const toggle = () => setIsActive(!isActive);
    const reset = () => { setIsActive(false); setSeconds(25 * 60); };

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="flex items-center gap-4 bg-zinc-900/80 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
            <div className={`text-sm font-mono font-bold tracking-widest ${isActive ? 'text-[#CC5500] animate-pulse' : 'text-zinc-400'}`}>
                {formatTime(seconds)}
            </div>
            <div className="flex gap-2 border-l border-zinc-800 pl-3">
                <button onClick={toggle} className="hover:text-[#CC5500] transition-colors">
                    {isActive ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button onClick={reset} className="hover:text-white transition-colors text-zinc-600">
                    <RotateCcw size={14} />
                </button>
            </div>
        </div>
    );
};
