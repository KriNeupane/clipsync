'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcutContextType {
    showHints: boolean;
    toggleHints: () => void;
    registerShortcut: (key: string, callback: () => void) => void;
    unregisterShortcut: (key: string) => void;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType | undefined>(undefined);

export function KeyboardShortcutProvider({ children }: { children: React.ReactNode }) {
    const [showHints, setShowHints] = useState(false);
    // We could store registered shortcuts here if we wanted a central registry, 
    // but for now we'll just handle the toggle and let components handle their own keydown logic
    // OR we can centralize the keydown logic to prevent conflicts. 
    // Let's stick to centralized Toggle state, but decentralized key listeners for simplicity in v1,
    // actually central registry is cleaner to avoid duplicate listeners.

    // Let's use a decentralized approach for listeners but centralized for state to keep it simple context-wise.
    // Components will use `useKeyboardShortcut` hook.

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl + /
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                toggleHints();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleHints = useCallback(() => {
        setShowHints(prev => !prev);
    }, []);

    const registerShortcut = useCallback((key: string, callback: () => void) => {
        // This is a placeholder if we wanted central registry
    }, []);

    const unregisterShortcut = useCallback((key: string) => {
        // Placeholder
    }, []);

    return (
        <KeyboardShortcutContext.Provider value={{ showHints, toggleHints, registerShortcut, unregisterShortcut }}>
            {children}
        </KeyboardShortcutContext.Provider>
    );
}

export function useKeyboardShortcut(key: string, callback: (e?: KeyboardEvent) => void, deps: any[] = []) {
    const context = useContext(KeyboardShortcutContext);
    if (!context) {
        throw new Error('useKeyboardShortcut must be used within a KeyboardShortcutProvider');
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if focus is on an input field (unless it's the Escape key, which often needs to work)
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            if (isInput && e.key !== 'Escape') {
                return;
            }

            // Handle simple keys and modifiers
            const keyLower = key.toLowerCase();
            const eventKeyLower = e.key.toLowerCase();

            // Basic matching (can be expanded for modifiers like 'ctrl+c')
            if (eventKeyLower === keyLower && !e.repeat) {
                // Should we prevent default? Maybe for some.
                // e.preventDefault(); // Don't enforce this generally
                callback(e);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [key, callback, ...deps]);

    return { showHints: context.showHints, toggleHints: context.toggleHints };
}

export function ShortcutHint({ shortcut, className = "" }: { shortcut: string, className?: string }) {
    const { showHints } = useContext(KeyboardShortcutContext)!;

    return (
        <AnimatePresence>
            {showHints && (
                <motion.span
                    initial={{ opacity: 0, scale: 0.5, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className={`absolute z-50 flex items-center justify-center min-w-[20px] h-[20px] px-1
                        bg-white dark:bg-[#3A3A3C] 
                        text-gray-500 dark:text-gray-300 
                        text-[11px] font-bold font-mono tracking-tight
                        rounded-[6px] 
                        border-b-2 border-l border-r border-t border-gray-200 dark:border-black/50
                        shadow-sm
                        pointer-events-none select-none
                        ${className}`}
                >
                    {shortcut}
                </motion.span>
            )}
        </AnimatePresence>
    );
}
