import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Pagination from '@/Components/Pagination';

export default function Users({ auth, users, filters }) {
    const { patch, post } = useForm();
    const [searchUsers, setSearchUsers] = useState(filters?.search_users || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchUsers !== (filters?.search_users || '')) {
                router.get(route('admin.users'), { 
                    search_users: searchUsers,
                    sort: filters?.sort,
                    direction: filters?.direction
                }, { preserveState: true, replace: true, preserveScroll: true, only: ['users'] });
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
        }, { preserveState: true, replace: true, preserveScroll: true, only: ['users'] });
    };

    const toggleStatus = (user) => {
        patch(route('admin.users.toggle', user.id));
    };

    const impersonate = (user) => {
        post(route('admin.users.impersonate', user.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manage Users</h2>}
        >
            <Head title="Manage Users" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-4 flex justify-end">
                        <div className="w-full sm:w-64">
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                value={searchUsers}
                                onChange={(e) => setSearchUsers(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg hover:shadow-purple-500/50 dark:hover:shadow-purple-500/50 transition-shadow duration-300">
                        <div className="p-6 text-gray-900 dark:text-gray-100 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th onClick={() => handleSort('id')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-600">
                                            ID {filters?.sort === 'id' && (filters?.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('name')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-600">
                                            Name {filters?.sort === 'name' && (filters?.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('email')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-600">
                                            Email {filters?.sort === 'email' && (filters?.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('role')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-600">
                                            Role {filters?.sort === 'role' && (filters?.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('is_active')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-600">
                                            Status {filters?.sort === 'is_active' && (filters?.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                                                <td className="px-6 py-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">{u.id}</td>
                                                <td className="px-6 py-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">{u.name}</td>
                                                <td className="px-6 py-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">{u.email}</td>
                                                <td className="px-6 py-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">{u.role}</td>
                                                <td className="px-6 py-4 whitespace-normal break-words text-sm">
                                                    {u.is_active ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">Active</span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">Disabled</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal break-words text-right text-sm font-medium">
                                                    {u.id !== auth.user.id && (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => impersonate(u)} className="text-indigo-600 hover:text-indigo-900 font-bold px-3 py-1 border rounded border-indigo-200">
                                                                Impersonate
                                                            </button>
                                                            <button onClick={() => toggleStatus(u)} className={`${u.is_active ? 'text-red-600 hover:text-red-900 border-red-200' : 'text-green-600 hover:text-green-900 border-green-200'} font-bold px-3 py-1 border rounded`}>
                                                                {u.is_active ? 'Disable' : 'Enable'}
                                                            </button>
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
        </AuthenticatedLayout>
    );
}
