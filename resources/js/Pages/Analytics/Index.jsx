import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Flame, PenTool, Type, Zap } from 'lucide-react';

const COLORS = ['#818CF8', '#A78BFA', '#F472B6', '#34D399', '#FBBF24', '#60A5FA', '#F87171', '#3B82F6'];

export default function AnalyticsIndex({ streak, totalWords, persona, hourChart, tagDistribution, velocityChart, busiestDayChart, totalNotes }) {
    
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">My Analytics</h2>}
        >
            <Head title="My Analytics" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mb-3">
                                <Flame className="w-8 h-8 text-orange-500" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Streak</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{streak} {streak === 1 ? 'Day' : 'Days'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full mb-3">
                                <Type className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Words</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalWords.toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full mb-3">
                                <PenTool className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Notes</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalNotes.toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-3">
                                <Zap className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Writing Persona</h3>
                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-2">{persona}</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Note Velocity */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Note Velocity (Last 30 Days)</h3>
                            <div className="h-64">
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

                        {/* Tag Distribution */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Top Topics</h3>
                            <div className="h-64 flex items-center justify-center">
                                {tagDistribution.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={tagDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
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
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">No tags used yet.</p>
                                )}
                            </div>
                            {tagDistribution.length > 0 && (
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {tagDistribution.map((tag, i) => (
                                        <div key={tag.name} className="flex items-center text-xs">
                                            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                            <span className="text-gray-600 dark:text-gray-400">{tag.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Productivity by Hour */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Productivity by Hour</h3>
                            <div className="h-64">
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

                        {/* Busiest Day */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Busiest Day of the Week</h3>
                            <div className="h-64">
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
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
