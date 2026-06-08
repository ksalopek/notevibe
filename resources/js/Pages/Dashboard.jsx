import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// SVG Icons
const FileTextIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>);
const TagsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const HashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>);
const GripVerticalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>);

function SortableWidget({ id, children, className }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} className={`${className} ${isDragging ? 'opacity-50 scale-[1.02] shadow-2xl z-50' : ''}`}>
            <div 
                className="absolute top-4 right-4 z-10 p-2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm"
                {...attributes} 
                {...listeners}
                title="Drag to reorder"
            >
                <GripVerticalIcon />
            </div>
            {children}
        </div>
    );
}

const MetricTotalNotesWidget = ({ stats }) => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md overflow-hidden shadow-lg rounded-3xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow h-full">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400">
            <FileTextIcon />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Notes</p>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalNotes || 0}</h4>
        </div>
    </div>
);

const MetricUniqueTagsWidget = ({ stats }) => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md overflow-hidden shadow-lg rounded-3xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow h-full">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl text-purple-600 dark:text-purple-400">
            <TagsIcon />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Tags</p>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalTags || 0}</h4>
        </div>
    </div>
);

const MetricInTrashWidget = ({ stats }) => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md overflow-hidden shadow-lg rounded-3xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow h-full">
        <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl text-red-600 dark:text-red-400">
            <TrashIcon />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Trash</p>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.trashedNotes || 0}</h4>
        </div>
    </div>
);

const RecentNotesWidget = ({ recentNotes }) => (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-100/50 dark:border-gray-700/50 h-full">
        <div className="flex items-center justify-between mb-6 pr-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="mr-2 text-indigo-500"><ClockIcon /></span>
                Recent Notes
            </h3>
            <Link href={route('notes.index')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                View all &rarr;
            </Link>
        </div>

        <div className="space-y-4">
            {!recentNotes || recentNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No notes yet. Start writing!
                </div>
            ) : (
                recentNotes.map(note => (
                    <Link key={note.id} href={route('notes.index', { search: note.title })} className="block group">
                        <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 shadow-sm hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                                        <span key={tag.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Link>
                ))
            )}
        </div>
    </div>
);

const TopTagsWidget = ({ topTags }) => (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-xl text-white h-full relative">
        <div className="flex items-center mb-6 pr-10">
            <span className="mr-2 text-indigo-100"><HashIcon /></span>
            <h3 className="text-xl font-bold">Top Tags</h3>
        </div>

        <div className="space-y-3">
            {!topTags || topTags.length === 0 ? (
                <div className="text-indigo-100 py-4 text-sm">
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
        
        <div className="mt-8 text-sm text-indigo-100/80">
            Organize your thoughts efficiently by tagging your notes.
        </div>
    </div>
);


export default function Dashboard({ recentNotes, stats, topTags }) {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    // Drag and Drop Logic
    const defaultOrder = ['metric_total', 'metric_tags', 'metric_trash', 'recent', 'tags'];
    const [widgetOrder, setWidgetOrder] = useState(() => {
        try {
            const saved = localStorage.getItem('user_dashboard_order_v2'); // new key since order changed
            if (saved) {
                const parsed = JSON.parse(saved);
                // Ensure all keys exist in case they had the old layout saved
                if (parsed.includes('metric_total')) return parsed;
            }
        } catch (e) {
            console.error('Failed to parse dashboard order', e);
        }
        return defaultOrder;
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setWidgetOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                localStorage.setItem('user_dashboard_order_v2', JSON.stringify(newOrder));
                return newOrder;
            });
        }
    };

    const renderWidget = (id) => {
        switch (id) {
            case 'metric_total':
                return <MetricTotalNotesWidget stats={stats} />;
            case 'metric_tags':
                return <MetricUniqueTagsWidget stats={stats} />;
            case 'metric_trash':
                return <MetricInTrashWidget stats={stats} />;
            case 'recent':
                return <RecentNotesWidget recentNotes={recentNotes} />;
            case 'tags':
                return <TopTagsWidget topTags={topTags} />;
            default:
                return null;
        }
    };

    const getColSpan = (id) => {
        if (id.startsWith('metric_')) return 'col-span-1 lg:col-span-1';
        if (id === 'recent') return 'col-span-1 lg:col-span-2';
        if (id === 'tags') return 'col-span-1 lg:col-span-1';
        return 'col-span-1 lg:col-span-1';
    };

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
                        {greeting}, Explorer! ✨
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Here's an overview of your notes today. Drag the handle on each widget to rearrange your dashboard.
                    </p>
                </motion.div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                            {widgetOrder.map(id => (
                                <SortableWidget key={id} id={id} className={getColSpan(id)}>
                                    {renderWidget(id)}
                                </SortableWidget>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

            </div>
        </AuthenticatedLayout>
    );
}
