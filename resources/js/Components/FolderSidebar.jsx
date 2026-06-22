import React, { useState, useEffect } from 'react';
import { Folder, Plus, MoreVertical, Edit2, Trash2, ChevronRight, ChevronDown, Settings, Tag, Library, PanelLeftClose } from 'lucide-react';
import Modal from './Modal';
import TextInput from './TextInput';
import InputLabel from './InputLabel';
import InputError from './InputError';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import DangerButton from './DangerButton';
import Dropdown from './Dropdown';
import { router, useForm } from '@inertiajs/react';

export default function FolderSidebar({ folders, activeFolderId, onSelectFolder, tags = [], onSelectTag, activeTags = [], openTagManager, hideManagement = false }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [deletingFolder, setDeletingFolder] = useState(null);
    const [isExpanded, setIsExpanded] = useState(!!activeFolderId);
    useEffect(() => {
        if (activeFolderId) {
            setIsExpanded(true);
        }
    }, [activeFolderId]);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        color: '',
    });

    const openCreateModal = () => {
        reset();
        setIsCreateOpen(true);
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

    const openEditModal = (folder) => {
        setEditingFolder(folder);
        setData({ name: folder.name, color: folder.color || '' });
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

    return (
        <div 
            className={`flex-shrink-0 mb-6 sm:mb-0 transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg h-fit flex flex-col ${
                isExpanded ? 'w-full sm:w-64 sm:mr-8 p-4' : 'w-fit self-end sm:self-auto sm:w-[68px] sm:mr-6 p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750'
            }`}
            onClick={!isExpanded ? () => setIsExpanded(true) : undefined}
        >
            {isExpanded ? (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                            <Library className="w-5 h-5 mr-2 text-primary-500" />
                            Library
                        </span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} 
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Collapse Sidebar"
                        >
                            <PanelLeftClose className="w-4 h-4" />
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex flex-row sm:flex-col items-center justify-end sm:justify-center text-gray-500 dark:text-gray-400 h-full w-full" title="Library">
                    <Library className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
            )}

            {isExpanded && (
                <div className="mt-4">
                    <div className="flex items-center justify-between px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        <span>Folders</span>
                        {!hideManagement && (
                            <button onClick={(e) => { e.stopPropagation(); openCreateModal(); }} className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 p-1" title="Create Folder">
                                <Plus className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <ul className="space-y-1">
                <li>
                    <button
                        onClick={() => onSelectFolder(null)}
                        className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                            !activeFolderId 
                                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 font-medium' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                    >
                        <Folder className="w-4 h-4 mr-3 opacity-70" />
                        All Notes
                    </button>
                </li>
                {folders && folders.map(folder => (
                    <li key={folder.id} className="flex items-center group">
                        <button
                            onClick={() => onSelectFolder(folder.id)}
                            className={`flex-1 flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                                activeFolderId === folder.id 
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 font-medium' 
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <Folder className="w-4 h-4 mr-3 opacity-70" style={{ color: folder.color || 'inherit' }} />
                            <span className="truncate">{folder.name}</span>
                        </button>
                        
                        {!hideManagement && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content width="48" align="right">
                                        <button
                                            onClick={() => openEditModal(folder)}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeletingFolder(folder)}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            Delete
                                        </button>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        )}
                    </li>
                ))}
                </ul>
                </div>
            )}

            {isExpanded && tags.length > 0 && (
                <div className="mt-8">
                    <div className="flex items-center justify-between px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        <span>Tags</span>
                        {!hideManagement && (
                            <button onClick={(e) => { e.stopPropagation(); openTagManager(); }} className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 p-1" title="Manage Tags">
                                <Settings className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 px-2">
                        {tags.slice(0, 15).map(tag => {
                            const isActive = activeTags.includes(tag.name);
                            return (
                                <button
                                    key={tag.id}
                                    onClick={() => onSelectTag(tag.name)}
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                        isActive 
                                            ? 'ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-gray-900' 
                                            : 'hover:opacity-80'
                                    }`}
                                    style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40` } : { backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}
                                >
                                    {tag.name}
                                </button>
                            );
                        })}
                        {tags.length > 15 && (
                            <button onClick={(e) => { e.stopPropagation(); openTagManager(); }} className="text-xs text-gray-500 hover:text-primary-500 px-2 py-0.5">
                                + {tags.length - 15} more
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal show={isCreateOpen || !!editingFolder} onClose={() => { setIsCreateOpen(false); setEditingFolder(null); reset(); }} maxWidth="sm" mobileFullWidth={true}>
                <form onSubmit={editingFolder ? handleEdit : handleCreate} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                        {editingFolder ? 'Edit Folder' : 'Create Folder'}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="name" value="Folder Name" />
                        <TextInput
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="color" value="Color (Hex or Name)" />
                        <TextInput
                            id="color"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="#e2e8f0 or blue"
                        />
                        <InputError message={errors.color} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => { setIsCreateOpen(false); setEditingFolder(null); reset(); }}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing}>{editingFolder ? 'Save Changes' : 'Create'}</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <Modal show={!!deletingFolder} onClose={() => setDeletingFolder(null)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Delete Folder</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to delete the folder "{deletingFolder?.name}"? Notes inside this folder will not be deleted, but they will be removed from the folder.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeletingFolder(null)}>Cancel</SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing}>Delete Folder</DangerButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
