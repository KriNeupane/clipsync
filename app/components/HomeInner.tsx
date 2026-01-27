'use client';

import { useAuth } from './AuthProvider';
// import { useTheme } from './ThemeProvider'; // Removed as toggle is now in AuthScreen
import ThemeToggle from './ThemeToggle';
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

import AnimatedBackground from './AnimatedBackground';
import InstallPrompt from './InstallPrompt';

export default function Home() {
    const { isAuthenticated, terminateSession, isHost, clearText } = useAuth();
    // const { theme, toggleTheme } = useTheme();

    if (!isAuthenticated) {
        return <AuthScreen />;
    }

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

    return (
        <main className="flex min-h-screen flex-col items-center p-6 relative overflow-hidden bg-white dark:bg-black transition-colors duration-500 pt-20">
            <InstallPrompt />
            <AnimatedBackground />

            {/* Header / Controls */}
            <div className="absolute top-4 right-4 flex gap-3 z-50">
                {/* Disconnect Button where user can "Logout" of the session */}
                <button
                    onClick={handleExit}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:scale-105 transition-transform shadow-sm font-medium text-sm"
                    title={isHost ? "End Session" : "Leave Session"}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    <span>{isHost ? "End" : "Exit"}</span>
                </button>
                <ThemeToggle className="bg-gray-100 dark:bg-zinc-800" />
                {/* Theme Toggle moved to AuthScreen/Landing */}
            </div>

            <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-8 font-mono text-sm">

                {/* Connection Box (Host Info) */}
                {/* We show this so the Host can see the code (it's inside ConnectionInfo now, populated by AuthContext) */}
                {/* We might want to allow toggling this visibility for security on the phone, but for now it's fine */}
                <ConnectionInfo />

                <div className="flex flex-col lg:flex-row gap-8 w-full justify-center items-center lg:items-start">
                    <ClipboardManager />
                    <FileManager />
                </div>

            </div>


        </main >
    );
}
