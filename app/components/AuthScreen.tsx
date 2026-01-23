'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function AuthScreen() {
    const { createSession, joinSession, roomId } = useAuth();
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F7] dark:bg-black text-black dark:text-white p-6 animate-in fade-in duration-500">
                <div className="mb-12 text-center">
                    <div className="w-20 h-20 bg-[#007AFF] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">ClipSync</h1>
                    <p className="text-gray-500 dark:text-gray-400">Sync clipboard & files securely</p>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <button
                        onClick={() => handleCreate()}
                        disabled={loading}
                        className="w-full py-4 bg-[#007AFF] hover:bg-blue-600 text-white rounded-2xl font-semibold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creating...' : 'Start New Session'}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                    </button>

                    <button
                        onClick={() => setMode('join')}
                        className="w-full py-4 bg-white dark:bg-[#1c1c1e] hover:bg-gray-50 dark:hover:bg-gray-800 text-black dark:text-white rounded-2xl font-semibold text-lg shadow-sm border border-black/5 dark:border-white/5 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Join Session
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F7] dark:bg-black text-black dark:text-white p-6 animate-in slide-in-from-right-10 duration-500">

            <button onClick={() => setMode('initial')} className="absolute top-6 left-6 p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>

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
