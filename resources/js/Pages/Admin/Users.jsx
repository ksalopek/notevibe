import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Users as UsersIconComponent } from 'lucide-react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { repackLayout } from '@/utils/gridLayoutUtils';
import Pagination from '@/Components/Pagination';
import Tooltip from '@/Components/Tooltip';
import { Responsive as ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import axios from 'axios';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Dropdown from '@/Components/Dropdown';
import useTableColumns from '@/Hooks/useTableColumns';
import ColumnSelector from '@/Components/ColumnSelector';
import Heatmap from '@/Components/Heatmap';

const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const SlidersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="4" x2="14" y2="4"></line><line x1="10" y1="4" x2="3" y2="4"></line><line x1="21" y1="12" x2="12" y2="12"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="20" x2="16" y2="20"></line><line x1="12" y1="20" x2="3" y2="20"></line><line x1="14" y1="2" x2="14" y2="6"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="22"></line></svg>);
const GripVerticalIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const MoreVerticalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>);

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
                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 mr-2 touch-none hidden md:block"
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

const defaultAvailableWidgets = [
    { id: 'metric_total', title: 'Total Users' },
    { id: 'metric_new', title: 'New Users' },
    { id: 'metric_active', title: 'Active Ratio' },
    { id: 'heatmap', title: 'Global User Activity' },
    { id: 'users_table', title: 'Users Directory' },
];

const defaultLayouts = {
    lg: [
        { i: 'metric_total', x: 0, y: 0, w: 1, h: 2 },
        { i: 'metric_new', x: 1, y: 0, w: 1, h: 2 },
        { i: 'metric_active', x: 2, y: 0, w: 1, h: 2 },
        { i: 'heatmap', x: 0, y: 2, w: 3, h: 8 },
        { i: 'users_table', x: 0, y: 10, w: 3, h: 8 },
    ],
    md: [
        { i: 'metric_total', x: 0, y: 0, w: 1, h: 2 },
        { i: 'metric_new', x: 1, y: 0, w: 1, h: 2 },
        { i: 'metric_active', x: 2, y: 0, w: 1, h: 2 },
        { i: 'heatmap', x: 0, y: 2, w: 3, h: 8 },
        { i: 'users_table', x: 0, y: 10, w: 3, h: 8 },
    ],
    sm: [
        { i: 'metric_total', x: 0, y: 0, w: 2, h: 2 },
        { i: 'metric_new', x: 0, y: 2, w: 2, h: 2 },
        { i: 'metric_active', x: 0, y: 4, w: 2, h: 2 },
        { i: 'heatmap', x: 0, y: 6, w: 2, h: 8 },
        { i: 'users_table', x: 0, y: 14, w: 2, h: 8 },
    ],
    xs: [
        { i: 'metric_total', x: 0, y: 0, w: 1, h: 2 },
        { i: 'metric_new', x: 0, y: 2, w: 1, h: 2 },
        { i: 'metric_active', x: 0, y: 4, w: 1, h: 2 },
        { i: 'heatmap', x: 0, y: 6, w: 1, h: 8 },
        { i: 'users_table', x: 0, y: 14, w: 1, h: 8 },
    ]
};

