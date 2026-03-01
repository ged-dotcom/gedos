import { createBrowserClient } from '@supabase/ssr'

// Initialize Supabase Client
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const PROJECTS = ["Inbox", "Personal Brand", "The916", "916 Collective", "Operations"] as const;
export const NOTE_TYPES = ["Idea", "Task", "Reflection", "Prayer", "Scripture", "Insight", "Other"] as const;

export type ProjectType = typeof PROJECTS[number];
export type NoteCategory = typeof NOTE_TYPES[number];

export interface Note {
    id: string;
    user_id?: string;
    text: string;
    project: ProjectType;
    type: NoteCategory;
    createdAt: string;
    updatedAt: string;
}

// Cloud-Enabled Storage Helper
export const getStorage = async (key: string, fallback: any) => {
    if (typeof window === 'undefined') return fallback;

    // 1. Try to get user session
    const { data: { session } } = await supabase.auth.getSession();

    if (session && key === 'gedos_notes_v1') {
        // Pull from Cloud if it's notes
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('createdAt', { ascending: false });

        if (!error && data) return data;
    }

    // 2. Fallback to LocalStorage
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
};

export const setStorage = async (key: string, value: any) => {
    if (typeof window === 'undefined') return;

    // 1. Always save to LocalStorage for speed (Local-First)
    localStorage.setItem(key, JSON.stringify(value));

    // 2. If logged in, sync to Cloud
    const { data: { session } } = await supabase.auth.getSession();

    if (session && key === 'gedos_notes_v1') {
        // Sync single note or bulk (Optimized for Notes)
        // Note: In a production app, we'd sync only the delta, 
        // but for Phase 1, we ensure the cloud matches your local state.
        const notesToSync = Array.isArray(value) ? value : [value];

        for (const note of notesToSync) {
            await supabase.from('notes').upsert({
                id: note.id,
                user_id: session.user.id,
                text: note.text,
                project: note.project,
                type: note.type,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            });
        }
    }
};

export const formatDate = (dateInput: string | number | Date) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-GB');
};

export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};