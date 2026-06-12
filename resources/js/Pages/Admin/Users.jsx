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

const ImpersonateIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>);
const BanIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>);
const CheckCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>);
const ShieldIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>);
const MoreVerticalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>);

export default function Users({ auth, users, filters, heatmapData }) {
    const { patch, post, delete: destroy } = useForm();
    const [searchUsers, setSearchUsers] = useState(filters?.search_users || '');
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchUsers !== (filters?.search_users || '')) {
                router.get(route('admin.users'), { 
                    search_users: searchUsers,
                    sort: filters?.sort,
                    direction: filters?.direction
                }, { preserveState: true, replace: true, preserveScroll: true, only: ['users', 'filters'] });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchUsers]);

    const handleSort = (field) => {
        let direction = 'asc';
        if (filters?.sort === field && filters?.direction === 'asc') {
            direction = 'desc';
        }

        router.get(route('admin.users'), { 
            search_users: searchUsers, 
            sort: field, 
            direction: direction 
        }, { preserveState: true, replace: true, preserveScroll: true, only: ['users', 'filters'] });
    };

    const sortValue = `${filters?.sort || 'id'}-${filters?.direction || 'asc'}`;

    const handleSortChange = (e) => {
        const [field, direction] = e.target.value.split('-');
        router.get(route('admin.users'), { 
            search_users: searchUsers, 
            sort: field, 
            direction: direction 
        }, { preserveState: true, replace: true, preserveScroll: true, only: ['users', 'filters'] });
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

    const toggleRole = (user) => {
        patch(route('admin.users.role', user.id));
    };

    const impersonate = (user) => {
        post(route('admin.users.impersonate', user.id));
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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
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

                    <div className="flex justify-end mb-4">
                        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                value={searchUsers}
                                onChange={(e) => setSearchUsers(e.target.value)}
                                className="w-full sm:w-64 px-4 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-slate-400"
                            />
                            <select
                                value={sortValue}
                                onChange={handleSortChange}
                                className="w-full sm:w-48 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
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
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 transition-shadow duration-300">
                        <div className="p-6 text-gray-900 dark:text-gray-100 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <button onClick={() => handleSort('id')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                ID <SortIcon field="id" />
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            <button onClick={() => handleSort('name')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                Name <SortIcon field="name" />
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            <button onClick={() => handleSort('email')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                Email <SortIcon field="email" />
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            <button onClick={() => handleSort('role')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                Role <SortIcon field="role" />
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            <button onClick={() => handleSort('is_active')} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group w-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                Status <SortIcon field="is_active" />
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {!users.data || users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No users found.</td>
                                        </tr>
                                    ) : (
                                        users.data.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">{u.id}</td>
                                                <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">{u.name}</td>
                                                <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">{u.email}</td>
                                                <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">{u.role}</td>
                                                <td className="px-4 py-4 whitespace-normal break-words text-sm">
                                                    {u.is_active ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">Active</span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">Disabled</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-normal break-words text-right text-sm font-medium">
                                                    {u.id !== auth.user.id && (
                                                        <div className="flex justify-end w-full items-center">
                                                            <Dropdown>
                                                                <Dropdown.Trigger>
                                                                    <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                                                        <MoreVerticalIcon />
                                                                    </button>
                                                                </Dropdown.Trigger>
                                                                <Dropdown.Content align="right" width="48">
                                                                    <button 
                                                                        onClick={() => toggleRole(u)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                    >
                                                                        {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
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
                                                </td>
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
        </AuthenticatedLayout>
    );
}
