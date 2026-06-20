import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Responsive as ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import { repackLayout } from '@/utils/gridLayoutUtils';
import axios from 'axios';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Flame, PenTool, Type, Zap } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const COLORS = ['#818CF8', '#A78BFA', '#F472B6', '#34D399', '#FBBF24', '#60A5FA', '#F87171', '#3B82F6'];

const SlidersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="4" x2="14" y2="4"></line><line x1="10" y1="4" x2="3" y2="4"></line><line x1="21" y1="12" x2="12" y2="12"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="20" x2="16" y2="20"></line><line x1="12" y1="20" x2="3" y2="20"></line><line x1="14" y1="2" x2="14" y2="6"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="22"></line></svg>);
const GripVerticalIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>);

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

// Widget Components
const MetricStreak = ({ streak }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center h-full hover:shadow-2xl transition-shadow duration-300">
        <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mb-3">
            <Flame className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Streak</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{streak} {streak === 1 ? 'Day' : 'Days'}</p>
    </div>
);

const MetricWords = ({ totalWords }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center h-full hover:shadow-2xl transition-shadow duration-300">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full mb-3">
            <Type className="w-8 h-8 text-indigo-500" />
        </div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Words</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalWords.toLocaleString()}</p>
    </div>
);

const MetricNotes = ({ totalNotes }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center h-full hover:shadow-2xl transition-shadow duration-300">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full mb-3">
            <PenTool className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Notes</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalNotes.toLocaleString()}</p>
    </div>
);

const MetricPersona = ({ persona }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center h-full hover:shadow-2xl transition-shadow duration-300">
        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-3">
            <Zap className="w-8 h-8 text-purple-500" />
        </div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Writing Persona</h3>
        <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-2">{persona}</p>
    </div>
);

