import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Pagination from '@/Components/Pagination';
import Tooltip from '@/Components/Tooltip';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Dropdown from '@/Components/Dropdown';
import Heatmap from '@/Components/Heatmap';
import useTableColumns from '@/Hooks/useTableColumns';
import ColumnSelector from '@/Components/ColumnSelector';
import axios from 'axios';

const ImpersonateIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>);
const BanIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>);
const CheckCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>);
const ShieldIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>);
const MoreVerticalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);

export default function Users({ auth, users, filters, heatmapData, metrics, availableRoles }) {
    const { patch, post, delete: destroy } = useForm();
    const [searchUsers, setSearchUsers] = useState(filters?.search_users || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || 'all');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(null);
    const [managingRolesUser, setManagingRolesUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [viewingActivityLog, setViewingActivityLog] = useState(null);
    const [activityData, setActivityData] = useState([]);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);

    const { visibleColumns, toggleColumn } = useTableColumns('admin_users', [
        { id: 'checkbox', label: '' },
        { id: 'id', label: 'ID' },
        { id: 'name', label: 'Name' },
        { id: 'email', label: 'Email' },
        { id: 'role', label: 'Role' },
        { id: 'status', label: 'Status' },
        { id: 'actions', label: 'Actions' }
    ]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchUsers !== (filters?.search_users || '') || roleFilter !== (filters?.role || 'all') || statusFilter !== (filters?.status || 'all')) {
                router.get(route('admin.users'), { 
                    search_users: searchUsers,
                    role: roleFilter,
                    status: statusFilter,
                    sort: filters?.sort,
                    direction: filters?.direction
                }, { preserveState: true, replace: true, preserveScroll: true, only: ['users', 'filters', 'metrics'] });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchUsers, roleFilter, statusFilter]);

    const handleSort = (field) => {
        let direction = 'asc';
        if (filters?.sort === field && filters?.direction === 'asc') {
            direction = 'desc';
        }

        router.get(route('admin.users'), { 
            search_users: searchUsers,
            role: roleFilter,
            status: statusFilter,
            sort: field, 
            direction: direction 
        }, { preserveState: true, replace: true, preserveScroll: true, only: ['users', 'filters'] });
    };

    const sortValue = `${filters?.sort || 'id'}-${filters?.direction || 'asc'}`;

    const handleSortChange = (e) => {
        const [field, direction] = e.target.value.split('-');
        router.get(route('admin.users'), { 
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
            setSelectedUsers(selectedUsers.filter(userId => userId !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    const executeBulkAction = (action) => {
        if (selectedUsers.length === 0) return;
        if (action === 'delete' && !confirm('Are you sure you want to delete selected users? This is permanent.')) return;
        
        post(route('admin.users.bulk'), {
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

    const toggleStatus = (user) => {
        patch(route('admin.users.toggle', user.id));
    };

    // Removed toggleRole, now handled by modal

    const impersonate = (user) => {
        post(route('admin.users.impersonate', user.id));
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

    const deleteUser = (user) => {
        setConfirmingUserDeletion(user);
    };

    const executeDelete = () => {
        if (confirmingUserDeletion) {
            destroy(route('admin.users.destroy', confirmingUserDeletion.id), {
                preserveScroll: true,
                onSuccess: () => setConfirmingUserDeletion(null),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manage Users</h2>}
        >
            <Head title="Manage Users" />

            <div className="py-12 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center">
                            <span className="mr-4 text-indigo-500 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
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

                    {metrics && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white dark:bg-gray-800 p-6 shadow-sm rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Users</h4>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.totalUsers}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 shadow-sm rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">New Users (7d)</h4>
                                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">+{metrics.newUsersThisWeek}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 shadow-sm rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Ratio</h4>
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                                    {metrics.totalUsers > 0 ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100) : 0}%
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mb-8 bg-white dark:bg-gray-800 p-6 shadow-sm sm:rounded-3xl hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700/50">
                        <div className="mb-4">
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                <span className="mr-2 text-primary-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                </span>
                                Global User Activity
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Visualizing user location density based on recent activity.</p>
                        </div>
                        <Heatmap data={heatmapData} />
                    </div>

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
                                    { id: 'checkbox', label: '' },
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

                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow duration-300 w-full overflow-hidden relative">
                        {/* Floating Action Bar */}
                        {selectedUsers.length > 0 && (
                            <div className="absolute top-0 left-0 w-full h-12 bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-between px-6 z-10 border-b border-indigo-100 dark:border-indigo-800">
                                <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => executeBulkAction('disable')} className="text-xs font-semibold px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 transition-colors shadow-sm">Disable</button>
                                    <button onClick={() => executeBulkAction('enable')} className="text-xs font-semibold px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 transition-colors shadow-sm">Enable</button>
                                    <button onClick={() => executeBulkAction('make_admin')} className="text-xs font-semibold px-3 py-1 bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 rounded hover:bg-indigo-50 transition-colors shadow-sm">Make Admin</button>
                                    <button onClick={() => executeBulkAction('make_user')} className="text-xs font-semibold px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 transition-colors shadow-sm">Make User</button>
                                    <button onClick={() => executeBulkAction('delete')} className="text-xs font-semibold px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow-sm">Delete</button>
                                </div>
                            </div>
                        )}

                        <div className={`p-6 text-gray-900 dark:text-gray-100 overflow-x-auto w-full min-h-[300px] ${selectedUsers.length > 0 ? 'mt-12' : ''}`}>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        {visibleColumns.includes('checkbox') && <th className="px-4 py-3 text-left w-10">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                checked={users.data && users.data.length > 0 && selectedUsers.length === users.data.length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>}
                                        {visibleColumns.includes('id') && <th className="px-4 py-3 text-left">
                                            <button onClick={() => handleSort('id')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                ID <SortIcon field="id" />
                                            </button>
                                        </th>}
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
                                        {visibleColumns.includes('role') && <th className="px-4 py-3 text-left">
                                            <button onClick={() => handleSort('role')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                Role <SortIcon field="role" />
                                            </button>
                                        </th>}
                                        {visibleColumns.includes('status') && <th className="px-4 py-3 text-left">
                                            <button onClick={() => handleSort('is_active')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                Status <SortIcon field="is_active" />
                                            </button>
                                        </th>}
                                        {visibleColumns.includes('actions') && <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {!users.data || users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No users found.</td>
                                        </tr>
                                    ) : (
                                        users.data.map((u, index) => (
                                            <tr key={u.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedUsers.includes(u.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                                                {visibleColumns.includes('checkbox') && <td className="px-4 py-4 whitespace-nowrap">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                        checked={selectedUsers.includes(u.id)}
                                                        onChange={() => handleSelectUser(u.id)}
                                                    />
                                                </td>}
                                                {visibleColumns.includes('id') && <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">{u.id}</td>}
                                                {visibleColumns.includes('name') && <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">{u.name}</td>}
                                                {visibleColumns.includes('email') && <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">{u.email}</td>}
                                                {visibleColumns.includes('role') && <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">{u.roles && u.roles.length > 0 ? u.roles.map(r => r.name).join(', ') : 'user'}</td>}
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
                                                                    <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                                                        <MoreVerticalIcon />
                                                                    </button>
                                                                </Dropdown.Trigger>
                                                                <Dropdown.Content align={index >= users.data.length - 2 && users.data.length > 2 ? "top-right" : "right"} width="48">
                                                                    <button 
                                                                        onClick={() => viewActivity(u)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                    >
                                                                        View Activity Log
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setManagingRolesUser(u);
                                                                            setSelectedRoles(u.roles ? u.roles.map(r => r.name) : []);
                                                                        }}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                    >
                                                                        Manage Roles
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => impersonate(u)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                    >
                                                                        Impersonate User
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => toggleStatus(u)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                    >
                                                                        {u.is_active ? 'Disable User' : 'Enable User'}
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => deleteUser(u)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                                    >
                                                                        Delete User
                                                                    </button>
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
                            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 p-4">
                                <Pagination links={users.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={!!viewingActivityLog} onClose={() => setViewingActivityLog(null)} maxWidth="lg">
                <div className="p-6 bg-white dark:bg-slate-900">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        Activity Log: {viewingActivityLog?.name}
                    </h2>
                    <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
                        {isLoadingActivity ? (
                            <div className="flex justify-center p-8">
                                <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
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
                                    <div className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                        {new Date(activity.date).toLocaleString()}
                                    </div>
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
                <div className="p-6 bg-white dark:bg-slate-900">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                        Are you sure you want to completely delete this user?
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        This action cannot be undone. This will permanently delete the user and all associated data from the database.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setConfirmingUserDeletion(null)}>Cancel</SecondaryButton>
                        <DangerButton className="ml-3" onClick={executeDelete}>
                            Delete User
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            <Modal show={!!managingRolesUser} onClose={() => setManagingRolesUser(null)} maxWidth="md">
                <div className="p-6 bg-white dark:bg-slate-900">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        Manage Roles: {managingRolesUser?.name}
                    </h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        <label className="flex items-start pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center h-5">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                    checked={selectedRoles.length === 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedRoles([]);
                                        }
                                    }}
                                    disabled={managingRolesUser?.id === auth.user.id && managingRolesUser?.roles?.some(r => r.name === 'super_admin')}
                                />
                            </div>
                            <div className="ml-3 text-sm flex flex-col justify-center">
                                <span className="font-bold text-slate-900 dark:text-slate-100">Standard User</span>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Has no admin privileges.</p>
                                {managingRolesUser?.id === auth.user.id && managingRolesUser?.roles?.some(r => r.name === 'super_admin') && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You cannot remove your own super_admin access.</p>
                                )}
                            </div>
                        </label>
                        {availableRoles && availableRoles.map((role) => (
                            <label key={role.id} className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        checked={selectedRoles.includes(role.name)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedRoles([...selectedRoles, role.name]);
                                            } else {
                                                setSelectedRoles(selectedRoles.filter((name) => name !== role.name));
                                            }
                                        }}
                                        disabled={managingRolesUser?.id === auth.user.id && role.name === 'super_admin'}
                                    />
                                </div>
                                <div className="ml-3 text-sm flex flex-col justify-center">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{role.label}</span>
                                    {managingRolesUser?.id === auth.user.id && role.name === 'super_admin' && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You cannot remove your own super_admin access.</p>
                                    )}
                                </div>
                            </label>
                        ))}
                        {(!availableRoles || availableRoles.length === 0) && (
                            <p className="text-sm text-slate-500">No additional roles available.</p>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setManagingRolesUser(null)}>Cancel</SecondaryButton>
                        <button
                            onClick={() => {
                                router.put(route('admin.users.roles.sync', managingRolesUser.id), { roles: selectedRoles }, {
                                    preserveScroll: true,
                                    onSuccess: () => setManagingRolesUser(null),
                                });
                            }}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            Save Roles
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
