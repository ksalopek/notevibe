import React, { useState, useEffect, useCallback } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { debounce } from 'lodash';
import Tooltip from '@/Components/Tooltip';

export default function Trash({ notes, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [viewMode, setViewMode] = useState(localStorage.getItem('notesViewMode') || 'grid');

    useEffect(() => {
        localStorage.setItem('notesViewMode', viewMode);
    }, [viewMode]);

    const restoreNote = (id) => {
        if (confirm('Are you sure you want to restore this note?')) {
            router.put(route('notes.restore', id));
        }
    };

    const forceDeleteNote = (id) => {
        if (confirm('Are you sure you want to PERMANENTLY delete this note? This action cannot be undone.')) {
            router.delete(route('notes.forceDelete', id));
        }
    };

    const debouncedSearch = useCallback(
        debounce((nextValue) => {
            router.get(route('notes.trash'), { search: nextValue }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300),
        []
    );

    useEffect(() => {
        if (searchTerm !== (filters.search || '')) {
            debouncedSearch(searchTerm);
        }
    }, [searchTerm, filters.search, debouncedSearch]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Trash Can</h2>
                    <Link href={route('notes.index')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold">
                        &larr; Back to Notes
                    </Link>
                </div>
            }
        >
            <Head title="Trash" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* --- SEARCH AND TOGGLE --- */}
                    <div className="mb-8 flex gap-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search trashed notes..."
                            className="flex-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        />
                        <div className="flex bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 p-1">
                            <Tooltip content="Grid View">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                                    </svg>
                                </button>
                            </Tooltip>
                            <Tooltip content="List View">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    {/* --- NOTES LIST --- */}
                    <div id="notes-list" className={`${viewMode === 'grid' ? 'columns-1 md:columns-2 lg:columns-3 gap-6' : 'space-y-6'} scroll-mt-24`}>
                        {notes.data.length === 0 ? (
                            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                                Your trash is empty.
                            </div>
                        ) : (
                            notes.data.map((note) => (
                                <div key={note.id} className="break-inside-avoid mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 relative group opacity-75 hover:opacity-100 transition-opacity">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 line-through">{note.title}</h2>
                                        <div className="flex gap-4">
                                            <button onClick={() => restoreNote(note.id)} className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold">
                                                Restore
                                            </button>
                                            <button onClick={() => forceDeleteNote(note.id)} className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-bold">
                                                Delete Forever
                                            </button>
                                        </div>
                                    </div>
                                    {/* Render content as HTML */}
                                    <div className="prose dark:prose-invert mt-2 text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: note.content }} />
                                    {/* Render notes as HTML */}
                                    <div className="prose dark:prose-invert mt-2 text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: note.notes }} />
                                    <p className="mt-4 text-xs text-red-500 dark:text-red-400 font-semibold">
                                        Deleted: {new Date(note.deleted_at).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* --- PAGINATION LINKS --- */}
                    {notes.links && notes.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-1">
                            {notes.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    preserveScroll={true}
                                    onSuccess={() => document.getElementById('notes-list')?.scrollIntoView({ behavior: 'smooth' })}
                                    className={`px-4 py-2 border rounded-md text-sm ${
                                        link.active
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
