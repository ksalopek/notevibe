import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Tooltip from '@/Components/Tooltip';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import RichTextEditor from '@/Components/RichTextEditor';
import { Responsive as ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';

// SVG Icons
const TitleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ContentIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>;
const NotesIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const FileTextIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>);
const TagsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const HashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>);
const GripVerticalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>);
const ActivityIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>);

function DraggableWidgetWrapper({ children, className }) {
    return (
        <div 
            className={`h-full relative group ${className || ''}`}
            onClickCapture={(e) => {
                if (window.__isDraggingWidget) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }}
        >
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip content="Drag to move">
                    <div 
                        className="p-2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm dashboard-drag-handle"
                    >
                        <GripVerticalIcon />
                    </div>
                </Tooltip>
            </div>
            {children}
        </div>
    );
}

const MetricTotalNotesWidget = ({ stats }) => (
    <div className="block h-full">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md overflow-hidden shadow-lg rounded-3xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4 h-full">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400">
                <FileTextIcon />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Notes</p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                    <CountUp end={stats?.totalNotes || 0} duration={2} separator="," />
                </h4>
            </div>
        </div>
    </div>
);

const MetricUniqueTagsWidget = ({ stats }) => (
    <div className="block h-full">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md overflow-hidden shadow-lg rounded-3xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4 h-full">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-xl text-primary-600 dark:text-primary-400">
                <TagsIcon />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Tags</p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                    <CountUp end={stats?.totalTags || 0} duration={2} separator="," />
                </h4>
            </div>
        </div>
    </div>
);

const MetricInTrashWidget = ({ stats }) => (
    <div className="block h-full">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md overflow-hidden shadow-lg rounded-3xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4 h-full">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl text-red-600 dark:text-red-400">
                <TrashIcon />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Trash</p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                    <CountUp end={stats?.trashedNotes || 0} duration={2} separator="," />
                </h4>
            </div>
        </div>
    </div>
);

const RecentNotesWidget = ({ recentNotes, onEdit }) => (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-100/50 dark:border-gray-700/50 h-full hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300 flex flex-col">
        <div className="flex items-center justify-between mb-6 pr-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="mr-2 text-primary-500"><ClockIcon /></span>
                Recent Notes
            </h3>
            <Link 
                href={route('notes.index')} 
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-primary-700 bg-primary-100 dark:bg-primary-900/50 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-900 transition-colors duration-200 shadow-sm hover:shadow"
            >
                View all <span className="ml-2">&rarr;</span>
            </Link>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {!recentNotes || recentNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No notes yet. Start writing!
                </div>
            ) : (
                recentNotes.map(note => (
                    <div key={note.id} onClick={() => onEdit(note)} className="block group cursor-pointer">
                        <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 shadow-sm hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
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
    </div>
);

const TopTagsWidget = ({ topTags }) => (
    <div className="bg-gradient-to-br from-primary-500 to-indigo-600 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-primary-500/50 transition-shadow duration-300 text-white h-full relative flex flex-col">
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

const ActivityChartWidget = ({ chartData }) => (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-100/50 dark:border-gray-700/50 h-full hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300 flex flex-col">
        <div className="flex items-center justify-between mb-6 pr-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="mr-2 text-primary-500"><ActivityIcon /></span>
                Note Activity (Last 7 Days)
            </h3>
        </div>
        <div className="w-full flex-1 min-h-[150px]">
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

export default function Dashboard({ recentNotes, stats, allTags, chartData }) {
    const { auth } = usePage().props;
    const [greeting, setGreeting] = useState('');
    const [showTagsModal, setShowTagsModal] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', notes: '', tags: '' });

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
        { i: 'activity_chart', x: 0, y: 1, w: 3, h: 2, minW: 2, minH: 1 },
        { i: 'recent', x: 0, y: 3, w: 2, h: 2, minW: 1, minH: 1 },
        { i: 'tags', x: 2, y: 3, w: 1, h: 2, minW: 1, minH: 1 }
    ];
    
    const [layouts, setLayouts] = useState(() => {
        try {
            const saved = localStorage.getItem('user_dashboard_layout_v4');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse dashboard layout', e);
        }
        return { lg: defaultLayout, md: defaultLayout, sm: defaultLayout };
    });

    const handleLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
        localStorage.setItem('user_dashboard_layout_v4', JSON.stringify(allLayouts));
    };

    const startEditing = (note) => {
        setEditingNoteId(note.id);
        setEditForm({
            title: note.title,
            content: note.content,
            notes: note.notes,
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
                return <ActivityChartWidget chartData={chartData} />;
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
                <h2 className="text-2xl font-bold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                
                {/* Greeting Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {greeting}, {auth.user.name}! ✨
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Here's an overview of your notes today. Drag the handle on each widget to rearrange your dashboard.
                    </p>
                </motion.div>

                <div ref={containerRef}>
                    <ResponsiveGridLayout
                        width={containerWidth}
                        className="layout pb-12"
                        layouts={layouts}
                        onLayoutChange={handleLayoutChange}
                        onDragStart={() => { window.__isDraggingWidget = true; }}
                        onDragStop={() => { setTimeout(() => { window.__isDraggingWidget = false; }, 100); }}
                        onResizeStart={() => { window.__isDraggingWidget = true; }}
                        onResizeStop={() => { setTimeout(() => { window.__isDraggingWidget = false; }, 100); }}
                        breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 }}
                    cols={{ lg: 3, md: 2, sm: 1, xs: 1, xxs: 1 }}
                    rowHeight={150}
                    draggableHandle=".dashboard-drag-handle"
                    containerPadding={[0, 0]}
                    margin={[32, 32]}
                >
                    {defaultLayout.map(item => (
                        <div key={item.i}>
                            <DraggableWidgetWrapper>
                                {renderWidget(item.i)}
                            </DraggableWidgetWrapper>
                        </div>
                    ))}
                    </ResponsiveGridLayout>
                </div>

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
