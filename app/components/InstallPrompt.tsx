'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return;

        // Detect iOS (iPhone, iPad, iPod) OR iPad/iPhone requesting desktop site (Macintosh + Touch)
        const isIOS =
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.userAgent.includes("Mac") && "ontouchend" in document);

        // Detect if already in standalone mode (installed)
        const isStandalone = (window.navigator as any).standalone;

        // Show prompt if on iOS and NOT installed
        if (isIOS && !isStandalone) {
            // Delay slightly to not annoy immediately
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!showPrompt) return null;

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-6 left-4 right-4 z-[100] bg-white dark:bg-[#1c1c1e] p-4 rounded-2xl shadow-2xl border border-black/10 dark:border-white/10"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold text-xl">
                                C
                            </div>
                            <div>
                                <h3 className="font-semibold text-black dark:text-white">Install ClipSync</h3>
                                <p className="text-sm text-gray-500">Get the full app experience</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPrompt(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <div className="space-y-3 pt-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold">1</span>
                            <span>Tap the <span className="font-bold">Share</span> button below</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold">2</span>
                            <span>Select <span className="font-bold">Add to Home Screen</span></span>
                        </div>
                    </div>

                    {/* Arrow pointing down */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#1c1c1e] border-b border-r border-black/10 dark:border-white/10 rotate-45"></div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
