import React, { useState, useEffect, useCallback } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { debounce } from 'lodash';
import RichTextEditor from '@/Components/RichTextEditor';
import { AnimatePresence, motion } from 'framer-motion';
import NoteSkeleton from '@/Components/NoteSkeleton';
import Tooltip from '@/Components/Tooltip';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';

const TitleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ContentIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>;
const NotesIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const TagsIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;

export default function Index({ notes, filters = {} }) {
    // 1. State for the "Create" form
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        content: '',
        notes: '',
        tags: '',
    });

    // 2. React State to track which note we are currently editing
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', notes: '', tags: '' });
    const [confirmingNoteDeletion, setConfirmingNoteDeletion] = useState(null);

    // 3. State for the search input and loading
    const safeFilters = Array.isArray(filters) ? {} : (filters || {});
    const initialSearch = typeof safeFilters.search === 'string' ? safeFilters.search : '';
    const initialSort = typeof safeFilters.sort === 'string' ? safeFilters.sort : 'relevance';

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [sortBy, setSortBy] = useState(initialSort);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState(localStorage.getItem('notesViewMode') || 'grid');

    useEffect(() => {
        localStorage.setItem('notesViewMode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        const startListener = router.on('start', () => setIsLoading(true));
        const finishListener = router.on('finish', () => setIsLoading(false));
        
        return () => {
            startListener();
            finishListener();
        };
    }, []);

    // --- Action Handlers ---

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('notes.store'), { onSuccess: () => reset() });
    };

    const deleteNote = (id) => {
        setConfirmingNoteDeletion(id);
    };

    const executeDelete = () => {
        if (confirmingNoteDeletion) {
            router.delete(route('notes.destroy', confirmingNoteDeletion), {
                onSuccess: () => setConfirmingNoteDeletion(null),
            });
        }
    };

    const startEditing = (note) => {
        setEditingNoteId(note.id);
        setEditForm({
            title: note.title,
            content: note.content,
            notes: note.notes,
            tags: note.tags.map(tag => tag.name).join(', '),
        });
    };

    const submitUpdate = (e, id) => {
        e.preventDefault();
        router.put(route('notes.update', id), editForm, {
            onSuccess: () => setEditingNoteId(null)
        });
    };

    // --- Search Handling ---
    const debouncedSearch = useCallback(
        debounce((nextValue, sortValue) => {
            router.get(route('notes.index'), { search: nextValue, sort: sortValue }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300),
        []
    );

    useEffect(() => {
        if (searchTerm !== initialSearch) {
            debouncedSearch(searchTerm, sortBy);
        }
    }, [searchTerm, debouncedSearch, initialSearch, sortBy]);

    const handleSortChange = (e) => {
        const newSort = e.target.value;
        setSortBy(newSort);
        router.get(route('notes.index'), { search: searchTerm, sort: newSort }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">My Notes</h2>}
        >
            <Head title="My Notes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* --- CREATE FORM --- */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-8 p-6">
                        <form onSubmit={submitCreate}>
                            <div className="mb-4">
                                <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-primary-100 dark:border-primary-800/50">
                                    <TitleIcon className="w-4 h-4 mr-2 text-primary-500" /> Title
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                    placeholder="Note title..."
                                />
                                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                            </div>
                            <div className="mb-4">
                                <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-primary-100 dark:border-primary-800/50">
                                    <ContentIcon className="w-4 h-4 mr-2 text-primary-500" /> Content
                                </label>
                                <RichTextEditor
                                    content={data.content}
                                    onChange={newContent => setData('content', newContent)}
                                    className="min-h-[150px]"
                                />
                                {errors.content && <div className="text-red-500 text-sm mt-1">{errors.content}</div>}
                            </div>
                            <div className="mb-4">
                                <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-primary-100 dark:border-primary-800/50">
                                    <NotesIcon className="w-4 h-4 mr-2 text-primary-500" /> Notes
                                </label>
                                <RichTextEditor
                                    content={data.notes}
                                    onChange={newNotes => setData('notes', newNotes)}
                                    className="min-h-[100px]"
                                />
                                {errors.notes && <div className="text-red-500 text-sm mt-1">{errors.notes}</div>}
                            </div>
                            <div className="mb-4">
                                <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-primary-100 dark:border-primary-800/50">
                                    <TagsIcon className="w-4 h-4 mr-2 text-primary-500" /> Tags
                                </label>
                                <input
                                    type="text"
                                    value={data.tags}
                                    onChange={e => setData('tags', e.target.value)}
                                    className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                    placeholder="Comma, separated, tags..."
                                />
                                {errors.tags && <div className="text-red-500 text-sm mt-1">{errors.tags}</div>}
                            </div>
                            <button type="submit" disabled={processing} className="w-full bg-emerald-600 text-white font-bold text-lg px-6 py-3 rounded-lg shadow-lg hover:bg-emerald-700 transition-all">
                                {processing ? 'Saving...' : 'Save Note'}
                            </button>
                        </form>
                    </div>

                    {/* --- SEARCH AND TOGGLE --- */}
                    <div className="mb-8 flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search notes..."
                            className="flex-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                        />
                        <select
                            value={sortBy}
                            onChange={handleSortChange}
                            className="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                        >
                            <option value="relevance">Relevance</option>
                            <option value="latest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="a_z">Alphabetical (A-Z)</option>
                            <option value="z_a">Alphabetical (Z-A)</option>
                        </select>
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

                    {/* --- NOTES LIST --- */}
                    <div id="notes-list" className={`${viewMode === 'grid' ? 'columns-1 md:columns-2 lg:columns-3 gap-6' : 'space-y-6'} scroll-mt-24`}>
                        {isLoading ? (
                            <>
                                <NoteSkeleton />
                                <NoteSkeleton />
                                <NoteSkeleton />
                                <NoteSkeleton />
                                <NoteSkeleton />
                                <NoteSkeleton />
                            </>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {notes.data.map((note) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        transition={{ duration: 0.3 }}
                                        key={note.id} 
                                        className="break-inside-avoid mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50"
                                    >
                                        <div className="flex justify-between items-start">
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{note.title}</h2>
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => startEditing(note)} 
                                                    className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full transition-all duration-200 border border-primary-200 dark:border-primary-800/50 shadow-sm hover:shadow"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => deleteNote(note.id)} 
                                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-full transition-all duration-200 border border-red-200 dark:border-red-800/50 shadow-sm hover:shadow"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <div className="prose dark:prose-invert mt-2 text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: note.content }} />
                                        <div className="prose dark:prose-invert mt-2 text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: note.notes }} />
                                        {/* Display Tags */}
                                        {note.tags && note.tags.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {note.tags.map(tag => (
                                                    <span key={tag.id} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-full">
                                                        {tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
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

            <Modal show={!!confirmingNoteDeletion} onClose={() => setConfirmingNoteDeletion(null)}>
                <div className="p-6 bg-white dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Move to Trash?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to move this note to the trash? You can restore it later if needed.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setConfirmingNoteDeletion(null)}>Cancel</SecondaryButton>
                        <DangerButton className="ml-3" onClick={executeDelete}>
                            Move to Trash
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            <Modal show={!!editingNoteId} onClose={() => setEditingNoteId(null)} maxWidth="5xl">
                <div className="p-6 bg-white dark:bg-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                        Edit Note
                    </h2>
                    <form onSubmit={(e) => submitUpdate(e, editingNoteId)}>
                        <div className="mb-4">
                            <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-primary-100 dark:border-primary-800/50">
                                <TitleIcon className="w-4 h-4 mr-2 text-primary-500" /> Title
                            </label>
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-primary-100 dark:border-primary-800/50">
                                <ContentIcon className="w-4 h-4 mr-2 text-primary-500" /> Content
                            </label>
                            <RichTextEditor
                                content={editForm.content}
                                onChange={newContent => setEditForm({ ...editForm, content: newContent })}
                                className="min-h-[150px]"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-primary-100 dark:border-primary-800/50">
                                <NotesIcon className="w-4 h-4 mr-2 text-primary-500" /> Notes
                            </label>
                            <RichTextEditor
                                content={editForm.notes}
                                onChange={newNotes => setEditForm({ ...editForm, notes: newNotes })}
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-primary-100 dark:border-primary-800/50">
                                <TagsIcon className="w-4 h-4 mr-2 text-primary-500" /> Tags
                            </label>
                            <input
                                type="text"
                                value={editForm.tags}
                                onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
                                className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm"
                                placeholder="Comma, separated, tags..."
                            />
                        </div>
                        <div className="flex gap-2 justify-end mt-6">
                            <button type="button" onClick={() => setEditingNoteId(null)} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-400 dark:hover:bg-gray-500">Cancel</button>
                            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700">Save Changes</button>
                        </div>
                    </form>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
