'use client';

import { useState, useRef } from 'react';
import { useAuth } from './AuthProvider';

export default function ClipboardManager() {
    const { history, sendText, clearText: authClearText } = useAuth();
    const [inputText, setInputText] = useState('');
    const [copyFeedbackId, setCopyFeedbackId] = useState<number | null>(null);

    // Auto-read removed for privacy as per user request

    const copyText = async (text: string, index: number) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                setCopyFeedbackId(index);
            } else {
                // Fallback
                const ta = document.createElement("textarea");
                ta.value = text;
                ta.style.position = "fixed";
                ta.style.left = "-9999px";
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                setCopyFeedbackId(index);
            }
        } catch (e) {
            console.error(e);
        }
        setTimeout(() => setCopyFeedbackId(null), 2000);
    };

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendText(inputText);
        setInputText('');
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    return (
        <div className="ios-card w-full max-w-md overflow-hidden flex flex-col h-auto min-h-[300px] max-h-[70vh]">
            {/* Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-gray-50/80 dark:bg-zinc-900/80 backdrop-blur-md z-10">
                <h2 className="text-[17px] font-semibold text-gray-900 dark:text-white">Shared Text</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (confirm('Clear entire history?')) {
                                authClearText();
                            }
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Clear All"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                    {/* Status Dot removed as AuthProvider manages connection globally */}
                    <div className={`w-2.5 h-2.5 rounded-full bg-[#34C759]`} />
                </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-black/10">
                {history.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic py-10">
                        No history yet...
                    </div>
                ) : (
                    history.map((item, i) => (
                        <div key={i} className="group bg-white dark:bg-[#1c1c1e] p-3 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex-1 text-[15px] text-gray-800 dark:text-gray-200 break-words whitespace-pre-wrap leading-snug">
                                {item}
                            </div>
                            <button
                                onClick={() => copyText(item, i)}
                                className={`self-start p-2 rounded-xl transition-all ${copyFeedbackId === i ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-500 hover:text-[#007AFF]'}`}
                            >
                                {copyFeedbackId === i ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                )}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-[#1c1c1e] border-t border-black/5 dark:border-white/5">
                <div className="flex gap-2">
                    <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={handleInput}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                                // Reset height
                                if (textareaRef.current) textareaRef.current.style.height = 'auto'; // or min-height default
                            }
                        }}
                        placeholder="Type and send..."
                        className="flex-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-xl px-4 py-3 text-[16px] focus:outline-none focus:ring-1 focus:ring-[#007AFF]/50 resize-none min-h-[50px] max-h-[150px] leading-tight custom-scrollbar"
                        rows={1}
                        style={{ height: '50px' }}
                    />
                    <button
                        onClick={() => {
                            handleSend();
                            if (textareaRef.current) textareaRef.current.style.height = 'auto';
                        }}
                        disabled={!inputText.trim()}
                        className="ios-btn-primary w-[50px] flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-default"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
