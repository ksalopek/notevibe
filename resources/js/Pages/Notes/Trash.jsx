import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { debounce } from 'lodash';
import Tooltip from '@/Components/Tooltip';
import { RotateCcw, Trash2, Filter, Search, ArrowUp, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import SimpleNoteCard from '@/Components/SimpleNoteCard';
import LibraryFilterDrawer from '@/Components/LibraryFilterDrawer';

const TitleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ContentIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>;
const NotesIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const TagsIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;

export default function Trash({ notes, filters = {}, folders = [], tags = [] }) {
    const safeFilters = Array.isArray(filters) ? {} : (filters || {});
    const initialSearch = typeof safeFilters.search === 'string' ? safeFilters.search : '';
    const initialSort = typeof safeFilters.sort === 'string' ? safeFilters.sort : 'latest';

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [sortBy, setSortBy] = useState(initialSort);
    const [viewMode, setViewMode] = useState(localStorage.getItem('notesViewMode') || 'grid');
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [activeFolderId, setActiveFolderId] = useState(safeFilters.folder_id ? parseInt(safeFilters.folder_id) : null);

    const [localNotes, setLocalNotes] = useState(notes.data || []);
    const [nextPageUrl, setNextPageUrl] = useState(notes.next_page_url);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const observerRef = useRef(null);
    const { version } = usePage();

    useEffect(() => {
        setLocalNotes(notes.data || []);
        setNextPageUrl(notes.next_page_url);
    }, [notes]);

    // Floating top bar state
    const [showFloatingTopBar, setShowFloatingTopBar] = useState(false);
    const searchBlockRef = useRef(null);
    const notesColumnRef = useRef(null);
    const [floatingBarStyles, setFloatingBarStyles] = useState({});

    useEffect(() => {
        const updateStyles = () => {
            if (notesColumnRef.current) {
                const rect = notesColumnRef.current.getBoundingClientRect();
                setFloatingBarStyles({
                    left: `${rect.left}px`,
                    width: `${rect.width}px`
                });
            }
        };

        if (showFloatingTopBar) {
            updateStyles();
            window.addEventListener('resize', updateStyles);
            return () => window.removeEventListener('resize', updateStyles);
        }
    }, [showFloatingTopBar]);

    useEffect(() => {
        if (!searchBlockRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                const isPast = !entry.isIntersecting && entry.boundingClientRect.bottom < 150;
                setShowFloatingTopBar(isPast);
            },
            { threshold: 0, rootMargin: '-64px 0px 0px 0px' }
        );
        observer.observe(searchBlockRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && nextPageUrl && !isFetchingNextPage) {
                    setIsFetchingNextPage(true);
                    window.axios.get(nextPageUrl, {
                        headers: {
                            'X-Inertia': 'true',
                            'X-Inertia-Version': version
                        }
                    }).then(response => {
                        const newNotes = response.data.props.notes;
                        if (newNotes && newNotes.data) {
                            setLocalNotes(prev => {
                                const existingIds = new Set(prev.map(n => n.id));
                                const additions = newNotes.data.filter(n => !existingIds.has(n.id));
                                return [...prev, ...additions];
                            });
                            setNextPageUrl(newNotes.next_page_url);
                        }
                    }).catch(error => {
                        console.error('Failed to load next page', error);
                    }).finally(() => {
                        setIsFetchingNextPage(false);
                    });
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        const currentRef = observerRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [nextPageUrl, isFetchingNextPage, version]);

    const handleApplyFilters = (newFilters) => {
        router.get(route('notes.trash'), { search: searchTerm, sort: sortBy, ...newFilters }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };



    const handleSortChange = (e) => {
        const newSort = e.target.value;
        setSortBy(newSort);
        router.get(route('notes.trash'), { ...safeFilters, search: searchTerm, sort: newSort }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleTagClick = (tagName) => {
        setSearchTerm(tagName);
    };
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
        if (e.target.checked && localNotes && localNotes.length > 0) {
            setSelectedNotes(localNotes.map(n => n.id));
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
        debounce((nextValue, sortValue, currentFilters) => {
            router.get(route('notes.trash'), { ...currentFilters, search: nextValue, sort: sortValue }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300),
        []
    );

    useEffect(() => {
        if (searchTerm !== initialSearch) {
            debouncedSearch(searchTerm, sortBy, safeFilters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, debouncedSearch, initialSearch, sortBy]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/20 text-white">
                        <Trash2 className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
                        Trash Can
                    </h2>
                </div>
            }
        >
            <Head title="Trash" />

            <AnimatePresence>
                {showFloatingTopBar && (
                    <div 
                        className="hidden sm:flex fixed top-[160px] z-[100] pointer-events-none justify-center"
                        style={floatingBarStyles}
                    >
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pointer-events-auto flex bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg rounded-full border border-gray-200 dark:border-gray-700 p-1.5 items-center gap-2 w-full max-w-md"
                        >
                            <Search className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search trashed notes..."
                                className="flex-1 bg-transparent border-none text-sm focus:ring-0 px-2 dark:text-gray-200 placeholder-gray-400"
                            />
                            <button
                                onClick={() => setIsFilterDrawerOpen(true)}
                                className={`flex-shrink-0 p-1.5 mr-1 rounded-full transition-colors ${
                                    (safeFilters.folder_id || safeFilters.tags || safeFilters.date_from) 
                                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                                title="Filters"
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="flex-shrink-0 p-1.5 mr-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Scroll to top"
                            >
                                <ArrowUp className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-8">

                    <div className="flex-1 min-w-0" ref={notesColumnRef}>
                        <div ref={searchBlockRef}>
                    {/* --- SEARCH AND TOGGLE --- */}
                    <div className="mb-8 flex flex-wrap items-center gap-4">
                        {localNotes && localNotes.length > 0 && (
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 p-2 px-3">
                                <input 
                                    type="checkbox" 
                                    onChange={handleSelectAll} 
                                    checked={selectedNotes.length > 0 && selectedNotes.length === localNotes.length}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" 
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">Select All</span>
                            </div>
                        )}
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search trashed notes..."
                            className="w-full order-last sm:order-none sm:w-auto sm:flex-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                        />
                        <button
                            onClick={() => setIsFilterDrawerOpen(true)}
                            className={`flex items-center justify-center gap-2 p-2 px-4 rounded border border-gray-300 dark:border-gray-700 shadow-sm transition-colors ${
                                (safeFilters.folder_id || safeFilters.tags || safeFilters.date_from) 
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 border-primary-200 dark:border-primary-800' 
                                : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            <Filter className="w-4 h-4" /> Filters
                        </button>
                        <select
                            value={sortBy}
                            onChange={handleSortChange}
                            className="w-auto sm:w-40 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm ml-auto"
                        >
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
                        </div>

                    {/* --- TRASH LIST --- */}
                    {localNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/50 dark:bg-gray-800/30 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm mt-8">
                            <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-inner">
                                <Trash2 className="w-10 h-10 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 tracking-tight">Your trash is empty</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                                {searchTerm ? 'No deleted notes match your search criteria.' : 'Notes you delete will appear here.'}
                            </p>
                        </div>
                    ) : (
                        <div id="notes-list" className={`${viewMode === 'grid' ? 'columns-1 md:columns-2 lg:columns-3 gap-6' : 'space-y-6'} scroll-mt-24`}>
                            {localNotes.map((note) => (
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
                                                    className="p-1.5 bg-white hover:bg-emerald-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-emerald-600 dark:text-emerald-400 rounded-full transition-all duration-200 border border-emerald-200 dark:border-emerald-800/50 shadow-md hover:shadow-lg"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                            </Tooltip>
                                            <Tooltip content="Delete Forever">
                                                <button 
                                                    onClick={() => forceDeleteNote(note.id)} 
                                                    className="p-1.5 bg-white hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 border border-red-200 dark:border-red-800/50 shadow-md hover:shadow-lg"
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

                    {/* --- INFINITE SCROLL SENTINEL --- */}
                    <div ref={observerRef} className="h-4 w-full mt-4 flex items-center justify-center">
                        {isFetchingNextPage && (
                            <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                    </div>
                    </div>
                </div>
            </div>

            <LibraryFilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                filters={safeFilters}
                onApply={handleApplyFilters}
                folders={folders}
                tags={tags}
                openTagManager={() => setIsTagManagerOpen(true)}
                hideManagement={true}
                dateLabelPrefix="Deleted"
            />

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
            
            {/* --- MOBILE FLOATING SEARCH BAR --- */}
            <AnimatePresence>
                {showFloatingTopBar && (
                    <div className="sm:hidden fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 px-4 z-[100] pointer-events-none flex justify-center">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pointer-events-auto flex bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg rounded-full border border-gray-200 dark:border-gray-700 p-1.5 items-center gap-2 w-full max-w-sm"
                        >
                            <Search className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search trashed notes..."
                                className="flex-1 bg-transparent border-none text-sm focus:ring-0 px-2 dark:text-gray-200 placeholder-gray-400 min-w-[10px]"
                            />
                            <button
                                onClick={() => setIsFilterDrawerOpen(true)}
                                className={`flex-shrink-0 p-1.5 mr-1 rounded-full transition-colors ${
                                    (safeFilters.folder_id || safeFilters.tags || safeFilters.date_from) 
                                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                                title="Filters"
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="flex-shrink-0 p-1.5 mr-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Scroll to top"
                            >
                                <ArrowUp className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
