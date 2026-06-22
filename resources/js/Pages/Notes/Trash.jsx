import React, { useState, useEffect, useCallback } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { debounce } from 'lodash';
import Tooltip from '@/Components/Tooltip';
import { RotateCcw, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import SimpleNoteCard from '@/Components/SimpleNoteCard';

const TitleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ContentIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>;
const NotesIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const TagsIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;

export default function Trash({ notes, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [viewMode, setViewMode] = useState(localStorage.getItem('notesViewMode') || 'grid');
    const [confirmingRestore, setConfirmingRestore] = useState(null);
    const [confirmingForceDelete, setConfirmingForceDelete] = useState(null);
    const [selectedNotes, setSelectedNotes] = useState([]);

    const handleSelectNote = (id, checked) => {
        if (checked) {
            setSelectedNotes(prev => [...prev, id]);
        } else {
            setSelectedNotes(prev => prev.filter(nId => nId !== id));
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked && notes.data && notes.data.length > 0) {
            setSelectedNotes(notes.data.map(n => n.id));
        } else {
            setSelectedNotes([]);
        }
    };

    const executeBulkAction = (action) => {
        if (selectedNotes.length === 0) return;
        router.post(route('notes.bulk'), { action, note_ids: selectedNotes }, {
            preserveScroll: true,
            onSuccess: () => setSelectedNotes([])
        });
    };

    useEffect(() => {
        localStorage.setItem('notesViewMode', viewMode);
    }, [viewMode]);

    const restoreNote = (id) => {
        setConfirmingRestore(id);
    };

    const executeRestore = () => {
        if (confirmingRestore) {
            router.put(route('notes.restore', confirmingRestore), {}, {
                onSuccess: () => setConfirmingRestore(null),
            });
        }
    };

    const forceDeleteNote = (id) => {
        setConfirmingForceDelete(id);
    };

    const executeForceDelete = () => {
        if (confirmingForceDelete) {
            router.delete(route('notes.forceDelete', confirmingForceDelete), {
                onSuccess: () => setConfirmingForceDelete(null),
            });
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

                </div>
            }
        >
            <Head title="Trash" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- SEARCH AND TOGGLE --- */}
                    <div className="mb-8 flex flex-col gap-4">
                        {/* Top Row: Actions and Toggles */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {notes.data && notes.data.length > 0 ? (
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 p-2 px-3">
                                    <input 
                                        type="checkbox" 
                                        onChange={handleSelectAll} 
                                        checked={selectedNotes.length > 0 && selectedNotes.length === notes.data.length}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" 
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">Select All</span>
                                </div>
                            ) : (
                                <div></div>
                            )}

                            <div className="flex flex-wrap items-center gap-3 ml-auto justify-end">
                                <div className="flex bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 p-1">
                                    <Tooltip content="Grid View">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                                            </svg>
                                        </button>
                                    </Tooltip>
                                    <Tooltip content="List View">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                            </svg>
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        {/* Second Row: Search */}
                        <div className="w-full">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search trashed notes..."
                                className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                            />
                        </div>
                    </div>

                    {/* --- NOTES LIST --- */}
                    {notes.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 px-4 text-center bg-white/50 dark:bg-gray-800/30 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm mt-8">
                            <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-inner">
                                <Trash2 className="w-10 h-10 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 tracking-tight">Your trash is empty</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                                You don't have any deleted notes. Items you delete will appear here before being permanently removed.
                            </p>
                        </div>
                    ) : (
                        <div id="notes-list" className={`${viewMode === 'grid' ? 'columns-1 md:columns-2 lg:columns-3 gap-6' : 'space-y-6'} scroll-mt-24`}>
                            {notes.data.map((note) => (
                                <SimpleNoteCard
                                    key={note.id}
                                    note={note}
                                    isSelected={selectedNotes.includes(note.id)}
                                    onSelect={handleSelectNote}
                                    isDeleted={true}
                                    badge={`Deleted: ${new Date(note.deleted_at).toLocaleString()}`}
                                    actions={
                                        <>
                                            <Tooltip content="Restore">
                                                <button 
                                                    onClick={() => restoreNote(note.id)} 
                                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full transition-all duration-200 border border-emerald-200 dark:border-emerald-800/50 shadow-sm hover:shadow"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                            </Tooltip>
                                            <Tooltip content="Delete Forever">
                                                <button 
                                                    onClick={() => forceDeleteNote(note.id)} 
                                                    className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 border border-red-200 dark:border-red-800/50 shadow-sm hover:shadow"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </Tooltip>
                                        </>
                                    }
                                />
                            ))}
                        </div>
                    )}

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
                                            ? 'bg-primary-600 text-white border-primary-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal show={!!confirmingRestore} onClose={() => setConfirmingRestore(null)}>
                <div className="p-6 bg-white dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Restore Note?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to restore this note? It will be moved back to your active notes.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setConfirmingRestore(null)}>Cancel</SecondaryButton>
                        <PrimaryButton className="ml-3" onClick={executeRestore}>
                            Restore
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            <Modal show={!!confirmingForceDelete} onClose={() => setConfirmingForceDelete(null)}>
                <div className="p-6 bg-white dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Permanently Delete Note?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to PERMANENTLY delete this note? This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setConfirmingForceDelete(null)}>Cancel</SecondaryButton>
                        <DangerButton className="ml-3" onClick={executeForceDelete}>
                            Delete Forever
                        </DangerButton>
                    </div>
                </div>
            </Modal>
            <AnimatePresence>
                {selectedNotes.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        exit={{ y: 100, opacity: 0 }} 
                        className="fixed bottom-24 sm:bottom-8 left-0 right-0 z-50 pointer-events-none flex justify-center"
                    >
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                            <div className="pointer-events-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl sm:rounded-full px-4 sm:px-6 py-3 border border-gray-200 dark:border-gray-700 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
                                <span className="font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap text-sm sm:text-base">
                                    {selectedNotes.length} selected
                                </span>
                                <div className="hidden sm:block h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                                <button onClick={() => executeBulkAction('restore')} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors">Restore</button>
                                <button onClick={() => executeBulkAction('force_delete')} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors">Delete Forever</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
