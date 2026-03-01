import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Navbar from '../components/Navbar';
import { Card } from '../components/Card';
import { Mail, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Initialize the browser-side Supabase client
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Use signInWithOtp for the Magic Link flow
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // This must match the redirect handled in callback.tsx
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Success! Check your email for the magic link.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Navbar />
            <main className="max-w-md mx-auto pt-32 px-6">
                <Card title="Founder Access" description="Passwordless Cloud Sync.">
                    <form onSubmit={handleLogin} className="space-y-6 mt-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#CC5500] transition-colors" size={18} />
                            <input
                                type="email"
                                placeholder="founder@the916.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-zinc-950/40 border border-white/5 rounded-xl px-12 py-3 text-sm focus:ring-2 focus:ring-[#CC5500]/20 focus:border-[#CC5500]/40 outline-none transition-all placeholder:text-zinc-700"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#CC5500] hover:bg-[#e65f00] text-white py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#CC5500]/10"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Send Magic Link'}
                        </button>

                        {message && (
                            <p className="text-center text-[10px] uppercase font-bold tracking-widest text-[#CC5500] animate-in fade-in slide-in-from-bottom-1">
                                {message}
                            </p>
                        )}
                    </form>
                </Card>
            </main>
        </div>
    );
}