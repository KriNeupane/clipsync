'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface AuthContextType {
    isAuthenticated: boolean;
    roomId: string | null;
    history: string[];
    createSession: () => Promise<string | null>;
    joinSession: (code: string) => Promise<boolean>;
    sendText: (text: string) => void;
    clearText: () => void;
    socket: Socket | null;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    roomId: null,
    history: [],
    createSession: async () => null,
    joinSession: async () => false,
    sendText: () => { },
    clearText: () => { },
    socket: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        // Connect socket
        const s = io();
        setSocket(s);

        s.on('history-update', (newHistory: string[]) => {
            setHistory(newHistory);
        });

        return () => {
            s.disconnect();
        };
    }, []);

    const createSession = (): Promise<string | null> => {
        return new Promise((resolve) => {
            if (!socket) return resolve(null);

            socket.emit('create-session', (response: { success: boolean, roomId: string }) => {
                if (response.success) {
                    setRoomId(response.roomId);
                    setIsAuthenticated(true);
                    resolve(response.roomId);
                } else {
                    resolve(null);
                }
            });
        });
    };

    const joinSession = (code: string): Promise<boolean> => {
        return new Promise((resolve) => {
            if (!socket) return resolve(false);

            socket.emit('join-session', code, (response: { success: boolean }) => {
                if (response.success) {
                    setRoomId(code);
                    setIsAuthenticated(true);
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    };

    const sendText = (text: string) => {
        if (socket && roomId) {
            socket.emit('send-text', text, roomId);
        }
    };

    const clearText = () => {
        if (socket && roomId) {
            socket.emit('clear-text', roomId);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, roomId, history, createSession, joinSession, sendText, clearText, socket }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
