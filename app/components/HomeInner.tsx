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
        <main className="flex min-h-screen flex-col items-center p-6 sm:p-24 relative overflow-hidden bg-white dark:bg-black transition-colors duration-500">

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-3 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform shadow-sm loading-none z-50"
            >
                {theme === 'light' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                )}
            </button>

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
