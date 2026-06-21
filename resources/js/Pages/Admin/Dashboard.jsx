import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { repackLayout } from '@/utils/gridLayoutUtils';
import Pagination from '@/Components/Pagination';
import Tooltip from '@/Components/Tooltip';
import { Responsive as ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import CountUp from 'react-countup';
import useTableColumns from '@/Hooks/useTableColumns';
import ColumnSelector from '@/Components/ColumnSelector';

// SVG Icons
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const ActivityIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>);
const DatabaseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const CheckCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const SlidersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="4" x2="14" y2="4"></line><line x1="10" y1="4" x2="3" y2="4"></line><line x1="21" y1="12" x2="12" y2="12"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="20" x2="16" y2="20"></line><line x1="12" y1="20" x2="3" y2="20"></line><line x1="14" y1="2" x2="14" y2="6"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="22"></line></svg>);
const GripVerticalIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>);
const SpeakerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>);

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
            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm"
        >
            <div className="flex items-center">
                <div 
                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 mr-2 touch-none"
                    onPointerDown={(e) => dragControls.start(e)}
                    style={{ touchAction: 'none' }}
                >
                    <GripVerticalIcon className="text-slate-400" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{widget.title}</span>
            </div>
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onToggle(widget.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </Reorder.Item>
    );
};



const MetricTotalUsersWidget = ({ metrics }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4 shadow-md h-full hover:shadow-xl transition-shadow duration-300 relative">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400 relative z-10">
                <UsersIcon />
            </div>
            <div className="relative z-10">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Users</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    <CountUp end={metrics?.totalUsers || 0} duration={2} separator="," />
                </h4>
            </div>
        </div>
    );
};

const MetricActiveUsersWidget = ({ metrics }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4 shadow-md h-full hover:shadow-xl transition-shadow duration-300 relative">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400 relative z-10">
                <CheckCircleIcon />
            </div>
            <div className="relative z-10">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active Users</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    <CountUp end={metrics?.activeUsers || 0} duration={2} separator="," />
                </h4>
            </div>
        </div>
    );
};

const MetricInactiveUsersWidget = ({ metrics }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4 shadow-md h-full hover:shadow-xl transition-shadow duration-300 relative">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400 relative z-10">
                <AlertTriangleIcon />
            </div>
            <div className="relative z-10">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Inactive Users</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    <CountUp end={metrics?.inactiveUsers || 0} duration={2} separator="," />
                </h4>
            </div>
        </div>
    );
};

const MetricTotalNotesWidget = ({ metrics }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4 shadow-md h-full hover:shadow-xl transition-shadow duration-300 relative">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400 relative z-10">
                <DatabaseIcon />
            </div>
            <div className="relative z-10">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Notes</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    <CountUp end={metrics?.totalNotes || 0} duration={2} separator="," />
                </h4>
            </div>
        </div>
    );
};

const MetricTotalLoginsWidget = ({ metrics }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4 shadow-md h-full hover:shadow-xl transition-shadow duration-300 relative">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl text-purple-600 dark:text-purple-400 relative z-10">
                <ActivityIcon />
            </div>
            <div className="relative z-10">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Logins</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    <CountUp end={metrics?.totalLogins || 0} duration={2} separator="," />
                </h4>
            </div>
        </div>
    );
};



