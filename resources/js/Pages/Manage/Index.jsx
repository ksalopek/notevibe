import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Folder, Tag, FileText, ChevronRight } from 'lucide-react';

export default function ManageIndex() {
    const handleOpenFolderManager = () => {
        window.dispatchEvent(new CustomEvent('open-folder-manager'));
    };

    const handleOpenTagManager = () => {
        window.dispatchEvent(new CustomEvent('open-tag-manager'));
    };

    const handleOpenTemplateManager = () => {
        window.dispatchEvent(new CustomEvent('open-template-manager'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manage Library</h2>}>
            <Head title="Manage Library" />
            
            <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        <li>
                            <button 
                                onClick={handleOpenFolderManager}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 focus:outline-none"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <Folder className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Folders</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Organize your notes into folders</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={handleOpenTagManager}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 focus:outline-none"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                        <Tag className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Tags</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage tags across all notes</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={handleOpenTemplateManager}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 focus:outline-none"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Templates</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Create and edit reusable templates</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
