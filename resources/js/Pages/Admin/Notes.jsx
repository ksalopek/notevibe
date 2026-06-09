import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Pagination from '@/Components/Pagination';
import { useState, useEffect } from 'react';
import Tooltip from '@/Components/Tooltip';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';

const DatabaseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);
const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);

export default function Notes({ notes, filters }) {
    const [searchNotes, setSearchNotes] = useState(filters?.search_notes || '');
    const [viewingNote, setViewingNote] = useState(null);
    const [confirmingNoteDeletion, setConfirmingNoteDeletion] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchNotes !== (filters?.search_notes || '')) {
                router.get(route('admin.notes'), { 
                    ...filters,
                    search_notes: searchNotes 
                }, { preserveState: true, replace: true, preserveScroll: true, only: ['notes'] });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchNotes]);

    const handleSort = (field) => {
        let newDirection = 'asc';
        if (filters?.sort === field && filters?.direction === 'asc') {
            newDirection = 'desc';
        }
        
        router.get(route('admin.notes'), { 
            ...filters, 
            search_notes: searchNotes, 
            sort: field, 
            direction: newDirection 
        }, { 
            preserveState: true, 
            replace: true, 
            preserveScroll: true,
            only: ['notes', 'filters'] 
        });
    };

    const SortIcon = ({ field }) => {
        if (filters?.sort !== field) {
            return <svg className="w-4 h-4 ml-1 opacity-20 group-hover:opacity-50 transition-opacity" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
        }
        if (filters?.direction === 'asc') {
            return <svg className="w-4 h-4 ml-1 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>;
        }
        return <svg className="w-4 h-4 ml-1 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
    };

    const handleDelete = (noteId) => {
        setConfirmingNoteDeletion(noteId);
    };

    const executeDelete = () => {
        if (confirmingNoteDeletion) {
            router.delete(route('admin.notes.destroy', confirmingNoteDeletion), {
                preserveScroll: true,
                onSuccess: () => setConfirmingNoteDeletion(null),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-bold text-2xl text-slate-800 dark:text-slate-100 leading-tight">
                    Admin - All Notes
                </h2>
            }
        >
            <Head title="Admin Notes" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
                
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                    <div>
                        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
                            <DatabaseIcon /> <span className="ml-3">Notes Management</span>
                        </h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            View and manage all notes posted by users across the platform.
                        </p>
                    </div>
                    <div className="w-full sm:w-64">
                        <input 
                            type="text" 
                            placeholder="Search notes or authors..." 
                            value={searchNotes}
                            onChange={(e) => setSearchNotes(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder-slate-400"
                        />
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:shadow-purple-500/50 dark:hover:shadow-purple-500/50 transition-shadow duration-300"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <button onClick={() => handleSort('title')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                            Title <SortIcon field="title" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        <button onClick={() => handleSort('author')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                            Author <SortIcon field="author" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        <button onClick={() => handleSort('created_at')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                            Created At <SortIcon field="created_at" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {!notes || !notes.data || notes.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-slate-500">No notes found.</td>
                                    </tr>
                                ) : (
                                    notes.data.map(note => (
                                        <tr key={note.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                            <td className="px-4 py-4 whitespace-normal break-words text-sm font-medium text-slate-900 dark:text-white">
                                                {note.title}
                                            </td>
                                            <td className="px-4 py-4 whitespace-normal break-words text-sm text-slate-500 dark:text-slate-400">
                                                {note.user ? note.user.name : 'Unknown'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-normal break-words text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(note.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 whitespace-normal break-words text-center text-sm font-medium">
                                                <div className="flex items-center justify-center gap-3 w-full">
                                                    <Tooltip content="View Note" placement="top">
                                                        <button
                                                            onClick={() => setViewingNote(note)}
                                                            className="text-indigo-500 hover:text-indigo-700 transition-colors"
                                                        >
                                                            <EyeIcon />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip content="Delete Note" placement="top-right">
                                                        <button
                                                            onClick={() => handleDelete(note.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {notes && notes.links && notes.data.length > 0 && (
                        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                            <Pagination links={notes.links} only={['notes']} />
                        </div>
                    )}
                </motion.div>
            </div>

            <Modal show={!!viewingNote} onClose={() => setViewingNote(null)} maxWidth="2xl">
                {viewingNote && (
                    <div className="p-6 bg-white dark:bg-slate-900">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white break-words pr-8">
                                {viewingNote.title}
                            </h3>
                            <button 
                                onClick={() => setViewingNote(null)}
                                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 flex justify-between">
                            <span>Author: {viewingNote.user ? viewingNote.user.name : 'Unknown'}</span>
                            <span>{new Date(viewingNote.created_at).toLocaleString()}</span>
                        </div>
                        <div 
                            className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300"
                            dangerouslySetInnerHTML={{ __html: viewingNote.content }}
                        />
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setViewingNote(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors font-medium text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal show={!!confirmingNoteDeletion} onClose={() => setConfirmingNoteDeletion(null)}>
                <div className="p-6 bg-white dark:bg-slate-900">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                        Are you sure you want to delete this note?
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        This action cannot be undone. This will permanently delete the note from the database.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setConfirmingNoteDeletion(null)}>Cancel</SecondaryButton>
                        <DangerButton className="ml-3" onClick={executeDelete}>
                            Delete Note
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