const RadarEngagementWidget = ({ radarData, radarDays, onRadarDaysChange }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 h-full hover:shadow-2xl transition-shadow duration-300 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <span className="mr-2 text-indigo-500"><ActivityIcon /></span>
                Platform Radar (Last {radarDays}d)
            </h3>
            <select
                value={radarDays}
                onChange={onRadarDaysChange}
                className="w-full sm:w-auto text-sm bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={21}>21 Days</option>
                <option value={30}>30 Days</option>
            </select>
        </div>
        <div className="w-full h-[300px] mt-4 lg:flex-1 lg:h-auto lg:min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#cbd5e1" className="dark:stroke-slate-700" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar name="Activity" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                    <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                        itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const GlobalBroadcastWidget = ({ currentAnnouncement }) => {
    const { data, setData, post, processing } = useForm({
        message: currentAnnouncement || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.announcement.update'), {
            preserveScroll: true,
        });
    };

    const clear = () => {
        router.post(route('admin.announcement.update'), { message: '' }, {
            preserveScroll: true,
            onSuccess: () => setData('message', ''),
        });
    };

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-xl border border-indigo-500/30 text-white h-full hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4 pr-10">
                <h3 className="text-xl font-bold flex items-center">
                    <span className="mr-2 text-indigo-200"><SpeakerIcon /></span>
                    Global Broadcast
                </h3>
            </div>
            <p className="text-sm text-indigo-200 mb-4">
                Set a global announcement. This will be pinned to the top of all user pages.
            </p>
            <form onSubmit={submit}>
                <textarea
                    value={data.message}
                    onChange={e => setData('message', e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder-indigo-300/50 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all mb-4"
                    rows="3"
                    placeholder="Type an announcement..."
                ></textarea>
                <div className="flex justify-end gap-2">
                    {currentAnnouncement && (
                        <button
                            type="button"
                            onClick={clear}
                            disabled={processing}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors"
                        >
                            Clear
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={processing || data.message === currentAnnouncement}
                        className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl text-sm font-bold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Saving...' : 'Publish'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const ActivityChartWidget = ({ chartData, activityDays, onActivityDaysChange }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 h-full hover:shadow-2xl transition-shadow duration-300 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pr-10 gap-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <span className="mr-2 text-indigo-500"><ActivityIcon /></span>
                Platform Activity (Last {activityDays} Days)
            </h3>
            <select
                value={activityDays}
                onChange={onActivityDaysChange}
                className="w-full sm:w-auto text-sm bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={21}>21 Days</option>
                <option value={30}>30 Days</option>
            </select>
        </div>
        <div className="w-full h-[300px] lg:flex-1 lg:h-auto lg:min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="notes" name="Notes Created" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="users" name="New Users" stroke="#10b981" strokeWidth={3} />
                    <Line type="monotone" dataKey="logins" name="User Logins" stroke="#f59e0b" strokeWidth={3} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const LiveContentFeedWidget = ({ latestGlobalNotes }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 h-full hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6 pr-10">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <span className="mr-2 text-indigo-500"><DatabaseIcon /></span>
                Live Content Feed
            </h3>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {!latestGlobalNotes || latestGlobalNotes.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No notes created yet.</p>
            ) : (
                latestGlobalNotes.map(note => (
                    <div key={note.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-900 dark:text-white truncate pr-4">{note.title}</h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {new Date(note.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                            <span className="text-indigo-400 mr-2"><UsersIcon /></span>
                            <span className="truncate">{note.user?.name || 'Unknown User'}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

const RegistrationsWidget = ({ recentUsers }) => {
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const { visibleColumns, toggleColumn } = useTableColumns('dashboard_registrations', [
        { id: 'name', label: 'Name' },
        { id: 'email', label: 'Email' },
        { id: 'status', label: 'Status' },
        { id: 'joined', label: 'Joined' }
    ]);

    const handleSort = (field) => {
        let direction = 'asc';
        if (sortField === field && sortDirection === 'asc') direction = 'desc';
        setSortField(field);
        setSortDirection(direction);
    };

    const sortedUsers = [...(recentUsers || [])].sort((a, b) => {
        if (!sortField) return 0;
        const aVal = a[sortField] === null ? '' : a[sortField];
        const bVal = b[sortField] === null ? '' : b[sortField];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const SortIcon = ({ field }) => {
        if (sortField !== field) {
            return <svg className="w-4 h-4 ml-1 opacity-20 group-hover:opacity-50 transition-opacity" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
        }
        if (sortDirection === 'asc') {
            return <svg className="w-4 h-4 ml-1 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>;
        }
        return <svg className="w-4 h-4 ml-1 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
    };

    return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 h-full hover:shadow-2xl transition-shadow duration-300 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-6 pr-10">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <span className="mr-2 text-indigo-500"><UsersIcon /></span>
                Recent Registrations
            </h3>
            <div className="flex items-center gap-2">
                <ColumnSelector 
                    columns={[
                        { id: 'name', label: 'Name' },
                        { id: 'email', label: 'Email' },
                        { id: 'status', label: 'Status' },
                        { id: 'joined', label: 'Joined' }
                    ]}
                    visibleColumns={visibleColumns}
                    toggleColumn={toggleColumn}
                />
                <Link 
                    href={route('admin.users')} 
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-primary-700 bg-primary-100 dark:bg-primary-900/50 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-900 transition-colors duration-200 shadow-sm hover:shadow"
                >
                    Manage <span className="ml-2">&rarr;</span>
                </Link>
            </div>
        </div>

        <div className="overflow-x-auto flex-1 w-full min-w-0">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                    <tr>
                        {visibleColumns.includes('name') && <th className="px-4 py-3 text-left">
                            <button onClick={() => handleSort('name')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                Name <SortIcon field="name" />
                            </button>
                        </th>}
                        {visibleColumns.includes('email') && <th className="px-4 py-3 text-left">
                            <button onClick={() => handleSort('email')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                Email <SortIcon field="email" />
                            </button>
                        </th>}
                        {visibleColumns.includes('status') && <th className="px-4 py-3 text-left">
                            <button onClick={() => handleSort('is_active')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                Status <SortIcon field="is_active" />
                            </button>
                        </th>}
                        {visibleColumns.includes('joined') && <th className="px-4 py-3 text-left">
                            <button onClick={() => handleSort('created_at')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                Joined <SortIcon field="created_at" />
                            </button>
                        </th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {!sortedUsers || sortedUsers.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="px-4 py-8 text-center text-slate-500">No users found.</td>
                        </tr>
                    ) : (
                        sortedUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                {visibleColumns.includes('name') && <td className="px-4 py-4 whitespace-normal break-words text-sm font-medium text-slate-900 dark:text-white">
                                    <div className="flex items-center">
                                        {user.roles && user.roles.length > 0 && (
                                            <Tooltip content="Admin" className="mr-2">
                                                <span className="text-amber-500"><SettingsIcon /></span>
                                            </Tooltip>
                                        )}
                                        {user.name}
                                    </div>
                                </td>}
                                {visibleColumns.includes('email') && <td className="px-4 py-4 whitespace-normal break-words text-sm text-slate-500 dark:text-slate-400">
                                    {user.email}
                                </td>}
                                {visibleColumns.includes('status') && <td className="px-4 py-4 whitespace-normal break-words text-sm">
                                    {user.is_active ? (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Inactive</span>
                                    )}
                                </td>}
                                {visibleColumns.includes('joined') && <td className="px-4 py-4 whitespace-normal break-words text-sm text-slate-500 dark:text-slate-400">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
    );
};

const ActionsWidget = ({ handleDisableAll, handleEnableAll }) => (
    <div className="bg-slate-900 dark:bg-black rounded-3xl p-6 shadow-2xl border border-slate-700 text-white h-full">
        <div className="flex items-center mb-6 border-b border-slate-700 pb-4 pr-10">
            <span className="mr-2 text-amber-400"><SettingsIcon /></span>
            <h3 className="text-xl font-bold">Quick Actions</h3>
        </div>

        <div className="space-y-4">
            <Link 
                href={route('admin.users')} 
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
                Manage All Users
            </Link>

            <div className="pt-4 mt-4 border-t border-slate-700">
                <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Danger Zone</h4>
                
                <button 
                    onClick={handleDisableAll}
                    className="w-full text-left bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-between mb-3"
                >
                    <span>Disable All Users</span>
                    <AlertTriangleIcon />
                </button>

                <button 
                    onClick={handleEnableAll}
                    className="w-full text-left bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-between"
                >
                    <span>Enable All Users</span>
                    <CheckCircleIcon />
                </button>
            </div>
        </div>
    </div>
);

const LoginsWidget = ({ latestLogins, searchLogins, setSearchLogins, handleSortLogins, SortIconLogins }) => {
    const { visibleColumns, toggleColumn } = useTableColumns('dashboard_logins', [
        { id: 'name', label: 'Name' },
        { id: 'email', label: 'Email' },
        { id: 'last_login', label: 'Last Login' }
    ]);
    return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 h-full hover:shadow-2xl transition-shadow duration-300 flex flex-col min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 pr-10">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <span className="mr-2 text-emerald-500"><ActivityIcon /></span>
                Latest User Logins
            </h3>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={searchLogins}
                    onChange={(e) => setSearchLogins(e.target.value)}
                    className="w-full sm:w-48 px-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder-slate-400"
                />
                <ColumnSelector 
                    columns={[
                        { id: 'name', label: 'Name' },
                        { id: 'email', label: 'Email' },
                        { id: 'last_login', label: 'Last Login' }
                    ]}
                    visibleColumns={visibleColumns}
                    toggleColumn={toggleColumn}
                />
            </div>
        </div>

        <div className="overflow-x-auto flex-1 w-full min-w-0">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                    <tr>
                        {visibleColumns.includes('name') && <th className="px-4 py-3 text-left">
                            <button onClick={() => handleSortLogins('name')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                                Name <SortIconLogins field="name" />
                            </button>
                        </th>}
                        {visibleColumns.includes('email') && <th className="px-4 py-3 text-left">
                            <button onClick={() => handleSortLogins('email')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                                Email <SortIconLogins field="email" />
                            </button>
                        </th>}
                        {visibleColumns.includes('last_login') && <th className="px-4 py-3 text-left">
                            <button onClick={() => handleSortLogins('last_login_at')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                                Last Login <SortIconLogins field="last_login_at" />
                            </button>
                        </th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {!latestLogins || !latestLogins.data || latestLogins.data.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="px-4 py-8 text-center text-slate-500">No login records found.</td>
                        </tr>
                    ) : (
                        latestLogins.data.map(user => (
                            <tr key={`login-${user.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                {visibleColumns.includes('name') && <td className="px-4 py-4 whitespace-normal break-words text-sm font-medium text-slate-900 dark:text-white">
                                    {user.name}
                                </td>}
                                {visibleColumns.includes('email') && <td className="px-4 py-4 whitespace-normal break-words text-sm text-slate-500 dark:text-slate-400">
                                    {user.email}
                                </td>}
                                {visibleColumns.includes('last_login') && <td className="px-4 py-4 whitespace-normal break-words text-sm text-slate-500 dark:text-slate-400">
                                    {new Date(user.last_login_at).toLocaleString()}
                                </td>}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        {latestLogins && latestLogins.links && latestLogins.data.length > 0 && (
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 relative z-0">
                <Pagination links={latestLogins.links} only={['latestLogins']} />
            </div>
        )}
    </div>
    );
};



export default function Dashboard({ metrics, recentUsers, latestLogins, filters, chartData, latestGlobalNotes, radarData }) {
    const { props } = usePage();
    const globalAnnouncement = props.global_announcement;

    const { patch: patchDisable } = useForm();
    const { patch: patchEnable } = useForm();
    
    const [activityDays, setActivityDays] = useState(filters?.activity_days || 7);
    const [radarDays, setRadarDays] = useState(filters?.radar_days || 30);

    const handleActivityDaysChange = (e) => {
        const days = e.target.value;
        setActivityDays(days);
        router.get(route('admin.index'), { search_logins: searchLogins, sort_logins: filters?.sort_logins, direction_logins: filters?.direction_logins, activity_days: days, radar_days: radarDays }, { preserveState: true, preserveScroll: true, only: ['chartData', 'filters'] });
    };

    const handleRadarDaysChange = (e) => {
        const days = e.target.value;
        setRadarDays(days);
        router.get(route('admin.index'), { search_logins: searchLogins, sort_logins: filters?.sort_logins, direction_logins: filters?.direction_logins, activity_days: activityDays, radar_days: days }, { preserveState: true, preserveScroll: true, only: ['radarData', 'filters'] });
    };
    
    const [searchLogins, setSearchLogins] = useState(filters?.search_logins || '');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        router.reload({
            only: ['metrics', 'recentUsers', 'latestLogins', 'chartData', 'latestGlobalNotes'],
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                setIsRefreshing(false);
                setLastUpdated(new Date());
            }
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['metrics', 'recentUsers', 'latestLogins', 'chartData', 'latestGlobalNotes'],
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setLastUpdated(new Date())
            });
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchLogins !== (filters?.search_logins || '')) {
                router.get(route('admin.index'), { 
                    search_logins: searchLogins,
                    sort_logins: filters?.sort_logins,
                    direction_logins: filters?.direction_logins
                }, { preserveState: true, replace: true, preserveScroll: true, only: ['latestLogins'] });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchLogins]);

    const handleSortLogins = (field) => {
        let direction = 'asc';
        if (filters?.sort_logins === field && filters?.direction_logins === 'asc') {
            direction = 'desc';
        }

        router.get(route('admin.index'), { 
            search_logins: searchLogins, 
            sort_logins: field, 
            direction_logins: direction 
        }, { preserveState: true, replace: true, preserveScroll: true, only: ['latestLogins', 'filters'] });
    };

    const SortIconLogins = ({ field }) => {
        if (filters?.sort_logins !== field) {
            return <svg className="w-4 h-4 ml-1 opacity-20 group-hover:opacity-50 transition-opacity" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
        }
        if (filters?.direction_logins === 'asc') {
            return <svg className="w-4 h-4 ml-1 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>;
        }
        return <svg className="w-4 h-4 ml-1 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
    };

    const handleDisableAll = () => {
        if (confirm('Are you absolutely sure? This will disable ALL users except yourself.')) {
            patchDisable(route('admin.users.disable-all'));
        }
    };

    const handleEnableAll = () => {
        if (confirm('Are you sure you want to enable ALL users?')) {
            patchEnable(route('admin.users.enable-all'));
        }
    };

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

    const { width: containerWidth, containerRef } = useContainerWidth();
    const { roles } = usePage().props.auth;
    const isSuperAdmin = roles && roles.includes('super_admin');

    const defaultLayout = [
        { i: 'metric_total_users', x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
        { i: 'metric_active_users', x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
        { i: 'metric_inactive_users', x: 2, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
        { i: 'metric_total_notes', x: 3, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
        { i: 'metric_total_logins', x: 0, y: 1, w: 1, h: 1, minW: 1, minH: 1 },
        { i: 'activity_chart', x: 0, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
        { i: 'radar_chart', x: 3, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
        ...(isSuperAdmin ? [{ i: 'global_broadcast', x: 0, y: 4, w: 2, h: 2, minW: 2, minH: 2 }] : []),
        { i: 'live_content_feed', x: 2, y: 4, w: 2, h: 2, minW: 2, minH: 2 },
        ...(isSuperAdmin ? [{ i: 'actions', x: 0, y: 6, w: 4, h: 2, minW: 2, minH: 2 }] : []),
        { i: 'registrations', x: 0, y: 8, w: 4, h: 2, minW: 3, minH: 2 },
        { i: 'logins', x: 0, y: 10, w: 4, h: 2, minW: 3, minH: 2 }
    ];
    
    const [layouts, setLayouts] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_dashboard_layout_v2');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (!isSuperAdmin) {
                    parsed.lg = parsed.lg.filter(item => item.i !== 'global_broadcast' && item.i !== 'actions');
                    parsed.md = parsed.md.filter(item => item.i !== 'global_broadcast' && item.i !== 'actions');
                    parsed.sm = parsed.sm.filter(item => item.i !== 'global_broadcast' && item.i !== 'actions');
                } else {
                    const savedWidgets = localStorage.getItem('admin_dashboard_widgets_v1');
                    if (savedWidgets) {
                        const parsedWidgets = JSON.parse(savedWidgets);
                        const hadGlobalBroadcast = parsedWidgets.some(w => w.id === 'global_broadcast');
                        const hadActions = parsedWidgets.some(w => w.id === 'actions');
                        
                        let maxY = Math.max(0, ...parsed.lg.map(item => item.y + item.h));
                        
                        const injectWidget = (id, w, h, minW, minH) => {
                            if (!parsed.lg.some(item => item.i === id)) parsed.lg.push({ i: id, x: 0, y: maxY, w, h, minW, minH });
                            if (!parsed.md.some(item => item.i === id)) parsed.md.push({ i: id, x: 0, y: maxY, w, h, minW, minH });
                            if (!parsed.sm.some(item => item.i === id)) parsed.sm.push({ i: id, x: 0, y: maxY, w, h, minW, minH });
                            maxY += h;
                        };

                        if (!hadGlobalBroadcast) injectWidget('global_broadcast', 2, 2, 2, 2);
                        if (!hadActions) injectWidget('actions', 4, 2, 2, 2);
                    }
                }
                return parsed;
            }
        } catch (e) {
            console.error('Failed to parse dashboard layout', e);
        }
        return { lg: defaultLayout, md: defaultLayout, sm: defaultLayout };
    });

    const defaultAvailableWidgets = [
        { id: 'metric_total_users', title: 'Total Users' },
        { id: 'metric_active_users', title: 'Active Users' },
        { id: 'metric_inactive_users', title: 'Inactive Users' },
        { id: 'metric_total_notes', title: 'Total Notes' },
        { id: 'metric_total_logins', title: 'Total Logins' },
        { id: 'activity_chart', title: 'Platform Activity' },
        { id: 'radar_chart', title: 'Platform Radar' },
        ...(isSuperAdmin ? [{ id: 'global_broadcast', title: 'Global Broadcast' }] : []),
        { id: 'live_content_feed', title: 'Live Content Feed' },
        ...(isSuperAdmin ? [{ id: 'actions', title: 'Quick Actions' }] : []),
        { id: 'registrations', title: 'Recent Registrations' },
        { id: 'logins', title: 'Recent Logins' },
    ];

    const [availableWidgets, setAvailableWidgets] = useState(() => {
        let widgets = defaultAvailableWidgets;
        try {
            const saved = localStorage.getItem('admin_dashboard_widgets_v1');
            if (saved) {
                const parsed = JSON.parse(saved);
                const validIds = new Set(defaultAvailableWidgets.map(w => w.id));
                const filteredParsed = parsed.filter(w => validIds.has(w.id));
                const parsedIds = new Set(filteredParsed.map(w => w.id));
                const missing = defaultAvailableWidgets.filter(w => !parsedIds.has(w.id));
                widgets = [...filteredParsed, ...missing];
            }
        } catch (e) {}
        return widgets;
    });

    const handleReorderWidgets = (newOrder) => {
        setAvailableWidgets(newOrder);
        localStorage.setItem('admin_dashboard_widgets_v1', JSON.stringify(newOrder));
        
        const newLayouts = {
            lg: repackLayout(newOrder, layouts.lg, 4),
            md: repackLayout(newOrder, layouts.md, 3),
            sm: repackLayout(newOrder, layouts.sm, 2),
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
            // Find max Y
            const y = Math.max(0, ...layouts.lg.map(item => item.y + item.h));
            const newItem = { i: id, x: 0, y, w: 1, h: 1, minW: 1, minH: 1 };
            
            if (['activity_chart', 'actions', 'registrations', 'logins'].includes(id)) {
                newItem.w = 3; newItem.h = 2;
            } else if (['radar_chart'].includes(id)) {
                newItem.w = 1; newItem.h = 2;
            } else if (['global_broadcast', 'live_content_feed'].includes(id)) {
                newItem.w = 2; newItem.h = 2;
            }

            const newLayouts = {
                lg: repackLayout(availableWidgets, [...layouts.lg, newItem], 4),
                md: repackLayout(availableWidgets, [...layouts.md, newItem], 3),
                sm: repackLayout(availableWidgets, [...layouts.sm, newItem], 2),
            };
            handleLayoutChange(newLayouts.lg, newLayouts);
        }
    };

    const handleLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
        localStorage.setItem('admin_dashboard_layout_v2', JSON.stringify(allLayouts));
    };

    const renderWidget = (id) => {
        switch (id) {
            case 'metric_total_users':
                return <MetricTotalUsersWidget metrics={metrics} />;
            case 'metric_active_users':
                return <MetricActiveUsersWidget metrics={metrics} />;
            case 'metric_inactive_users':
                return <MetricInactiveUsersWidget metrics={metrics} />;
            case 'metric_total_notes':
                return <MetricTotalNotesWidget metrics={metrics} />;
            case 'metric_total_logins':
                return <MetricTotalLoginsWidget metrics={metrics} />;
            case 'radar_chart':
                return <RadarEngagementWidget radarData={radarData} radarDays={radarDays} onRadarDaysChange={handleRadarDaysChange} />;
            case 'activity_chart':
                return <ActivityChartWidget chartData={chartData} activityDays={activityDays} onActivityDaysChange={handleActivityDaysChange} />;
            case 'global_broadcast':
                return <GlobalBroadcastWidget currentAnnouncement={globalAnnouncement} />;
            case 'live_content_feed':
                return <LiveContentFeedWidget latestGlobalNotes={latestGlobalNotes} />;
            case 'registrations':
                return <RegistrationsWidget recentUsers={recentUsers} />;
            case 'actions':
                return <ActionsWidget handleDisableAll={handleDisableAll} handleEnableAll={handleEnableAll} />;
            case 'logins':
                return <LoginsWidget latestLogins={latestLogins} searchLogins={searchLogins} setSearchLogins={setSearchLogins} handleSortLogins={handleSortLogins} SortIconLogins={SortIconLogins} />;
            default:
                return null;
        }
    };

    // Colspan logic is handled by react-grid-layout

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center w-full">
                    <h2 className="font-bold text-2xl text-slate-800 dark:text-slate-100 leading-tight">
                        Admin Command Center
                    </h2>
                    <Tooltip content="Customize Layout">
                        <button 
                            onClick={() => setIsCustomizeOpen(true)}
                            className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none"
                        >
                            <SlidersIcon />
                        </button>
                    </Tooltip>
                </div>
            }
        >
            <Head title="Admin Command Center" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-transparent min-h-screen">
                
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                    <div>
                        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
                            <ActivityIcon /> <span className="ml-3">System Overview</span>
                        </h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Monitor platform health and manage global settings. Drag the handle on each widget to rearrange your dashboard.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <Tooltip content="Refresh Dashboard">
                            <button 
                                onClick={handleRefresh} 
                                disabled={isRefreshing}
                                className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
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
                            cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
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

            {/* Slideout Drawer */}
            {isCustomizeOpen && (
                <div className="fixed top-0 left-0 right-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] sm:bottom-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsCustomizeOpen(false)}></div>
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-80 bg-white dark:bg-slate-800 h-full shadow-2xl relative z-10 flex flex-col border-l border-slate-200 dark:border-slate-700"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                <SlidersIcon /> <span className="ml-2">Customize</span>
                            </h3>
                            <button onClick={() => setIsCustomizeOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <motion.div layoutScroll className="px-6 pb-6 overflow-y-auto flex-1">
                            <div className="pt-6">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
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
