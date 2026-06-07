<<<<<<< HEAD
import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Users({ users }) {
    const authUser = users.find(u => u.id === users.auth_id); // we don't have auth_id explicitly passed, but we can check usePage().props.auth.user.id

    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    const toggleStatus = (userId) => {
        router.patch(route('admin.users.toggle-status', userId), {}, {
            preserveScroll: true,
        });
    };

    const disableAll = () => {
        if (window.confirm("NUCLEAR OPTION: Are you absolutely sure you want to disable ALL other users? This will instantly lock them out and destroy their active sessions.")) {
            router.patch(route('admin.users.disable-all'), {}, {
                preserveScroll: true,
            });
=======
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Users({ auth, users }) {
    const { patch } = useForm();
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const toggleStatus = (user) => {
        patch(route('admin.users.toggle', user.id));
    };

    const disableAll = () => {
        if (confirm('NUCLEAR OPTION: Are you sure you want to disable all other users?')) {
            patch(route('admin.users.disable-all'));
>>>>>>> feature/user_list
        }
    };

    const enableAll = () => {
<<<<<<< HEAD
        if (window.confirm("Are you sure you want to restore and enable all users?")) {
            router.patch(route('admin.users.enable-all'), {}, {
                preserveScroll: true,
            });
        }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedUsers = useMemo(() => {
        let sortableUsers = [...users];
        if (sortConfig.key !== null) {
            sortableUsers.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                
                // Handle nulls
                if (aValue === null) aValue = '';
                if (bValue === null) bValue = '';

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableUsers;
    }, [users, sortConfig]);

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <span className="ml-1 text-gray-400 opacity-0 group-hover:opacity-100">↕</span>;
        }
        return sortConfig.direction === 'asc' ? 
            <span className="ml-1 text-gray-700 dark:text-gray-300">↑</span> : 
            <span className="ml-1 text-gray-700 dark:text-gray-300">↓</span>;
    };

    const SortableHeader = ({ columnKey, children }) => (
        <th 
            scope="col" 
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            onClick={() => requestSort(columnKey)}
        >
            <div className="flex items-center">
                {children}
                <SortIcon columnKey={columnKey} />
            </div>
        </th>
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">User Management</h2>}
        >
            <Head title="Admin Users" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex justify-end space-x-4">
                        <button
                            onClick={enableAll}
                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-500 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                        >
                            Restore All Users
                        </button>
                        <button
                            onClick={disableAll}
                            className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                        >
                            ☢️ Nuclear Option: Disable All Users
=======
        if (confirm('RESTORE: Are you sure you want to enable all users?')) {
            patch(route('admin.users.enable-all'));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manage Users</h2>}
        >
            <Head title="Manage Users" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-4 flex justify-end space-x-4">
                        <button onClick={enableAll} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow">
                            Restore All Users
                        </button>
                        <button onClick={disableAll} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow">
                            Nuclear Option (Disable All)
>>>>>>> feature/user_list
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
<<<<<<< HEAD
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <SortableHeader columnKey="id">ID</SortableHeader>
                                            <SortableHeader columnKey="name">Name</SortableHeader>
                                            <SortableHeader columnKey="email">Email</SortableHeader>
                                            <SortableHeader columnKey="role">Role</SortableHeader>
                                            <SortableHeader columnKey="created_at">Joined</SortableHeader>
                                            <SortableHeader columnKey="is_active">Status</SortableHeader>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {sortedUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {user.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                        {user.is_active ? 'Active' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => toggleStatus(user.id)}
                                                        className={`text-sm font-semibold transition-colors ${user.is_active ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'}`}
                                                    >
                                                        {user.is_active ? 'Disable' : 'Enable'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {sortedUsers.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No users found.
                                    </div>
                                )}
                            </div>

=======
                        <div className="p-6 text-gray-900 dark:text-gray-100 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th onClick={() => handleSort('id')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-600">
                                            ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('name')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-600">
                                            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('email')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-600">
                                            Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('role')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-600">
                                            Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('is_active')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-600">
                                            Status {sortField === 'is_active' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {sortedUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{u.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{u.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{u.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {u.is_active ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">Active</span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">Disabled</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {u.id !== auth.user.id && (
                                                    <button onClick={() => toggleStatus(u)} className={`${u.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} font-bold px-3 py-1 border rounded`}>
                                                        {u.is_active ? 'Disable' : 'Enable'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
>>>>>>> feature/user_list
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