const ChartVelocity = ({ velocityChart }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Note Velocity (Last 30 Days)</h3>
        <div className="w-full h-[300px] lg:flex-1 lg:h-auto lg:min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickMargin={10} minTickGap={20} />
                    <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                        itemStyle={{ color: '#818CF8' }}
                    />
                    <Line type="monotone" dataKey="count" name="Notes" stroke="#818CF8" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const ChartTopics = ({ tagDistribution }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Top Topics</h3>
        <div className="w-full h-[300px] lg:flex-1 lg:h-auto lg:min-h-[200px] flex flex-col items-center justify-center">
            {tagDistribution.length > 0 ? (
                <>
                    <div className="w-full flex-1 min-h-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={tagDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="name"
                                >
                                    {tagDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {tagDistribution.map((tag, i) => (
                            <div key={tag.name} className="flex items-center text-xs">
                                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                <span className="text-gray-600 dark:text-gray-400">{tag.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">No tags used yet.</p>
            )}
        </div>
    </div>
);

const ChartProductivity = ({ hourChart }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Productivity by Hour</h3>
        <div className="w-full h-[300px] lg:flex-1 lg:h-auto lg:min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                    <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} tickFormatter={(tick) => `${tick}:00`} />
                    <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                        itemStyle={{ color: '#F472B6' }}
                        labelFormatter={(label) => `${label}:00`}
                    />
                    <Bar dataKey="count" name="Notes Created" fill="#F472B6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const ChartBusiest = ({ busiestDayChart }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Busiest Day of the Week</h3>
        <div className="w-full h-[300px] lg:flex-1 lg:h-auto lg:min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={busiestDayChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                    <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                        itemStyle={{ color: '#34D399' }}
                    />
                    <Bar dataKey="count" name="Notes Created" fill="#34D399" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

// Default Layout
const defaultLayout = [
    { i: 'streak', x: 0, y: 0, w: 1, h: 1, minW: 1 },
    { i: 'words', x: 1, y: 0, w: 1, h: 1, minW: 1 },
    { i: 'notes', x: 2, y: 0, w: 1, h: 1, minW: 1 },
    { i: 'persona', x: 3, y: 0, w: 1, h: 1, minW: 1 },
    { i: 'velocity', x: 0, y: 1, w: 2, h: 2, minW: 2 },
    { i: 'topics', x: 2, y: 1, w: 2, h: 2, minW: 2 },
    { i: 'productivity', x: 0, y: 3, w: 2, h: 2, minW: 2 },
    { i: 'busiest', x: 2, y: 3, w: 2, h: 2, minW: 2 }
];

export default function AnalyticsIndex({ streak, totalWords, persona, hourChart, tagDistribution, velocityChart, busiestDayChart, totalNotes }) {
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [layouts, setLayouts] = useState(() => {
        const savedLayouts = localStorage.getItem('analytics_dashboard_layouts');
        if (savedLayouts) {
            try {
                return JSON.parse(savedLayouts);
            } catch (e) {
                console.error("Error parsing layouts", e);
            }
        }
        return {
            lg: defaultLayout,
            md: defaultLayout,
            sm: defaultLayout
        };
    });
    const { width: containerWidth, containerRef } = useContainerWidth();
    
    const defaultAvailableWidgets = [
        { id: 'streak', title: 'Current Streak' },
        { id: 'words', title: 'Total Words' },
        { id: 'notes', title: 'Total Notes' },
        { id: 'persona', title: 'Writing Persona' },
        { id: 'velocity', title: 'Note Velocity' },
        { id: 'topics', title: 'Top Topics' },
        { id: 'productivity', title: 'Productivity by Hour' },
        { id: 'busiest', title: 'Busiest Day' },
    ];

    const [availableWidgets, setAvailableWidgets] = useState(() => {
        try {
            const saved = localStorage.getItem('user_analytics_widgets_v1');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return defaultAvailableWidgets;
    });

    const syncWidgetsToBackend = (widgetsToSync) => {
        axios.post(route('profile.analytics-widgets'), { widgets: widgetsToSync })
            .catch(err => console.error('Failed to sync widget preferences', err));
    };

    useEffect(() => {
        syncWidgetsToBackend(availableWidgets);
    }, []);

    useEffect(() => {
        localStorage.setItem('analytics_dashboard_layouts', JSON.stringify(layouts));
    }, [layouts]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
        localStorage.setItem('analytics_dashboard_layouts', JSON.stringify(allLayouts));

        setAvailableWidgets((prev) => {
            const sortedLayout = [...currentLayout].sort((a, b) => {
                if (a.y === b.y) return a.x - b.x;
                return a.y - b.y;
            });
            
            const newOrder = [];
            sortedLayout.forEach(item => {
                const widget = prev.find(w => w.id === item.i);
                if (widget) newOrder.push(widget);
            });
            
            prev.forEach(widget => {
                if (!newOrder.find(w => w.id === widget.id)) {
                    newOrder.push(widget);
                }
            });
            
            const isDifferent = JSON.stringify(prev) !== JSON.stringify(newOrder);
            if (isDifferent) {
                localStorage.setItem('user_analytics_widgets_v1', JSON.stringify(newOrder));
                syncWidgetsToBackend(newOrder);
            }
            
            return newOrder;
        });
    };

    const handleReorderWidgets = (newOrder) => {
        setAvailableWidgets(newOrder);
        localStorage.setItem('user_analytics_widgets_v1', JSON.stringify(newOrder));
        syncWidgetsToBackend(newOrder);

        const activeWidgets = newOrder.filter(w => w.isVisible !== false);
        const filterLayout = (layout) => layout.filter(item => activeWidgets.find(w => w.id === item.i));

        const newLayouts = {
            lg: repackLayout(activeWidgets, filterLayout(layouts.lg), 4),
            md: repackLayout(activeWidgets, filterLayout(layouts.md), 2),
            sm: repackLayout(activeWidgets, filterLayout(layouts.sm), 1),
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
        localStorage.setItem('user_analytics_widgets_v1', JSON.stringify(newOrder));
        syncWidgetsToBackend(newOrder);

        if (!isEnabling) {
            const newLayouts = {
                lg: layouts.lg.filter(item => item.i !== id),
                md: layouts.md.filter(item => item.i !== id),
                sm: layouts.sm.filter(item => item.i !== id),
            };
            handleLayoutChange(newLayouts.lg, newLayouts);
        } else {
            const y = Math.max(0, ...layouts.lg.map(item => item.y + item.h));
            const newItem = defaultLayout.find(item => item.i === id) || {
                i: id, x: 0, y: y, w: id === 'streak' || id === 'words' || id === 'notes' || id === 'persona' ? 1 : 2, h: id === 'streak' || id === 'words' || id === 'notes' || id === 'persona' ? 1 : 2
            };
            const activeWidgets = newOrder.filter(w => w.isVisible !== false);
            
            const newLayouts = {
                lg: repackLayout(activeWidgets, [...layouts.lg, newItem], 4),
                md: repackLayout(activeWidgets, [...layouts.md, newItem], 2),
                sm: repackLayout(activeWidgets, [...layouts.sm, newItem], 1),
            };
            handleLayoutChange(newLayouts.lg, newLayouts);
        }
    };

    const renderWidget = (id) => {
        switch (id) {
            case 'streak': return <MetricStreak streak={streak} />;
            case 'words': return <MetricWords totalWords={totalWords} />;
            case 'notes': return <MetricNotes totalNotes={totalNotes} />;
            case 'persona': return <MetricPersona persona={persona} />;
            case 'velocity': return <ChartVelocity velocityChart={velocityChart} />;
            case 'topics': return <ChartTopics tagDistribution={tagDistribution} />;
            case 'productivity': return <ChartProductivity hourChart={hourChart} />;
            case 'busiest': return <ChartBusiest busiestDayChart={busiestDayChart} />;
            default: return null;
        }
    };
    
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">My Analytics</h2>
            }
        >
            <Head title="My Analytics" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-end mb-6">
                        <button 
                            onClick={() => setIsCustomizeOpen(true)}
                            className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            <SlidersIcon />
                            <span className="hidden sm:inline">Customize</span>
                        </button>
                    </div>
                    
                    {isMobile ? (
                        <div className="flex flex-col gap-6">
                            {availableWidgets.filter(w => w.isVisible !== false).map(widget => (
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
                                isDraggable={false}
                                breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 }}
                                cols={{ lg: 4, md: 2, sm: 1, xs: 1, xxs: 1 }}
                                rowHeight={150}
                                containerPadding={[0, 0]}
                                margin={[20, 20]}
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
            </div>

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
