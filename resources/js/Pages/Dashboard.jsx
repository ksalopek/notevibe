import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { repackLayout } from '@/utils/gridLayoutUtils';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Tooltip from '@/Components/Tooltip';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import RichTextEditor from '@/Components/RichTextEditor';
import { Responsive as ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import useTableColumns from '@/Hooks/useTableColumns';
import ColumnSelector from '@/Components/ColumnSelector';
import { downloadCSV } from '@/utils/csvUtils';
import { Download, List, Table } from 'lucide-react';

// SVG Icons
const TitleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ContentIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>;
const EditIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-6 h-6"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const FileTextIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>);
const TagsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const HashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>);
const GripVerticalIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>);
const ActivityIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const SlidersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="4" x2="14" y2="4"></line><line x1="10" y1="4" x2="3" y2="4"></line><line x1="21" y1="12" x2="12" y2="12"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="20" x2="16" y2="20"></line><line x1="12" y1="20" x2="3" y2="20"></line><line x1="14" y1="2" x2="14" y2="6"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="22"></line></svg>);
const SparklesIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>);

function DraggableWidgetWrapper({ children, className }) {
    return (
        <div className={`relative w-full h-full group ${className || ''}`}>
            {children}
        </div>
    );
}

const SlideoutReorderItem = ({ widget, enabled, onToggle }) => {
    const dragControls = useDragControls();

    return (
        <Reorder.Item 
            value={widget} 
            dragListener={false} 
            dragControls={dragControls} 
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors shadow-sm"
        >
            <div className="flex items-center">
                <div 
                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 mr-2 touch-none"
                    onPointerDown={(e) => dragControls.start(e)}
                    style={{ touchAction: 'none' }}
                >
                    <GripVerticalIcon className="text-gray-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{widget.title}</span>
            </div>
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onToggle(widget.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </Reorder.Item>
    );
};

const QuickDraftWidget = () => {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        content: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('notes.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-100/50 dark:border-gray-700/50 h-full hover:shadow-2xl transition-shadow duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-4 pr-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <span className="mr-2 text-primary-500"><EditIcon className="w-6 h-6" /></span>
                    Quick Draft
                </h3>
            </div>
            <form onSubmit={submit} className="flex flex-col flex-1 gap-3 h-full">
                <div>
                    <input
                        type="text"
                        value={data.title}
                        onChange={e => setData('title', e.target.value)}
                        placeholder="Note title..."
                        className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                        required
                    />
                    {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                    <textarea
                        value={data.content}
                        onChange={e => setData('content', e.target.value)}
                        placeholder="Jot down a quick thought..."
                        className="w-full h-full flex-1 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                        required
                    />
                    {errors.content && <div className="text-red-500 text-xs mt-1">{errors.content}</div>}
                </div>
                <div className="flex justify-end pt-1 shrink-0">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-full hover:bg-primary-500 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Saving...' : 'Save Draft'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const MetricTotalNotesWidget = ({ stats }) => (
    <div className="block h-full">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100/50 dark:border-gray-700/50 h-full hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg"><FileTextIcon /></div>
                <p className="text-sm font-medium uppercase tracking-wider">Total Notes</p>
            </div>
            <div>
                <h4 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white tracking-tight">
                    <CountUp end={stats?.totalNotes || 0} duration={2} separator="," />
                </h4>
            </div>
        </div>
    </div>
);

const MetricUniqueTagsWidget = ({ stats }) => (
    <div className="block h-full">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100/50 dark:border-gray-700/50 h-full hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-lg"><TagsIcon /></div>
                <p className="text-sm font-medium uppercase tracking-wider">Unique Tags</p>
            </div>
            <div>
                <h4 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white tracking-tight">
                    <CountUp end={stats?.totalTags || 0} duration={2} separator="," />
                </h4>
            </div>
        </div>
    </div>
);

const MetricInTrashWidget = ({ stats }) => (
    <div className="block h-full">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100/50 dark:border-gray-700/50 h-full hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg"><TrashIcon /></div>
                <p className="text-sm font-medium uppercase tracking-wider">In Trash</p>
            </div>
            <div>
                <h4 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white tracking-tight">
                    <CountUp end={stats?.trashedNotes || 0} duration={2} separator="," />
                </h4>
            </div>
        </div>
    </div>
);

const RecentNotesWidget = ({ recentNotes, onEdit }) => {
    const [viewMode, setViewMode] = useState(localStorage.getItem('dashboard_recent_notes_viewMode') || 'list');
    
    const { visibleColumns, toggleColumn } = useTableColumns('dashboard_recent_notes', [
        { id: 'title', label: 'Title' },
        { id: 'content', label: 'Preview' },
        { id: 'tags', label: 'Tags' },
        { id: 'word_count', label: 'Word Count' },
        { id: 'created_at', label: 'Created At' },
        { id: 'updated_at', label: 'Last Updated' }
    ]);

    const handleExport = () => {
        const exportData = recentNotes.map(n => ({
            Title: n.title,
            Preview: n.content?.replace(/(<([^>]+)>)/gi, "").substring(0, 50) + '...',
            Tags: n.tags ? n.tags.map(t => t.name).join(' | ') : '',
            'Word Count': n.content ? n.content.replace(/(<([^>]+)>)/gi, "").split(/\s+/).filter(w => w.length > 0).length : 0,
            'Created At': new Date(n.created_at).toLocaleString(),
            'Last Updated': new Date(n.updated_at).toLocaleString()
        }));
        downloadCSV(exportData, 'recent_notes.csv');
    };

    const handleViewChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('dashboard_recent_notes_viewMode', mode);
    };

    return (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-100/50 dark:border-gray-700/50 h-full hover:shadow-2xl transition-shadow duration-300 flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 pr-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <span className="mr-2 text-primary-500"><ClockIcon /></span>
                    Recent Notes
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                    {viewMode === 'table' && (
                        <div className="flex items-center gap-2 mr-2">
                            <ColumnSelector 
                                columns={[
                                    { id: 'title', label: 'Title' },
                                    { id: 'content', label: 'Preview' },
                                    { id: 'tags', label: 'Tags' },
                                    { id: 'word_count', label: 'Word Count' },
                                    { id: 'created_at', label: 'Created At' },
                                    { id: 'updated_at', label: 'Last Updated' }
                                ]}
                                visibleColumns={visibleColumns}
                                toggleColumn={toggleColumn}
                            />
                            <Tooltip content="Export CSV">
                                <button 
                                    onClick={handleExport}
                                    className="inline-flex items-center justify-center p-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 shrink-0 shadow-sm hover:shadow-md"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </Tooltip>
                        </div>
                    )}
                    
                    <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 mr-2">
                        <Tooltip content="List View">
                            <button
                                onClick={() => handleViewChange('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </Tooltip>
                        <Tooltip content="Table View">
                            <button
                                onClick={() => handleViewChange('table')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                <Table className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    </div>


                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    {!recentNotes || recentNotes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No notes yet. Start writing!
                        </div>
                    ) : (
                        recentNotes.map(note => (
                            <div key={note.id} onClick={() => onEdit(note)} className="block group/note cursor-pointer">
                                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 shadow-sm hover:shadow-md">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover/note:text-primary-600 dark:group-hover/note:text-primary-400 transition-colors">
                                            {note.title}
                                        </h4>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(note.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {note.content?.replace(/(<([^>]+)>)/gi, "") || "No content"}
                                    </p>
                                    {note.tags && note.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {note.tags.map(tag => (
                                                <span key={tag.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto flex-1 w-full min-w-0">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                {visibleColumns.includes('title') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>}
                                {visibleColumns.includes('content') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preview</th>}
                                {visibleColumns.includes('tags') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</th>}
                                {visibleColumns.includes('word_count') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Words</th>}
                                {visibleColumns.includes('created_at') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>}
                                {visibleColumns.includes('updated_at') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {!recentNotes || recentNotes.length === 0 ? (
                                <tr><td colSpan="6" className="px-3 py-8 text-center text-gray-500">No recent notes.</td></tr>
                            ) : (
                                recentNotes.map(note => (
                                    <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        {visibleColumns.includes('title') && <td className="px-3 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium whitespace-normal break-words">
                                            {note.title}
                                        </td>}
                                        {visibleColumns.includes('content') && <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                            {note.content?.replace(/(<([^>]+)>)/gi, "") || "No content"}
                                        </td>}
                                        {visibleColumns.includes('tags') && <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {note.tags && note.tags.length > 0 ? note.tags.map(t => t.name).join(', ') : '-'}
                                        </td>}
                                        {visibleColumns.includes('word_count') && <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {note.content ? note.content.replace(/(<([^>]+)>)/gi, "").split(/\s+/).filter(w => w.length > 0).length : 0}
                                        </td>}
                                        {visibleColumns.includes('created_at') && <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </td>}
                                        {visibleColumns.includes('updated_at') && <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {new Date(note.updated_at).toLocaleDateString()}
                                        </td>}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const TopTagsWidget = ({ topTags }) => (
    <div className="bg-gradient-to-br from-primary-500 to-indigo-600 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300 text-white h-full relative flex flex-col">
        <div className="flex items-center mb-6 pr-10">
            <span className="mr-2 text-primary-100"><HashIcon /></span>
            <h3 className="text-xl font-bold">Top Tags</h3>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {!topTags || topTags.length === 0 ? (
                <div className="text-primary-100 py-4 text-sm">
                    No tags created yet.
                </div>
            ) : (
                topTags.map((tag, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-3 backdrop-blur-sm">
                        <span className="font-medium">{tag.name}</span>
                        <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold">
                            {tag.count}
                        </span>
                    </div>
                ))
            )}
        </div>
        
        <div className="mt-8 text-sm text-primary-100/80">
            Organize your thoughts efficiently by tagging your notes.
        </div>
    </div>
);

const ActivityChartWidget = ({ chartData, noteDays, onNoteDaysChange }) => (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-100/50 dark:border-gray-700/50 h-full hover:shadow-2xl transition-shadow duration-300 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pr-10 gap-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="mr-2 text-primary-500"><ActivityIcon /></span>
                Note Activity (Last {noteDays} Days)
            </h3>
            <select
                value={noteDays}
                onChange={onNoteDaysChange}
                className="w-full sm:w-auto text-sm bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={21}>21 Days</option>
                <option value={30}>30 Days</option>
            </select>
        </div>
        <div className="w-full h-[300px] lg:flex-1 lg:h-auto lg:min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" allowDecimals={false} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f3f4f6' }}
                        itemStyle={{ color: '#f3f4f6' }}
                    />
                    <Line type="monotone" dataKey="notes" name="Notes Written" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default function Dashboard({ recentNotes, stats, allTags, chartData, filters }) {
    const { auth } = usePage().props;
    const [greeting, setGreeting] = useState('');
    const [showTagsModal, setShowTagsModal] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', tags: '' });
    
    const [noteDays, setNoteDays] = useState(filters?.note_days || 7);
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.matchMedia('(max-width: 1023px)').matches : false
    );

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(max-width: 1023px)');
            const handler = (e) => setIsMobile(e.matches);
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, []);
    
    const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');

    const handleNoteDaysChange = (e) => {
        const days = e.target.value;
        setNoteDays(days);
        router.get(route('dashboard'), { note_days: days }, { preserveState: true, preserveScroll: true, only: ['chartData', 'filters'] });
    };

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    const { width: containerWidth, containerRef } = useContainerWidth();
    const defaultLayout = [
        { i: 'metric_total', x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
        { i: 'metric_tags', x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
        { i: 'metric_trash', x: 2, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
        { i: 'quick_draft', x: 0, y: 1, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'activity_chart', x: 1, y: 1, w: 2, h: 2, minW: 2, minH: 1 },
        { i: 'recent', x: 0, y: 3, w: 2, h: 2, minW: 1, minH: 1 },
        { i: 'tags', x: 2, y: 3, w: 1, h: 2, minW: 1, minH: 1 }
    ];
    
    const [layouts, setLayouts] = useState(() => {
        try {
            const saved = localStorage.getItem('user_dashboard_layout_v11');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse dashboard layout', e);
        }
        return { lg: defaultLayout, md: defaultLayout, sm: defaultLayout };
    });

    const defaultAvailableWidgets = [
        { id: 'metric_total', title: 'Total Notes' },
        { id: 'metric_tags', title: 'Unique Tags' },
        { id: 'metric_trash', title: 'In Trash' },
        { id: 'quick_draft', title: 'Quick Draft' },
        { id: 'activity_chart', title: 'Note Activity' },
        { id: 'recent', title: 'Recent Notes' },
        { id: 'tags', title: 'Top Tags' },
    ];

    const [availableWidgets, setAvailableWidgets] = useState(() => {
        try {
            const saved = localStorage.getItem('user_dashboard_widgets_v7');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return defaultAvailableWidgets;
    });

    // Sync widgets to backend
    const syncWidgetsToBackend = (widgetsToSync) => {
        axios.post(route('profile.widgets'), { widgets: widgetsToSync })
            .catch(err => console.error('Failed to sync widget preferences', err));
    };

    // Sync on initial load to ensure backend is up to date
    useEffect(() => {
        syncWidgetsToBackend(availableWidgets);
    }, []);

    const handleReorderWidgets = (newOrder) => {
        setAvailableWidgets(newOrder);
        localStorage.setItem('user_dashboard_widgets_v7', JSON.stringify(newOrder));
        syncWidgetsToBackend(newOrder);
        
        const activeWidgets = newOrder.filter(w => w.isVisible !== false);
        
        const filterLayout = (layout) => layout.filter(item => activeWidgets.find(w => w.id === item.i));
        
        const newLayouts = {
            lg: repackLayout(activeWidgets, filterLayout(layouts.lg), 4),
            md: repackLayout(activeWidgets, filterLayout(layouts.md), 3),
            sm: repackLayout(activeWidgets, filterLayout(layouts.sm), 2),
        };
        handleLayoutChange(newLayouts.lg, newLayouts);
    };

    const isWidgetEnabled = (id) => {
        const widget = availableWidgets.find(w => w.id === id);
        return widget ? (widget.isVisible !== false) : true;
    };

    const handleToggleWidget = (id) => {
        const isEnabling = !isWidgetEnabled(id);
        const newOrder = availableWidgets.map(w => 
            w.id === id ? { ...w, isVisible: isEnabling } : w
        );
        
        setAvailableWidgets(newOrder);
        localStorage.setItem('user_dashboard_widgets_v7', JSON.stringify(newOrder));
        syncWidgetsToBackend(newOrder);

        if (!isEnabling) {
            // Removing
            const newLayouts = {
                lg: layouts.lg.filter(item => item.i !== id),
                md: layouts.md.filter(item => item.i !== id),
                sm: layouts.sm.filter(item => item.i !== id),
            };
            handleLayoutChange(newLayouts.lg, newLayouts);
            localStorage.setItem('user_dashboard_layout_v11', JSON.stringify(newLayouts));
        } else {
            const y = Math.max(0, ...layouts.lg.map(item => item.y + item.h));
            const newItem = { i: id, x: 0, y, w: 1, h: 1, minW: 1, minH: 1 };
            
            if (['activity_chart'].includes(id)) {
                newItem.w = 3; newItem.h = 2;
            } else if (['recent'].includes(id)) {
                newItem.w = 2; newItem.h = 2;
            } else if (['quick_draft'].includes(id)) {
                newItem.w = 1; newItem.h = 2;
            } else if (['tags'].includes(id)) {
                newItem.w = 1; newItem.h = 2;
            }

            const newLayouts = {
                lg: repackLayout(availableWidgets, [...layouts.lg, newItem], 3),
                md: repackLayout(availableWidgets, [...layouts.md, newItem], 2),
                sm: repackLayout(availableWidgets, [...layouts.sm, newItem], 1),
            };
            handleLayoutChange(newLayouts.lg, newLayouts);
        }
    };

    const handleLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
        localStorage.setItem('user_dashboard_layout_v11', JSON.stringify(allLayouts));
    };

    const startEditing = (note) => {
        setEditingNoteId(note.id);
        setEditForm({
            title: note.title,
            content: note.content,
            tags: note.tags ? note.tags.map(tag => tag.name).join(', ') : '',
        });
    };

    const submitUpdate = (e, id) => {
        e.preventDefault();
        router.put(route('notes.update', id), editForm, {
            onSuccess: () => setEditingNoteId(null)
        });
    };

    const renderWidget = (id) => {
        switch (id) {
            case 'metric_total':
                return <MetricTotalNotesWidget stats={stats} />;
            case 'metric_tags':
                return <MetricUniqueTagsWidget stats={stats} />;
            case 'metric_trash':
                return <MetricInTrashWidget stats={stats} />;
            case 'activity_chart':
                return <ActivityChartWidget chartData={chartData} noteDays={noteDays} onNoteDaysChange={handleNoteDaysChange} />;
            case 'quick_draft':
                return <QuickDraftWidget />;
            case 'recent':
                return <RecentNotesWidget recentNotes={recentNotes} onEdit={startEditing} />;
            case 'tags':
                // Only take top 10 for the widget display
                const topTags = allTags ? allTags.slice(0, 10) : [];
                return <TopTagsWidget topTags={topTags} />;
            default:
                return null;
        }
    };

    // We no longer need getColSpan since react-grid-layout handles sizing through 'w' and 'h' in layout

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center w-full gap-4">
                    <h2 className="text-2xl font-bold leading-tight text-gray-800 dark:text-gray-200">
                        Dashboard
                    </h2>
                    <Tooltip content="Customize Layout">
                        <button 
                            onClick={() => setIsCustomizeOpen(true)}
                            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                        >
                            <SlidersIcon />
                        </button>
                    </Tooltip>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                

                {/* Premium Greeting Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-10 relative overflow-hidden rounded-[2rem] shadow-2xl group w-full"
                >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-700 transition-all duration-700 group-hover:scale-105"></div>
                    
                    {/* Glassmorphism / Lighting effects */}
                    <div className="absolute -right-32 -top-32 w-96 h-96 bg-white/20 rounded-full blur-[80px] group-hover:bg-white/30 transition-all duration-700 mix-blend-overlay"></div>
                    <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-primary-400/30 rounded-full blur-[80px] group-hover:bg-primary-300/40 transition-all duration-700 mix-blend-overlay"></div>
                    
                    {/* Border & Overlay */}
                    <div className="absolute inset-0 border border-white/20 rounded-[2rem]"></div>
                    <div className="absolute inset-0 bg-black/10 dark:bg-black/30 backdrop-blur-[2px]"></div>

                    <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between z-10">
                        <div>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center space-x-2 bg-white/20 dark:bg-black/20 rounded-full px-4 py-1.5 mb-5 backdrop-blur-md border border-white/20 shadow-sm"
                            >
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                <span className="text-[11px] font-bold text-white tracking-widest uppercase drop-shadow-sm">Workspace Active</span>
                            </motion.div>
                            
                            <motion.h3 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-md"
                            >
                                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-100 to-white">{auth.user.name}</span>!
                            </motion.h3>
                            
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-primary-50 text-base sm:text-lg max-w-xl leading-relaxed drop-shadow-sm font-medium"
                            >
                                Welcome to your personal command center. Here's an overview of your notes today. Use the customize button to tailor your dashboard layout.
                            </motion.p>
                        </div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                            className="mt-6 sm:mt-0 hidden md:flex items-center justify-center relative"
                        >
                            <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full"></div>
                            <div className="relative p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transform hover:scale-110 hover:-rotate-6 transition-all duration-500 group-hover:bg-white/20">
                                <SparklesIcon className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>


                {isMobile ? (
                    <div className="flex flex-col gap-6">
                        {availableWidgets.filter(w => isWidgetEnabled(w.id)).map(widget => (
                            <div key={widget.id} className="w-full">
                                <DraggableWidgetWrapper>
                                    {renderWidget(widget.id)}
                                </DraggableWidgetWrapper>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div ref={containerRef}>
                        <ResponsiveGridLayout
                            key="desktop"
                            width={containerWidth}
                            className="layout pb-12"
                            layouts={{
                                lg: layouts.lg.map(item => ({ ...item, isDraggable: false })),
                                md: layouts.md?.map(item => ({ ...item, isDraggable: false })) || [],
                                sm: layouts.sm?.map(item => ({ ...item, isDraggable: false })) || [],
                                xs: layouts.xs?.map(item => ({ ...item, isDraggable: false })) || [],
                                xxs: layouts.xxs?.map(item => ({ ...item, isDraggable: false })) || []
                            }}
                            onLayoutChange={handleLayoutChange}
                            onBreakpointChange={(bp) => setCurrentBreakpoint(bp)}
                            isDraggable={false}
                            onDragStart={() => { window.__isDraggingWidget = true; }}
                            onDragStop={() => { setTimeout(() => { window.__isDraggingWidget = false; }, 100); }}
                            onResizeStart={() => { window.__isDraggingWidget = true; }}
                            onResizeStop={() => { setTimeout(() => { window.__isDraggingWidget = false; }, 100); }}
                            breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 }}
                            cols={{ lg: 3, md: 2, sm: 1, xs: 1, xxs: 1 }}
                            rowHeight={150}
                            containerPadding={[0, 0]}
                            margin={[32, 32]}
                        >
                        {layouts.lg.map(item => (
                            <div key={item.i} className="h-full">
                                <DraggableWidgetWrapper>
                                    {renderWidget(item.i)}
                                </DraggableWidgetWrapper>
                            </div>
                        ))}
                        </ResponsiveGridLayout>
                    </div>
                )}

            </div>

            <Modal show={showTagsModal} onClose={() => setShowTagsModal(false)} maxWidth="2xl">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                            <span className="mr-2 text-primary-500"><TagsIcon /></span>
                            All Unique Tags
                        </h2>
                        <span className="bg-primary-100 text-primary-800 text-sm font-semibold px-3 py-1 rounded-full dark:bg-primary-900/50 dark:text-primary-300">
                            {allTags?.length || 0} Total
                        </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto pr-2">
                        {!allTags || allTags.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No tags have been created yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {allTags.map((tag, idx) => (
                                    <Link key={idx} href={route('notes.index', { search: tag.name })} className="block">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 transition-colors p-3 rounded-xl flex justify-between items-center group cursor-pointer shadow-sm hover:shadow">
                                            <span className="text-gray-800 dark:text-gray-200 font-medium truncate pr-2 group-hover:text-primary-700 dark:group-hover:text-primary-400">
                                                {tag.name}
                                            </span>
                                            <span className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-md shadow-sm border border-gray-100 dark:border-gray-700 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                                {tag.count}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowTagsModal(false)}>
                            Close
                        </SecondaryButton>
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
                                className="min-h-[300px]"
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

            {/* Slideout Drawer */}
            {isCustomizeOpen && (
                <div className="fixed top-0 left-0 right-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] sm:bottom-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsCustomizeOpen(false)}></div>
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-80 bg-white dark:bg-gray-800 h-full shadow-2xl relative z-10 flex flex-col border-l border-gray-200 dark:border-gray-700"
                    >
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                <SlidersIcon /> <span className="ml-2">Customize</span>
                            </h3>
                            <button onClick={() => setIsCustomizeOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <motion.div layoutScroll className="px-6 pb-6 overflow-y-auto flex-1">
                            <div className="pt-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Toggle widgets on or off and drag them to reorder your dashboard layout.
                                </p>
                                <Reorder.Group axis="y" values={availableWidgets} onReorder={handleReorderWidgets} className="flex flex-col gap-3">
                                    {availableWidgets.map((widget) => (
                                        <SlideoutReorderItem 
                                            key={widget.id} 
                                            widget={widget} 
                                            enabled={isWidgetEnabled(widget.id)} 
                                            onToggle={handleToggleWidget} 
                                        />
                                    ))}
                                </Reorder.Group>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
