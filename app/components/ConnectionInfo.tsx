'use client';

import { useAuth } from './AuthProvider';

export default function ConnectionInfo() {
    const { roomId } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center mb-10 w-full max-w-md animate-in fade-in duration-700">

            {/* PAIRING CODE DISPLAY */}
            <div className="mb-8 text-center bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 w-full">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Session Code</p>
                <div className="text-5xl font-bold text-[#007AFF] tracking-[0.2em] font-mono">
                    {roomId ? `${roomId.slice(0, 3)} ${roomId.slice(3)}` : '...'}
                </div>
            </div>

            <p className="text-xs text-center text-gray-400 max-w-xs">
                Share this code with other devices to join this session.
            </p>
        </div>
    );
}

