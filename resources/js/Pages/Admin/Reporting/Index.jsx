import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Download } from 'lucide-react';

export default function ReportingIndex({ powerUsers, atRiskUsers, activityHeatmap, noteVelocity, tagCloud, accessLogs, abandonedAccounts, settingsAudit, stats }) {
    
    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) return;
        const keys = Object.keys(data[0]);
        const csvContent = [
            keys.join(','),
            ...data.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Platform Reporting & Analytics</h2>}
        >
            <Head title="Reporting" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Total Notes</h3>
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalNotes.toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Avg Note Length</h3>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.avgNoteLength.toLocaleString()} chars</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Note Velocity */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Note Velocity (Last 30 Days)</h3>
                            <div className="h-64">
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

                        {/* Tag Cloud */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Top 20 Tags</h3>
                            <div className="h-64">
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
                    </div>

                    {/* Activity Heatmap */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Login Activity Heatmap (Last 90 Days)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis type="number" dataKey="hour" name="Hour" stroke="#6B7280" fontSize={12} tickFormatter={(tick) => `${tick}:00`} domain={[0, 23]} tickCount={24} />
                                    <YAxis type="category" dataKey="day" name="Day" stroke="#6B7280" fontSize={12} />
                                    <ZAxis type="number" dataKey="count" range={[0, 400]} name="Logins" />
                                    <RechartsTooltip 
                                        cursor={{ strokeDasharray: '3 3' }} 
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                        itemStyle={{ color: '#34D399' }}
                                    />
                                    <Scatter name="Logins" data={activityHeatmap} fill="#34D399" opacity={0.8} />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tables Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Power Users */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Power Users Leaderboard</h3>
                                <button 
                                    onClick={() => downloadCSV(powerUsers, 'power_users.csv')}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                                >
                                    <Download className="w-4 h-4" /> Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {powerUsers.map((u, i) => (
                                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    <div className="font-medium flex items-center gap-2">
                                                        <span className="text-gray-400 text-xs w-4">{i + 1}.</span>
                                                        {u.name}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.notes_count}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {u.last_login_human}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* At-Risk Users */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">At-Risk Users (>30 Days Inactive)</h3>
                                <button 
                                    onClick={() => downloadCSV(atRiskUsers, 'at_risk_users.csv')}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                >
                                    <Download className="w-4 h-4" /> Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {atRiskUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-3 py-6 text-center text-sm text-gray-500">No at-risk users found! 🎉</td>
                                            </tr>
                                        )}
                                        {atRiskUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{u.name}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-red-500 dark:text-red-400">
                                                    {u.last_login_human}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-12 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Security & Auditing</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Access Logs */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col col-span-1 lg:col-span-2">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Access Logs (Suspicious Activity)</h3>
                                <button 
                                    onClick={() => downloadCSV(accessLogs, 'access_logs.csv')}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                                >
                                    <Download className="w-4 h-4" /> Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {accessLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{log.user_name}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.email}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.ip}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.location}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Abandoned Accounts */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Abandoned Accounts (No Notes, >7 Days Old)</h3>
                                <button 
                                    onClick={() => downloadCSV(abandonedAccounts, 'abandoned_accounts.csv')}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                                >
                                    <Download className="w-4 h-4" /> Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {abandonedAccounts.length === 0 && (
                                            <tr><td colSpan={2} className="px-3 py-6 text-center text-sm text-gray-500">No abandoned accounts found.</td></tr>
                                        )}
                                        {abandonedAccounts.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{u.name} <span className="text-gray-400 font-normal block">{u.email}</span></td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.created_human}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Settings Audit */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Global Settings Audit Log</h3>
                                <button 
                                    onClick={() => downloadCSV(settingsAudit, 'settings_audit.csv')}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                                >
                                    <Download className="w-4 h-4" /> Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Setting Key</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {settingsAudit.length === 0 && (
                                            <tr><td colSpan={2} className="px-3 py-6 text-center text-sm text-gray-500">No setting updates found.</td></tr>
                                        )}
                                        {settingsAudit.map((s, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{s.key}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{s.updated_human}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
