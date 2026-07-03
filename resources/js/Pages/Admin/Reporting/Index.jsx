import React, { useState, useEffect, useRef, Fragment } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Listbox, Transition } from '@headlessui/react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Responsive as ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import { repackLayout } from '@/utils/gridLayoutUtils';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell, ComposedChart, Legend
} from 'recharts';
import { Download, Monitor, Smartphone, Tablet, Globe, Check, ChevronsUpDown } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import useTableColumns from '@/Hooks/useTableColumns';
import ColumnSelector from '@/Components/ColumnSelector';
import Tooltip from '@/Components/Tooltip';
import { downloadCSV } from '@/utils/csvUtils';
import Pagination from '@/Components/Pagination';

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
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col justify-between gap-3 sm:gap-0 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <p className="text-sm font-medium uppercase tracking-wider">Total Notes</p>
        </div>
        <div>
            <h4 className="text-4xl sm:text-5xl font-light text-indigo-600 dark:text-indigo-400 tracking-tight">
                {stats.totalNotes.toLocaleString()}
            </h4>
        </div>
    </div>
);

const MetricAvgNoteLength = ({ stats }) => (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col justify-between gap-3 sm:gap-0 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <p className="text-sm font-medium uppercase tracking-wider">Avg Note Length</p>
        </div>
        <div>
            <h4 className="text-4xl sm:text-5xl font-light text-purple-600 dark:text-purple-400 tracking-tight">
                {stats.avgNoteLength.toLocaleString()} <span className="text-xl sm:text-2xl font-medium">chars</span>
            </h4>
        </div>
    </div>
);

