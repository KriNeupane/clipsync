'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import ThemeToggle from './ThemeToggle';
import { useKeyboardShortcut, ShortcutHint } from './KeyboardShortcutContext';

export default function AuthScreen() {
    const { createSession, joinSession, roomId } = useAuth();
    const { toggleHints, showHints } = useKeyboardShortcut('', () => { });
    const [mode, setMode] = useState<'initial' | 'join' | 'create'>('initial');
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);


    // Handle Keyboard Input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (mode !== 'join') return;

            if (e.key >= '0' && e.key <= '9') {
                handleNum(e.key);
            } else if (e.key === 'Backspace') {
                handleBackspace();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode, code]); // Re-bind when code changes to avoid stale closure if not using functional updates, but handleNum uses state? 
    // handleNum uses 'code' state directly: `const newCode = code + num;`
    // So we need to include [code] in dependency or use functional state updates.
    // Let's rely on the existing handlers but make sure dependencies are right.
    // Better: Update handlers to use functional state so we don't need 'code' in deps?
    // handleNum uses `code` var.
    // Let's just include `code` in the dependency array.

    // Shortcuts
    useKeyboardShortcut('n', () => {
        if (mode === 'initial' && !loading) handleCreate();
    }, [mode, loading]);

    useKeyboardShortcut('j', () => {
        if (mode === 'initial') setMode('join');
    }, [mode]);

    useKeyboardShortcut('Escape', () => {
        if (mode === 'join') setMode('initial');
    }, [mode]);

    useKeyboardShortcut('Backspace', () => {
        if (mode === 'join' && code.length === 0) setMode('initial');
    }, [mode, code]);

    const handleCreate = async () => {
        setLoading(true);
        const newRoomId = await createSession();
        setLoading(false);
        if (newRoomId) {
            // Success
        } else {
            setError(true);
        }
    };

    const handleNum = (num: string) => {
        if (code.length < 6) {
            const newCode = code + num;
            setCode(newCode);
            setError(false);

            if (newCode.length === 6) {
                handleSubmit(newCode);
            }
        }
    };

    const handleBackspace = () => {
        setCode(prev => prev.slice(0, -1));
        setError(false);
    };

    const handleSubmit = async (fullCode: string) => {
        setLoading(true);
        const success = await joinSession(fullCode);
        setLoading(false);
        if (!success) {
            setError(true);
            setTimeout(() => {
                setCode('');
                setError(false);
            }, 500);
        }
    };

    if (mode === 'initial') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F7] dark:bg-black text-black dark:text-white p-6 animate-in fade-in duration-500 relative">
                <div className="absolute top-6 right-6 z-50 flex gap-4 items-center">
                    <button
                        onClick={toggleHints}
                        className={`p-3 rounded-full transition-all shadow-sm hover:scale-105 ${showHints ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300'}`}
                        title="Toggle Keyboard Shortcuts (Ctrl + /)"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><path d="M6 8h.001"></path><path d="M10 8h.001"></path><path d="M14 8h.001"></path><path d="M18 8h.001"></path><path d="M6 12h.001"></path><path d="M10 12h.001"></path><path d="M14 12h.001"></path><path d="M18 12h.001"></path><path d="M7 16h10"></path></svg>
                    </button>
                    <ThemeToggle />
                </div>



                <div className="mb-12 text-center">
                    <div className="w-20 h-20 bg-[#007AFF] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Clipboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">No need to send emails to yourself again.</p>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-xs relative">
                    <button
                        onClick={() => handleCreate()}
                        disabled={loading}
                        className="w-full py-4 bg-[#007AFF] hover:bg-blue-600 text-white rounded-2xl font-semibold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 relative"
                    >
                        {loading ? 'Creating...' : 'Start New Session'}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                        <ShortcutHint shortcut="N" className="absolute right-4 bg-white/20 text-white border-white/30" />
                    </button>

                    <button
                        onClick={() => setMode('join')}
                        className="w-full py-4 bg-white dark:bg-[#1c1c1e] hover:bg-gray-50 dark:hover:bg-gray-800 text-black dark:text-white rounded-2xl font-semibold text-lg shadow-sm border border-black/5 dark:border-white/5 active:scale-95 transition-all flex items-center justify-center gap-2 relative"
                    >
                        Join Session
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
                        <ShortcutHint shortcut="J" className="absolute right-4" />
                    </button>


                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F7] dark:bg-black text-black dark:text-white p-6 animate-in slide-in-from-right-10 duration-500">

            <div className="absolute top-6 right-6 z-50 flex gap-3">
                <button
                    onClick={() => setMode('initial')}
                    className="p-3 rounded-full bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:scale-105 transition-transform shadow-sm relative group"
                    title="Back (Esc)"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    <ShortcutHint shortcut="Esc" className="absolute top-full right-0 mt-3" />
                </button>

                <button
                    onClick={toggleHints}
                    className={`p-3 rounded-full transition-all shadow-sm hover:scale-105 ${showHints ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300'}`}
                    title="Toggle Keyboard Shortcuts (Ctrl + /)"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><path d="M6 8h.001"></path><path d="M10 8h.001"></path><path d="M14 8h.001"></path><path d="M18 8h.001"></path><path d="M6 12h.001"></path><path d="M10 12h.001"></path><path d="M14 12h.001"></path><path d="M18 12h.001"></path><path d="M7 16h10"></path></svg>
                </button>
                <ThemeToggle />
            </div>



            <div className="mb-10 text-center">
                <h1 className="text-2xl font-bold mb-2">Enter Session Code</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Ask the host for the 6-digit code</p>
            </div>

            {/* Code Dots */}
            <div className={`flex gap-4 mb-12 ${error ? 'animate-shake' : ''}`}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${i < code.length
                            ? 'bg-[#007AFF] scale-110'
                            : 'bg-gray-300 dark:bg-gray-700'
                            } ${error ? 'bg-red-500' : ''}`}
                    />
                ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-[300px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNum(num.toString())}
                        className="w-16 h-16 rounded-full bg-white dark:bg-[#1c1c1e] text-2xl font-medium shadow-sm active:bg-gray-100 dark:active:bg-gray-700 transition-colors mx-auto flex items-center justify-center"
                    >
                        {num}
                    </button>
                ))}
                <div /> {/* Empty slot */}
                <button
                    onClick={() => handleNum('0')}
                    className="w-16 h-16 rounded-full bg-white dark:bg-[#1c1c1e] text-2xl font-medium shadow-sm active:bg-gray-100 dark:active:bg-gray-700 transition-colors mx-auto flex items-center justify-center"
                >
                    0
                </button>
                <button
                    onClick={handleBackspace}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-gray-500 active:text-gray-900 transition-colors mx-auto"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
                </button>
            </div>
        </div>
    );
}