export default function Users({ users, filters, metrics, heatmapData, availableRoles }) {
    const { auth } = usePage().props;

    // Layout State
    const [layouts, setLayouts] = useState(() => {
        const saved = localStorage.getItem('admin_users_layouts_v2');
        return saved ? JSON.parse(saved) : defaultLayouts;
    });
    const [availableWidgets, setAvailableWidgets] = useState(() => {
        const saved = localStorage.getItem('admin_users_widgets_v2');
        return saved ? JSON.parse(saved) : defaultAvailableWidgets;
    });
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
    const { width: containerWidth, containerRef } = useContainerWidth();
    
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

    // Table State
    const [searchUsers, setSearchUsers] = useState(filters?.search_users || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || 'all');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [selectedUsers, setSelectedUsers] = useState([]);
    
    // Modal State
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(null);
    const [managingRolesUser, setManagingRolesUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [viewingActivityLog, setViewingActivityLog] = useState(null);
    const [activityData, setActivityData] = useState([]);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);

    const { visibleColumns, toggleColumn } = useTableColumns('admin_users_v2', [
        { id: 'checkbox', label: 'Bulk Select' },
        { id: 'id', label: 'ID' },
        { id: 'name', label: 'Name' },
        { id: 'email', label: 'Email' },
        { id: 'role', label: 'Role' },
        { id: 'status', label: 'Status' },
        { id: 'actions', label: 'Actions' }
    ]);

    const currentSortValue = `${filters?.sort || 'id'}-${filters?.direction || 'desc'}`;
    const [sortValue, setSortValue] = useState(currentSortValue);

    // Grid Effects
    useEffect(() => {
        localStorage.setItem('admin_users_layouts_v2', JSON.stringify(layouts));
    }, [layouts]);

    useEffect(() => {
        if (!users || !users.data) return;
        const basePx = 220;
        const rowPx = 65;
        const bulkActionPx = selectedUsers.length > 0 ? 50 : 0;
        
        let requiredPx = basePx + bulkActionPx;
        if (users.data.length === 0) {
            requiredPx += 100;
        } else {
            requiredPx += users.data.length * rowPx;
        }

        const requiredH = Math.max(5, Math.ceil((requiredPx + 24) / 64));

        setLayouts(prev => {
            if (!prev) return prev;
            let changed = false;
            const newLayouts = {};
            Object.keys(prev).forEach(bp => {
                if (!prev[bp]) return;
                const layout = [...prev[bp]];
                const index = layout.findIndex(item => item.i === 'users_table');
                if (index !== -1 && layout[index].h !== requiredH) {
                    layout[index] = { ...layout[index], h: requiredH };
                    changed = true;
                }
                newLayouts[bp] = layout;
            });
            if (changed) {
                Object.keys(newLayouts).forEach(bp => {
                    newLayouts[bp] = repackLayout(availableWidgets, newLayouts[bp], bp === 'lg' || bp === 'md' ? 3 : (bp === 'sm' ? 2 : 1));
                });
            }
            return changed ? newLayouts : prev;
        });
    }, [users, selectedUsers.length, availableWidgets]);

    useEffect(() => {
        localStorage.setItem('admin_users_widgets_v2', JSON.stringify(availableWidgets));
    }, [availableWidgets]);

    const handleLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
    };

    const handleReorderWidgets = (newOrder) => {
        setAvailableWidgets(newOrder);
        setLayouts(prevLayouts => {
            const newLayouts = { ...prevLayouts };
            Object.keys(newLayouts).forEach(bp => {
                if (newLayouts[bp]) {
                    newLayouts[bp] = repackLayout(newOrder, newLayouts[bp], bp === 'lg' || bp === 'md' ? 3 : (bp === 'sm' ? 2 : 1));
                }
            });
            return newLayouts;
        });
    };

    const toggleWidget = (widgetId) => {
        setLayouts(prevLayouts => {
            const newLayouts = { ...prevLayouts };
            Object.keys(newLayouts).forEach(bp => {
                if (!newLayouts[bp]) return;
                const layout = newLayouts[bp];
                const exists = layout.find(item => item.i === widgetId);
                if (exists) {
                    newLayouts[bp] = layout.filter(item => item.i !== widgetId);
                } else {
                    const defaultItem = defaultLayouts[bp]?.find(item => item.i === widgetId) || 
                                        { i: widgetId, x: 0, y: Infinity, w: bp === 'lg' || bp === 'md' ? 3 : 1, h: 4 };
                    newLayouts[bp] = [...layout, { ...defaultItem, y: Infinity }];
                }
                newLayouts[bp] = repackLayout(availableWidgets, newLayouts[bp], bp === 'lg' || bp === 'md' ? 3 : (bp === 'sm' ? 2 : 1));
            });
            return newLayouts;
        });
    };

    // Table Effects & Handlers
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchUsers !== (filters?.search_users || '')) {
                router.get(route('admin.users'), { 
                    ...filters,
                    search_users: searchUsers,
                    role: roleFilter,
                    status: statusFilter
                }, { preserveState: true, replace: true, preserveScroll: true, only: ['users'] });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchUsers]);

    useEffect(() => {
        if (roleFilter !== (filters?.role || 'all') || statusFilter !== (filters?.status || 'all')) {
            router.get(route('admin.users'), { 
                ...filters, 
                search_users: searchUsers,
                role: roleFilter,
                status: statusFilter
            }, { preserveState: true, replace: true, preserveScroll: true, only: ['users', 'filters'] });
        }
    }, [roleFilter, statusFilter]);

    const handleSortChange = (e) => {
        const val = e.target.value;
        setSortValue(val);
        const [field, direction] = val.split('-');
        router.get(route('admin.users'), { 
            ...filters, 
            search_users: searchUsers, 
            role: roleFilter,
            status: statusFilter,
            sort: field, 
            direction: direction 
        }, { preserveState: true, replace: true, preserveScroll: true, only: ['users', 'filters'] });
    };

    const handleSort = (field) => {
        let direction = 'asc';
        if (filters?.sort === field && filters?.direction === 'asc') {
            direction = 'desc';
        }
        setSortValue(`${field}-${direction}`);
        router.get(route('admin.users'), { 
            ...filters, 
            search_users: searchUsers, 
            role: roleFilter,
            status: statusFilter,
            sort: field, 
            direction: direction 
        }, { preserveState: true, replace: true, preserveScroll: true, only: ['users', 'filters'] });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(users.data.map(u => u.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (id) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(uId => uId !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    const executeBulkAction = (action) => {
        if (selectedUsers.length === 0) return;
        if (action === 'delete' && !confirm('Are you sure you want to delete selected users? This is permanent.')) return;
        router.post(route('admin.users.bulk'), {
            userIds: selectedUsers,
            action: action
        }, {
            preserveScroll: true,
            onSuccess: () => setSelectedUsers([])
        });
    };

    const handleExportCSV = () => {
        window.location.href = route('admin.users.export', {
            search_users: searchUsers,
            role: roleFilter,
            status: statusFilter,
            sort: filters?.sort,
            direction: filters?.direction
        });
    };

    const SortIcon = ({ field }) => {
        if (filters?.sort !== field) {
            return <svg className="w-4 h-4 ml-1 opacity-20 group-hover:opacity-50 transition-opacity" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
        }
        if (filters?.direction === 'asc') {
            return <svg className="w-4 h-4 ml-1 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>;
        }
        return <svg className="w-4 h-4 ml-1 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
    };

    const toggleStatus = (user) => router.patch(route('admin.users.toggle', user.id));
    const impersonate = (user) => router.post(route('admin.users.impersonate', user.id));
    const deleteUser = (user) => setConfirmingUserDeletion(user);

    const executeDelete = () => {
        if (confirmingUserDeletion) {
            router.delete(route('admin.users.destroy', confirmingUserDeletion.id), {
                preserveScroll: true,
                onSuccess: () => setConfirmingUserDeletion(null),
            });
        }
    };

    const viewActivity = (user) => {
        setViewingActivityLog(user);
        setIsLoadingActivity(true);
        axios.get(route('admin.users.activity', user.id))
            .then(res => {
                setActivityData(res.data);
                setIsLoadingActivity(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoadingActivity(false);
            });
    };

    // Widget Components
    const renderWidget = (id) => {
        switch (id) {
            case 'metric_total':
                return (
                    <DraggableWidgetWrapper>
                        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-sm rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between gap-3 sm:gap-0 hover:shadow-md transition-shadow h-full">
                            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                                <h4 className="text-sm font-medium uppercase tracking-wider">Total Users</h4>
                            </div>
                            <div>
                                <p className="text-4xl sm:text-5xl font-light text-slate-900 dark:text-white tracking-tight">{metrics?.totalUsers}</p>
                            </div>
                        </div>
                    </DraggableWidgetWrapper>
                );
            case 'metric_new':
                return (
                    <DraggableWidgetWrapper>
                        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-sm rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between gap-3 sm:gap-0 hover:shadow-md transition-shadow h-full">
                            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                                <h4 className="text-sm font-medium uppercase tracking-wider">New Users (7d)</h4>
                            </div>
                            <div>
                                <p className="text-4xl sm:text-5xl font-light text-indigo-600 dark:text-indigo-400 tracking-tight">+{metrics?.newUsersThisWeek}</p>
                            </div>
                        </div>
                    </DraggableWidgetWrapper>
                );
            case 'metric_active':
                return (
                    <DraggableWidgetWrapper>
                        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-sm rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between gap-3 sm:gap-0 hover:shadow-md transition-shadow h-full">
                            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                                <h4 className="text-sm font-medium uppercase tracking-wider">Active Ratio</h4>
                            </div>
                            <div>
                                <p className="text-4xl sm:text-5xl font-light text-emerald-600 dark:text-emerald-400 tracking-tight">
                                    {metrics?.totalUsers > 0 ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100) : 0}%
                                </p>
                            </div>
                        </div>
                    </DraggableWidgetWrapper>
                );
            case 'heatmap':
                return (
                    <DraggableWidgetWrapper>
                        <div className="bg-white dark:bg-slate-800 p-6 shadow-sm sm:rounded-3xl hover:shadow-lg transition-shadow duration-300 border border-slate-100 dark:border-slate-700/50 h-full flex flex-col">
                            <div className="mb-4">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                    <span className="mr-2 text-indigo-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    </span>
                                    Global User Activity
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Visualizing user location density based on recent activity.</p>
                            </div>
                            <div className="flex-1 min-h-0 relative">
                                <Heatmap data={heatmapData} />
                            </div>
                        </div>
                    </DraggableWidgetWrapper>
                );
            case 'users_table':
                return (
                    <DraggableWidgetWrapper>
                        <div className="h-full flex flex-col">
                            <div className="flex flex-wrap items-center mb-4 gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Search by name or email..." 
                                    value={searchUsers}
                                    onChange={(e) => setSearchUsers(e.target.value)}
                                    className="flex-1 min-w-[200px] md:flex-none md:w-64 px-4 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-slate-400"
                                />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-auto bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-auto bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="disabled">Disabled</option>
                                </select>
                                <select
                                    value={sortValue}
                                    onChange={handleSortChange}
                                    className="w-auto bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="id-desc">Newest First</option>
                                    <option value="id-asc">Oldest First</option>
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
                                    <option value="email-asc">Email (A-Z)</option>
                                    <option value="email-desc">Email (Z-A)</option>
                                    <option value="role-asc">Role (A-Z)</option>
                                    <option value="role-desc">Role (Z-A)</option>
                                </select>
                                <div className="flex gap-3 ml-auto">
                                    <ColumnSelector 
                                        columns={[
                                            { id: 'checkbox', label: 'Bulk Select' },
                                            { id: 'id', label: 'ID' },
                                            { id: 'name', label: 'Name' },
                                            { id: 'email', label: 'Email' },
                                            { id: 'role', label: 'Role' },
                                            { id: 'status', label: 'Status' },
                                            { id: 'actions', label: 'Actions' }
                                        ]}
                                        visibleColumns={visibleColumns}
                                        toggleColumn={toggleColumn}
                                    />
                                    <Tooltip content="Export to CSV">
                                        <button 
                                            onClick={handleExportCSV}
                                            className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            <DownloadIcon />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow duration-300 w-full overflow-hidden relative flex flex-col flex-1">
                                {selectedUsers.length > 0 && (
                                    <div className="absolute top-0 left-0 w-full h-12 bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-between px-6 z-10 border-b border-indigo-100 dark:border-indigo-800">
                                        <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                                            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => executeBulkAction('disable')} className="text-xs font-semibold px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 transition-colors shadow-sm">Disable</button>
                                            <button onClick={() => executeBulkAction('enable')} className="text-xs font-semibold px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 transition-colors shadow-sm">Enable</button>
                                            <button onClick={() => executeBulkAction('make_admin')} className="text-xs font-semibold px-3 py-1 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 rounded hover:bg-indigo-50 transition-colors shadow-sm">Make Admin</button>
                                            <button onClick={() => executeBulkAction('make_user')} className="text-xs font-semibold px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 transition-colors shadow-sm">Make User</button>
                                            <button onClick={() => executeBulkAction('delete')} className="text-xs font-semibold px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow-sm">Delete</button>
                                        </div>
                                    </div>
                                )}

                                <div className={`flex-1 overflow-auto w-full ${selectedUsers.length > 0 ? 'mt-12' : ''}`}>
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                            <tr>
                                                {visibleColumns.includes('checkbox') && <th className="px-4 py-5 text-left w-10">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                        checked={users.data && users.data.length > 0 && selectedUsers.length === users.data.length}
                                                        onChange={handleSelectAll}
                                                    />
                                                </th>}
                                                {visibleColumns.includes('id') && <th className="px-4 py-5 text-left">
                                                    <button onClick={() => handleSort('id')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                        ID <SortIcon field="id" />
                                                    </button>
                                                </th>}
                                                {visibleColumns.includes('name') && <th className="px-4 py-5 text-left">
                                                    <button onClick={() => handleSort('name')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                        Name <SortIcon field="name" />
                                                    </button>
                                                </th>}
                                                {visibleColumns.includes('email') && <th className="px-4 py-5 text-left">
                                                    <button onClick={() => handleSort('email')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                        Email <SortIcon field="email" />
                                                    </button>
                                                </th>}
                                                {visibleColumns.includes('role') && <th className="px-4 py-5 text-left">
                                                    <button onClick={() => handleSort('role')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                        Role <SortIcon field="role" />
                                                    </button>
                                                </th>}
                                                {visibleColumns.includes('status') && <th className="px-4 py-5 text-left">
                                                    <button onClick={() => handleSort('is_active')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                        Status <SortIcon field="is_active" />
                                                    </button>
                                                </th>}
                                                {visibleColumns.includes('actions') && <th className="px-4 py-5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Actions
                                                </th>}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                            {!users.data || users.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan={visibleColumns.length || 7} className="px-6 py-8 text-center text-slate-500">No users found.</td>
                                                </tr>
                                            ) : (
                                                users.data.map((u, index) => (
                                                    <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${selectedUsers.includes(u.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                                                        {visibleColumns.includes('checkbox') && <td className="px-4 py-4 whitespace-nowrap">
                                                            <input 
                                                                type="checkbox" 
                                                                className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                                checked={selectedUsers.includes(u.id)}
                                                                onChange={() => handleSelectUser(u.id)}
                                                            />
                                                        </td>}
                                                        {visibleColumns.includes('id') && <td className="px-4 py-4 whitespace-normal break-words text-sm text-slate-900 dark:text-slate-100">{u.id}</td>}
                                                        {visibleColumns.includes('name') && <td className="px-4 py-4 whitespace-normal break-words text-sm text-slate-900 dark:text-slate-100">{u.name}</td>}
                                                        {visibleColumns.includes('email') && <td className="px-4 py-4 whitespace-normal break-words text-sm text-slate-900 dark:text-slate-100">{u.email}</td>}
                                                        {visibleColumns.includes('role') && <td className="px-4 py-4 whitespace-normal break-words text-sm text-slate-900 dark:text-slate-100">{u.roles && u.roles.length > 0 ? u.roles.map(r => r.name).join(', ') : 'user'}</td>}
                                                        {visibleColumns.includes('status') && <td className="px-4 py-4 whitespace-normal break-words text-sm">
                                                            {u.is_active ? (
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">Active</span>
                                                            ) : (
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">Disabled</span>
                                                            )}
                                                        </td>}
                                                        {visibleColumns.includes('actions') && <td className="px-4 py-4 whitespace-normal break-words text-right text-sm font-medium">
                                                            {u.id !== auth.user.id && (
                                                                <div className="flex justify-end w-full items-center">
                                                                    <Dropdown>
                                                                        <Dropdown.Trigger>
                                                                            <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                                                                                <MoreVerticalIcon />
                                                                            </button>
                                                                        </Dropdown.Trigger>
                                                                        <Dropdown.Content align="right" width="48">
                                                                            <button onClick={() => viewActivity(u)} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">View Activity Log</button>
                                                                            <button onClick={() => { setManagingRolesUser(u); setSelectedRoles(u.roles ? u.roles.map(r => r.name) : []); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Manage Roles</button>
                                                                            <button onClick={() => impersonate(u)} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Impersonate User</button>
                                                                            <button onClick={() => toggleStatus(u)} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">{u.is_active ? 'Disable User' : 'Enable User'}</button>
                                                                            <button onClick={() => deleteUser(u)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">Delete User</button>
                                                                        </Dropdown.Content>
                                                                    </Dropdown>
                                                                </div>
                                                            )}
                                                        </td>}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {users.links && users.data.length > 0 && (
                                    <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                                        <Pagination links={users.links} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </DraggableWidgetWrapper>
                );
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center w-full gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl shadow-lg shadow-primary-500/20 text-white">
                        <UsersIconComponent className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
                        Manage Users
                    </h2>
                </div>
                <Tooltip content="Customize Layout">
                    <button
                        onClick={() => setIsCustomizeOpen(true)}
                        className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                    >
                        <SlidersIcon />
                    </button>
                </Tooltip>
            </div>
        }>
            <Head title="Manage Users" />
            
            <div className="py-12 relative min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center">
                            <span className="mr-4 text-indigo-500 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl shadow-sm">
                                <UsersIcon />
                            </span>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Manage Users
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    View, search, and manage all registered accounts in the system.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Responsive Grid Layout */}
                    <div className="mb-20" ref={containerRef}>
                        {isMobile ? (
                            <div className="flex flex-col gap-6">
                                {layouts.lg?.filter(item => layouts[currentBreakpoint]?.find(l => l.i === item.i) || layouts.lg.find(l => l.i === item.i)).map(item => {
                                    const widgetId = item.i;
                                    const isEnabled = !!layouts[currentBreakpoint]?.find(l => l.i === widgetId) || !!layouts.lg?.find(l => l.i === widgetId);
                                    if (!isEnabled) return null;
                                    return (
                                        <div key={widgetId} className="w-full">
                                            {renderWidget(widgetId)}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <ResponsiveGridLayout
                                className="layout"
                                layouts={{
                                    lg: layouts.lg?.map(item => ({ ...item, isDraggable: false, isResizable: false })) || [],
                                    md: layouts.md?.map(item => ({ ...item, isDraggable: false, isResizable: false })) || [],
                                    sm: layouts.sm?.map(item => ({ ...item, isDraggable: false, isResizable: false })) || [],
                                    xs: layouts.xs?.map(item => ({ ...item, isDraggable: false, isResizable: false })) || []
                                }}
                                breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 0 }}
                                cols={{ lg: 3, md: 3, sm: 2, xs: 1 }}
                                rowHeight={40}
                                onLayoutChange={handleLayoutChange}
                                onBreakpointChange={setCurrentBreakpoint}
                                isDraggable={false}
                                isResizable={false}
                                margin={[24, 24]}
                                containerPadding={[0, 0]}
                                useCSSTransforms={true}
                                measureBeforeMount={false}
                                width={containerWidth || 1200}
                            >
                                {layouts[currentBreakpoint]?.map(item => (
                                    <div key={item.i} className="group/widget h-full">
                                        {renderWidget(item.i)}
                                    </div>
                                ))}
                            </ResponsiveGridLayout>
                        )}
                    </div>
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
                        className="relative w-full max-w-sm bg-slate-50 dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                <SlidersIcon /> <span className="ml-2">Customize Layout</span>
                            </h3>
                            <button onClick={() => setIsCustomizeOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto" style={{ layoutScroll: "true" }}>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Toggle widgets on or off, and drag to reorder them on your page.
                            </p>
                            <Reorder.Group 
                                axis="y" 
                                values={availableWidgets} 
                                onReorder={handleReorderWidgets}
                                className="flex flex-col gap-3"
                                layoutScroll
                            >
                                {availableWidgets.map(widget => (
                                    <SlideoutReorderItem 
                                        key={widget.id} 
                                        widget={widget} 
                                        enabled={!!layouts[currentBreakpoint]?.find(l => l.i === widget.id)}
                                        onToggle={toggleWidget}
                                    />
                                ))}
                            </Reorder.Group>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modals */}
            <Modal show={!!viewingActivityLog} onClose={() => setViewingActivityLog(null)} maxWidth="lg">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        Activity Log: {viewingActivityLog?.name}
                    </h2>
                    <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
                        {isLoadingActivity ? (
                            <div className="flex justify-center p-8"><svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
                        ) : activityData.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No recent activity found.</p>
                        ) : (
                            activityData.map((activity, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${activity.type === 'login' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{activity.action}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.details}</p>
                                    </div>
                                    <div className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{new Date(activity.date).toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setViewingActivityLog(null)}>Close</SecondaryButton>
                    </div>
                </div>
            </Modal>

            <Modal show={!!confirmingUserDeletion} onClose={() => setConfirmingUserDeletion(null)}>
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Are you sure you want to completely delete this user?</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">This action cannot be undone. This will permanently delete the user and all associated data from the database.</p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setConfirmingUserDeletion(null)}>Cancel</SecondaryButton>
                        <DangerButton className="ml-3" onClick={executeDelete}>Delete User</DangerButton>
                    </div>
                </div>
            </Modal>

            <Modal show={!!managingRolesUser} onClose={() => setManagingRolesUser(null)} maxWidth="md">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Manage Roles: {managingRolesUser?.name}</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        <label className="flex items-start pb-4 mb-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center h-5">
                                <input type="checkbox" className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500" checked={selectedRoles.length === 0} onChange={(e) => { if (e.target.checked) setSelectedRoles([]); }} disabled={managingRolesUser?.id === auth.user.id && managingRolesUser?.roles?.some(r => r.name === 'super_admin')} />
                            </div>
                            <div className="ml-3 text-sm flex flex-col justify-center">
                                <span className="font-bold text-slate-900 dark:text-slate-100">Standard User</span>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Has no admin privileges.</p>
                            </div>
                        </label>
                        {availableRoles && availableRoles.map((role) => (
                            <label key={role.id} className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500" checked={selectedRoles.includes(role.name)} onChange={(e) => { if (e.target.checked) { setSelectedRoles([...selectedRoles, role.name]); } else { setSelectedRoles(selectedRoles.filter((name) => name !== role.name)); } }} disabled={managingRolesUser?.id === auth.user.id && role.name === 'super_admin'} />
                                </div>
                                <div className="ml-3 text-sm flex flex-col justify-center">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{role.label}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setManagingRolesUser(null)}>Cancel</SecondaryButton>
                        <button onClick={() => { router.put(route('admin.users.roles.sync', managingRolesUser.id), { roles: selectedRoles }, { preserveScroll: true, onSuccess: () => setManagingRolesUser(null) }); }} className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">Save Roles</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
