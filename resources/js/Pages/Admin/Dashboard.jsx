import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Pagination from '@/Components/Pagination';
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
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const ActivityIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>);
const DatabaseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const CheckCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
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

const MetricTotalUsersWidget = ({ metrics }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border-l-4 border-l-blue-500 border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4 shadow-md h-full hover:shadow-xl transition-shadow">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
            <UsersIcon />
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Users</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.totalUsers || 0}</h4>
        </div>
    </div>
);

const MetricActiveUsersWidget = ({ metrics }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border-l-4 border-l-emerald-500 border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4 shadow-md h-full hover:shadow-xl transition-shadow">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon />
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active Users</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.activeUsers || 0}</h4>
        </div>
    </div>
);

const MetricInactiveUsersWidget = ({ metrics }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border-l-4 border-l-amber-500 border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4 shadow-md h-full hover:shadow-xl transition-shadow">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
            <AlertTriangleIcon />
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Inactive Users</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.inactiveUsers || 0}</h4>
        </div>
    </div>
);

const MetricTotalNotesWidget = ({ metrics }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border-l-4 border-l-indigo-500 border border-slate-200 dark:border-slate-700 p-6 flex items-center space-x-4 shadow-md h-full hover:shadow-xl transition-shadow">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <DatabaseIcon />
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Notes</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.totalNotes || 0}</h4>
        </div>
    </div>
);


const RegistrationsWidget = ({ recentUsers }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 h-full">
        <div className="flex items-center justify-between mb-6 pr-10">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <span className="mr-2 text-indigo-500"><UsersIcon /></span>
                Recent Registrations
            </h3>
            <Link href={route('admin.users')} className="text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Manage &rarr;
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
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
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
    </div>
);

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

const LoginsWidget = ({ latestLogins, searchLogins, setSearchLogins }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 h-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 pr-10">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <span className="mr-2 text-emerald-500"><ActivityIcon /></span>
                Latest User Logins
            </h3>
            <div className="w-full sm:w-64">
                <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={searchLogins}
                    onChange={(e) => setSearchLogins(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder-slate-400"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Login</th>
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
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                    {user.name}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {user.email}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {new Date(user.last_login_at).toLocaleString()}
                                </td>
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


export default function Dashboard({ metrics, recentUsers, latestLogins, filters }) {
    const { patch: patchDisable } = useForm();
    const { patch: patchEnable } = useForm();
    
    const [searchLogins, setSearchLogins] = useState(filters?.search_logins || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchLogins !== (filters?.search_logins || '')) {
                router.get(route('admin.index'), { search_logins: searchLogins }, { preserveState: true, replace: true, preserveScroll: true, only: ['latestLogins'] });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchLogins]);

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

    // Drag and Drop Logic
    const defaultOrder = [
        'metric_total_users', 
        'metric_active_users', 
        'metric_inactive_users', 
        'metric_total_notes', 
        'registrations', 
        'actions', 
        'logins'
    ];
    
    const [widgetOrder, setWidgetOrder] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_dashboard_order_v2'); // new key since order changed
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.includes('metric_total_users')) return parsed;
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
                localStorage.setItem('admin_dashboard_order_v2', JSON.stringify(newOrder));
                return newOrder;
            });
        }
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
            case 'registrations':
                return <RegistrationsWidget recentUsers={recentUsers} />;
            case 'actions':
                return <ActionsWidget handleDisableAll={handleDisableAll} handleEnableAll={handleEnableAll} />;
            case 'logins':
                return <LoginsWidget latestLogins={latestLogins} searchLogins={searchLogins} setSearchLogins={setSearchLogins} />;
            default:
                return null;
        }
    };

    const getColSpan = (id) => {
        if (id.startsWith('metric_')) return 'col-span-1 lg:col-span-1';
        if (id === 'registrations') return 'col-span-1 lg:col-span-3';
        if (id === 'actions') return 'col-span-1 lg:col-span-1';
        if (id === 'logins') return 'col-span-1 lg:col-span-4';
        return 'col-span-1 lg:col-span-4';
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
                        Monitor platform health and manage global settings. Drag the handle on each widget to rearrange your dashboard.
                    </p>
                </motion.div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12">
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
