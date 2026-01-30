'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

import ThemeToggle from './ThemeToggle';
import AuthScreen from './AuthScreen';
import ConnectionInfo from './ConnectionInfo';
import ClipboardManager from './ClipboardManager';
import FileManager from './FileManager';



import AnimatedBackground from './AnimatedBackground';
import InstallPrompt from './InstallPrompt';
import { KeyboardShortcutProvider, useKeyboardShortcut, ShortcutHint } from './KeyboardShortcutContext';

export default function Home() {
    return (
        <KeyboardShortcutProvider>
            <HomeContent />
        </KeyboardShortcutProvider>
    );
}

function HomeContent() {
    const { isAuthenticated, terminateSession, isHost, clearText } = useAuth();
    const { toggleHints, showHints } = useKeyboardShortcut('', () => { }); // Just to get context values


    const handleExit = () => {
        if (isHost) {
            if (confirm("End session for everyone?")) {
                terminateSession();
            }
        } else {
            if (confirm("Leave session?")) {
                window.location.reload();
            }
        }
    };

    useKeyboardShortcut('Escape', () => {
        if (isAuthenticated) handleExit();
    });

    if (!isAuthenticated) {
        return <AuthScreen />;
    }


    return (
        <main className="flex min-h-screen flex-col items-center p-6 relative overflow-hidden bg-white dark:bg-black transition-colors duration-500 pt-20">
            <InstallPrompt />
            <AnimatedBackground />

            {/* Header / Controls */}
            <div className="absolute top-4 right-4 flex gap-3 z-50">
                {/* Disconnect Button where user can "Logout" of the session */}
                <button
                    onClick={handleExit}
                    className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:scale-105 transition-transform shadow-sm relative group"
                    title={isHost ? "End Session" : "Leave Session"}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
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




            <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-8 font-mono text-sm">

                {/* Connection Box (Host Info) */}
                <ConnectionInfo />

                <div className="flex flex-col lg:flex-row gap-8 w-full justify-center items-center lg:items-start">
                    <ClipboardManager />
                    <FileManager />
                </div>

            </div>


        </main >
    );
}
