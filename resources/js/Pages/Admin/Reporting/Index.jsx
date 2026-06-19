import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Responsive as ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import { repackLayout } from '@/utils/gridLayoutUtils';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell, ComposedChart, Legend
} from 'recharts';
import { Download } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import useTableColumns from '@/Hooks/useTableColumns';
import ColumnSelector from '@/Components/ColumnSelector';
import Tooltip from '@/Components/Tooltip';
import { downloadCSV } from '@/utils/csvUtils';

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


// Widget Components
const MetricTotalNotes = ({ stats }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col justify-center hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Total Notes</h3>
        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalNotes.toLocaleString()}</p>
    </div>
);

const MetricAvgNoteLength = ({ stats }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col justify-center hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Avg Note Length</h3>
        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.avgNoteLength.toLocaleString()} chars</p>
    </div>
);

const ChartVelocity = ({ noteVelocity }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Note Velocity (Last 30 Days)</h3>
        <div className="w-full h-[300px] lg:flex-1 lg:h-auto lg:min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={noteVelocity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickMargin={10} minTickGap={20} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                        itemStyle={{ color: '#818CF8' }}
                    />
                    <Line type="monotone" dataKey="count" name="Notes Created" stroke="#818CF8" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const ChartTagCloud = ({ tagCloud }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Top 20 Tags</h3>
        <div className="w-full h-[300px] lg:flex-1 lg:h-auto lg:min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagCloud} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} horizontal={false} />
                    <XAxis type="number" stroke="#6B7280" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} width={80} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                        itemStyle={{ color: '#A78BFA' }}
                    />
                    <Bar dataKey="count" name="Uses" fill="#A78BFA" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const ChartHeatmap = ({ activityHeatmap }) => {
    // Filter out zero counts so they don't clutter the DOM or mess up ZAxis scaling
    const activeData = activityHeatmap.filter(d => d.count > 0);
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Login Activity Heatmap (Last 90 Days)</h3>
            <div className="w-full h-[300px] lg:flex-1 lg:h-auto lg:min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis type="number" dataKey="hour" name="Hour" stroke="#6B7280" fontSize={12} tickFormatter={(tick) => `${tick}:00`} domain={[0, 23]} tickCount={24} />
                        <YAxis type="category" dataKey="day" name="Day" stroke="#6B7280" fontSize={12} ticks={DAYS} allowDuplicatedCategory={false} />
                        <ZAxis type="number" dataKey="count" range={[50, 800]} name="Logins" domain={[0, 'dataMax']} />
                        <RechartsTooltip 
                            cursor={{ strokeDasharray: '3 3' }} 
                            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                            itemStyle={{ color: '#34D399' }}
                        />
                        <Scatter name="Logins" data={activeData} fill="#34D399" opacity={0.8} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const TableWidgetUsage = ({ widgetUsage }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300 overflow-hidden">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex justify-between items-center">
                Dashboard Widget Usage
                <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">Sorted by Popularity</span>
            </h3>
            <div className="w-full flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                    {widgetUsage.map((widget, idx) => {
                        const total = widget.active + widget.inactive;
                        const percentage = total > 0 ? Math.round((widget.active / total) * 100) : 0;
                        
                        return (
                            <div key={widget.id} className="relative">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <span className="text-gray-400 font-mono text-xs w-4">{idx + 1}.</span>
                                        {widget.title}
                                    </span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        <span className="font-medium text-primary-600 dark:text-primary-400">{widget.active} active</span>
                                        {' '}/{' '}
                                        <span className="text-gray-400">{widget.inactive} inactive</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1 overflow-hidden flex">
                                    <div 
                                        className="bg-gradient-to-r from-primary-500 to-indigo-500 h-2.5 rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <div className="text-[10px] text-right font-medium text-gray-400 dark:text-gray-500">
                                    {percentage}% Adoption Rate
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const TablePowerUsers = ({ powerUsers }) => {
    const { visibleColumns, toggleColumn } = useTableColumns('reporting_power_users', [
        { id: 'name', label: 'Name' },
        { id: 'notes', label: 'Notes' },
        { id: 'last_login', label: 'Last Login' }
    ]);
    return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Power Users Leaderboard</h3>
            <div className="flex items-center gap-2">
                <ColumnSelector 
                    columns={[
                        { id: 'name', label: 'Name' },
                        { id: 'notes', label: 'Notes' },
                        { id: 'last_login', label: 'Last Login' }
                    ]}
                    visibleColumns={visibleColumns}
                    toggleColumn={toggleColumn}
                />
                <Tooltip content="Export CSV">
                    <button 
                        onClick={() => downloadCSV(powerUsers, 'power_users.csv')}
                        className="inline-flex items-center justify-center p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 shrink-0 shadow-sm hover:shadow-md"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </Tooltip>
            </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <tr>
                        {visibleColumns.includes('name') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>}
                        {visibleColumns.includes('notes') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>}
                        {visibleColumns.includes('last_login') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {powerUsers.map((u, i) => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {visibleColumns.includes('name') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                <div className="font-medium flex items-center gap-2">
                                    <span className="text-gray-400 text-xs w-4">{i + 1}.</span>
                                    {u.name}
                                </div>
                            </td>}
                            {visibleColumns.includes('notes') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.notes_count}</td>}
                            {visibleColumns.includes('last_login') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {u.last_login_human}
                            </td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};

const TableAtRiskUsers = ({ atRiskUsers }) => {
    const { visibleColumns, toggleColumn } = useTableColumns('reporting_at_risk_users', [
        { id: 'name', label: 'Name' },
        { id: 'email', label: 'Email' },
        { id: 'last_login', label: 'Last Login' }
    ]);
    return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">At-Risk Users (&gt;30 Days)</h3>
            <div className="flex items-center gap-2">
                <ColumnSelector 
                    columns={[
                        { id: 'name', label: 'Name' },
                        { id: 'email', label: 'Email' },
                        { id: 'last_login', label: 'Last Login' }
                    ]}
                    visibleColumns={visibleColumns}
                    toggleColumn={toggleColumn}
                />
                <Tooltip content="Export CSV">
                    <button 
                        onClick={() => downloadCSV(atRiskUsers, 'at_risk_users.csv')}
                        className="inline-flex items-center justify-center p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 shrink-0 shadow-sm hover:shadow-md"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </Tooltip>
            </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <tr>
                        {visibleColumns.includes('name') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>}
                        {visibleColumns.includes('email') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>}
                        {visibleColumns.includes('last_login') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {atRiskUsers.length === 0 && (
                        <tr><td colSpan={3} className="px-3 py-6 text-center text-sm text-gray-500">No at-risk users found! 🎉</td></tr>
                    )}
                    {atRiskUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {visibleColumns.includes('name') && <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{u.name}</td>}
                            {visibleColumns.includes('email') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.email}</td>}
                            {visibleColumns.includes('last_login') && <td className="px-3 py-3 whitespace-nowrap text-sm text-red-500 dark:text-red-400">{u.last_login_human}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};

const TableAccessLogs = ({ accessLogs }) => {
    const { visibleColumns, toggleColumn } = useTableColumns('reporting_access_logs', [
        { id: 'user', label: 'User' },
        { id: 'email', label: 'Email' },
        { id: 'ip', label: 'IP Address' },
        { id: 'location', label: 'Location' },
        { id: 'time', label: 'Time' }
    ]);
    return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Access Logs</h3>
            <div className="flex items-center gap-2">
                <ColumnSelector 
                    columns={[
                        { id: 'user', label: 'User' },
                        { id: 'email', label: 'Email' },
                        { id: 'ip', label: 'IP Address' },
                        { id: 'location', label: 'Location' },
                        { id: 'time', label: 'Time' }
                    ]}
                    visibleColumns={visibleColumns}
                    toggleColumn={toggleColumn}
                />
                <Tooltip content="Export CSV">
                    <button 
                        onClick={() => downloadCSV(accessLogs, 'access_logs.csv')}
                        className="inline-flex items-center justify-center p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 shrink-0 shadow-sm hover:shadow-md"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </Tooltip>
            </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <tr>
                        {visibleColumns.includes('user') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>}
                        {visibleColumns.includes('email') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>}
                        {visibleColumns.includes('ip') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>}
                        {visibleColumns.includes('location') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>}
                        {visibleColumns.includes('time') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {accessLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {visibleColumns.includes('user') && <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{log.user_name}</td>}
                            {visibleColumns.includes('email') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.email}</td>}
                            {visibleColumns.includes('ip') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.ip}</td>}
                            {visibleColumns.includes('location') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.location}</td>}
                            {visibleColumns.includes('time') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.time}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};

const TableAbandonedAccounts = ({ abandonedAccounts }) => {
    const { visibleColumns, toggleColumn } = useTableColumns('reporting_abandoned_accounts', [
        { id: 'user', label: 'User' },
        { id: 'registered', label: 'Registered' }
    ]);
    return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Abandoned Accounts</h3>
            <div className="flex items-center gap-2">
                <ColumnSelector 
                    columns={[
                        { id: 'user', label: 'User' },
                        { id: 'registered', label: 'Registered' }
                    ]}
                    visibleColumns={visibleColumns}
                    toggleColumn={toggleColumn}
                />
                <Tooltip content="Export CSV">
                    <button 
                        onClick={() => downloadCSV(abandonedAccounts, 'abandoned_accounts.csv')}
                        className="inline-flex items-center justify-center p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 shrink-0 shadow-sm hover:shadow-md"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </Tooltip>
            </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <tr>
                        {visibleColumns.includes('user') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>}
                        {visibleColumns.includes('registered') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {abandonedAccounts.length === 0 && (
                        <tr><td colSpan={2} className="px-3 py-6 text-center text-sm text-gray-500">No abandoned accounts found.</td></tr>
                    )}
                    {abandonedAccounts.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {visibleColumns.includes('user') && <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{u.name} <span className="text-gray-400 font-normal block">{u.email}</span></td>}
                            {visibleColumns.includes('registered') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.created_human}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};

const TableSettingsAudit = ({ settingsAudit }) => {
    const { visibleColumns, toggleColumn } = useTableColumns('reporting_settings_audit', [
        { id: 'setting_key', label: 'Setting Key' },
        { id: 'last_updated', label: 'Last Updated' }
    ]);
    return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Global Settings Audit Log</h3>
            <div className="flex items-center gap-2">
                <ColumnSelector 
                    columns={[
                        { id: 'setting_key', label: 'Setting Key' },
                        { id: 'last_updated', label: 'Last Updated' }
                    ]}
                    visibleColumns={visibleColumns}
                    toggleColumn={toggleColumn}
                />
                <Tooltip content="Export CSV">
                    <button 
                        onClick={() => downloadCSV(settingsAudit, 'settings_audit.csv')}
                        className="inline-flex items-center justify-center p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 shrink-0 shadow-sm hover:shadow-md"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </Tooltip>
            </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <tr>
                        {visibleColumns.includes('setting_key') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Setting Key</th>}
                        {visibleColumns.includes('last_updated') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {settingsAudit.length === 0 && (
                        <tr><td colSpan={2} className="px-3 py-6 text-center text-sm text-gray-500">No setting updates found.</td></tr>
                    )}
                    {settingsAudit.map((s, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {visibleColumns.includes('setting_key') && <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{s.key}</td>}
                            {visibleColumns.includes('last_updated') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{s.updated_human}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};

const ChartRoleDistribution = ({ roleDistribution }) => {
    const COLORS = ['#6366f1', '#10b981'];
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Role Distribution</h3>
            <div className="w-full h-[300px] lg:flex-1 lg:h-auto lg:min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={roleDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {roleDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const TableGeoDistribution = ({ geoDistribution }) => {
    const [expandedRows, setExpandedRows] = useState({});
    
    const toggleRow = (idx) => {
        setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const flatDataForCsv = geoDistribution.flatMap(loc => 
        (loc.users || []).map(u => ({ 
            Location: loc.location, 
            Name: u.name, 
            Email: u.email 
        }))
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Geographical Distribution</h3>
                <Tooltip content="Export CSV">
                    <button 
                        onClick={() => downloadCSV(flatDataForCsv, 'geo_distribution.csv')}
                        className="inline-flex items-center justify-center p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 shrink-0 shadow-sm hover:shadow-md"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </Tooltip>
            </div>
            <div className="w-full flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                    {geoDistribution.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No location data available.</p>
                    ) : geoDistribution.map((loc, idx) => (
                        <div key={idx} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                            <div 
                                className="flex justify-between items-center cursor-pointer group"
                                onClick={() => toggleRow(idx)}
                            >
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 transition-colors flex items-center gap-2">
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedRows[idx] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    {loc.location}
                                </span>
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{loc.count} users</span>
                            </div>
                            
                            {expandedRows[idx] && loc.users && (
                                <div className="mt-3 ml-6 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50 space-y-2">
                                    {loc.users.map((u, i) => (
                                        <div key={i} className="text-xs">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{u.name}</span>
                                            <span className="text-gray-500 dark:text-gray-400 ml-2">{u.email}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MetricPeakUsage = ({ peakUsage }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col justify-center hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Peak Usage Time</h3>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{peakUsage}</p>
        <p className="text-xs text-gray-500 mt-2">Based on 90-day login heatmap</p>
    </div>
);

const ChartActiveUsers = ({ activeUsersData }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">DAU vs MAU (Last 30 Days)</h3>
        <div className="w-full h-[300px] lg:flex-1 lg:h-auto lg:min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeUsersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickMargin={10} minTickGap={20} />
                    <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="dau" name="Daily Active Users" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="mau" name="Monthly Active Users" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    </div>
);

// Default Layout
const defaultLayout = [
    { i: 'total-notes', x: 0, y: 0, w: 2, h: 1, minW: 2 },
    { i: 'avg-length', x: 2, y: 0, w: 2, h: 1, minW: 2 },
    { i: 'peak-usage', x: 0, y: 1, w: 2, h: 1, minW: 2 },
    { i: 'role-distribution', x: 2, y: 1, w: 2, h: 2, minW: 2 },
    { i: 'velocity', x: 0, y: 2, w: 2, h: 2, minW: 2 },
    { i: 'active-users', x: 2, y: 3, w: 2, h: 2, minW: 2 },
    { i: 'tag-cloud', x: 0, y: 4, w: 2, h: 2, minW: 2 },
    { i: 'geo-distribution', x: 2, y: 5, w: 2, h: 2, minW: 2 },
    { i: 'heatmap', x: 0, y: 7, w: 4, h: 2, minW: 3 },
    { i: 'power-users', x: 0, y: 9, w: 2, h: 2, minW: 2 },
    { i: 'at-risk', x: 2, y: 9, w: 2, h: 2, minW: 2 },
    { i: 'access-logs', x: 0, y: 11, w: 4, h: 2, minW: 3 },
    { i: 'abandoned', x: 0, y: 13, w: 2, h: 2, minW: 2 },
    { i: 'settings-audit', x: 2, y: 13, w: 2, h: 2, minW: 2 },
    { i: 'widget-usage', x: 0, y: 15, w: 4, h: 2, minW: 2 },
    { i: 'total-notes', x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'avg-length', x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'velocity', x: 2, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    { i: 'tag-cloud', x: 0, y: 1, w: 2, h: 2, minW: 2, minH: 2 },
    { i: 'heatmap', x: 2, y: 2, w: 2, h: 2, minW: 2, minH: 2 },
    { i: 'widget-usage', x: 0, y: 3, w: 2, h: 2, minW: 2, minH: 2 },
    { i: 'power-users', x: 2, y: 4, w: 2, h: 2, minW: 2, minH: 2 },
    { i: 'at-risk', x: 0, y: 5, w: 2, h: 2, minW: 2, minH: 2 },
    { i: 'access-logs', x: 2, y: 6, w: 2, h: 2, minW: 2, minH: 2 },
    { i: 'abandoned', x: 0, y: 7, w: 2, h: 2, minW: 2, minH: 2 },
    { i: 'settings-audit', x: 2, y: 8, w: 2, h: 2, minW: 2, minH: 2 },
];

export default function Reporting({ 
    powerUsers, atRiskUsers, activityHeatmap, noteVelocity, 
    tagCloud, accessLogs, abandonedAccounts, settingsAudit, widgetUsage, stats,
    roleDistribution, geoDistribution, peakUsage, activeUsersData
}) {
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [layouts, setLayouts] = useState(() => {
        const savedLayout = localStorage.getItem('admin_reporting_layout_v3');
        if (savedLayout) return JSON.parse(savedLayout);
        return {
            lg: defaultLayout,
            md: defaultLayout,
            sm: defaultLayout
        };
    });
    const { width: containerWidth, containerRef } = useContainerWidth();
    
    const [availableWidgets, setAvailableWidgets] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_reporting_widgets_v3');
            return saved ? JSON.parse(saved) : [
                { id: 'total-notes', title: 'Total Notes' },
                { id: 'avg-length', title: 'Avg Note Length' },
                { id: 'peak-usage', title: 'Peak Usage Time' },
                { id: 'role-distribution', title: 'Role Distribution' },
                { id: 'velocity', title: 'Note Velocity' },
                { id: 'active-users', title: 'DAU vs MAU' },
                { id: 'tag-cloud', title: 'Top Tags' },
                { id: 'geo-distribution', title: 'Geographical Distribution' },
                { id: 'heatmap', title: 'Activity Heatmap' },
                { id: 'widget-usage', title: 'Widget Usage' },
                { id: 'power-users', title: 'Power Users' },
                { id: 'at-risk', title: 'At-Risk Users' },
                { id: 'access-logs', title: 'Access Logs' },
                { id: 'abandoned', title: 'Abandoned Accounts' },
                { id: 'settings-audit', title: 'Settings Audit' },
            ];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('reporting_dashboard_layouts', JSON.stringify(layouts));
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
    };

    const handleReorderWidgets = (newOrder) => {
        setAvailableWidgets(newOrder);
        localStorage.setItem('admin_reporting_widgets_v3', JSON.stringify(newOrder));
        setLayouts({
            lg: repackLayout(newOrder, layouts.lg, 4),
            md: repackLayout(newOrder, layouts.md, 3),
            sm: repackLayout(newOrder, layouts.sm, 2),
        });
    };

    const isWidgetEnabled = (id) => layouts.lg.some(item => item.i === id);

    const handleToggleWidget = (id) => {
        if (isWidgetEnabled(id)) {
            setLayouts({
                lg: layouts.lg.filter(item => item.i !== id),
                md: layouts.md.filter(item => item.i !== id),
                sm: layouts.sm.filter(item => item.i !== id),
            });
        } else {
            const y = Math.max(0, ...layouts.lg.map(item => item.y + item.h));
            const newItem = defaultLayout.find(item => item.i === id) || {
                i: id, x: 0, y: y, w: 2, h: 2, minW: 2
            };
            setLayouts({
                lg: repackLayout(availableWidgets, [...layouts.lg, newItem], 4),
                md: repackLayout(availableWidgets, [...layouts.md, newItem], 3),
                sm: repackLayout(availableWidgets, [...layouts.sm, newItem], 2),
            });
        }
    };

    const renderWidget = (id) => {
        switch (id) {
            case 'total-notes': return <MetricTotalNotes stats={stats} />;
            case 'avg-length': return <MetricAvgNoteLength stats={stats} />;
            case 'velocity': return <ChartVelocity noteVelocity={noteVelocity} />;
            case 'tag-cloud': return <ChartTagCloud tagCloud={tagCloud} />;
            case 'heatmap': return <ChartHeatmap activityHeatmap={activityHeatmap} />;
            case 'widget-usage': return <TableWidgetUsage widgetUsage={widgetUsage} />;
            case 'power-users': return <TablePowerUsers powerUsers={powerUsers} />;
            case 'at-risk': return <TableAtRiskUsers atRiskUsers={atRiskUsers} />;
            case 'access-logs': return <TableAccessLogs accessLogs={accessLogs} />;
            case 'abandoned': return <TableAbandonedAccounts abandonedAccounts={abandonedAccounts} />;
            case 'settings-audit': return <TableSettingsAudit settingsAudit={settingsAudit} />;
            case 'role-distribution': return <ChartRoleDistribution roleDistribution={roleDistribution} />;
            case 'geo-distribution': return <TableGeoDistribution geoDistribution={geoDistribution} />;
            case 'peak-usage': return <MetricPeakUsage peakUsage={peakUsage} />;
            case 'active-users': return <ChartActiveUsers activeUsersData={activeUsersData} />;
            default: return null;
        }
    };
    
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center w-full">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Platform Reporting & Analytics</h2>
                    <button 
                        onClick={() => setIsCustomizeOpen(true)}
                        className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        <SlidersIcon />
                        <span className="hidden sm:inline">Customize</span>
                    </button>
                </div>
            }
        >
            <Head title="Reporting" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
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
                                cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
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
