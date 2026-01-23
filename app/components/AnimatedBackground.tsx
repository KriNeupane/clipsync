'use client';

import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

export default function AnimatedBackground() {
    const { theme } = useTheme();

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Blob 1 */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[100px]"
            />

            {/* Blob 2 */}
            <motion.div
                animate={{
                    x: [0, -70, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-[100px]"
            />

            {/* Blob 3 (Bottom) */}
            <motion.div
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
                className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-300/20 dark:bg-indigo-900/10 blur-[120px]"
            />
        </div>
    );
}
