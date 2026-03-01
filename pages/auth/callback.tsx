import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createBrowserClient } from '@supabase/ssr';

export default function AuthCallback() {
    const router = useRouter();

    // Use the new SSR-compatible client
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const handleAuth = async () => {
            // Get the 'code' from the URL sent in the Magic Link
            const { code } = router.query;

            if (code) {
                // Exchange the code for a real browser session
                const { error } = await supabase.auth.exchangeCodeForSession(String(code));

                if (!error) {
                    router.push('/'); // Success: Send to Dashboard
                } else {
                    console.error('Auth error:', error.message);
                    router.push('/login'); // Fail: Send back to Login
                }
            }
        };

        if (router.isReady) {
            handleAuth();
        }
    }, [router.isReady, router.query, supabase]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-[#CC5500] border-t-transparent rounded-full animate-spin" />
                <div className="text-[#CC5500] animate-pulse font-mono text-[10px] uppercase tracking-[0.3em]">
                    Establishing Cloud Session...
                </div>
            </div>
        </div>
    );
}