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
    terminateSession: () => void;
    isHost: boolean;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    roomId: null,
    history: [],
    createSession: async () => null,
    joinSession: async () => false,
    sendText: () => { },
    clearText: () => { },
    terminateSession: () => { },
    isHost: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);

    // Convex Hooks
    const createRoomMutation = useMutation(api.rooms.createRoom);
    const addClipMutation = useMutation(api.rooms.addClip);
    const clearHistoryMutation = useMutation(api.rooms.clearHistory);
    const closeRoomMutation = useMutation(api.rooms.closeRoom);

    // Subscribe to room data if we have a roomId
    const roomData = useQuery(api.rooms.getRoom, roomId ? { code: roomId } : "skip");

    // Reactive Session Closure
    useEffect(() => {
        if (roomData?.status === 'closed' && isAuthenticated) {
            alert('Session has been closed by the host.');
            setRoomId(null);
            setIsAuthenticated(false);
            setIsHost(false);
        }
    }, [roomData?.status, isAuthenticated]);

    const history = roomData?.history || [];

    const createSession = async (): Promise<string | null> => {
        try {
            const code = await createRoomMutation({});

            // Track locally created sessions (Host Logic)
            const created = JSON.parse(localStorage.getItem('clipsync_created_sessions') || '[]');
            created.push(code);
            localStorage.setItem('clipsync_created_sessions', JSON.stringify(created));

            setRoomId(code);
            setIsAuthenticated(true);
            setIsHost(true);

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

            if (room && room.status !== 'closed') {
                setRoomId(code);
                setIsAuthenticated(true);
                setIsHost(false);
                return true;
            }
            return false;
        } catch (e) {
            console.error("Error joining session:", e);
            return false;
        }
    };

    const sendText = (text: string) => {
        if (roomId) addClipMutation({ code: roomId, text });
    };

    const clearText = () => {
        if (roomId) clearHistoryMutation({ code: roomId });
    };

    const terminateSession = async () => {
        if (roomId) {
            await closeRoomMutation({ code: roomId });
            setRoomId(null);
            setIsAuthenticated(false);
            setIsHost(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, roomId, history, createSession, joinSession, sendText, clearText, terminateSession, isHost }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
