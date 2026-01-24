'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery, useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface AuthContextType {
    isAuthenticated: boolean;
    roomId: string | null;
    history: string[];
    createSession: () => Promise<string | null>;
    joinSession: (code: string) => Promise<boolean>;
    sendText: (text: string) => void;
    clearText: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    roomId: null,
    history: [],
    createSession: async () => null,
    joinSession: async () => false,
    sendText: () => { },
    clearText: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);

    // Convex Hooks
    const createRoomMutation = useMutation(api.rooms.createRoom);
    const addClipMutation = useMutation(api.rooms.addClip);
    const clearHistoryMutation = useMutation(api.rooms.clearHistory);

    // Subscribe to room data if we have a roomId
    // skip: !roomId is automatic if we pass skip or just handle null inside
    // Convex queries are reactive.
    const roomData = useQuery(api.rooms.getRoom, roomId ? { code: roomId } : "skip");

    const history = roomData?.history || [];

    // Persist session (optional: simple localStorage check could go here)

    const createSession = async (): Promise<string | null> => {
        try {
            const code = await createRoomMutation({});

            // Track locally created sessions
            const created = JSON.parse(localStorage.getItem('clipsync_created_sessions') || '[]');
            created.push(code);
            localStorage.setItem('clipsync_created_sessions', JSON.stringify(created));

            setRoomId(code);
            setIsAuthenticated(true);
            return code;
        } catch (e) {
            console.error("Failed to create session", e);
            return null;
        }
    };

    const convex = useConvex();

    const joinSession = async (code: string): Promise<boolean> => {
        try {
            // Prevent joining own session (same device)
            const created = JSON.parse(localStorage.getItem('clipsync_created_sessions') || '[]');
            if (created.includes(code)) {
                alert("You created this session on this device. Please use a different device to join.");
                return false;
            }

            const room = await convex.query(api.rooms.getRoom, { code });

            if (room) {
                setRoomId(code);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (e) {
            console.error("Error joining session:", e);
            return false;
        }
    };

    const sendText = (text: string) => {
        if (roomId) {
            addClipMutation({ code: roomId, text });
        }
    };

    const clearText = () => {
        if (roomId) {
            clearHistoryMutation({ code: roomId });
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, roomId, history, createSession, joinSession, sendText, clearText }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
