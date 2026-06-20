import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '@/Components/Pagination';
import Tooltip from '@/Components/Tooltip';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Dropdown from '@/Components/Dropdown';
import useTableColumns from '@/Hooks/useTableColumns';
import ColumnSelector from '@/Components/ColumnSelector';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const DatabaseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>);
const MoreVerticalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);

const getAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&color=7F9CF5&background=EBF4FF`;

const getLengthBadge = (content) => {
    const text = content ? content.replace(/<[^>]*>?/gm, '') : '';
    const len = text.length;
    if (len < 200) return { label: 'Short', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    if (len < 1000) return { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    return { label: 'Long', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
};

export default function Notes({ notes, filters, analyticsData }) {
    const [searchNotes, setSearchNotes] = useState(filters?.search_notes || '');
    const [viewMode, setViewMode] = useState(localStorage.getItem('adminNotesViewMode') || 'table');
    const [expandedRow, setExpandedRow] = useState(null);
    const [confirmingNoteDeletion, setConfirmingNoteDeletion] = useState(null);
    const { visibleColumns, toggleColumn } = useTableColumns('admin_notes', [
        { id: 'note_info', label: 'Note Info' },
        { id: 'author', label: 'Author' },
        { id: 'created_at', label: 'Created At' },
        { id: 'actions', label: 'Actions' }
    ]);

    const currentSortValue = `${filters?.sort || 'created_at'}-${filters?.direction || 'desc'}`;
    const [sortValue, setSortValue] = useState(currentSortValue);

    useEffect(() => {
        localStorage.setItem('adminNotesViewMode', viewMode);
    }, [viewMode]);

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

    const handleSortChange = (e) => {
        const val = e.target.value;
        setSortValue(val);
        const [field, direction] = val.split('-');
        
        router.get(route('admin.notes'), { 
            ...filters, 
            search_notes: searchNotes, 
            sort: field, 
            direction: direction 
        }, { 
            preserveState: true, 
            replace: true, 
            preserveScroll: true,
            only: ['notes', 'filters'] 
        });
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
        <AuthenticatedLayout header={<h2 className="font-bold text-2xl text-slate-800 dark:text-slate-100 leading-tight">Admin - All Notes</h2>}>
            <Head title="Admin Notes" />
            
            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-transparent min-h-screen">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4"
                >
                    <div>
                        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
                            <DatabaseIcon /> <span className="ml-3">Notes Management</span>
                        </h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            View and manage all notes posted by users across the platform.
                        </p>
                    </div>
                </motion.div>

                {/* Analytics Dashboard */}
                {analyticsData && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Note Lengths Chart */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-6 relative overflow-hidden">
                            <div className="w-1/2 h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analyticsData.lengths}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill="#10b981" /> {/* Emerald (Short) */}
                                            <Cell fill="#3b82f6" /> {/* Blue (Medium) */}
                                            <Cell fill="#a855f7" /> {/* Purple (Long) */}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                                            itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 space-y-3 relative z-10">
                                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Length Distribution</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> Short ({analyticsData.lengths[0].value})
                                    </li>
                                    <li className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> Medium ({analyticsData.lengths[1].value})
                                    </li>
                                    <li className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span> Long ({analyticsData.lengths[2].value})
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Top Authors Podium */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6 text-center">Top Contributors</h4>
                            <div className="flex justify-center items-end gap-2 sm:gap-6">
                                {analyticsData.topAuthors.map((author, index) => {
                                    // Order them visually: 2nd place, 1st place, 3rd place
                                    let visualOrder = index === 0 ? 'order-2 scale-110 -translate-y-4' : (index === 1 ? 'order-1' : 'order-3');
                                    let trophyColor = index === 0 ? 'text-yellow-400' : (index === 1 ? 'text-slate-400' : 'text-amber-600');
                                    
                                    return (
                                        <div key={author.id} className={`flex flex-col items-center ${visualOrder} transition-transform`}>
                                            <div className="relative mb-2">
                                                <img src={getAvatar(author.name)} alt={author.name} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-md" />
                                                <div className={`absolute -top-2 -right-2 bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm ${trophyColor}`}>
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.5 3a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zM4 6a2 2 0 00-2 2v2a2 2 0 002 2h2.5A2.5 2.5 0 009 14.5v1.75A2.75 2.75 0 0011.75 19h1.5A2.75 2.75 0 0016 16.25v-1.75A2.5 2.5 0 0018.5 12h2.5a2 2 0 002-2V8a2 2 0 00-2-2h-17zM6 10H4V8h2v2zm12 0h-2V8h2v2z" clipRule="evenodd" /></svg>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-16 truncate text-center">{author.name}</span>
                                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full mt-1">
                                                {author.notes_count} Notes
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Controls */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full"
                >
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <input 
                            type="text" 
                            placeholder="Search notes or authors..." 
                            value={searchNotes}
                            onChange={(e) => setSearchNotes(e.target.value)}
                            className="flex-1 min-w-[200px] md:flex-none md:w-64 px-4 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-shadow placeholder-slate-400"
                        />
                        <select
                            value={sortValue}
                            onChange={handleSortChange}
                            className="w-auto bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="created_at-desc">Newest First</option>
                            <option value="created_at-asc">Oldest First</option>
                            <option value="title-asc">Title (A-Z)</option>
                            <option value="title-desc">Title (Z-A)</option>
                            <option value="author-asc">Author (A-Z)</option>
                            <option value="author-desc">Author (Z-A)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 ml-auto w-full lg:w-auto justify-end">
                        <div className="flex bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-300 dark:border-slate-700 p-1">
                            {viewMode === 'table' && (
                                <div className="border-r border-slate-200 dark:border-slate-700 pr-1 mr-1 flex items-center">
                                    <ColumnSelector 
                                        columns={[
                                            { id: 'note_info', label: 'Note Info' },
                                            { id: 'author', label: 'Author' },
                                            { id: 'created_at', label: 'Created At' },
                                            { id: 'actions', label: 'Actions' }
                                        ]}
                                        visibleColumns={visibleColumns}
                                        toggleColumn={toggleColumn}
                                    />
                                </div>
                            )}
                            <Tooltip content="Table View">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                                </button>
                            </Tooltip>
                            <Tooltip content="Grid View">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </motion.div>

                {/* Content Area */}
                {notes.data.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400">No notes found.</p>
                    </div>
                ) : viewMode === 'table' ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 w-full"
                    >
                        <div className="overflow-x-auto w-full min-h-[300px]">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
                                <tr>
                                    {visibleColumns.includes('note_info') && <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Note Info</th>}
                                    {visibleColumns.includes('author') && <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Author</th>}
                                    {visibleColumns.includes('created_at') && <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created At</th>}
                                    {visibleColumns.includes('actions') && <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {notes.data.map((note, index) => {
                                    const isExpanded = expandedRow === note.id;
                                    const authorName = note.user ? note.user.name : 'Unknown';
                                    const badge = getLengthBadge(note.content);
                                    
                                    return (
                                        <React.Fragment key={note.id}>
                                            <tr 
                                                onClick={() => setExpandedRow(isExpanded ? null : note.id)}
                                                className={`cursor-pointer transition-colors ${isExpanded ? 'bg-primary-50/50 dark:bg-primary-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                            >
                                                {visibleColumns.includes('note_info') && <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${badge.color}`}>
                                                            {badge.label}
                                                        </span>
                                                        <span className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{note.title}</span>
                                                    </div>
                                                </td>}
                                                {visibleColumns.includes('author') && <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={getAvatar(authorName)} alt={authorName} className="w-8 h-8 rounded-full shadow-sm" />
                                                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">{authorName}</span>
                                                    </div>
                                                </td>}
                                                {visibleColumns.includes('created_at') && <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {new Date(note.created_at).toLocaleDateString()}
                                                </td>}
                                                {visibleColumns.includes('actions') && <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <Dropdown>
                                                        <Dropdown.Trigger>
                                                            <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                                                <MoreVerticalIcon />
                                                            </button>
                                                        </Dropdown.Trigger>
                                                        <Dropdown.Content align={index >= notes.data.length - 2 && notes.data.length > 2 ? 'top-right' : 'right'}>
                                                            <button
                                                                onClick={() => setExpandedRow(isExpanded ? null : note.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                            >
                                                                {isExpanded ? 'Close Details' : 'View Details'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(note.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center"
                                                            >
                                                                <TrashIcon /> <span className="ml-2">Delete Note</span>
                                                            </button>
                                                        </Dropdown.Content>
                                                    </Dropdown>
                                                </td>}
                                            </tr>
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan={visibleColumns.length || 1} className="p-0 border-0">
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 border-y border-slate-100 dark:border-slate-700/50 shadow-inner"
                                                            >
                                                                <div className="p-8 prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: note.content }} />
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                        </div>
                        {notes && notes.links && notes.data.length > 0 && (
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-center">
                                <Pagination links={notes.links} only={['notes']} />
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
                    >
                        {notes.data.map((note, index) => {
                            const authorName = note.user ? note.user.name : 'Unknown';
                            const badge = getLengthBadge(note.content);

                            return (
                                <div key={note.id} className="break-inside-avoid bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 hover:-translate-y-1 transition-transform duration-300 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider mb-2 inline-block ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{note.title}</h4>
                                        </div>
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button className="p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
                                                    <MoreVerticalIcon />
                                                </button>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content align={index >= notes.data.length - 2 && notes.data.length > 2 ? 'top-right' : 'right'}>
                                                <button
                                                    onClick={() => handleDelete(note.id)}
                                                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center"
                                                >
                                                    <TrashIcon /> <span className="ml-2">Delete Note</span>
                                                </button>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                    <div className="prose dark:prose-invert text-sm text-slate-600 dark:text-slate-300 line-clamp-6 mb-6" dangerouslySetInnerHTML={{ __html: note.content }} />
                                    
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center gap-2">
                                            <img src={getAvatar(authorName)} alt={authorName} className="w-6 h-6 rounded-full shadow-sm" />
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{authorName}</span>
                                        </div>
                                        <span className="text-xs text-slate-400">{new Date(note.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Grid Pagination */}
                {viewMode === 'grid' && notes && notes.links && notes.data.length > 0 && (
                    <div className="mt-12 flex justify-center">
                        <div className="bg-white dark:bg-slate-800 rounded-full px-6 py-3 shadow-lg border border-slate-200 dark:border-slate-700">
                            <Pagination links={notes.links} only={['notes']} />
                        </div>
                    </div>
                )}
            </div>

            <Modal show={!!confirmingNoteDeletion} onClose={() => setConfirmingNoteDeletion(null)}>
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                        Delete this note?
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                        This action cannot be undone. This will permanently remove the note from the database.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmingNoteDeletion(null)}>Cancel</SecondaryButton>
                        <DangerButton onClick={executeDelete}>Delete Note</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
