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
import Masonry from 'react-masonry-css';
import NoteCard from '@/Components/NoteCard';
import SimpleNoteCard from '@/Components/SimpleNoteCard';
import { Archive, Notebook, Trash2, Filter, Folder } from 'lucide-react';
import FolderSidebar from '@/Components/FolderSidebar';
import AdvancedFilterDrawer from '@/Components/AdvancedFilterDrawer';
import TemplateManagerModal from '@/Components/TemplateManagerModal';
import MoveNotesModal from '@/Components/MoveNotesModal';
import TagManagerModal from '@/Components/TagManagerModal';
import BulkTagModal from '@/Components/BulkTagModal';
import TagAutocompleteInput from '@/Components/TagAutocompleteInput';

const breakpointColumnsObj = {
  default: 3,
  1024: 2,
  768: 1
};

const TitleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ContentIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>;
const NotesIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const TagsIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;

export default function Index({ notes, filters = {}, isArchiveView = false, folders = [], templates = [], tags = [] }) {
    // 1. State for the "Create" form
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        content: '',
        tags: '',
        folder_id: '',
    });

    // 2. React State to track which note we are currently editing
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', tags: '' });
    const [confirmingNoteDeletion, setConfirmingNoteDeletion] = useState(null);

    // 3. State for the search input and loading
    const safeFilters = Array.isArray(filters) ? {} : (filters || {});
    const initialSearch = typeof safeFilters.search === 'string' ? safeFilters.search : '';
    const initialSort = typeof safeFilters.sort === 'string' ? safeFilters.sort : 'relevance';

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [sortBy, setSortBy] = useState(initialSort);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState(localStorage.getItem('notesViewMode') || 'grid');
    const [selectedNotes, setSelectedNotes] = useState([]);

    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
    const [activeFolderId, setActiveFolderId] = useState(safeFilters.folder_id ? parseInt(safeFilters.folder_id) : null);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [moveTargetIds, setMoveTargetIds] = useState([]);
    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
    const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);

    useEffect(() => {
        setData('folder_id', activeFolderId || '');
    }, [activeFolderId]);

    const handleApplyFilters = (newFilters) => {
        router.get(route(isArchiveView ? 'notes.archived' : 'notes.index'), { search: searchTerm, sort: sortBy, ...newFilters }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSelectFolder = (folderId) => {
        setActiveFolderId(folderId);
        handleApplyFilters({ folder_id: folderId, tags: safeFilters.tags, date_from: safeFilters.date_from, date_to: safeFilters.date_to });
    };

    const handleTemplateSelect = (e) => {
        const value = e.target.value;
        if (value === 'manage') {
            setIsTemplateManagerOpen(true);
            return;
        }
        
        const templateId = value;
        setSelectedTemplateId(templateId);
        if (!templateId) {
            setData(prevData => ({
                ...prevData,
                content: '',
                title: ''
            }));
            return;
        }
        const template = templates.find(t => t.id == templateId);
        if (template) {
            setData(prevData => ({
                ...prevData,
                content: template.content || '',
                title: prevData.title ? prevData.title : template.name
            }));
        }
    };

    const handleClearTemplate = () => {
        setSelectedTemplateId('');
        setData(prevData => ({
            ...prevData,
            content: '',
            title: ''
        }));
    };

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

    const openMoveModal = (id) => {
        setMoveTargetIds([id]);
        setIsMoveModalOpen(true);
    };

    const handleBulkMove = () => {
        setMoveTargetIds(selectedNotes);
        setIsMoveModalOpen(true);
    };

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
            tags: note.tags.map(tag => tag.name).join(', '),
        });
    };

    const submitUpdate = (e, id) => {
        e.preventDefault();
        router.put(route('notes.update', id), editForm, {
            onSuccess: () => setEditingNoteId(null)
        });
    };

    const togglePin = (note) => {
        router.put(route('notes.update', note.id), {
            title: note.title,
            content: note.content,
            tags: note.tags.map(tag => tag.name).join(', '),
            is_pinned: !note.is_pinned
        }, { preserveScroll: true });
    };

    const toggleArchive = (note) => {
        router.put(route('notes.update', note.id), {
            title: note.title,
            content: note.content,
            tags: note.tags.map(tag => tag.name).join(', '),
            is_archived: !note.is_archived
        }, { preserveScroll: true });
    };

    const handleTagClick = (tagName) => {
        // Just set the search term to the tag name and it will auto-filter
        setSearchTerm(tagName);
    };

    const updateNoteContent = useCallback(debounce((noteId, field, newHtml) => {
        const note = notes.data.find(n => n.id === noteId);
        if (!note) return;
        
        // Use raw axios instead of Inertia router to prevent the progress bar 
        // from appearing and to avoid a full page prop refresh, making it completely silent.
        window.axios.put(route('notes.update', note.id), {
            title: note.title,
            content: field === 'content' ? newHtml : note.content,
            tags: note.tags.map(tag => tag.name).join(', '),
        }).catch(error => {
            console.error("Failed to silently update note content", error);
        });
    }, 500), [notes.data]);

    // --- Search Handling ---
    const debouncedSearch = useCallback(
        debounce((nextValue, sortValue, isArchive, currentFilters) => {
            router.get(route(isArchive ? 'notes.archived' : 'notes.index'), { ...currentFilters, search: nextValue, sort: sortValue }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300),
        []
    );

    useEffect(() => {
        if (searchTerm !== initialSearch) {
            debouncedSearch(searchTerm, sortBy, isArchiveView, safeFilters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, debouncedSearch, initialSearch, sortBy]);

    const handleSortChange = (e) => {
        const newSort = e.target.value;
        setSortBy(newSort);
        router.get(route(isArchiveView ? 'notes.archived' : 'notes.index'), { ...safeFilters, search: searchTerm, sort: newSort }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">{isArchiveView ? 'Archived Notes' : 'My Notes'}</h2>}
        >
            <Head title={isArchiveView ? 'Archived Notes' : 'My Notes'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-8">
                    <FolderSidebar 
                        folders={folders} 
                        activeFolderId={activeFolderId} 
                        onSelectFolder={handleSelectFolder} 
                        tags={tags}
                        activeTags={safeFilters.tags ? safeFilters.tags.split(',') : []}
                        onSelectTag={handleTagClick}
                        openTagManager={() => setIsTagManagerOpen(true)}
                        hideManagement={isArchiveView}
                    />
                    <div className="flex-1 min-w-0">
                    {/* --- CREATE FORM --- */}
                    {!isArchiveView && (
                        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mb-8 p-6">
                        <form onSubmit={submitCreate}>
                            <div className="flex justify-end mb-4">
                                <div className="flex gap-2 items-center">
                                    <select 
                                            value={selectedTemplateId}
                                            onChange={handleTemplateSelect} 
                                            className="text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm py-1 pl-3 pr-8"
                                        >
                                            <option value="">Use Template...</option>
                                            {templates.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                            <option disabled>──────────</option>
                                            <option value="manage">⚙️ Manage Templates...</option>
                                        </select>
                                        {selectedTemplateId && selectedTemplateId !== 'manage' && (
                                            <button type="button" onClick={handleClearTemplate} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            <div className="mb-6 relative pt-2">
                                <label className="absolute top-0 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center z-10 transition-colors uppercase tracking-wider">
                                    <TitleIcon className="w-3 h-3 mr-1.5" /> Title
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm pt-3 pb-3"
                                    placeholder="Note title..."
                                />
                                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                            </div>
                            <div className="mb-6 relative pt-2">
                                <label className="absolute top-0 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center z-10 transition-colors uppercase tracking-wider">
                                    <ContentIcon className="w-3 h-3 mr-1.5" /> Content
                                </label>
                                <RichTextEditor
                                    content={data.content}
                                    onChange={newContent => setData('content', newContent)}
                                    className="min-h-[300px]"
                                />
                                {errors.content && <div className="text-red-500 text-sm mt-1">{errors.content}</div>}
                            </div>
                            <div className="mb-6 relative pt-2">
                                <label className="absolute top-0 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center z-10 transition-colors uppercase tracking-wider">
                                    <TagsIcon className="w-3 h-3 mr-1.5" /> Tags
                                </label>
                                <TagAutocompleteInput
                                    value={data.tags}
                                    onChange={newTags => setData('tags', newTags)}
                                    tags={tags}
                                    placeholder="Select or type tags..."
                                />
                                {errors.tags && <div className="text-red-500 text-sm mt-1">{errors.tags}</div>}
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" disabled={processing} className="inline-flex items-center justify-center gap-2 bg-primary-600 dark:bg-primary-500 text-white font-semibold text-sm px-6 py-2.5 rounded-full shadow-md hover:bg-primary-700 dark:hover:bg-primary-600 hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    {processing ? 'Saving...' : 'Create Note'}
                                </button>
                            </div>
                        </form>
                    </div>

                    )}

                    {/* --- SEARCH AND TOGGLE --- */}
                    {isArchiveView ? (
                        <div className="mb-8 flex flex-wrap items-center gap-4">
                            {notes.data && notes.data.length > 0 && (
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 p-2 px-3">
                                    <input 
                                        type="checkbox" 
                                        onChange={handleSelectAll} 
                                        checked={selectedNotes.length > 0 && selectedNotes.length === notes.data.length}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" 
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">Select All</span>
                                </div>
                            )}
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search archived notes..."
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
                            <div className="flex bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 p-1 ml-auto">
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
                    ) : (
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
                                    <select
                                        value={sortBy}
                                        onChange={handleSortChange}
                                        className="w-auto sm:w-48 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
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
                            </div>

                            {/* Second Row: Search */}
                            <div className="w-full flex gap-2">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search notes..."
                                    className="flex-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
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
                            </div>
                        </div>
                    )}

                    {/* --- NOTES LIST --- */}
                    <div id="notes-list" className={`${viewMode === 'grid' ? '' : 'space-y-6'} scroll-mt-24`}>
                        {isLoading ? (
                            <div className={viewMode === 'grid' ? "columns-1 md:columns-2 lg:columns-3 gap-6" : "space-y-6"}>
                                <NoteSkeleton />
                                <NoteSkeleton />
                                <NoteSkeleton />
                                <NoteSkeleton />
                                <NoteSkeleton />
                                <NoteSkeleton />
                            </div>
                        ) : notes.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 px-4 text-center bg-white/50 dark:bg-gray-800/30 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm mt-8">
                                <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-inner">
                                    {isArchiveView ? (
                                        <Archive className="w-10 h-10 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
                                    ) : (
                                        <Notebook className="w-10 h-10 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 tracking-tight">
                                    {searchTerm ? 'No matching notes found' : isArchiveView ? 'Your archive is empty' : 'Your journal is empty'}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                                    {searchTerm ? (
                                        'We couldn\'t find any notes matching your search or filter criteria. Try adjusting your filters.'
                                    ) : isArchiveView ? (
                                        'You don\'t have any archived notes. Notes you archive will appear here, keeping your main workspace clean.'
                                    ) : (
                                        'You don\'t have any notes yet. Create your first note above to get started!'
                                    )}
                                </p>
                            </div>
                        ) : isArchiveView ? (
                            <div id="notes-list" className={`${viewMode === 'grid' ? 'columns-1 md:columns-2 lg:columns-3 gap-6' : 'space-y-6'} scroll-mt-24`}>
                                {notes.data.map((note) => (
                                    <SimpleNoteCard
                                        key={note.id}
                                        note={note}
                                        isSelected={selectedNotes.includes(note.id)}
                                        onSelect={handleSelectNote}
                                        badge={isArchiveView ? (note.archived_at ? `Archived: ${new Date(note.archived_at).toLocaleString()}` : `Archived`) : `Created: ${new Date(note.created_at).toLocaleString()}`}
                                        actions={
                                            <>
                                                <Tooltip content="Unarchive">
                                                    <button 
                                                        onClick={() => toggleArchive(note)} 
                                                        className="p-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full transition-all duration-200 border border-amber-200 dark:border-amber-800/50 shadow-sm hover:shadow"
                                                    >
                                                        <Archive className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip content="Move to Trash">
                                                    <button 
                                                        onClick={() => deleteNote(note.id)} 
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
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {viewMode === 'grid' ? (
                                    <Masonry
                                        breakpointCols={breakpointColumnsObj}
                                        className="flex w-auto -ml-6"
                                        columnClassName="pl-6 bg-clip-padding"
                                    >
                                        {notes.data.map((note) => (
                                            <NoteCard 
                                                key={note.id} 
                                                note={note} 
                                                startEditing={startEditing} 
                                                deleteNote={deleteNote}
                                                togglePin={togglePin}
                                                toggleArchive={toggleArchive}
                                                handleTagClick={handleTagClick}
                                                updateNoteContent={updateNoteContent}
                                                moveNote={openMoveModal}
                                                isSelected={selectedNotes.includes(note.id)}
                                                onSelect={handleSelectNote}
                                            />
                                        ))}
                                    </Masonry>
                                ) : (
                                    <div>
                                        {notes.data.map((note) => (
                                            <NoteCard 
                                                key={note.id} 
                                                note={note} 
                                                startEditing={startEditing} 
                                                deleteNote={deleteNote}
                                                togglePin={togglePin}
                                                toggleArchive={toggleArchive}
                                                handleTagClick={handleTagClick}
                                                updateNoteContent={updateNoteContent}
                                                moveNote={openMoveModal}
                                                isSelected={selectedNotes.includes(note.id)}
                                                onSelect={handleSelectNote}
                                            />
                                        ))}
                                    </div>
                                )}
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
                        <div className="mb-6 relative pt-2">
                            <label className="absolute top-0 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center z-10 transition-colors uppercase tracking-wider">
                                <TitleIcon className="w-3 h-3 mr-1.5" /> Title
                            </label>
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm pt-3 pb-3"
                            />
                        </div>
                        <div className="mb-6 relative pt-2">
                            <label className="absolute top-0 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center z-10 transition-colors uppercase tracking-wider">
                                <ContentIcon className="w-3 h-3 mr-1.5" /> Content
                            </label>
                            <RichTextEditor
                                content={editForm.content}
                                onChange={newContent => setEditForm({ ...editForm, content: newContent })}
                                className="min-h-[300px]"
                            />
                        </div>
                        <div className="mb-6 relative pt-2">
                            <label className="absolute top-0 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center z-10 transition-colors uppercase tracking-wider">
                                <TagsIcon className="w-3 h-3 mr-1.5" /> Tags
                            </label>
                            <TagAutocompleteInput
                                value={editForm.tags}
                                onChange={newTags => setEditForm({ ...editForm, tags: newTags })}
                                tags={tags}
                                placeholder="Select or type tags..."
                            />
                        </div>
                        <div className="flex gap-2 justify-end mt-6">
                            <button type="button" onClick={() => setEditingNoteId(null)} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-400 dark:hover:bg-gray-500">Cancel</button>
                            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700">Save Changes</button>
                        </div>
                    </form>
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
                                <div className="flex gap-2 flex-wrap">
                                    <button onClick={() => executeBulkAction('delete')} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors">Delete</button>
                                    <button onClick={() => executeBulkAction(isArchiveView ? 'unarchive' : 'archive')} className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors">{isArchiveView ? 'Unarchive' : 'Archive'}</button>
                                    <button onClick={handleBulkMove} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors">Move</button>
                                    <button onClick={() => setIsBulkTagModalOpen(true)} className="text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors">Tag</button>
                                    <button onClick={() => executeBulkAction('pin')} className="text-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors">Pin</button>
                                    <button onClick={() => executeBulkAction('unpin')} className="text-gray-500 hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors">Unpin</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AdvancedFilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                filters={safeFilters}
                onApply={handleApplyFilters}
                folders={folders}
                dateLabelPrefix={isArchiveView ? "Archived" : "Created"}
            />

            <TemplateManagerModal 
                isOpen={isTemplateManagerOpen} 
                onClose={() => setIsTemplateManagerOpen(false)} 
                templates={templates} 
            />

            <MoveNotesModal
                isOpen={isMoveModalOpen}
                onClose={(success) => {
                    setIsMoveModalOpen(false);
                    if (success) setSelectedNotes([]);
                }}
                selectedIds={moveTargetIds}
                folders={folders}
            />

            <TagManagerModal
                isOpen={isTagManagerOpen}
                onClose={() => setIsTagManagerOpen(false)}
                tags={tags}
            />

            <BulkTagModal
                isOpen={isBulkTagModalOpen}
                onClose={(success) => {
                    setIsBulkTagModalOpen(false);
                    if (success) setSelectedNotes([]);
                }}
                selectedIds={selectedNotes}
                tags={tags}
            />
        </AuthenticatedLayout>
    );
}
