export const PROJECTS = ["Inbox", "Personal Brand", "The916", "916 Collective", "Operations"] as const;
export const NOTE_TYPES = ["Idea", "Task", "Reflection", "Prayer", "Scripture", "Insight", "Other"] as const;

export type ProjectType = typeof PROJECTS[number];
export type NoteCategory = typeof NOTE_TYPES[number];

export interface Note {
    id: string;
    text: string;
    project: ProjectType;
    type: NoteCategory;
    createdAt: string;
    updatedAt: string;
}

export const formatDate = (dateInput: string | number | Date) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
};

export const truncate = (str: string, len: number = 300) => {
    if (!str) return "(none)";
    return str.length > len ? str.substring(0, len) + "..." : str;
};

export const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`; // Safe fallback
};

export const getStorage = <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        return fallback;
    }
};

export const setStorage = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

export const migrateMissionData = () => {
    if (typeof window === 'undefined') return;
    const oldMission = localStorage.getItem('gedos-mission');
    const newMission = localStorage.getItem('gedos-mission-v1.6');
    if (oldMission && !newMission) {
        try {
            const parsed = JSON.parse(oldMission);
            const migrated = {
                primary: parsed.title || '',
                movingForward: '',
                ifWorked: parsed.success || ''
            };
            localStorage.setItem('gedos-mission-v1.6', JSON.stringify(migrated));
        } catch (e) { }
    }
};