const ChartVelocity = ({ noteVelocity }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300">
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300">
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300">
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden hover:shadow-2xl transition-shadow duration-300">
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
                        onClick={() => downloadCSV(powerUsers.data, 'power_users.csv')}
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
                    {powerUsers.data.map((u, i) => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {visibleColumns.includes('name') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                <div className="font-medium flex items-center gap-2">
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
        <div className="mt-4">
            <Pagination links={powerUsers.links} />
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden hover:shadow-2xl transition-shadow duration-300">
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
        { id: 'device', label: 'Device' },
        { id: 'email', label: 'Email' },
        { id: 'ip', label: 'IP Address' },
        { id: 'location', label: 'Location' },
        { id: 'time', label: 'Time' }
    ]);
    return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Access Logs</h3>
            <div className="flex items-center gap-2">
                <ColumnSelector 
                    columns={[
                        { id: 'user', label: 'User' },
                        { id: 'device', label: 'Device' },
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
                        onClick={() => downloadCSV(accessLogs.data, 'access_logs.csv')}
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
                        {visibleColumns.includes('device') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Device</th>}
                        {visibleColumns.includes('email') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>}
                        {visibleColumns.includes('ip') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>}
                        {visibleColumns.includes('location') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>}
                        {visibleColumns.includes('time') && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {accessLogs.data.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {visibleColumns.includes('user') && <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{log.user_name}</td>}
                            {visibleColumns.includes('device') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1" title={`${log.platform} - ${log.browser}`}>
                                    {log.device_type === 'Desktop' ? <Monitor className="w-4 h-4 text-indigo-500" /> : log.device_type === 'Tablet' ? <Tablet className="w-4 h-4 text-purple-500" /> : log.device_type === 'Mobile' ? <Smartphone className="w-4 h-4 text-pink-500" /> : <Globe className="w-4 h-4 text-gray-500" />}
                                </div>
                            </td>}
                            {visibleColumns.includes('email') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.email}</td>}
                            {visibleColumns.includes('ip') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.ip}</td>}
                            {visibleColumns.includes('location') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.location}</td>}
                            {visibleColumns.includes('time') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.time}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="mt-4">
            <Pagination links={accessLogs.links} />
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden hover:shadow-2xl transition-shadow duration-300">
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
                        onClick={() => downloadCSV(abandonedAccounts.data, 'abandoned_accounts.csv')}
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
                    {abandonedAccounts.data.length === 0 && (
                        <tr><td colSpan={2} className="px-3 py-6 text-center text-sm text-gray-500">No abandoned accounts found.</td></tr>
                    )}
                    {abandonedAccounts.data.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {visibleColumns.includes('user') && <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{u.name} <span className="text-gray-400 font-normal block">{u.email}</span></td>}
                            {visibleColumns.includes('registered') && <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.created_human}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="mt-4">
            <Pagination links={abandonedAccounts.links} />
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden hover:shadow-2xl transition-shadow duration-300">
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300">
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
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
                                className="flex justify-between items-center cursor-pointer group/row"
                                onClick={() => toggleRow(idx)}
                            >
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/row:text-primary-600 transition-colors flex items-center gap-2">
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
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 flex-col justify-between gap-3 sm:gap-0 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex flex-col text-gray-500 dark:text-gray-400">
            <p className="text-sm font-medium uppercase tracking-wider">Peak Usage Time</p>
            <p className="text-xs mt-1 opacity-70">Based on 90-day login heatmap</p>
        </div>
        <div>
            <h4 className="text-4xl sm:text-5xl font-light text-amber-600 dark:text-amber-400 tracking-tight">
                {peakUsage}
            </h4>
        </div>
    </div>
);

const ChartActiveUsers = ({ activeUsersData }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300">
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

const ChartDeviceDistribution = ({ deviceDistribution }) => {
    const COLORS = ['#818CF8', '#C084FC', '#F472B6', '#9CA3AF'];
    const total = deviceDistribution.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Device Usage</h3>
            <div className="w-full h-[300px] lg:flex-1 lg:h-auto lg:min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={deviceDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {deviceDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                            formatter={(value) => {
                                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return [`${value} (${percent}%)`, 'Count'];
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const MapLoginTrajectory = ({ loginTrajectories }) => {
    const mapRef = React.useRef(null);
    const mapContainer = React.useRef(null);
    const layerGroupRef = React.useRef(null);
    const [selectedUserId, setSelectedUserId] = React.useState('all');

    React.useEffect(() => {
        if (!mapContainer.current) return;

        if (!mapRef.current) {
            // Initialize map
            mapRef.current = L.map(mapContainer.current, {
                center: [20, 0],
                zoom: 2,
                zoomControl: false,
                attributionControl: false
            });

            // Dark theme tiles (CartoDB Dark Matter)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(mapRef.current);
            
            layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
        }

        // Clear previous layers
        layerGroupRef.current.clearLayers();

        const trajectoriesToShow = selectedUserId === 'all' 
            ? loginTrajectories 
            : loginTrajectories.filter(t => t.user_id.toString() === selectedUserId);

        // Plot trajectories
        trajectoriesToShow.forEach(userTrack => {
            const latlngs = userTrack.path.map(p => [p.lat, p.lng]);
            
            // Draw path line
            if (latlngs.length > 1) {
                L.polyline(latlngs, {
                    color: '#818CF8', // Indigo 400
                    weight: 2,
                    opacity: 0.6,
                    dashArray: '5, 5'
                }).addTo(layerGroupRef.current);
            }

            // Draw points
            userTrack.path.forEach(p => {
                L.circleMarker([p.lat, p.lng], {
                    radius: 4,
                    fillColor: '#C084FC', // Purple 400
                    color: '#fff',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                })
                .bindTooltip(`${userTrack.name} <br/> ${p.city}, ${p.country} <br/> <span class="text-xs text-gray-300">${p.time}</span>`, {
                    className: 'bg-gray-800 text-white border-gray-700'
                })
                .addTo(layerGroupRef.current);
            });
        });

        // We don't remove the map on cleanup, just when unmounting completely
        return () => {
            // Cleanup handled when component fully unmounts below, 
            // but we leave mapRef alive across re-renders for performance.
        };
    }, [loginTrajectories, selectedUserId]);

    // Cleanup map on unmount
    React.useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const options = [
        { id: 'all', name: 'All Users' },
        ...loginTrajectories.map(t => ({ id: t.user_id.toString(), name: t.name }))
    ];
    const selectedOption = options.find(o => o.id === selectedUserId) || options[0];

    return (
        <div className="bg-white dark:bg-gray-800 p-0 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:shadow-2xl transition-shadow duration-300 overflow-hidden relative">
            <div className="absolute top-4 left-6 z-[1000] pointer-events-auto flex items-center gap-4">
                <h3 className="text-lg font-medium text-white drop-shadow-md">Global Login Trajectories</h3>
                <div className="relative w-48">
                    <Listbox value={selectedUserId} onChange={setSelectedUserId}>
                        <div className="relative mt-1">
                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-800/90 backdrop-blur-sm py-2 pl-3 pr-10 text-left text-white shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 sm:text-sm border border-gray-700 hover:bg-gray-700 transition-colors">
                                <span className="block truncate">{selectedOption.name}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronsUpDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </span>
                            </Listbox.Button>
                            <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm border border-gray-700 custom-scrollbar z-[1001]">
                                    {options.map((option) => (
                                        <Listbox.Option
                                            key={option.id}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 transition-colors ${
                                                    active ? 'bg-indigo-600 text-white' : 'text-gray-200'
                                                }`
                                            }
                                            value={option.id}
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-medium text-white' : 'font-normal'}`}>
                                                        {option.name}
                                                    </span>
                                                    {selected ? (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-400">
                                                            <Check className="h-4 w-4" aria-hidden="true" />
                                                        </span>
                                                    ) : null}
                                                </>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </Transition>
                        </div>
                    </Listbox>
                </div>
            </div>
            <div ref={mapContainer} className="w-full h-full min-h-[300px]" style={{ zIndex: 1 }} />
        </div>
    );
};

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
    { i: 'device-distribution', x: 0, y: 13, w: 2, h: 2, minW: 2 },
    { i: 'login-trajectories', x: 2, y: 13, w: 2, h: 2, minW: 2 },
    { i: 'abandoned', x: 0, y: 15, w: 2, h: 2, minW: 2 },
    { i: 'settings-audit', x: 2, y: 15, w: 2, h: 2, minW: 2 },
    { i: 'widget-usage', x: 0, y: 17, w: 4, h: 2, minW: 2 },
];

export default function Reporting({ 
    powerUsers, atRiskUsers, activityHeatmap, noteVelocity, 
    tagCloud, accessLogs, abandonedAccounts, settingsAudit, widgetUsage, stats,
    roleDistribution, geoDistribution, peakUsage, activeUsersData,
    deviceDistribution, loginTrajectories
}) {
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [layouts, setLayouts] = useState(() => {
        const savedLayout = localStorage.getItem('admin_reporting_layout_v4');
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
                { id: 'device-distribution', title: 'Device Distribution' },
                { id: 'login-trajectories', title: 'Global Trajectories Map' },
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
        localStorage.setItem('admin_reporting_layout_v4', JSON.stringify(layouts));
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
            case 'device-distribution': return <ChartDeviceDistribution deviceDistribution={deviceDistribution} />;
            case 'login-trajectories': return <MapLoginTrajectory loginTrajectories={loginTrajectories} />;
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
                <div className="flex justify-between items-center w-full gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Platform Reporting & Analytics
                    </h2>
                    <Tooltip content="Customize Layout">
                        <button 
                            onClick={() => setIsCustomizeOpen(true)}
                            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                        >
                            <SlidersIcon />
                        </button>
                    </Tooltip>
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
                                layouts={layouts}
                                onLayoutChange={handleLayoutChange}
                                breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 }}
                                cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                                rowHeight={150}
                                containerPadding={[0, 0]}
                                margin={[20, 20]}
                            >
                            {(layouts.lg || []).map(item => (
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
