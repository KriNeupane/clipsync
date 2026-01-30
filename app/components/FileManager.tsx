'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/convex/_generated/api';
import { useAuth } from './AuthProvider';
import { useKeyboardShortcut, ShortcutHint } from './KeyboardShortcutContext';

export default function FileManager() {
    const { roomId } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    // Convex Hooks
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveFile = useMutation(api.files.saveFile);
    const deleteFileMutation = useMutation(api.files.deleteFile);

    // Subscribe to files for this room
    const files = useQuery(api.files.listFiles, roomId ? { roomCode: roomId } : "skip") || [];

    const handleDelete = async (fileId: any, storageId: string, filename: string) => {
        if (!confirm(`Delete "${filename}"?`)) return;
        try {
            await deleteFileMutation({ id: fileId, storageId });
        } catch (e) {
            console.error(e);
            alert('Failed to delete file');
        }
    };

    const uploadFile = useCallback(async (file: File) => {
        if (!file || !roomId) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('File too large. Max size is 10MB.');
            return;
        }

        setUploading(true);
        setStatusMsg('Preparing...');

        try {
            // 1. Get a short-lived upload URL
            const postUrl = await generateUploadUrl();

            // 2. POST the file to the URL
            setStatusMsg('Uploading...');
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) {
                throw new Error(`Upload failed: ${result.statusText}`);
            }

            const { storageId } = await result.json();

            // 3. Save the file metadata to our database
            setStatusMsg('Saving...');
            await saveFile({
                storageId,
                name: file.name,
                type: file.type,
                roomCode: roomId,
                size: file.size,
            });

            setStatusMsg('Done');
        } catch (err) {
            console.error(err);
            setStatusMsg('Error');
        } finally {
            setUploading(false);
            setTimeout(() => setStatusMsg(''), 2000);
        }
    }, [roomId, generateUploadUrl, saveFile]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.[0]) {
            uploadFile(acceptedFiles[0]);
        }
    }, [uploadFile]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        multiple: false,
        disabled: uploading,
        noClick: false
    });

    useKeyboardShortcut('u', open);

    if (!roomId) return null;

    return (
        <div className="w-full max-w-md mt-6">
            <div className="flex justify-between items-end px-4 mb-2">
                <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Shared Files</h3>
                {statusMsg && <span className="text-[13px] text-[#007AFF] font-medium">{statusMsg}</span>}
            </div>

            <div className="ios-card overflow-hidden">
                {/* Upload Button */}
                <div
                    {...getRootProps()}
                    className={`block w-full cursor-pointer transition-colors border-b border-gray-100 dark:border-white/5 active:bg-gray-100 outline-none
                        ${isDragActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-white/5'}
                        relative
                    `}
                >
                    <input {...getInputProps()} />
                    <ShortcutHint shortcut="U" className="absolute top-3 right-3" />
                    <div className="py-6 px-4 flex items-center justify-center gap-2">
                        {uploading ? (
                            <span className="text-[17px] text-gray-400">Uploading...</span>
                        ) : isDragActive ? (
                            <>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                <span className="text-[17px] font-medium text-[#007AFF]">Drop file to upload</span>
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    <span className="text-[17px] font-medium text-[#007AFF]">Upload File</span>
                                </div>
                                <span className="text-[12px] text-gray-400 mt-1">or drag and drop here</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* File List */}
                <div className="max-h-[300px] overflow-y-auto">
                    {files.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-[15px] text-gray-400">No files shared yet</p>
                        </div>
                    ) : (
                        <ul className="pl-4">
                            {files.map((file: any) => (
                                <li key={file._id} className="flex items-center justify-between py-3 pr-4 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden flex-1 mr-4">
                                        <svg className="w-8 h-8 text-gray-300 dark:text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M13 9h5.5L13 3.5V9M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m5 13v-3h7v3H11z" /></svg>
                                        <div className="overflow-hidden">
                                            <p className="text-[17px] text-black dark:text-white truncate">{file.name}</p>
                                            <p className="text-[12px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(file.url);
                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.style.display = 'none';
                                                    a.href = url;
                                                    a.download = file.name;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    window.URL.revokeObjectURL(url);
                                                    document.body.removeChild(a);
                                                } catch (e) {
                                                    console.error('Download failed', e);
                                                    window.open(file.url, '_blank');
                                                }
                                            }}
                                            className="bg-[#F2F2F7] dark:bg-[#3A3A3C] p-2 rounded-full text-[#007AFF] hover:opacity-80 transition-opacity"
                                            title="Download"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(file._id, file.storageId, file.name)}
                                            className="bg-[#F2F2F7] dark:bg-[#3A3A3C] p-2 rounded-full text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors"
                                            title="Delete"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
