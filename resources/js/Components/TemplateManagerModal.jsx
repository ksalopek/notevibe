import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import RichTextEditor from '@/Components/RichTextEditor';

export default function TemplateManagerModal({ isOpen, onClose, templates }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const createForm = useForm({
        name: '',
        content: '',
    });

    const editForm = useForm({
        name: '',
        content: '',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('templates.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setIsCreating(false);
            },
        });
    };

    const handleEditSubmit = (e, id) => {
        e.preventDefault();
        editForm.put(route('templates.update', id), {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const startEditing = (template) => {
        setEditingId(template.id);
        editForm.setData({
            name: template.name,
            content: template.content || '',
        });
    };

    const handleDelete = () => {
        router.delete(route('templates.destroy', deletingId), {
            preserveScroll: true,
            onSuccess: () => setDeletingId(null),
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="3xl" mobileFullWidth={true}>
            <div className="p-6 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Manage Templates
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {templates.filter(t => !t.is_global).map(template => (
                        <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                            {editingId === template.id ? (
                                <form onSubmit={(e) => handleEditSubmit(e, template.id)}>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={editForm.data.name}
                                            onChange={(e) => editForm.setData('name', e.target.value)}
                                            className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm text-sm"
                                            placeholder="Template Name"
                                        />
                                        <RichTextEditor
                                            content={editForm.data.content}
                                            onChange={(newContent) => editForm.setData('content', newContent)}
                                            className="min-h-[150px]"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <SecondaryButton onClick={() => setEditingId(null)} type="button">Cancel</SecondaryButton>
                                            <PrimaryButton disabled={editForm.processing}>Save Changes</PrimaryButton>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEditing(template)} className="text-gray-500 hover:text-primary-600 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setDeletingId(template.id)} className="text-gray-500 hover:text-red-600 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none line-clamp-3" dangerouslySetInnerHTML={{ __html: template.content || '<p className="italic">No content</p>' }}></div>
                                </div>
                            )}
                        </div>
                    ))}

                    {templates.filter(t => !t.is_global).length === 0 && !isCreating && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            You haven't created any custom templates yet.
                        </div>
                    )}
                </div>

                {isCreating ? (
                    <div className="border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10 rounded-lg p-4 mt-4">
                        <h3 className="font-medium text-primary-900 dark:text-primary-100 mb-3">Create New Template</h3>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm text-sm"
                                    placeholder="Template Name"
                                    required
                                />
                                <RichTextEditor
                                    content={createForm.data.content}
                                    onChange={(newContent) => createForm.setData('content', newContent)}
                                    className="min-h-[150px]"
                                />
                                <div className="flex justify-end gap-2">
                                    <SecondaryButton onClick={() => setIsCreating(false)} type="button">Cancel</SecondaryButton>
                                    <PrimaryButton disabled={createForm.processing}>Create Template</PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors font-medium text-sm border border-gray-200 dark:border-gray-600 shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Create Custom Template
                        </button>
                    </div>
                )}
            </div>

            <Modal show={!!deletingId} onClose={() => setDeletingId(null)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Delete Template?</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this template? This cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setDeletingId(null)}>Cancel</SecondaryButton>
                        <DangerButton className="ml-3" onClick={handleDelete}>Delete Template</DangerButton>
                    </div>
                </div>
            </Modal>
        </Modal>
    );
}
