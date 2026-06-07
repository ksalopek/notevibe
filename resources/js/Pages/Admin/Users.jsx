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
        }
    };

    const enableAll = () => {
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
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
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
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
