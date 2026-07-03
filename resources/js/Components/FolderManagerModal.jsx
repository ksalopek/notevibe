import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Folder, Trash2, Edit2, X, Plus } from 'lucide-react';

export default function FolderManagerModal({ isOpen, onClose, folders = [] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [deletingFolder, setDeletingFolder] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        color: '',
    });

    const openCreate = () => {
        reset();
        setIsCreateOpen(true);
    };

    const openEdit = (folder) => {
        setEditingFolder(folder);
        setData({ name: folder.name, color: folder.color || '' });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('folders.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            }
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        put(route('folders.update', editingFolder.id), {
            onSuccess: () => {
                setEditingFolder(null);
                reset();
            }
        });
    };

    const handleDelete = () => {
        destroy(route('folders.destroy', deletingFolder.id), {
            onSuccess: () => setDeletingFolder(null)
        });
    };

    const handleClose = () => {
        setIsCreateOpen(false);
        setEditingFolder(null);
        setDeletingFolder(null);
        reset();
        onClose();
    };

    return (
        <Modal show={isOpen} onClose={handleClose} maxWidth="md" mobileFullWidth={true}>
            <div className="p-6 h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <Folder className="w-6 h-6 mr-3 text-primary-500" />
                        Manage Folders
                    </h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!isCreateOpen && !editingFolder && !deletingFolder ? (
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={openCreate}
                                className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150 shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Folder
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {folders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">You don't have any folders yet.</p>
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {folders.map(folder => (
                                        <li key={folder.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm group hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                                            <div className="flex items-center">
                                                <Folder className="w-5 h-5 mr-3" style={{ color: folder.color || '#9ca3af' }} />
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{folder.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(folder)}
                                                    className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingFolder(folder)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ) : deletingFolder ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Delete Folder?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-8">
                            Are you sure you want to delete the folder <span className="font-semibold text-gray-700 dark:text-gray-300">"{deletingFolder.name}"</span>? 
                            Notes inside this folder will not be deleted, but they will be removed from the folder.
                        </p>
                        <div className="flex gap-3 w-full max-w-xs">
                            <SecondaryButton onClick={() => setDeletingFolder(null)} className="flex-1 justify-center">Cancel</SecondaryButton>
                            <PrimaryButton onClick={handleDelete} disabled={processing} className="flex-1 justify-center bg-red-600 hover:bg-red-700 focus:bg-red-700 focus:ring-red-500 border-transparent">
                                Delete
                            </PrimaryButton>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={editingFolder ? handleEdit : handleCreate} className="flex flex-col h-full">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            {editingFolder ? 'Edit Folder' : 'Create Folder'}
                        </h3>

                        <div className="flex-1 space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Folder Name" />
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="color" value="Color (Hex or Name)" />
                                <div className="flex mt-1 gap-3">
                                    <TextInput
                                        id="color"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="flex-1"
                                        placeholder="#e2e8f0 or blue"
                                    />
                                    <div 
                                        className="w-10 h-10 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm flex-shrink-0"
                                        style={{ backgroundColor: data.color || 'transparent' }}
                                    ></div>
                                </div>
                                <InputError message={errors.color} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                            <SecondaryButton onClick={() => { setIsCreateOpen(false); setEditingFolder(null); reset(); }} type="button">Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>{editingFolder ? 'Save Changes' : 'Create'}</PrimaryButton>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
