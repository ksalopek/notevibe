import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { repackLayout } from '@/utils/gridLayoutUtils';
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
const GripVerticalIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>);
const ActivityIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const SlidersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="4" x2="14" y2="4"></line><line x1="10" y1="4" x2="3" y2="4"></line><line x1="21" y1="12" x2="12" y2="12"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="20" x2="16" y2="20"></line><line x1="12" y1="20" x2="3" y2="20"></line><line x1="14" y1="2" x2="14" y2="6"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="22"></line></svg>);



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

const MetricTotalNotesWidget = ({ stats }) => (
    <div className="block h-full">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md overflow-hidden shadow-lg rounded-3xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4 h-full hover:shadow-2xl hover:shadow-primary-500/50 transition-shadow duration-300">
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
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md overflow-hidden shadow-lg rounded-3xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4 h-full hover:shadow-2xl hover:shadow-primary-500/50 transition-shadow duration-300">
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
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md overflow-hidden shadow-lg rounded-3xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4 h-full hover:shadow-2xl hover:shadow-primary-500/50 transition-shadow duration-300">
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

const ActivityChartWidget = ({ chartData, noteDays, onNoteDaysChange }) => (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-100/50 dark:border-gray-700/50 h-full hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300 flex flex-col">
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
    const [editForm, setEditForm] = useState({ title: '', content: '', notes: '', tags: '' });
    
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
        { i: 'activity_chart', x: 0, y: 1, w: 3, h: 2, minW: 2, minH: 1 },
        { i: 'recent', x: 0, y: 3, w: 2, h: 2, minW: 1, minH: 1 },
        { i: 'tags', x: 2, y: 3, w: 1, h: 2, minW: 1, minH: 1 }
    ];
    
    const [layouts, setLayouts] = useState(() => {
        try {
            const saved = localStorage.getItem('user_dashboard_layout_v5');
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
        { id: 'activity_chart', title: 'Note Activity' },
        { id: 'recent', title: 'Recent Notes' },
        { id: 'tags', title: 'Top Tags' },
    ];

    const [availableWidgets, setAvailableWidgets] = useState(() => {
        try {
            const saved = localStorage.getItem('user_dashboard_widgets_v1');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return defaultAvailableWidgets;
    });

    const handleReorderWidgets = (newOrder) => {
        setAvailableWidgets(newOrder);
        localStorage.setItem('user_dashboard_widgets_v1', JSON.stringify(newOrder));
        
        const newLayouts = {
            lg: repackLayout(newOrder, layouts.lg, 3),
            md: repackLayout(newOrder, layouts.md, 2),
            sm: repackLayout(newOrder, layouts.sm, 1),
        };
        handleLayoutChange(newLayouts.lg, newLayouts);
    };

    const isWidgetEnabled = (id) => layouts.lg.some(item => item.i === id);

    const handleToggleWidget = (id) => {
        const enabled = isWidgetEnabled(id);
        if (enabled) {
            const newLayouts = {
                lg: layouts.lg.filter(item => item.i !== id),
                md: layouts.md.filter(item => item.i !== id),
                sm: layouts.sm.filter(item => item.i !== id),
            };
            handleLayoutChange(newLayouts.lg, newLayouts);
        } else {
            const y = Math.max(0, ...layouts.lg.map(item => item.y + item.h));
            const newItem = { i: id, x: 0, y, w: 1, h: 1, minW: 1, minH: 1 };
            
            if (['activity_chart'].includes(id)) {
                newItem.w = 3; newItem.h = 2;
            } else if (['recent'].includes(id)) {
                newItem.w = 2; newItem.h = 2;
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
        localStorage.setItem('user_dashboard_layout_v5', JSON.stringify(allLayouts));

        setAvailableWidgets((prev) => {
            const sortedLayout = [...currentLayout].sort((a, b) => {
                if (a.y === b.y) return a.x - b.x;
                return a.y - b.y;
            });
            
            const newOrder = [];
            const addedIds = new Set();
            
            sortedLayout.forEach(item => {
                const widget = prev.find(w => w.id === item.i);
                if (widget) {
                    newOrder.push(widget);
                    addedIds.add(widget.id);
                }
            });
            
            prev.forEach(widget => {
                if (!addedIds.has(widget.id)) {
                    newOrder.push(widget);
                }
            });
            
            const isDifferent = JSON.stringify(prev) !== JSON.stringify(newOrder);
            if (isDifferent) {
                localStorage.setItem('user_dashboard_widgets_v1', JSON.stringify(newOrder));
            }
            
            return newOrder;
        });
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
                return <ActivityChartWidget chartData={chartData} noteDays={noteDays} onNoteDaysChange={handleNoteDaysChange} />;
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
                    className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {greeting}, {auth.user.name}! ✨
                        </h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Here's an overview of your notes today. Drag the handle on each widget to rearrange your dashboard.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                        <Tooltip content="Customize Dashboard">
                            <button 
                                onClick={() => setIsCustomizeOpen(true)}
                                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all"
                            >
                                <SlidersIcon />
                            </button>
                        </Tooltip>
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
                            <div key={item.i}>
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

            {/* Slideout Drawer */}
            {isCustomizeOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
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
                        <div className="p-6 overflow-y-auto flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Toggle widgets on or off and drag them to reorder your dashboard layout.
                            </p>
                            <Reorder.Group axis="y" values={availableWidgets} onReorder={handleReorderWidgets} className="space-y-3">
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
                </div>
            )}
        </AuthenticatedLayout>
    );
}
