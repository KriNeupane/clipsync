'use client';

import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import AuthScreen from './AuthScreen';
import ConnectionInfo from './ConnectionInfo';
import ClipboardManager from './ClipboardManager';
import FileManager from './FileManager';

// We need to move the server-component text fetch to a client side fetch or pass it down?
// Actually 'page.tsx' is a Server Component by default in Next.js App Router 
// BUT we need it to be Client for useAuth hooks. 
// So we will make this a Client Component. 
// The original page.tsx was Server component fetching IPs. 
// We will pass IPs as props from a Layout or just fetch them here?
// Actually, 'page.tsx' can be client if we rename the original logic or pass data.
// Let's make a new wrapper component.

export default function Home() {
    const { isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();

    if (!isAuthenticated) {
        return <AuthScreen />;
    }

    return (
    return (
        <main className="flex min-h-screen flex-col items-center p-6 relative overflow-hidden bg-white dark:bg-black transition-colors duration-500 pt-20">

            {/* Header / Controls */}
            <div className="absolute top-4 right-4 flex gap-3 z-50">
                {/* Disconnect Button where user can "Logout" of the session */}
                <button
                    onClick={() => window.location.reload()}
                    /* Ideally we use a proper disconnect method, but a reload clears the in-memory socket and state for now since we don't persist automatically anymore. 
                       Actually, AuthProvider state is memory only. Reload works perfect. */
                    className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:scale-105 transition-transform shadow-sm"
                    title="Leave Session"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:scale-105 transition-transform shadow-sm"
                >
                    {theme === 'light' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    )}
                </button>
            </div>

            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex flex-col">

                {/* Connection Box (Host Info) */}
                {/* We show this so the Host can see the code (it's inside ConnectionInfo now, populated by AuthContext) */}
                {/* We might want to allow toggling this visibility for security on the phone, but for now it's fine */}
                <ConnectionInfo />

                <div className="flex flex-col lg:flex-row gap-8 w-full justify-center">
                    <ClipboardManager />
                    <FileManager />
                </div>

            </div>

            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-50/50 dark:from-blue-900/10 to-transparent -z-10 pointer-events-none" />
        </main>
    );
}
