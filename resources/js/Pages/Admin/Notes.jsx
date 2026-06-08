import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Pagination from '@/Components/Pagination';
import { useState, useEffect } from 'react';
import Tooltip from '@/Components/Tooltip';

const DatabaseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);

export default function Notes({ notes, filters }) {
    const [searchNotes, setSearchNotes] = useState(filters?.search_notes || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchNotes !== (filters?.search_notes || '')) {
                router.get(route('admin.notes'), { search_notes: searchNotes }, { preserveState: true, replace: true, preserveScroll: true, only: ['notes'] });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchNotes]);

    const handleDelete = (noteId) => {
        if (confirm('Are you sure you want to delete this note?')) {
            router.delete(route('admin.notes.destroy', noteId), {
                preserveScroll: true,
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
                    className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Author</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created At</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
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
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                                {note.title}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                {note.user ? note.user.name : 'Unknown'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(note.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end w-full">
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
        </AuthenticatedLayout>
    );
}
