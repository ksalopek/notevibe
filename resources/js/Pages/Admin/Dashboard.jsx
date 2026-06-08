import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

// SVG Icons
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const ActivityIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>);
const DatabaseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const CheckCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);

export default function Dashboard({ metrics, recentUsers }) {
    const { patch: patchDisable } = useForm();
    const { patch: patchEnable } = useForm();

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-bold text-2xl text-slate-800 dark:text-slate-100 leading-tight">
                    Admin Command Center
                </h2>
            }
        >
            <Head title="Admin Command Center" />

            {/* Use a distinct background styling for the admin area */}
            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
                
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
                        <ActivityIcon /> <span className="ml-3">System Overview</span>
                    </h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Monitor platform health and manage global settings.
                    </p>
                </motion.div>

                {/* Metrics Cards */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md overflow-hidden shadow-md rounded-2xl border-l-4 border-l-blue-500 border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                            <UsersIcon />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Users</p>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.totalUsers || 0}</h4>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md overflow-hidden shadow-md rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <CheckCircleIcon />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active Users</p>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.activeUsers || 0}</h4>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md overflow-hidden shadow-md rounded-2xl border-l-4 border-l-amber-500 border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
                            <AlertTriangleIcon />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Inactive Users</p>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.inactiveUsers || 0}</h4>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md overflow-hidden shadow-md rounded-2xl border-l-4 border-l-indigo-500 border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <DatabaseIcon />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Notes</p>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.totalNotes || 0}</h4>
                        </div>
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    
                    {/* Recent Users List */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                <span className="mr-2 text-indigo-500"><UsersIcon /></span>
                                Recent Registrations
                            </h3>
                            <Link href={route('admin.users')} className="text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                Manage Users &rarr;
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {!recentUsers || recentUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-8 text-center text-slate-500">No users found.</td>
                                        </tr>
                                    ) : (
                                        recentUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white flex items-center">
                                                    {user.is_admin && <span className="mr-2 text-amber-500" title="Admin"><SettingsIcon /></span>}
                                                    {user.name}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    {user.is_active ? (
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Inactive</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Quick Actions Panel */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-slate-900 dark:bg-black rounded-3xl p-6 shadow-2xl border border-slate-700 text-white"
                    >
                        <div className="flex items-center mb-6 border-b border-slate-700 pb-4">
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
                    </motion.div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
